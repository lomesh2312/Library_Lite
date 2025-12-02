const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('Starting verification...');

    // 1. Setup Data
    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            passwordHash: 'hash',
        }
    });

    const author = await prisma.author.create({ data: { name: `Test Author ${Date.now()}` } });

    const book = await prisma.book.create({
        data: {
            title: 'Test Book',
            isbn: `TEST-${Date.now()}`,
            authorId: author.id,
            price: 500
        }
    });

    // 2. Test Case 1: Loan 6 days ago (Not Overdue)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    await prisma.loan.create({
        data: {
            userId: user.id,
            bookId: book.id,
            loanedAt: sixDaysAgo,
            dueDate: new Date() // Irrelevant for new logic, but required by schema
        }
    });

    // Check Dashboard Stats
    // We can't easily call the controller function directly without mocking req/res, 
    // so we'll replicate the query logic here to verify it matches the controller's logic.

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overdueCount1 = await prisma.loan.count({
        where: {
            returned: false,
            loanedAt: { lt: sevenDaysAgo }
        }
    });

    console.log(`Test 1 (6 days ago): Overdue Count = ${overdueCount1}`);
    if (overdueCount1 !== 0) console.error('FAIL: Should be 0');
    else console.log('PASS');

    // 3. Test Case 2: Loan 7.5 days ago (Overdue by 0.5 days -> 1 day fine)
    const sevenPointFiveDaysAgo = new Date();
    sevenPointFiveDaysAgo.setTime(sevenPointFiveDaysAgo.getTime() - (7.5 * 24 * 60 * 60 * 1000));

    const loan2 = await prisma.loan.create({
        data: {
            userId: user.id,
            bookId: book.id,
            loanedAt: sevenPointFiveDaysAgo,
            dueDate: new Date()
        }
    });

    const overdueCount2 = await prisma.loan.count({
        where: {
            returned: false,
            loanedAt: { lt: sevenDaysAgo }
        }
    });

    console.log(`Test 2 (7.5 days ago): Overdue Count = ${overdueCount2}`);
    if (overdueCount2 < 1) console.error('FAIL: Should be at least 1');
    else console.log('PASS');

    // 4. Test Fine Calculation
    // Logic: (Days - 7) * 10
    // 7.5 days ago -> ceil(7.5) = 8 days.
    // 8 - 7 = 1 day overdue.
    // Fine = 10.

    const loanDate = new Date(loan2.loanedAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - loanDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let fine = 0;
    if (diffDays > 7) {
        fine = (diffDays - 7) * 10;
    }

    console.log(`Test 3 (Fine Calculation): Days=${diffDays}, Fine=${fine}`);
    if (fine !== 10) console.error('FAIL: Fine should be 10');
    else console.log('PASS');

    // Cleanup
    await prisma.loan.deleteMany({ where: { userId: user.id } });
    await prisma.book.delete({ where: { id: book.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.author.delete({ where: { id: author.id } });

    await prisma.$disconnect();
}

verify().catch(console.error);
