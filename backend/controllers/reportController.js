const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MEMBERSHIP_PRICES = {
  MONTH_1: 200,
  MONTH_3: 500,
  MONTH_6: 800,
  YEAR_1: 1200,
};

exports.getReports = async (req, res) => {
  try {
    const transactions = [];
    let totalEarnings = 0;

    const users = await prisma.user.findMany({
      where: {
        membershipType: { not: null },

      },
      select: {
        name: true,
        membershipType: true,
        createdAt: true,
      },

    });

    users.forEach((user) => {
      const amount = MEMBERSHIP_PRICES[user.membershipType] || 0;

      if (amount > 0) {
        transactions.push({
          id: `mem-${user.name}-${user.createdAt}`,
          source: "Membership",
          description: `${user.membershipType} - ${user.name}`,
          amount: amount,
          date: user.createdAt,
          type: "credit",

        });

        totalEarnings += amount;
      }

    });

    const loans = await prisma.loan.findMany({
      include: {
        book: true,
        user: true,
      },

    });

    loans.forEach((loan) => {
      const bookPrice = loan.book.price || 0;

      if (bookPrice > 0) {
        transactions.push({
          id: `loan-${loan.id}`,

          source: "Book Issue",
          description: `${loan.book.title} (Issued to ${loan.user.name})`,
          amount: bookPrice,
          date: loan.loanedAt,
          type: "credit",

        });

        totalEarnings += bookPrice;
      }

      const returnDate = loan.returned ? new Date(loan.returnedAt) : new Date();
      const dueDate = new Date(loan.dueDate);

      const loanDate = new Date(loan.loanedAt);

      const diffTime = Math.abs(returnDate - loanDate);

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        const overdueDays = diffDays - 7;
        const fineAmount = overdueDays * 10;

        if (fineAmount > 0) {
          transactions.push({
            id: `fine-${loan.id}`,

            source: "Overdue Fine",
            description: `Overdue ${overdueDays} days - ${loan.book.title} (${loan.user.name})`,
            amount: fineAmount,
            date: returnDate,
            type: "credit",

          });

          totalEarnings += fineAmount;
        }
      }
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      totalEarnings,
      transactions,
    });

  } catch (error) {
    console.error("Error generating reports:", error);
    
    res.status(500).json({ error: "Failed to generate reports" });
  }
};
