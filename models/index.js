const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

module.exports = () => {
    const connect = () => {
        if (NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect(MONGO_URL, { useNewUrlParser: true, dbName: 'nextjsback' }, error => {
            if (error) {
                console.log('MongoDB Connection Error', error);
            } else {
                console.log('MongoDB Connected!');
            }
        });
    };
    connect();

    mongoose.connection.on('error', error => {
        console.error('MongoDB Connection Error', error);
    });
    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB Disconnected! Trying to connect...');
        connect();
    });

    require('./user');
};
