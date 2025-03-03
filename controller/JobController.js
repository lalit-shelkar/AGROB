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


// ✅ Create a new job
const createJob = async (req, res) => {
    try {
        const { userId, title, description, location, workDate, wageType, duration, contact, workersNeeded, jobType } = req.body;

        if (!userId || !title || !location || !workDate || !wageType || !workersNeeded || !contact) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }
        console.log(location);

        const coordinates = await getCoordinates(location);
        console.log(coordinates);
        const newJob = new JOB({
            title,
            description,
            location: {
                ...location,
                coordinates: coordinates || { lat: null, lon: null }
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