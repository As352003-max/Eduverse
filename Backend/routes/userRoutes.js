// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your User model
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import your auth middleware

// @route   GET /api/users/profile
// @desc    Get the profile of the currently authenticated user
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        // req.user is populated by the 'protect' middleware
        // We select specific fields to return, excluding sensitive ones like password
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                totalXp: user.totalXp,
                currentLevel: user.currentLevel,
                badges: user.badges,
                // Add any other user profile fields you want to expose
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.', error: error.message });
    }
});

// Example of an admin-only route (if you need one)
// @route   GET /api/users/all
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/all', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Fetch all users, exclude passwords
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error fetching all users.', error: error.message });
    }
});


module.exports = router;

