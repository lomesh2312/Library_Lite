const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('Starting verification...');

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

    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    await prisma.loan.create({
        data: {
            userId: user.id,
            bookId: book.id,
            loanedAt: sixDaysAgo,
            dueDate: new Date() 
        }
    });

    

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


    await prisma.loan.deleteMany({ where: { userId: user.id } });

    await prisma.book.delete({ where: { id: book.id } });

    await prisma.user.delete({ where: { id: user.id } });
    await prisma.author.delete({ where: { id: author.id } });

    await prisma.$disconnect();
}

verify().catch(console.error);
