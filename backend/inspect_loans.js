const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {

    console.log('Inspecting Loans...');
    const loans = await prisma.loan.findMany({
        where: { returned: false },
        include: { user: true, book: true }
    });

    const now = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('Current Time:', now.toISOString());

    console.log('7 Days Ago:', sevenDaysAgo.toISOString());

    loans.forEach(loan => {
        
        const isOverdueBackend = loan.loanedAt < sevenDaysAgo;
        console.log(`Loan ID: ${loan.id}`);
        console.log(`  User: ${loan.user.name}`);
        console.log(`  Book: ${loan.book.title}`);
        console.log(`  Loaned At: ${loan.loanedAt.toISOString()}`);
        console.log(`  Due Date (DB): ${loan.dueDate.toISOString()}`);
        console.log(`  Is Overdue (New Logic): ${isOverdueBackend}`);
        console.log('---');
    });

    await prisma.$disconnect();
}

inspect().catch(console.error);
