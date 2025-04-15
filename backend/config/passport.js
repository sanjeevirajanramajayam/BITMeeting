// config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async(id, done) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy Configuration
passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:5000/auth/google/callback',
            passReqToCallback: true,
        },
        async(req, accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in database
                const [existingUsers] = await db.query(
                    'SELECT * FROM users WHERE email = ?', [profile.emails[0].value]
                );

                if (existingUsers.length > 0) {
                    // Update existing user
                    const user = existingUsers[0];
                    await db.query(
                        'UPDATE users SET name = ?, google_id = ?, auth_type = ? WHERE id = ?', [profile.displayName, profile.id, 'google', user.id]
                    );
                    return done(null, user);
                }

                // Create new user
                const [result] = await db.query(
                    'INSERT INTO users (name, email, google_id, auth_type) VALUES (?, ?, ?, ?)', [profile.displayName, profile.emails[0].value, profile.id, 'google']
                );

                const newUser = {
                    id: result.insertId,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    google_id: profile.id,
                    auth_type: 'google'
                };

                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;