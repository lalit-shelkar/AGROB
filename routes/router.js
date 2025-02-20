const express = require('express');
const { signupcontroller } = require('../controller/AuthController');
const router = express.Router();

router.post("/signup", signupcontroller);

module.exports = router;