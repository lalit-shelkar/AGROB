// CORRECT (matches file path)
const Animal = require('../schema/Animal');



// Create animal listing
const createAnimal = async (req, res) => {
    try {
        const { name, animalType, breed, age, weight, price, description, location } = req.body;

        const animal = new Animal({
            user: req.body.userId,
            name,
            animalType,
            breed,
            age: age ? parseInt(age) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            price: parseFloat(price),
            description,
            location: location,
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
        const animals = await Animal.find({ isSold: false, user: { $ne: req.body.userId } })
            .populate({ path: 'user', model: 'USER', select: 'name mobNumber' })
            .sort({ createdAt: -1 });

        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get animals listed by current user
const getMyListedAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({ user: req.body.userId })
            .sort({ createdAt: -1 });

        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get animals bought by current user
const getMyBoughtAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({ soldTo: req.body.userId })
            .populate({ path: 'user', model: 'USER', select: 'name mobNumber' })
            .sort({ soldAt: -1 });

        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buy an animal
const buyAnimal = async (req, res) => {
    try {
        const animal = await Animal.findById(req.body.animalId);

        if (!animal) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        if (animal.isSold) {
            return res.status(400).json({ message: 'Animal already sold' });
        }

        if (animal.user.toString() === req.body.userId) {
            return res.status(400).json({ message: 'You cannot buy your own animal' });
        }

        animal.isSold = true;
        animal.soldTo = req.body.userId;
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
            .populate({ path: 'user', model: 'USER', select: 'name mobNumber' })
            .populate({ path: 'soldTo', model: 'USER', select: 'name mobNumber' });

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