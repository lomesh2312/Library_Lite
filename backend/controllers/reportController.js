const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MEMBERSHIP_PRICES = {
    'MONTH_1': 200,
    'MONTH_3': 500,
    'MONTH_6': 800,
    'YEAR_1': 1200
};

exports.getReports = async (req, res) => {
    try {
        const transactions = [];
        let totalEarnings = 0;

        // 1. Membership Earnings
        const users = await prisma.user.findMany({
            where: {
                membershipType: { not: null }
            },
            select: {
                name: true,
                membershipType: true,
                createdAt: true
            }
        });

        users.forEach(user => {
            const amount = MEMBERSHIP_PRICES[user.membershipType] || 0;
            if (amount > 0) {
                transactions.push({
                    id: `mem-${user.name}-${user.createdAt}`,
                    source: 'Membership',
                    description: `${user.membershipType} - ${user.name}`,
                    amount: amount,
                    date: user.createdAt,
                    type: 'credit'
                });
                totalEarnings += amount;
            }
        });

        // 2. Book Issue Earnings & Overdue Fines
        const loans = await prisma.loan.findMany({
            include: {
                book: true,
                user: true
            }
        });

        loans.forEach(loan => {
            // A. Book Issue Revenue (Price of the book)
            const bookPrice = loan.book.price || 0;
            if (bookPrice > 0) {
                transactions.push({
                    id: `loan-${loan.id}`,
                    source: 'Book Issue',
                    description: `${loan.book.title} (Issued to ${loan.user.name})`,
                    amount: bookPrice,
                    date: loan.loanedAt,
                    type: 'credit'
                });
                totalEarnings += bookPrice;
            }

            // B. Overdue Fines
            // Calculate overdue days
            const returnDate = loan.returned ? new Date(loan.returnedAt) : new Date();
            const dueDate = new Date(loan.dueDate);

            // Normalize dates to ignore time component for fairer calculation (optional, but good for "days")
            // or just stick to strict timestamp comparison. 
            // User said: "if the book is not returned in the interval of 7 days".
            // Let's stick to the timestamp comparison but ensure we don't charge for the 7th day itself if returned late in the day?
            // Actually, usually due date is set to end of day or specific time. 
            // Let's keep strict comparison but ensure logic is clear.

            const loanDate = new Date(loan.loanedAt);
            const diffTime = Math.abs(returnDate - loanDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                const overdueDays = diffDays - 7;
                const fineAmount = overdueDays * 10;

                if (fineAmount > 0) {
                    transactions.push({
                        id: `fine-${loan.id}`,
                        source: 'Overdue Fine',
                        description: `Overdue ${overdueDays} days - ${loan.book.title} (${loan.user.name})`,
                        amount: fineAmount,
                        date: returnDate,
                        type: 'credit'
                    });
                    totalEarnings += fineAmount;
                }
            }
        });

        // Sort transactions by date descending
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            totalEarnings,
            transactions
        });

    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).json({ error: 'Failed to generate reports' });
    }
};
