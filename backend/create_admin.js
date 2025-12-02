const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@library.com';
    const password = 'admin123';
    const name = 'Admin User';

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.admin.upsert({
            where: { email_id: email },
            update: {
                password: hashedPassword,
                name: name
            },
            create: {
                email_id: email,
                password: hashedPassword,
                name: name
            },
        });
        console.log(`Admin user created/updated: ${admin.email_id}`);
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
