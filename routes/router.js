const express = require('express');
const { signupcontroller, verifyOtpController, loginController } = require('../controller/AuthController');
const { createJob, getAllJobs, getJobsByUser, nearestJobs } = require('../controller/JobController');
const router = express.Router();

router.post("/signup", signupcontroller);
router.post("/verifyotp", verifyOtpController);
router.post("/login", loginController);
router.post('/createJob', createJob);
router.get('/getAllJobs', getAllJobs);
router.get('/user/:userId', getJobsByUser);
router.post('/jobs/near', nearestJobs);


module.exports = router;