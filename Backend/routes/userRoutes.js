const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { io } = require('../server');

router.get('/profile', protect, async (req, res) => {
    const start = Date.now();
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
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
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Server error fetching profile.', error: error.message });
    } finally {
        console.log(`[GET] /users/profile took ${Date.now() - start}ms`);
    }
});

router.get('/role/:roleName', protect, async (req, res) => {
    const start = Date.now();
    const { roleName } = req.params;
    const requester = req.user;
    try {
        const validRoles = ['student', 'teacher', 'admin', 'parent'];
        if (!validRoles.includes(roleName)) {
            return res.status(400).json({ message: `Invalid role: ${roleName}` });
        }
        const authorized =
            requester.role === 'admin' ||
            (['teacher', 'parent'].includes(requester.role) && roleName === 'student');
        if (!authorized) {
            return res.status(403).json({ message: 'Not authorized to access this role.' });
        }
        const users = await User.find({ role: roleName }).select('-password');
        if (!users.length) {
            return res.status(404).json({ message: `No ${roleName}s found.` });
        }
        const filtered = users.map(u => ({
            _id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
            totalXp: u.totalXp,
            currentLevel: u.currentLevel,
            badges: u.badges,
            ...(u.role === 'student' && u.grade && { grade: u.grade }),
        }));
        res.status(200).json(filtered);
    } catch (error) {
        console.error(`Error fetching ${roleName}s:`, error.message);
        res.status(500).json({ message: 'Server error fetching users by role.', error: error.message });
    } finally {
        console.log(`[GET] /users/role/${roleName} took ${Date.now() - start}ms`);
    }
});

router.get('/all', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error.message);
        res.status(500).json({ message: 'Server error fetching all users.', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const start = Date.now();
    const requester = req.user;
    try {
        if (requester._id.toString() !== id && requester.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this profile.' });
        }
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
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
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ message: 'Server error fetching user.', error: error.message });
    } finally {
        console.log(`[GET] /users/${id} took ${Date.now() - start}ms`);
    }
});

router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    const requester = req.user;
    try {
        if (requester._id.toString() !== id && requester.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this user.' });
        }
        if (updates.role && requester.role !== 'admin') delete updates.role;
        if (updates.password) delete updates.password;
        const updatedUser = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'User not found.' });
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
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'Server error updating user.', error: error.message });
    }
});

router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
});

router.post('/:id/progress', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const score = Number(req.body.score) || 0;
        const level = Number(req.body.level) || 0;
        const overallProgress = Number(req.body.overallProgress) || 0;
        const xpGained = Number(req.body.xpGained) || 0;
        const { gameId, badgesEarned } = req.body;

        let profile = await User.findById(id);

        if (!profile) {
            return res.status(404).json({ message: 'Profile (User) not found.' });
        }

        if (!profile.gameProgress) {
            profile.gameProgress = {};
        }
        if (!profile.gameProgress[gameId]) {
            profile.gameProgress[gameId] = { currentScore: 0, currentLevel: 0 };
        }

        profile.gameProgress[gameId].currentScore = (profile.gameProgress[gameId].currentScore || 0) + score;
        profile.gameProgress[gameId].currentLevel = Math.max(profile.gameProgress[gameId].currentLevel || 0, level);

        profile.totalXp = (profile.totalXp || 0) + xpGained;
        profile.currentLevel = Math.max(profile.currentLevel || 0, overallProgress);

        if (badgesEarned && Array.isArray(badgesEarned)) {
            if (!profile.badges) {
                profile.badges = [];
            }
            badgesEarned.forEach(badge => {
                if (!profile.badges.includes(badge)) {
                    profile.badges.push(badge);
                }
            });
        }

        await profile.save();

        io.to(id.toString()).emit('profileUpdated', {
            userId: id,
            updates: {
                gameProgress: profile.gameProgress,
                totalXp: profile.totalXp,
                currentLevel: profile.currentLevel,
                badges: profile.badges
            }
        });

        res.status(200).json({
            message: 'Progress updated successfully',
            profile: {
                _id: profile._id,
                totalXp: profile.totalXp,
                currentLevel: profile.currentLevel,
                gameProgress: profile.gameProgress,
                badges: profile.badges,
            }
        });

    } catch (error) {
        console.error('Error updating progress:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error updating progress', errors: error.errors });
        }
        res.status(500).json({ message: 'Failed to update progress', error: error.message });
    }
});

module.exports = router;