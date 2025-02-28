const JOB = require('../schema/JobSchema');
const USER = require('../schema/UserSchema');

// ✅ Create a new job
const createJob = async (req, res) => {
    try {
        const { userId, title, description, location, workDate, wageType, duration, contact, workersNeeded, jobType } = req.body;

        if (!userId || !title || !location || !workDate || !wageType || !workersNeeded || !contact) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        const newJob = new JOB({
            title,
            description,
            location,
            workDate,
            wageType,
            duration,
            contact,
            workersNeeded,
            jobType,
            createdBy: userId
        });

        const savedJob = await newJob.save();

        // Update user's createdJobs list
        await USER.findByIdAndUpdate(userId, { $push: { createdJobs: savedJob._id } });

        res.status(201).json({ message: 'Job posted successfully', job: savedJob });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Fetch all jobs
const getAllJobs = async (req, res) => {
    try {
        const jobs = await JOB.find().populate('createdBy', 'name mobNumber');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Fetch jobs by user ID
const getJobsByUser = async (req, res) => {
    try {
        const jobs = await JOB.find({ createdBy: req.params.userId });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJobsByUser
};