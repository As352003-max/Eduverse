const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const User = require('../models/User');
const GameProgress = require('../models/GameProgress');
const Module = require('../models/Module');

router.post('/event', protect, analyticsController.trackEvent);

router.get('/student/:userId', protect, async (req, res) => {
    const { userId } = req.params;
    const requestingUser = req.user;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }

        const student = await User.findById(userId).select('-password -parent_id');

        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found or user is not a student.' });
        }

        const isAuthorized =
            requestingUser.id.toString() === userId ||
            requestingUser.role === 'admin' ||
            requestingUser.role === 'teacher' ||
            (requestingUser.role === 'parent' &&
                student.parent_id &&
                requestingUser._id.toString() === student.parent_id.toString());

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to view this student\'s analytics.' });
        }

        const studentProgress = await GameProgress.find({ userId: student._id });

        const totalModulesAttempted = studentProgress.length;
        const modulesCompleted = studentProgress.filter(p => p.completed).length;
        const totalAvailableModules = await Module.countDocuments();

        const completionRate = totalModulesAttempted > 0
            ? (modulesCompleted / totalModulesAttempted) * 100
            : 0;

        const recentActivity = studentProgress
            .sort((a, b) => new Date(b.lastAttemptedAt).getTime() - new Date(a.lastAttemptedAt).getTime())
            .slice(0, 5)
            .map(p => ({
                moduleId: p.moduleId,
                score: p.score,
                completed: p.completed,
                lastAttemptedAt: p.lastAttemptedAt,
            }));

        res.status(200).json({
            student: {
                _id: student._id,
                username: student.username,
                email: student.email,
                role: student.role,
                totalXp: student.totalXp,
                currentLevel: student.currentLevel,
                badges: student.badges,
            },
            analytics: {
                totalModulesAttempted,
                modulesCompleted,
                completionRate: parseFloat(completionRate.toFixed(2)),
                totalAvailableModules,
                recentActivity,
            },
            progressDetails: studentProgress
        });

    } catch (error) {
        console.error('Error fetching student analytics:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format provided.' });
        }
        res.status(500).json({ message: 'Server error fetching student analytics.', error: error.message });
    }
});

module.exports = router;
