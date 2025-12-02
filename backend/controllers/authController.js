const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {

  try {
    const { name, email, password } = req.body
    const hash = await bcrypt.hash(password, 10)

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        isAdmin: true // Every user is an admin/librarian
      }
    })

    // Sync with Admin table
    // Check if admin exists first to avoid unique constraint errors if retrying
    const existingAdmin = await prisma.admin.findUnique({ where: { email_id: email } });
    let admin;
    if (!existingAdmin) {
      admin = await prisma.admin.create({
        data: {
          name,
          email_id: email,
          password: hash,
          profileUrl: null
        }
      });
    } else {
      admin = existingAdmin;
    }

    // Generate token and return user data for auto-login
    const token = jwt.sign({ userId: admin.admin_id, isAdmin: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })

    res.json({
      accessToken: token,
      user: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email_id,
        isAdmin: true,
        profileUrl: admin.profileUrl
      }
    })
  } catch (e) {
    next(e)
  }
}


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Try finding in Admin table first (legacy support + source of truth for "librarians")
    let admin = await prisma.admin.findUnique({ where: { email_id: email } })

    // If not in Admin, check User table (in case sync failed or manual DB entry)
    // But requirement says "every user will be treated as librarian", so we should probably rely on Admin table 
    // or sync if missing. For now, let's stick to the existing flow but ensure we return profileUrl.

    if (!admin) {
      // Fallback: check User table, if found and password matches, create Admin entry?
      // For now, let's just return error as per original logic, but maybe the user signed up via User table only?
      // Let's check User table to be safe.
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (ok) {
          // Sync to Admin
          admin = await prisma.admin.create({
            data: {
              name: user.name,
              email_id: user.email,
              password: user.passwordHash,
              profileUrl: null
            }
          });
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      } else {
        return res.status(401).json({ error: 'You are not the librarian' })
      }
    }

    const ok = await bcrypt.compare(password, admin.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })


    const token = jwt.sign({ userId: admin.admin_id, isAdmin: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })

    res.json({
      accessToken: token,
      user: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email_id,
        isAdmin: true,
        profileUrl: admin.profileUrl // Return profileUrl
      }
    })
  } catch (e) {
    next(e)
  }
}

const exist = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
}

module.exports = { register, login, exist }
