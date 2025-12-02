const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const totalBooks = await prisma.book.count();
        const activeLoans = await prisma.loan.count({
            where: { returned: false }
        });

        // Overdue Loans: Count loans where (Now - LoanedAt) > 7 days AND not returned
        // We can't easily do "date diff > 7 days" directly in Prisma where clause without raw query or calculating the date.
        // So we calculate the cutoff date: 7 days ago.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log('DEBUG: Checking Overdue Loans');
        console.log('DEBUG: Current Time:', new Date().toISOString());
        console.log('DEBUG: Seven Days Ago:', sevenDaysAgo.toISOString());

        const overdueLoans = await prisma.loan.count({
            where: {
                returned: false,
                loanedAt: { lt: sevenDaysAgo } // Loaned BEFORE 7 days ago means it's overdue
            }
        });
        console.log('DEBUG: Overdue Count:', overdueLoans);

        const totalMembers = await prisma.user.count({
            where: { isAdmin: false }
        });

        let totalEarnings = 0;

        // 1. Memberships
        const users = await prisma.user.findMany({ where: { membershipType: { not: null } } });
        const MEMBERSHIP_PRICES = { 'MONTH_1': 200, 'MONTH_3': 500, 'MONTH_6': 800, 'YEAR_1': 1200 };
        users.forEach(u => totalEarnings += (MEMBERSHIP_PRICES[u.membershipType] || 0));

        // 2. Book Prices from Loans
        const loans = await prisma.loan.findMany({ include: { book: true } });
        loans.forEach(l => {
            totalEarnings += (l.book.price || 0);

            // 3. Overdue Fines
            // Fine Logic: 7 days free. Day 8 = 10 Rs fine. Day 9 = 20 Rs fine.
            // Formula: if (days > 7) fine = (days - 7) * 10

            const loanDate = new Date(l.loanedAt);
            const returnDate = l.returned ? new Date(l.returnedAt) : new Date();

            // Calculate difference in days
            const diffTime = Math.abs(returnDate - loanDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                const overdueDays = diffDays - 7;
                totalEarnings += (overdueDays * 10);
            }
        });

        // Recent Activity (Last 5 loans)
        const recentActivity = await prisma.loan.findMany({
            take: 5,
            orderBy: { loanedAt: 'desc' },
            include: {
                user: true,
                book: true
            }
        });

        // Graph Data (Last 7 days earnings)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const graphData = last7Days.map(date => {
            let dailyEarnings = 0;

            // Filter users created on this date
            users.forEach(u => {
                if (u.createdAt.toISOString().startsWith(date)) {
                    dailyEarnings += (MEMBERSHIP_PRICES[u.membershipType] || 0);
                }
            });

            // Filter loans created on this date
            loans.forEach(l => {
                if (l.loanedAt.toISOString().startsWith(date)) {
                    dailyEarnings += (l.book.price || 0);
                }
            });

            return dailyEarnings;
        });


        res.json({
            totalBooks,
            activeLoans,
            overdueLoans,
            totalMembers,
            totalEarnings,
            recentActivity,
            graphData: {
                labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
                data: graphData
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
