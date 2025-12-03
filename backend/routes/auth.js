const express = require('express');

const router = express.Router();

const { register, login, exist } = require('../controllers/authController')
const auth = require('../middleware/auth')


const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', register)
router.post('/login', login)
router.get('/exist', auth, exist)


router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',

    passport.authenticate('github', { failureRedirect: '/login', session: false }),
    (req, res) => {

        const token = jwt.sign({ userId: req.user.admin_id, isAdmin: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        const frontendUrl = process.env.FRONTEND_URL || 'https://library-lite-1.onrender.com';
        res.redirect(`${frontendUrl}/oauth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: req.user.admin_id,
            name: req.user.name,
            email: req.user.email_id,
            isAdmin: true,
            profileUrl: req.user.profileUrl
        }))}`);
    }
);


module.exports = router;
