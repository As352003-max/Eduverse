// backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import auth middleware
const User = require('../models/User');
const GameProgress = require('../models/GameProgress');
const Module = require('../models/Module'); // Assuming you have a Module model

// @route   GET /api/analytics/student/:userId
// @desc    Get dashboard analytics data for a specific student
// @access  Private (accessible by student themselves, their parent, or admin/teacher)
router.get('/student/:userId', protect, async (req, res) => {
    const { userId } = req.params;
    const requestingUser = req.user; // User object from 'protect' middleware

    // Authorization check:
    // A user can view their own data OR
    // A parent can view their child's data (if parent_id matches) OR
    // An admin/teacher can view any student's data
    if (
        requestingUser.id.toString() !== userId && // Not viewing their own data
        requestingUser.role !== 'admin' && // Not an admin
        requestingUser.role !== 'teacher' && // Not a teacher
        !(requestingUser.role === 'parent' && requestingUser._id.toString() === (await User.findById(userId))?.parent_id?.toString()) // Not a parent of this student
    ) {
        return res.status(403).json({ message: 'Not authorized to view this student\'s analytics.' });
    }

    try {
        const student = await User.findById(userId).select('-password');

        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found or user is not a student.' });
        }

        // Fetch game progress for the student
        const studentProgress = await GameProgress.find({ userId: student._id });

        // Calculate various metrics
        const totalModulesAttempted = studentProgress.length;
        const modulesCompleted = studentProgress.filter(p => p.completed).length;
        const uniqueModules = await Module.countDocuments(); // Get total available modules

        const completionRate = totalModulesAttempted > 0
            ? (modulesCompleted / totalModulesAttempted) * 100
            : 0;

        // Example of recent activity (last 5 attempts)
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
                totalAvailableModules: uniqueModules,
                recentActivity,
                // You can add more analytics here, e.g., average score, time spent, etc.
            },
            progressDetails: studentProgress // Optionally send full progress details
        });

    } catch (error) {
        console.error('Error fetching student analytics:', error);
        res.status(500).json({ message: 'Server error fetching student analytics.', error: error.message });
    }
});

module.exports = router;
