const express = require('express');
const { signupcontroller, verifyOtpController } = require('../controller/AuthController');
const router = express.Router();

router.post("/signup", signupcontroller);
router.post("/verifyotp", verifyOtpController);

module.exports = router;