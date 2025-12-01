const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {

        const bookCount = await prisma.book.count();
        const userCount = await prisma.user.count();
        const authorCount = await prisma.author.count();

        console.log(`Books: ${bookCount}`);
        console.log(`Users: ${userCount}`);

        console.log(`Authors: ${authorCount}`);
    } catch (e) {

        console.error(e);
    } finally {
        
        await prisma.$disconnect();
    }
}

main();
