const express = require('express');
const { signupcontroller, verifyOtpController, loginController } = require('../controller/AuthController');
const { createJob, getAllJobs, getJobsByUser, nearestJobs, applyJob } = require('../controller/JobController');
const router = express.Router();

router.post("/signup", signupcontroller);
router.post("/verifyotp", verifyOtpController);
router.post("/login", loginController);



router.post('/createJob', createJob);
router.get('/getAllJobs', getAllJobs);
router.post('/user/posts', getJobsByUser);
router.post('/jobs/near', nearestJobs);
router.post('/job/apply', applyJob);



module.exports = router;