const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const router = express.Router();

// GET /api/user
router.get('/', isLoggedIn, (req, res) => {
    res.send('you are logged in');
});

// POST /api/user/register
router.post('/register', isNotLoggedIn, async (req, res, next) => {
    if (req.body.password.length < 8) {
        return res.send('too short');
    }

    try {
        console.log(req.body);
        const exUser = await User.findOne({ userId: req.body.userId });
        if (exUser) {
            return res.status(403).send('Already signed up');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const newUser = await User.create({ userId: req.body.userId, password: hashedPassword });

        return res.status(200).json(newUser);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

// POST /api/user/login
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }

        if (info) {
            return res.status(401).send(info.message);
        }

        return req.login(user, async loginError => {
            try {
                if (loginError) {
                    console.error(loginError);
                    return next(loginError);
                }

                const exUser = await User.findOne({ _id: user._id });
                return res.json(exUser);
            } catch (e) {
                next(e);
            }
        });
    })(req, res, next);
});

// get /api/user/login
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
