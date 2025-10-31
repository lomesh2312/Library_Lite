const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {

  try {
    const { name, email, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, passwordHash: hash } })
    res.json({ id: user.id, name: user.name, email: user.email })
  } catch (e) {
    next(e)
  }
}


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'invalid' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid' })
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ accessToken: token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } })
  } catch (e) {
    next(e)
  }
}

const exist = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
}

module.exports = { register, login, exist }
