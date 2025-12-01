require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authorsData = [
    {
        name: 'William Shakespeare',
        books: [
            'Hamlet',
            'Macbeth',
            'Romeo and Juliet',
            'Othello',
            'King Lear'
        ]
    },
    {
        name: 'J.K. Rowling',
        books: [
            'Harry Potter and the Philosopher’s Stone',
            'Harry Potter and the Chamber of Secrets',
            'Harry Potter and the Prisoner of Azkaban',
            'Harry Potter and the Goblet of Fire',
            'Harry Potter and the Order of the Phoenix'
        ]
    },
    {
        name: 'George Orwell',
        books: [
            '1984',
            'Animal Farm',
            'Homage to Catalonia',
            'Down and Out in Paris and London',
            'The Road to Wigan Pier'
        ]
    },
    {
        name: 'Agatha Christie',
        books: [
            'Murder on the Orient Express',
            'And Then There Were None',
            'The Murder of Roger Ackroyd',
            'Death on the Nile',
            'The A.B.C. Murders'
        ]
    },
    {
        name: 'Mark Twain',
        books: [
            'The Adventures of Tom Sawyer',
            'Adventures of Huckleberry Finn',
            'The Prince and the Pauper',
            'A Connecticut Yankee in King Arthur’s Court',
            'Life on the Mississippi'
        ]
    },
    {
        name: 'Jane Austen',
        books: [
            'Pride and Prejudice',
            'Sense and Sensibility',
            'Emma',
            'Mansfield Park',
            'Persuasion'
        ]
    },
    {
        name: 'Charles Dickens',
        books: [
            'A Tale of Two Cities',
            'Great Expectations',
            'Oliver Twist',
            'David Copperfield',
            'Bleak House'
        ]
    },
    {
        name: 'Stephen King',
        books: [
            'The Shining',
            'It',
            'Misery',
            'The Stand',
            'Carrie'
        ]
    },
    {
        name: 'J.R.R. Tolkien',
        books: [
            'The Hobbit',
            'The Fellowship of the Ring',
            'The Two Towers',
            'The Return of the King',
            'The Silmarillion'
        ]
    },
    {
        name: 'Paulo Coelho',
        books: [
            'The Alchemist',
            'Brida',
            'The Devil and Miss Prym',
            'The Valkyries',
            'Eleven Minutes'
        ]
    }
];

async function main() {
    console.log('Start seeding ...');


    const category = await prisma.category.upsert({
        where: { name: 'General' },
        update: {},
        create: { name: 'General' },
    });

    for (const authorData of authorsData) {
        const author = await prisma.author.upsert({
            where: { name: authorData.name },
            update: {},
            create: { name: authorData.name },
        });

        console.log(`Created author: ${author.name}`);

        for (const bookTitle of authorData.books) {

            const isbn = `ISBN-${bookTitle.length}-${Math.floor(Math.random() * 10000)}`;

            await prisma.book.create({
                data: {
                    title: bookTitle,
                    isbn: isbn,
                    totalCopies: 5,
                    availableCopies: 5,
                    authorId: author.id,
                    categoryId: category.id,
                    description: `A classic book by ${author.name}`,
                    coverUrl: `https://placehold.co/400x600?text=${encodeURIComponent(bookTitle)}`,
                    price: Math.floor(Math.random() * (450 - 200 + 1)) + 200
                },
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
