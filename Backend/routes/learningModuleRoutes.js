const express = require('express');
const router = express.Router();
// CORRECTED: Import LearningModule Mongoose model
const LearningModule = require('../models/LearningModule');

// Create new module
router.post('/', async (req, res) => {
    try {
        // CORRECTED: Use Mongoose create
        const newModule = await LearningModule.create(req.body);
        res.status(201).json(newModule); // Send back the created module object
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all modules
router.get('/', async (req, res) => {
    try {
        // CORRECTED: Use Mongoose find
        const modules = await LearningModule.find({});
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get module by ID
router.get('/:id', async (req, res) => {
    try {
        // CORRECTED: Use Mongoose findById
        const module = await LearningModule.findById(req.params.id);
        if (!module) return res.status(404).json({ error: 'Module not found' });
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;