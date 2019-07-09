const local = require('./local');
const User = require('../models/user');

module.exports = passport => {
    passport.serializeUser((user, done) => {
        return done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findOne({ _id: id });
            console.log(`1 ${id}`);
            done(null, user); // -> req.user
        } catch (e) {
            console.error(e);
            return done(e);
        }
    });

    local(passport);
};
