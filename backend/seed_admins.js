const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    const admins = [
        {
            name: 'Lomesh Sonkeshriya',
            email_id: 'lomesh@sonkeshriya.com',
            password: '#Lucky2312'
        },
        {
            name: 'Manik Tyagi',
            email_id: 'manik@tyagi.com',
            password: '#matu4405'
        }
    ];

    for (const admin of admins) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);

        const existing = await prisma.admin.findUnique({
            where: { email_id: admin.email_id }
        });

        if (!existing) {
            await prisma.admin.create({
                data: {
                    name: admin.name,
                    email_id: admin.email_id,
                    password: hashedPassword
                }
            });
            console.log(`Created admin: ${admin.name}`);
        } else {
            console.log(`Admin already exists: ${admin.name}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    
    .finally(async () => {
        await prisma.$disconnect();
    });
