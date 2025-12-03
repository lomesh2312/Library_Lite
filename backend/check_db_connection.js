const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to the database...');
        await prisma.$connect();
        console.log('✅ Successfully connected to the database!');

        // Optional: Query something simple to ensure read access
        const userCount = await prisma.user.count();
        console.log(`✅ Database check passed. Current user count: ${userCount}`);

    } catch (error) {
        console.error('❌ Failed to connect to the database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
