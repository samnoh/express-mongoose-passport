const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const passport = require('passport');
const hpp = require('hpp');
const helmet = require('helmet');
const dotenv = require('dotenv');
dotenv.config();

const apiRouter = require('./routes/apiRouter');
const connect = require('./models');
const passportConfig = require('./passport');
const prod = process.env.NODE_ENV === 'production';

const app = express();
connect();
passportConfig(passport);
app.set('port', process.env.PORT || 5000);

if (prod) {
    app.use(hpp());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(
        cors({
            origin: '*',
            credentials: true
        })
    );
} else {
    app.use(morgan('dev'));
    app.use(
        cors({
            origin: true,
            credentials: true
        })
    );
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: prod,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        },
        name: 'mynextjsapp',
        store: new MongoStore({
            url: `mongodb://${process.env.MONGO_ID}:${
                process.env.MONGO_PASSWORD
            }@localhost:27017/admin`
        })
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('back-end');
});

app.use('/api/user', apiRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send(`${res.locals.error} - ${err.status}`);
});

app.listen(app.get('port'), () => {
    console.log(`server is running on http://localhost:${app.get('port')}`);
});
