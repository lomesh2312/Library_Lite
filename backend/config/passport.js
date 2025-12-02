const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {

        const admin = await prisma.admin.findUnique({ where: { admin_id: id } });
        if (admin) {
            done(null, admin);
        } else {
            const user = await prisma.user.findUnique({ where: { id } });
            done(null, user);
        }
    } catch (err) {
        done(err, null);
    }
});


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'PLACEHOLDER_CLIENT_SECRET',
    callbackURL: "https://library-lite.onrender.com/api/auth/github/callback",
    scope: ['user:email']
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.com`; // Fallback if email is private
            const name = profile.displayName || profile.username;
            const profileUrl = profile.photos?.[0]?.value;

            // Check if Admin exists
            let admin = await prisma.admin.findUnique({ where: { email_id: email } });

            if (!admin) {
                // Check if User exists
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    // Create User
                    user = await prisma.user.create({
                        data: {
                            name,
                            email,
                            passwordHash: 'oauth_user',
                            isAdmin: true
                        }
                    });
                }

                // Create Admin (Sync)
                admin = await prisma.admin.create({
                    data: {
                        name,
                        email_id: email,
                        password: 'oauth_user',
                        profileUrl: profileUrl
                    }
                });
            } else {
                // Update profile URL if missing
                if (!admin.profileUrl && profileUrl) {
                    admin = await prisma.admin.update({
                        where: { admin_id: admin.admin_id },
                        data: { profileUrl }
                    });
                }
            }

            return done(null, admin);
        } catch (err) {
            return done(err, null);
        }
    }
));

module.exports = passport;
