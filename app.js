require('dotenv').config();
const express = require('express');
const connectDB = require('./config/mongodbConfig');
const router = require('./routes/router');

const app = express();
const port = process.env.PORT || 5000;
connectDB.connect();

// Middleware
app.use(express.json());

// Routes
app.use('/api', router);

// Root route
app.get('/', (req, res) => {
    res.send("Welcome to Agro 360 v5");
});


app.listen(port, () => {
    console.log(` Server running at: http://localhost:${port}`);
});
// Start server only after MongoDB is connected


//module.exports = app;