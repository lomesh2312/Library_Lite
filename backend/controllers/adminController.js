const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

exports.getAdmins = async (req, res) => {
    try {
        const admins = await prisma.admin.findMany({
            select: {
                admin_id: true,
                name: true,
                email_id: true,
                profileUrl: true
            }
        });
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existing = await prisma.admin.findUnique({
            where: { email_id: email }
        });

        if (existing) {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileUrl = req.file ? `https://library-lite.onrender.com/uploads/${req.file.filename}` : (req.body.profileUrl || null);

        const newAdmin = await prisma.admin.create({
            data: {
                name,
                email_id: email,
                password: hashedPassword,
                profileUrl
            }
        });

        res.status(201).json({
            message: 'Admin added successfully',
            admin: {
                id: newAdmin.admin_id,
                name: newAdmin.name,
                email: newAdmin.email_id
            }
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ error: 'Failed to add admin' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.admin.delete({
            where: { admin_id: parseInt(id) }
        });
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        let { profileUrl } = req.body;

        if (req.file) {
            profileUrl = `https://library-lite.onrender.com/uploads/${req.file.filename}`;
        }

        const updatedAdmin = await prisma.admin.update({
            where: { admin_id: parseInt(id) },
            data: { profileUrl }
        });

        res.json({
            message: 'Admin updated successfully',
            admin: {
                id: updatedAdmin.admin_id,
                name: updatedAdmin.name,
                email: updatedAdmin.email_id,
                profileUrl: updatedAdmin.profileUrl
            }
        });
        
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ error: 'Failed to update admin' });
    }
};
