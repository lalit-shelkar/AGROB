require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { // Prevent buffering issues
        });

        console.log(" MongoDB Connected Successfully!");
    } catch (error) {
        console.error(" MongoDB Connection Failed:", error);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = connectDB;
