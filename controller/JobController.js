const JOB = require('../schema/JobSchema');
const USER = require('../schema/UserSchema');
const axios = require('axios');                  // For sending HTTP requests

async function getCoordinates({ district, taluka, village }) {
    const baseUrl = "https://nominatim.openstreetmap.org/search";

    async function fetchLocation(query) {
        try {
            const response = await axios.get(baseUrl, {
                params: {
                    q: query,
                    format: "json",
                    limit: 5
                },
                headers: {
                    "User-Agent": "Agro360-App"
                }
            });
            return response.data;
        } catch (error) {
            return { error: error.message };
        }
    }

    let locationQuery = `${village}, ${taluka}, ${district}, महाराष्ट्र,भारत`;
    console.log("Trying with village:", locationQuery);
    let data = await fetchLocation(locationQuery);

    if (!data || data.length === 0) {
        locationQuery = `${taluka}, ${district}, महाराष्ट्र,भारत`;
        console.log("Retrying without village:", locationQuery);
        data = await fetchLocation(locationQuery);
    }

    if (!data || data.length === 0) {
        return { error: "No location found" };
    }

    let bestMatch = null;
    for (const place of data) {
        if (place.type === "village") {
            bestMatch = place;
            break;
        } else if (place.type === "town" && !bestMatch) {
            bestMatch = place;
        } else if (place.type === "administrative" && !bestMatch) {
            bestMatch = place;
        }
    }

    if (!bestMatch) {
        return { error: "No suitable match found" };
    }

    return {
        lat: bestMatch.lat,
        lon: bestMatch.lon,
    };
}


const createJob = async (req, res) => {
    try {
        const { userId, title, description, location, workDate, wageType, duration, contact, workersNeeded, jobType } = req.body;

        if (!userId || !title || !location || !workDate || !wageType || !workersNeeded || !contact) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }
        console.log(location);

        const coordinates = await getCoordinates(location);
        console.log(coordinates);

        const geoPoint = coordinates.lat && coordinates.lon ? {
            type: "Point",
            coordinates: [parseFloat(coordinates.lon), parseFloat(coordinates.lat)]  // MongoDB requires [longitude, latitude] order
        } : null;

        const newJob = new JOB({
            title,
            description,
            location: {
                ...location,
                coordinates: coordinates || { lat: null, lon: null },
                geoPoint: geoPoint // ✅ Added without affecting existing logic
            },
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


const getAppliedJobsByUser = async (req, res) => {
    try {
        const { userId } = req.body; // Extract userId from request body

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch user's applied jobs
        const user = await USER.findById(userId).select("appliedJobs");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch jobs using the appliedJobs array
        const jobs = await JOB.find({ _id: { $in: user.appliedJobs } });

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Fetch jobs by user ID
const getJobsByUser = async (req, res) => {
    try {
        const { userId } = req.body; // Extract userId from request body

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const jobs = await JOB.find({ createdBy: userId });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const nearestJobs = async (req, res) => {
    try {
        const { location, userId } = req.body; // Accepting from request body
        const coordinates = await getCoordinates(location);
        if (!coordinates.lat || !coordinates.lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        // Fetch user's applied job IDs
        const user = await USER.findById(userId).select("appliedJobs");
        const appliedJobIds = user?.appliedJobs || [];

        const jobs = await JOB.find({
            "location.geoPoint": {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(coordinates.lon), parseFloat(coordinates.lat)] },
                    $maxDistance: 40000 // Default: 20 km
                }
            },
            createdBy: { $ne: userId },// excluding post created by user 
            _id: { $nin: appliedJobIds },// Exclude jobs already applied for
            $expr: { $lt: ["$currentApplicants", "$workersNeeded"] } // Exclude full jobs
        });

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




//apply
const applyJob = async (req, res) => {
    const { userId, jobId } = req.body;  // Extract userId and jobId from request body

    try {
        const job = await JOB.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Prevent job creator from applying
        if (job.createdBy.toString() === userId)
            return res.status(400).json({ message: "You cannot apply to your own job" });

        // Check if user already applied
        const user = await USER.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.appliedJobs.includes(jobId))
            return res.status(400).json({ message: "You have already applied to this job" });

        // Check if all positions are filled
        if (job.currentApplicants >= job.workersNeeded)
            return res.status(400).json({ message: "Job application is full" });

        // Update User schema
        user.appliedJobs.push(jobId);
        await user.save();

        // Update Job schema
        job.currentApplicants += 1;
        await job.save();

        res.status(200).json({ message: "Application successful" });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};





const mongoose = require('mongoose');


const getApplicantsForJob = async (req, res) => {
    try {
        // Extract jobId from request body
        const { jobId } = req.body;

        // 1️⃣ Check if jobId is provided
        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        // 2️⃣ Check if jobId is a valid ObjectId
        if (!mongoose.isValidObjectId(jobId)) {
            return res.status(400).json({ message: "Invalid job ID format" });
        }

        console.log("🔍 Searching applicants for jobId:", jobId);

        // 3️⃣ Try querying users with different formats of jobId
        let applicants = await USER.find({ appliedJobs: jobId });

        // 4️⃣ If no applicants found, try querying with ObjectId
        if (applicants.length === 0) {
            console.log("⚠️ No applicants found using jobId as a string. Retrying with ObjectId...");
            applicants = await USER.find({ appliedJobs: new mongoose.Types.ObjectId(jobId) });
        }

        // 5️⃣ Final check if applicants exist
        if (applicants.length === 0) {
            return res.status(404).json({ message: "No applicants found for this job", jobId, applicants: [] });
        }

        console.log("✅ Applicants found:", applicants.length);

        res.status(200).json({ jobId, applicants });
    } catch (error) {
        console.error("❌ Error fetching applicants:", error);

        // 6️⃣ Handle specific MongoDB errors
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ObjectId format" });
        }

        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// async function addAppliedJob(userId, jobId) {
//     try {
//         const updatedUser = await USER.findByIdAndUpdate(
//             userId,
//             { $push: { appliedJobs: new mongoose.Types.ObjectId(jobId) } },
//             { new: true } // Return the updated user
//         );

//         console.log("✅ Job added successfully:", updatedUser);
//     } catch (error) {
//         console.error("❌ Error updating user:", error);
//     }
// }
//addAppliedJob("67b7275291e61944c6a92716", "67c803cff30960e19d28fea1");



module.exports = {
    createJob,
    getAllJobs,
    getJobsByUser,
    nearestJobs,
    applyJob,
    getApplicantsForJob
};