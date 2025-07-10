const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ChatSession = require('../models/ChatSession');
const ModuleProgress = require('../models/ModuleProgress');
const GameProgress = require('../models/GameProgress');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const mongoose = require('mongoose'); 

router.get('/teacher/students', protect, authorizeRoles('teacher', 'admin'), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('username email totalXp currentLevel');
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching teacher students:', error.message);
        res.status(500).json({ message: 'Failed to fetch students.', error: error.message });
    }
});

router.get('/teacher/student-progress/:studentId', protect, authorizeRoles('teacher', 'admin', 'parent'), async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await User.findById(studentId).select('-password');
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const moduleProgress = await ModuleProgress.find({ userId: studentId });
        const gameProgress = await GameProgress.find({ userId: studentId });
        const chatSessions = await ChatSession.find({ userId: studentId }).sort({ lastActive: -1 }).limit(5);

        res.status(200).json({
            studentInfo: student,
            moduleProgress,
            gameProgress,
            latestChatSessions: chatSessions
        });
    } catch (error) {
        console.error('Error fetching student progress:', error.message);
        res.status(500).json({ message: 'Failed to fetch student progress.', error: error.message });
    }
});

router.get('/reports/module-completion', protect, authorizeRoles('admin', 'teacher'), async (req, res) => {
    try {
        const completionStats = await ModuleProgress.aggregate([
            { $group: {
                _id: '$moduleId',
                completedCount: { $sum: { $cond: ['$isCompleted', 1, 0] } },
                totalAttempts: { $sum: 1 }
            }},
            { $lookup: {
                from: 'modules',
                localField: '_id',
                foreignField: '_id',
                as: 'moduleDetails'
            }},
            { $unwind: '$moduleDetails' },
            { $project: {
                _id: 0,
                moduleId: '$_id',
                moduleTitle: '$moduleDetails.title',
                completedCount: 1,
                totalAttempts: 1,
                completionRate: { $multiply: [{ $divide: ['$completedCount', '$totalAttempts'] }, 100] }
            }}
        ]);
        res.status(200).json(completionStats);
    } catch (error) {
        console.error('Error generating module completion report:', error.message);
        res.status(500).json({ message: 'Failed to generate report.', error: error.message });
    }
});

module.exports = router;