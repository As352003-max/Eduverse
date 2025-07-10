const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// 🔐 GET user profile
router.get('/profile', protect, async (req, res) => {
    console.log(`🔐 [GET] /users/profile for ${req.user.email}`);
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
        console.error('❌ Error fetching profile:', error.message);
        res.status(500).json({ message: 'Server error fetching profile.', error: error.message });
    } finally {
        console.log(`⏱️ [GET] /users/profile took ${Date.now() - start}ms`);
    }
});

// 📚 GET users by role
router.get('/role/:roleName', protect, async (req, res) => {
    const start = Date.now();
    const { roleName } = req.params;
    const requester = req.user;

    console.log(`🔎 [GET] /users/role/${roleName} by ${requester.email} (${requester.role})`);

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
            ...(u.role === 'student' && u.grade && { grade: u.grade }),
        }));

        res.status(200).json(filtered);
    } catch (error) {
        console.error(`❌ Error fetching ${roleName}s:`, error.message);
        res.status(500).json({ message: 'Server error fetching users by role.', error: error.message });
    } finally {
        console.log(`⏱️ [GET] /users/role/${roleName} took ${Date.now() - start}ms`);
    }
});

// 🔍 GET all users (admin only)
router.get('/all', protect, authorizeRoles('admin'), async (req, res) => {
    console.log(`🧑‍💼 [GET] /users/all by admin`);
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('❌ Error fetching all users:', error.message);
        res.status(500).json({ message: 'Server error fetching all users.', error: error.message });
    }
});

// 👤 GET specific user by ID
router.get('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const start = Date.now();
    const requester = req.user;

    console.log(`📄 [GET] /users/${id} by ${requester.email} (${requester.role})`);

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
        console.error('❌ Error fetching user by ID:', error.message);
        res.status(500).json({ message: 'Server error fetching user.', error: error.message });
    } finally {
        console.log(`⏱️ [GET] /users/${id} took ${Date.now() - start}ms`);
    }
});

// ✏️ UPDATE user
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    const requester = req.user;

    console.log(`✏️ [PUT] /users/${id} by ${requester.email}`);

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
        console.error('❌ Error updating user:', error.message);
        res.status(500).json({ message: 'Server error updating user.', error: error.message });
    }
});

// 🗑️ DELETE user (admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ [DELETE] /users/${id}`);

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found.' });

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
        res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
});

module.exports = router;
