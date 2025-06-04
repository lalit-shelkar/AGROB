const express = require('express');
const { signupcontroller, verifyOtpController, loginController } = require('../controller/AuthController');
const { createJob, getAllJobs, getJobsByUser, nearestJobs, applyJob, getApplicantsForJob, getAppliedJobsByUser, withdrawApplication } = require('../controller/JobController');
const { createAnimal, getAvailableAnimals, getMyListedAnimals, getMyBoughtAnimals, buyAnimal, getAnimalDetails } = require('../controller/AnimalController');
const router = express.Router();

router.post("/signup", signupcontroller);
router.post("/verifyotp", verifyOtpController);
router.post("/login", loginController);



router.post('/createJob', createJob);
router.get('/getAllJobs', getAllJobs);
router.post('/user/posts', getJobsByUser);
router.post('/jobs/near', nearestJobs);
router.post('/job/apply', applyJob);
router.post('/viewApplicants', getApplicantsForJob);

router.post('/jobs/applied', getAppliedJobsByUser);
router.post('/job/withdraw', withdrawApplication);


router.post('/createAnimal', createAnimal);
router.get('/available', getAvailableAnimals);
router.get('/my-listings', getMyListedAnimals);
router.get('/my-purchases', getMyBoughtAnimals);
router.put('/:id/buy', buyAnimal);
router.get('/:id', getAnimalDetails);



module.exports = router;