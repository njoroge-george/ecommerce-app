const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User').default;

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        let user = await User.findOne({ where: { email: profile.emails[0].value } });

        if (user) {
          // User exists, return the user
          return done(null, user);
        } else {
          // Create a new user
          const newUser = await User.create({
            name: profile.displayName,
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' '),
            email: profile.emails[0].value,
            password: 'google-oauth-' + Math.random().toString(36).substring(7), // Random password (they won't use it)
            avatar: profile.photos[0]?.value || null,
            isVerified: profile.emails[0].verified || false,
            role: 'customer',
          });

          return done(null, newUser);
        }
      } catch (error) {
        console.error('Error in Google OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
