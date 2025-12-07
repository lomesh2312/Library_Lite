const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data migration...');

    try {
        const dataPath = path.join(__dirname, 'book_list.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const books = JSON.parse(rawData);

        console.log(`Found ${books.length} books to migrate.`);

        for (const book of books) {
            // 1. Upsert Author
            const author = await prisma.author.upsert({
                where: { name: book.author.name },
                update: {},
                create: {
                    name: book.author.name,
                    profileUrl: null // Or add a placeholder if needed
                }
            });

            // 2. Upsert Book
            await prisma.book.upsert({
                where: { isbn: book.isbn },
                update: {
                    title: book.title,
                    coverUrl: book.coverUrl,
                    description: book.description,
                    totalCopies: book.totalCopies,
                    availableCopies: book.availableCopies,
                    price: book.price,
                    authorId: author.id
                },
                create: {
                    title: book.title,
                    isbn: book.isbn,
                    coverUrl: book.coverUrl,
                    description: book.description,
                    totalCopies: book.totalCopies,
                    availableCopies: book.availableCopies,
                    price: book.price,
                    authorId: author.id
                }
            });

            console.log(`Migrated: ${book.title} by ${author.name}`);
        }

        console.log('✅ Data migration completed successfully.');

    } catch (error) {
        console.error('❌ Data migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
