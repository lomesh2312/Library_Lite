const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


const syncAdmin = async (user, profileUrl) => {
    try {
        const existingAdmin = await prisma.admin.findUnique({ where: { email_id: user.email } });
        if (!existingAdmin) {
            await prisma.admin.create({
                data: {
                    name: user.name,
                    email_id: user.email,
                    password: user.passwordHash || 'oauth_user', 
                    profileUrl: profileUrl
                }
            });
        } else {

            if (profileUrl && existingAdmin.profileUrl !== profileUrl) {
                await prisma.admin.update({
                    where: { email_id: user.email },
                    data: { profileUrl }
                });
            }
        }
    } catch (error) {
        console.error('Error syncing admin:', error);
    }
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName,
                            email: email,
                            passwordHash: 'oauth_google', 
                            isAdmin: true
                        }
                    });
                }

                await syncAdmin(user, profile.photos[0]?.value);
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
        scope: ['user:email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `${profile.username}@github.com`; 
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName || profile.username,
                            email: email,
                            passwordHash: 'oauth_github',
                            isAdmin: true
                        }
                    });
                }

                await syncAdmin(user, profile.photos[0]?.value);
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

module.exports = passport;
