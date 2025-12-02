const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.issueBook = async (req, res) => {
    try {
        const { userId, bookId, dueDate } = req.body;


        const book = await prisma.book.findUnique({
            where: { id: parseInt(bookId) }
        });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({ error: 'Book is not available' });
        }


        const loan = await prisma.loan.create({
            data: {
                userId: parseInt(userId),
                bookId: parseInt(bookId),
                dueDate: new Date(dueDate),
            }
        });


        await prisma.book.update({
            where: { id: parseInt(bookId) },
            data: { availableCopies: { decrement: 1 } }
        });

        res.status(201).json(loan);
    } catch (error) {
        console.error('Error issuing book:', error);
        res.status(500).json({ error: 'Failed to issue book' });
    }
};

exports.returnBook = async (req, res) => {
    try {
        const { id } = req.params;

        const loan = await prisma.loan.findUnique({
            where: { id: parseInt(id) }
        });

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.returned) {
            return res.status(400).json({ error: 'Book already returned' });
        }


        const updatedLoan = await prisma.loan.update({
            where: { id: parseInt(id) },
            data: {
                returned: true,
                returnedAt: new Date(),
            }
        });


        await prisma.book.update({
            where: { id: loan.bookId },
            data: { availableCopies: { increment: 1 } }
        });

        res.json(updatedLoan);
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ error: 'Failed to return book' });
    }
};

exports.getLoans = async (req, res) => {
    try {
        const loans = await prisma.loan.findMany({
            include: {
                book: true,
                user: true,
            },
            orderBy: {
                loanedAt: 'desc',
            }
        });
        res.json(loans);

    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

exports.deleteLoan = async (req, res) => {
    try {
        const { id } = req.params;

        const loan = await prisma.loan.findUnique({
            where: { id: parseInt(id) }
        });

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }


        if (!loan.returned) {
            await prisma.book.update({
                where: { id: loan.bookId },
                data: { availableCopies: { increment: 1 } }
            });
        }


        await prisma.loan.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Loan deleted successfully' });
    } catch (error) {
        console.error('Error deleting loan:', error);
        res.status(500).json({ error: 'Failed to delete loan' });
    }
};
