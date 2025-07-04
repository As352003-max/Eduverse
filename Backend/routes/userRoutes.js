// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import auth middleware

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private (User can view their own, Admin/Teacher can view any)
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Authorization: User can view their own profile, or admin/teacher can view any
        if (req.user.id.toString() !== user._id.toString() && !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to view this profile.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
});

// You can add more user-related routes here, e.g., update user profile, get all users (for admin)

module.exports = router;
