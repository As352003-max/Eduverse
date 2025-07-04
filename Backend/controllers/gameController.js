// backend/controllers/gameController.js
const asyncHandler = require('express-async-handler'); // For handling async errors gracefully
const User = require('../models/User'); // Assuming your User model defines totalXp and currentLevel
// You might need to import other models if your game controller handles more (e.g., GameProgress, AIModule, Reward)

// @desc    Get the global game leaderboard
// @route   GET /api/games/leaderboard
// @access  Public (or Private, if you choose to protect it with 'protect' middleware)
const getLeaderboard = asyncHandler(async (req, res) => {
    try {
        // Fetch users, sorted by totalXp (descending) and then currentLevel (descending)
        // You can adjust the sorting and limit as needed for your leaderboard.
        // Selecting only necessary fields for efficiency.
        const leaderboard = await User.find({})
                                      .sort({ totalXp: -1, currentLevel: -1 }) // Sort by XP, then by Level
                                      .limit(20) // Get top 20 users
                                      .select('username totalXp currentLevel'); // Only return these fields

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Respond with a 500 status and an error message if something goes wrong
        res.status(500).json({ message: 'Server error fetching leaderboard data.' });
    }
});

// You can add other game-related controller functions here as you develop them
// Example:
// const updateGameProgress = asyncHandler(async (req, res) => {
//     // ... logic to update game progress based on req.body and req.user
// });

// Export all the functions you want to use in your routes
module.exports = {
    getLeaderboard,
    // updateGameProgress, // Uncomment and add if you implement it
};