// const mongoose = require('mongoose');

// const jobSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     description: { type: String },
//     location: {
//         district: { type: String, required: true },
//         taluka: { type: String, required: true },
//         village: { type: String, required: true }
//     },
//     workDate: { type: Date, required: true },
//     wageType: { type: String, enum: ['Daily Wage', 'Fixed Pay'], required: true },
//     duration: { type: String }, // Only required for daily wage jobs
//     contact: { type: String, required: true },
//     workersNeeded: { type: Number, required: true },
//     jobType: { type: String, required: true },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USER', required: true }
// }, { timestamps: true });

// const JOB = mongoose.model('JOB', jobSchema);
// module.exports = JOB;
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    location: {
        district: { type: String, required: true },
        taluka: { type: String, required: true },
        village: { type: String, required: true },
        coordinates: {
            lat: { type: Number },  // Latitude
            lon: { type: Number }   // Longitude
        },
        geoPoint: {
            type: { type: String, enum: ['Point'], default: 'Point' },  // Required for geospatial queries
            coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
        }
    },
    workDate: { type: Date, required: true },
    wageType: { type: String, enum: ['Daily Wage', 'Fixed Pay'], required: true },
    duration: { type: String }, // Only required for daily wage jobs
    contact: { type: String, required: true },
    workersNeeded: { type: Number, required: true },
    jobType: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USER', required: true },
    currentApplicants: { type: Number, default: 0 },
}, { timestamps: true });

// Create a geospatial index on coordinates for efficient searching
jobSchema.index({ 'location.geoPoint': '2dsphere' });
const JOB = mongoose.model('JOB', jobSchema);
module.exports = JOB;
