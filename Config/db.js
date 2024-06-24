const mongoose = require('mongoose');
require('dotenv').config(); // Ensure dotenv is configured

const dbUrl = process.env.dbUrl;


const connectToMongo = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to Mongoose');
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
    }
};

module.exports = connectToMongo;
