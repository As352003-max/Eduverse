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
                ...(user.role === 'student' && user.grade && { grade: user.grade }),
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.', error: error.message });
    }
});

router.get('/role/:roleName', protect, async (req, res) => {
    try {
        const { roleName } = req.params;
        const validRoles = ['student', 'teacher', 'admin', 'parent'];
        if (!validRoles.includes(roleName)) {
            return res.status(400).json({ message: `Invalid role specified: ${roleName}. Valid roles are: ${validRoles.join(', ')}.` });
        }
        if (req.user.role === 'admin') {
        } else if (['teacher', 'parent'].includes(req.user.role) && roleName === 'student') {
        } else {
            return res.status(403).json({ message: `Not authorized to view users of role: ${roleName}.` });
        }
        const users = await User.find({ role: roleName }).select('-password');
        if (users.length === 0) {
            return res.status(404).json({ message: `No ${roleName}s found.` });
        }
        const filteredUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            totalXp: user.totalXp,
            currentLevel: user.currentLevel,
            ...(user.role === 'student' && user.grade && { grade: user.grade }),
        }));
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error(`Error fetching users by role (${req.params.roleName}):`, error);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid role parameter format.' });
        }
        res.status(500).json({ message: 'Server error fetching users by role.', error: error.message });
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

router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user._id.toString() !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this user\'s profile.' });
        }
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            totalXp: user.totalXp,
            currentLevel: user.currentLevel,
            badges: user.badges,
            ...(user.role === 'student' && user.grade && { grade: user.grade }),
        });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching user by ID.', error: error.message });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (req.user._id.toString() !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this user\'s profile.' });
        }
        if (updates.role && req.user.role !== 'admin') {
            delete updates.role;
        }
        if (updates.password) {
            delete updates.password;
        }
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            totalXp: updatedUser.totalXp,
            currentLevel: updatedUser.currentLevel,
            badges: updatedUser.badges,
            ...(updatedUser.role === 'student' && updatedUser.grade && { grade: updatedUser.grade }),
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format for update.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating user profile.', error: error.message });
    }
});

router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format for deletion.' });
        }
        res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
});

module.exports = router;
