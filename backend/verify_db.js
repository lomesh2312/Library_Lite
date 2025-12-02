const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const authorCount = await prisma.author.count();
    const bookCount = await prisma.book.count();
    console.log(`Authors: ${authorCount}`);
    console.log(`Books: ${bookCount}`);

    if (authorCount > 0) {
        const firstAuthor = await prisma.author.findFirst({ include: { books: true } });
        console.log('First Author:', JSON.stringify(firstAuthor, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
