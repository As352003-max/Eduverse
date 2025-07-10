const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');


router.get('/profile', protect, async (req, res) => {
    try {
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
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.', error: error.message });
    }
});


router.get('/:id', protect, async (req, res) => { 
    try {
        const user = await User.findById(req.params.id).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            totalXp: user.totalXp,
            currentLevel: user.currentLevel,
            badges: user.badges,
           
        });
    } catch (error) {
      
        console.error('Error fetching user by ID:', error);
      
        res.status(500).json({ message: 'Server error fetching user by ID.', error: error.message });
    }
});


router.get('/all', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error fetching all users.', error: error.message });
    }
});

module.exports = router;