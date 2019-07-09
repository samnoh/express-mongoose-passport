const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'userId',
                passwordField: 'password'
            },
            async (userId, password, done) => {
                try {
                    const user = await User.findOne({ userId: userId });
                    if (!user) {
                        return done(null, false, { reason: 'No Such User' });
                    }

                    const result = await bcrypt.compare(password, user.password);
                    if (result) {
                        return done(null, user);
                    }

                    return done(null, false, { reason: 'Wrong password' });
                } catch (e) {
                    console.error(e);
                    return done(e);
                }
            }
        )
    );
};
