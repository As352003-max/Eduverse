// backend/routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const Module = require('../models/Module'); // Import the Module model
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import auth middleware

// @route   GET /api/modules
// @desc    Get all learning modules
// @access  Public (or Private, if you want to require login to see modules)
router.get('/', async (req, res) => {
    try {
        const modules = await Module.find({});
        res.status(200).json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error.message);
        res.status(500).json({ message: 'Server error fetching modules.' });
    }
});

// @route   GET /api/modules/:id
// @desc    Get a single learning module by ID
// @access  Public (or Private)
router.get('/:id', async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: 'Module not found.' });
        }
        res.status(200).json(module);
    } catch (error) {
        console.error('Error fetching module by ID:', error.message);
        res.status(500).json({ message: 'Server error fetching module.' });
    }
});

// @route   POST /api/modules
// @desc    Create a new learning module
// @access  Private (Admin/Teacher only)
router.post('/', protect, authorizeRoles('admin', 'teacher'), async (req, res) => {
    const { title, description, gradeLevel, difficulty, content, xpAward } = req.body;

    if (!title || !description || !gradeLevel || !difficulty || !content) {
        return res.status(400).json({ message: 'Please enter all required module fields.' });
    }

    try {
        const newModule = new Module({
            title,
            description,
            gradeLevel,
            difficulty,
            content,
            xpAward: xpAward || 100, // Default XP if not provided
        });
        const savedModule = await newModule.save();
        res.status(201).json({ message: 'Module created successfully.', module: savedModule });
    } catch (error) {
        console.error('Error creating module:', error.message);
        res.status(500).json({ message: 'Server error creating module.' });
    }
});

// @route   PUT /api/modules/:id
// @desc    Update a learning module by ID
// @access  Private (Admin/Teacher only)
router.put('/:id', protect, authorizeRoles('admin', 'teacher'), async (req, res) => {
    const { title, description, gradeLevel, difficulty, content, xpAward } = req.body;

    try {
        const updatedModule = await Module.findByIdAndUpdate(
            req.params.id,
            { title, description, gradeLevel, difficulty, content, xpAward },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedModule) {
            return res.status(404).json({ message: 'Module not found.' });
        }
        res.status(200).json({ message: 'Module updated successfully.', module: updatedModule });
    } catch (error) {
        console.error('Error updating module:', error.message);
        res.status(500).json({ message: 'Server error updating module.' });
    }
});

// @route   DELETE /api/modules/:id
// @desc    Delete a learning module by ID
// @access  Private (Admin/Teacher only)
router.delete('/:id', protect, authorizeRoles('admin', 'teacher'), async (req, res) => {
    try {
        const deletedModule = await Module.findByIdAndDelete(req.params.id);
        if (!deletedModule) {
            return res.status(404).json({ message: 'Module not found.' });
        }
        res.status(200).json({ message: 'Module deleted successfully.' });
    } catch (error) {
        console.error('Error deleting module:', error.message);
        res.status(500).json({ message: 'Server error deleting module.' });
    }
});

module.exports = router;
