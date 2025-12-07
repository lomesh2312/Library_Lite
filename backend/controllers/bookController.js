const prisma = require('../prismaClient');

exports.getBooks = async (req, res) => {
    try {
        const { search, authorId } = req.query;

        const where = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } }, 
                { author: { name: { contains: search, mode: 'insensitive' } } },
                { isbn: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (authorId) {
            where.authorId = parseInt(authorId);
        }

        const books = await prisma.book.findMany({
            where,
            include: {
                author: true,
            },
            orderBy: {
                title: 'asc',
            }
        });

        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: true,
                loans: {
                    include: { user: true },
                    orderBy: { loanedAt: 'desc' }
                }
            }
        });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
};

exports.createBook = async (req, res) => {
    try {
        const { title, authorName, isbn, totalCopies, price, coverUrl, description } = req.body;


        let author = await prisma.author.findUnique({
            where: { name: authorName }
        });

        if (!author) {
            author = await prisma.author.create({
                data: { name: authorName }
            });
        }

        
        const book = await prisma.book.create({
            data: {
                title,
                isbn,
                coverUrl,
                description,
                totalCopies: parseInt(totalCopies) || 1,
                availableCopies: parseInt(totalCopies) || 1,
                price: parseInt(price) || 0,
                authorId: author.id
            }
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Failed to create book' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, totalCopies, coverUrl } = req.body;

        const dataToUpdate = {};
        if (price !== undefined && price !== '') dataToUpdate.price = parseInt(price);
        if (totalCopies !== undefined && totalCopies !== '') {
            dataToUpdate.totalCopies = parseInt(totalCopies);
        }
        if (coverUrl !== undefined && coverUrl !== '') {
            dataToUpdate.coverUrl = coverUrl;
        }

        const book = await prisma.book.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        res.json(book);
        
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.book.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error('Error deleting book:', error);
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete book with active loans' });
        }
        res.status(500).json({ error: 'Failed to delete book' });
    }
};
