const prisma = require('../prismaClient');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalBooks = await prisma.book.count();
        const activeLoans = await prisma.loan.count({
            where: { returned: false }
        });


        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log('DEBUG: Checking Overdue Loans');
        console.log('DEBUG: Current Time:', new Date().toISOString());
        console.log('DEBUG: Seven Days Ago:', sevenDaysAgo.toISOString());

        const overdueLoans = await prisma.loan.count({
            where: {
                returned: false,
                loanedAt: { lt: sevenDaysAgo } 
            }
        });
        console.log('DEBUG: Overdue Count:', overdueLoans);

        const totalMembers = await prisma.user.count({
            where: { isAdmin: false }
        });

        let totalEarnings = 0;


        const users = await prisma.user.findMany({ where: { membershipType: { not: null } } });
        const MEMBERSHIP_PRICES = { 'MONTH_1': 200, 'MONTH_3': 500, 'MONTH_6': 800, 'YEAR_1': 1200 };
        users.forEach(u => totalEarnings += (MEMBERSHIP_PRICES[u.membershipType] || 0));


        const loans = await prisma.loan.findMany({ include: { book: true } });
        loans.forEach(l => {
            totalEarnings += (l.book.price || 0);



            const loanDate = new Date(l.loanedAt);
            const returnDate = l.returned ? new Date(l.returnedAt) : new Date();


            const diffTime = Math.abs(returnDate - loanDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                const overdueDays = diffDays - 7;
                totalEarnings += (overdueDays * 10);
            }
        });


        const recentActivity = await prisma.loan.findMany({
            take: 5,
            orderBy: { loanedAt: 'desc' },
            include: {
                user: true,
                book: true
            }
        });


        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const graphData = last7Days.map(date => {
            let dailyEarnings = 0;


            users.forEach(u => {
                if (u.createdAt.toISOString().startsWith(date)) {
                    dailyEarnings += (MEMBERSHIP_PRICES[u.membershipType] || 0);
                }
            });


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
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};
