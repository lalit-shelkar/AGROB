require('dotenv').config();
const express = require('express');
const connectDB = require('./config/mongodbConfig');
const router = require('./routes/router');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', router);

// Root route
app.get('/', (req, res) => {
    res.send("Welcome to Agro 360 v4");
});

// Start server only after MongoDB is connected
connectDB().then(() => {
    app.listen(port, () => {
        console.log(` Server running at: http://localhost:${port}`);
    });
}).catch((error) => {
    console.error(" Server startup failed due to DB connection issue:", error);
});

//module.exports = app;