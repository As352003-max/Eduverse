const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getIO } = require('../socket');

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

router.get('/role/:roleName', protect, async (req, res) => {
    const { roleName } = req.params;
    const validRoles = ['student', 'teacher', 'admin', 'parent'];
    if (!validRoles.includes(roleName)) return res.status(400).json({ message: 'Invalid role' });
    const authorized = req.user.role === 'admin' || (['teacher', 'parent'].includes(req.user.role) && roleName === 'student');
    if (!authorized) return res.status(403).json({ message: 'Not authorized' });
    try {
        const users = await User.find({ role: roleName }).select('-password');
        if (!users.length) return res.status(404).json({ message: `No ${roleName}s found` });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

router.get('/all', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all users', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    const { id } = req.params;
    if (req.user._id.toString() !== id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    try {
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    if (req.user._id.toString() !== id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    const updates = { ...req.body };
    if (updates.role && req.user.role !== 'admin') delete updates.role;
    if (updates.password) delete updates.password;
    try {
        const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

router.post('/:id/progress', protect, async (req, res) => {
    const { id } = req.params;
    const { score = 0, level = 0, overallProgress = 0, xpGained = 0, gameId, badgesEarned } = req.body;
    try {
        const profile = await User.findById(id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        if (!profile.gameProgress) profile.gameProgress = {};
        if (!profile.gameProgress[gameId]) profile.gameProgress[gameId] = { currentScore: 0, currentLevel: 0 };
        profile.gameProgress[gameId].currentScore += score;
        profile.gameProgress[gameId].currentLevel = Math.max(profile.gameProgress[gameId].currentLevel, level);
        profile.totalXp += xpGained;
        profile.currentLevel = Math.max(profile.currentLevel, overallProgress);
        if (badgesEarned && Array.isArray(badgesEarned)) {
            profile.badges = [...new Set([...(profile.badges || []), ...badgesEarned])];
        }
        await profile.save();
        getIO().to(id.toString()).emit('profileUpdated', { userId: id, updates: profile });
        res.json({ message: 'Progress updated', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error: error.message });
    }
});

module.exports = router;
