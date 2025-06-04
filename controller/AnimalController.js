const Animal = require('../models/Animal');


// Create animal listing
const createAnimal = async (req, res) => {
    try {
        const { name, animalType, breed, age, weight, price, description, location } = req.body;

        const animal = new Animal({
            user: req.user.id,
            name,
            animalType,
            breed,
            age: age ? parseInt(age) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            price: parseFloat(price),
            description,
            location: JSON.parse(location),
            image: req.body.image // Cloudinary URL from client
        });

        await animal.save();
        res.status(201).json(animal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all available animals (not sold)
const getAvailableAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({ isSold: false })
            .populate('user', 'name contact')
            .sort({ createdAt: -1 });

        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get animals listed by current user
const getMyListedAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get animals bought by current user
const getMyBoughtAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({ soldTo: req.user.id })
            .populate('user', 'name contact')
            .sort({ soldAt: -1 });

        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buy an animal
const buyAnimal = async (req, res) => {
    try {
        const animal = await Animal.findById(req.params.id);

        if (!animal) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        if (animal.isSold) {
            return res.status(400).json({ message: 'Animal already sold' });
        }

        if (animal.user.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot buy your own animal' });
        }

        animal.isSold = true;
        animal.soldTo = req.user.id;
        animal.soldAt = new Date();

        await animal.save();

        res.json({ message: 'Purchase successful', animal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get animal details
const getAnimalDetails = async (req, res) => {
    try {
        const animal = await Animal.findById(req.params.id)
            .populate('user', 'name contact')
            .populate('soldTo', 'name contact');

        if (!animal) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        res.json(animal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAnimal, getAvailableAnimals, getMyListedAnimals, getMyBoughtAnimals, buyAnimal, getAnimalDetails
};