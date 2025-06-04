const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    animalType: {
        type: String,
        required: true,
        enum: ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Other']
    },
    breed: String,
    age: Number,
    weight: Number,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: String,
    image: {
        type: String,
        required: true
    },
    location: {
        district: String,
        taluka: String,
        village: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isSold: {
        type: Boolean,
        default: false
    },
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    soldAt: Date
});

module.exports = mongoose.model('Animal', animalSchema);