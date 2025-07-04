// backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const GameProgress = require('../models/GameProgress');
const User = require('../models/User');
const Module = require('../models/Module');
const Reward = require('../models/Reward'); // For badges
const { calculateLevel } = require('../utils/gamificationUtils'); // For level calculation
const { io } = require('../server'); // Import the Socket.IO instance

// @route   POST /api/games/progress
// @desc    Update user's game progress and apply gamification
// @access  Private
router.post('/progress', protect, async (req, res) => {
    const { moduleId, progress, score, completed, hintsUsed, customData } = req.body;
    const userId = req.user.id; // User ID from authenticated request

    try {
        // Find existing progress
        let gameProgress = await GameProgress.findOne({ userId, moduleId });
        let wasAlreadyCompleted = gameProgress ? gameProgress.completed : false; // Check if it was already completed

        if (!gameProgress) {
            gameProgress = new GameProgress({
                userId,
                moduleId,
                progress,
                score,
                completed,
                attempts: 1,
                hintsUsed,
                customData,
                lastAttemptedAt: Date.now(),
            });
        } else {
            // Update existing progress
            gameProgress.progress = Math.max(gameProgress.progress, progress); // Take highest progress
            gameProgress.score = Math.max(gameProgress.score, score); // Take highest score for this attempt
            gameProgress.completed = gameProgress.completed || completed; // Once completed, always completed
            gameProgress.attempts += 1;
            gameProgress.hintsUsed += hintsUsed;
            gameProgress.customData = { ...gameProgress.customData, ...customData }; // Merge custom data
            gameProgress.lastAttemptedAt = Date.now();
        }

        await gameProgress.save();

        // --- Gamification Logic ---
        let user = await User.findById(userId);
        let xpGain = 0;
        let levelUp = false;
        let newLevel = user.currentLevel;
        const newBadges = [];

        const module = await Module.findById(moduleId);
        if (!module) {
            console.warn(`Module with ID ${moduleId} not found for gamification.`);
        }

        // 1. XP Awarding
        // Award XP only if the module was just completed NOW (i.e., it wasn't completed before, but is now)
        if (completed && !wasAlreadyCompleted && module) {
            xpGain = module.xpAward || 100; // Use module's XP or default XP for completion
            user.totalXp += xpGain;

            // 2. Level Up Check
            const oldLevel = user.currentLevel;
            newLevel = calculateLevel(user.totalXp);
            if (newLevel > oldLevel) {
                user.currentLevel = newLevel;
                levelUp = true;
                // Emit a real-time notification for level up
                if (io) { // Check if io is defined (it should be if imported correctly in server.js)
                    io.to(userId).emit('achievementUnlocked', {
                        type: 'levelUp',
                        newLevel: newLevel,
                        message: `Congratulations! You leveled up to Level ${newLevel}!`,
                    });
                }
            }
        } else if (progress > 0 && !completed && module && !wasAlreadyCompleted) { // Award partial XP for incomplete, non-completed activities
            // Award a small amount of XP for partial progress if not already completed
            // This is optional, adjust logic as needed
            const partialXp = Math.floor((module.xpAward || 100) * (progress / 100) * 0.2); // 20% of module XP for partial
            if (partialXp > 0) {
                user.totalXp += partialXp;
                const oldLevel = user.currentLevel;
                newLevel = calculateLevel(user.totalXp);
                if (newLevel > oldLevel) {
                    user.currentLevel = newLevel;
                    levelUp = true;
                    if (io) {
                        io.to(userId).emit('achievementUnlocked', {
                            type: 'levelUp',
                            newLevel: newLevel,
                            message: `Congratulations! You leveled up to Level ${newLevel}!`,
                        });
                    }
                }
                xpGain += partialXp;
            }
        }


        // 3. Badge Awarding (simplified for example)
        // Check for general completion badge (e.g., "First Completion")
        if (completed && !wasAlreadyCompleted && module && !user.badges.includes('First Completion')) {
            const firstCompletionBadge = await Reward.findOne({ name: 'First Completion', type: 'badge' });
            if (firstCompletionBadge) {
                user.badges.push('First Completion');
                newBadges.push('First Completion');
                if (io) {
                    io.to(userId).emit('achievementUnlocked', {
                        type: 'badge',
                        name: 'First Completion',
                        message: `New Badge Unlocked: First Completion!`,
                    });
                }
            }
        }

        // Check for module-specific badge (example: requires a `moduleCompletion` field in Reward model)
        // You would need to seed these specific badges in your database
        if (completed && !wasAlreadyCompleted && module) {
            const moduleSpecificBadge = await Reward.findOne({ moduleCompletion: module._id, type: 'badge' });
            if (moduleSpecificBadge && !user.badges.includes(moduleSpecificBadge.name)) {
                user.badges.push(moduleSpecificBadge.name);
                newBadges.push(moduleSpecificBadge.name);
                if (io) {
                    io.to(userId).emit('achievementUnlocked', {
                        type: 'badge',
                        name: moduleSpecificBadge.name,
                        message: `New Badge Unlocked: ${moduleSpecificBadge.name}!`,
                    });
                }
            }
        }

        // Save updated user data
        await user.save();

        res.status(200).json({
            message: 'Game progress updated successfully.',
            progress: gameProgress,
            gamification: {
                xpGain,
                levelUp,
                newLevel,
                newBadges,
                totalXp: user.totalXp,
                currentLevel: user.currentLevel,
            },
        });

    } catch (error) {
        console.error('Error updating game progress:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/games/progress/:moduleId
// @desc    Get user's progress for a specific module
// @access  Private
router.get('/progress/:moduleId', protect, async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.id;

        const gameProgress = await GameProgress.findOne({ userId, moduleId });

        if (!gameProgress) {
            return res.status(200).json({
                message: 'No progress found for this module.',
                progress: null,
                completed: false,
                score: 0,
            });
        }

        res.status(200).json({
            message: 'Game progress retrieved successfully.',
            progress: gameProgress,
            completed: gameProgress.completed,
            score: gameProgress.score,
        });
    } catch (error) {
        console.error('Error fetching game progress:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/games/leaderboard
// @desc    Get top users for the leaderboard based on total XP
// @access  Public (or Private, if you want to require login to see leaderboard)
router.get('/leaderboard', async (req, res) => {
    try {
        // Find all users, sort by totalXp in descending order, and limit to top 100 (or adjust as needed)
        // Select only necessary fields to avoid sending sensitive data
        const leaderboard = await User.find({})
            .sort({ totalXp: -1 }) // Sort by totalXp descending
            .limit(100) // Limit to top 100 users
            .select('username totalXp currentLevel badges'); // Select only these fields

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Server error fetching leaderboard.' });
    }
});


module.exports = router;
