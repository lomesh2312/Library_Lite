const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAuthors = async (req, res) => {
    try {
        const authors = await prisma.author.findMany({
            include: {
                _count: {
                    select: { books: true }
                }
            },
            orderBy: {
                name: 'asc',
            }
        });
        res.json(authors);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Failed to fetch authors' });
    }
};

exports.getAuthorById = async (req, res) => {
    try {
        const { id } = req.params;
        const author = await prisma.author.findUnique({
            where: { id: parseInt(id) },
            include: {
                books: true,
            }
        });

        if (!author) {
            return res.status(404).json({ error: 'Author not found' });
        }

        res.json(author);
    } catch (error) {
        console.error('Error fetching author:', error);
        res.status(500).json({ error: 'Failed to fetch author' });
    }
};

exports.createAuthor = async (req, res) => {
    try {
        const { name, profileUrl } = req.body;
        const author = await prisma.author.create({
            data: {
                name,
                profileUrl
            }
        });
        res.status(201).json(author);
    } catch (error) {
        console.error('Error creating author:', error);
        res.status(500).json({ error: 'Failed to create author' });
    }
};

exports.deleteAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.author.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Author deleted successfully' });
    } catch (error) {
        console.error('Error deleting author:', error);
        res.status(500).json({ error: 'Failed to delete author' });
    }
};

exports.updateAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, profileUrl } = req.body;

        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (profileUrl !== undefined) dataToUpdate.profileUrl = profileUrl;

        const author = await prisma.author.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        res.json(author);
    } catch (error) {
        console.error('Error updating author:', error);
        res.status(500).json({ error: 'Failed to update author' });
    }
};
