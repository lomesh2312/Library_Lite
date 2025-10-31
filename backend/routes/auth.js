const express = require('express');

const router = express.Router();

const { register, login, exist } = require('../controllers/authController')
const auth = require('../middleware/auth')


router.post('/register', register)
router.post('/login', login)
router.get('/exist', auth, exist)


module.exports = router;
