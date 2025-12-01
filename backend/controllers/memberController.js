const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

exports.createMember = async (req, res) => {
  try {
    const { name, email, duration } = req.body;

    let expiryDate = new Date();
    switch (duration) {
      case "MONTH_1":
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case "MONTH_3":
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case "MONTH_6":
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        break;
      case "YEAR_1":
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid duration" });
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        membershipType: duration,
        membershipExpiry: expiryDate,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating member:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create member" });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { isAdmin: false },
      include: {
        _count: {
          select: { loans: true },
        },
      },
    });
    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const activeLoans = await prisma.loan.findMany({
      where: {
        userId: parseInt(id),
        returned: false,
      },
    });

    if (activeLoans.length > 0) {
      return res.status(400).json({
        error: `Cannot delete member with ${activeLoans.length} active loan(s). Please return all books first.`,
      });
    }

    await prisma.loan.deleteMany({
      where: { userId: parseInt(id) },
    });

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ error: "Failed to delete member" });
  }
};
