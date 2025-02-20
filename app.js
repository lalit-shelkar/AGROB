require('dotenv').config();
const express = require('express');
const connectDB = require('./config/mongodbConfig');
const router = require('./routes/router');

const app = express();
const port = process.env.PORT || 9000; // Use default port 5000 if not specified

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Handle JSON requests

// Routes
app.use('/api', router);

// Root route
app.get('/', (req, res) => {
    res.send("Welcome to Agro 360 v3 🚜");
});

// Global error handler (prevents app crashes)
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err);
    res.status(500).json({ message: "Something went wrong on our end." });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`);
});
