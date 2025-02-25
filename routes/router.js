const express = require('express');
const { signupcontroller, verifyOtpController, loginController } = require('../controller/AuthController');
const router = express.Router();

router.post("/signup", signupcontroller);
router.post("/verifyotp", verifyOtpController);
router.post("/login", loginController);


module.exports = router;