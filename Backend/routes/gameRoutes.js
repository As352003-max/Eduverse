// backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const GameProgress = require('../models/GameProgress');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // CORRECTED: Destructure 'protect' here
const { io } = require('../server');

const applyGamificationLogic = async (userId, score, completed) => {
    const user = await User.findById(userId);
    if (!user) return;

    let xpGain = 0;
    let levelUp = false;
    let newBadges = [];

    xpGain += completed ? 50 : 20;
    xpGain += Math.floor(score / 10);

    user.totalXp += xpGain;

    const newLevel = Math.floor(user.totalXp / 100) + 1;
    if (newLevel > user.currentLevel) {
        user.currentLevel = newLevel;
        levelUp = true;
        io.to(userId.toString()).emit('levelUp', { newLevel: user.currentLevel });
    }

    if (completed && !user.badges.includes('First Completion')) {
        user.badges.push('First Completion');
        newBadges.push('First Completion');
        io.to(userId.toString()).emit('newBadge', { badge: 'First Completion' });
    }
    if (score >= 90 && !user.badges.includes('High Scorer')) {
        user.badges.push('High Scorer');
        newBadges.push('High Scorer');
        io.to(userId.toString()).emit('newBadge', { badge: 'High Scorer' });
    }

    await user.save();

    return { xpGain, levelUp, newBadges, newLevel: user.currentLevel };
};

router.post('/progress', protect, async (req, res) => { // CORRECTED: Use 'protect' directly as middleware
    const { moduleId, progress, score, completed, hintsUsed, customData } = req.body;
    const userId = req.user.id;

    if (!moduleId) {
        return res.status(400).json({ message: 'Module ID is required.' });
    }

    try {
        let gameProgress = await GameProgress.findOneAndUpdate(
            { userId, moduleId },
            {
                $set: { progress, score, completed, hintsUsed, customData, lastAttemptedAt: Date.now() },
                $inc: { attempts: 1 },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        let gamificationResult = {};
        if (completed || progress >= 50) {
            gamificationResult = await applyGamificationLogic(userId, score, completed);
        }

        res.status(200).json({
            message: 'Game progress updated successfully.',
            gameProgress,
            gamification: gamificationResult,
        });
    } catch (error) {
        console.error('Error updating game progress:', error);
        res.status(500).json({ message: 'Server error updating game progress.', error: error.message });
    }
});

router.get('/progress/:moduleId', protect, async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.user.id;

    try {
        const gameProgress = await GameProgress.findOne({ userId, moduleId });
        if (!gameProgress) {
            return res.status(404).json({ message: 'No progress found for this module.' });
        }
        res.status(200).json(gameProgress);
    } catch (error) {
        console.error('Error fetching game progress:', error);
        res.status(500).json({ message: 'Server error fetching game progress.', error: error.message });
    }
});

router.get('/leaderboard', protect, async (req, res) => {
    try {
        const leaderboard = await User.find({})
            .sort({ totalXp: -1, currentLevel: -1 })
            .select('username totalXp currentLevel badges')
            .limit(20);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard.', error: error.message });
    }
});

module.exports = router;