// backend/models/Reward.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['badge', 'xp_bonus', 'item'], // Define types of rewards
        required: true,
    },
    // For badges related to module completion
    moduleCompletion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        default: null, // Null if it's a general badge
    },
    xpAmount: { // For XP bonus rewards
        type: Number,
        default: 0,
    },
    imageUrl: { // Optional: for badge icons or item images
        type: String,
    },
    // Add other fields as needed, e.g., criteria for unlocking
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);