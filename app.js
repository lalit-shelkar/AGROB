require('dotenv').config();
const express = require('express');
const connectDB = require('./config/mongodbConfig');
const router = require('./routes/router');
const path = require("path");


const app = express();
const port = process.env.PORT || 5000;
connectDB.connect();

app.use(express.static(path.join(__dirname, "public")));
// Middleware
app.use(express.json());

// Routes
app.use('/api', router);

// Root route
app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Agro 360</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: green; }
                .container { max-width: 600px; margin: auto; }
                .contact { margin-top: 20px; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to Agro 360</h1>
                <p>Your trusted platform for agricultural solutions.</p>
                <p>This is an academic project designed to help farmers with agricultural solutions.</p>
                <h3>OTP Verification Proof *** PLZ TRY REFRESHING IN CASE OF PAGE NOT LOAING</h3>
                <p>We use OTP verification to ensure secure access. <br> Check <a href="/fast2sms_verify.txt">this file</a> for ownership verification.</p>
                <div class="contact">
                    <h3>Contact Us</h3>
                    <p>Email: lalitshelkar2424@gmail.com</p>
                    <p>Phone: +91-7385624021</p>
                </div>
            </div>
        </body>
        </html>
    `);
});


app.listen(port, () => {
    console.log(` Server running at: http://localhost:${port}`);
});
// Start server only after MongoDB is connected


//module.exports = app;