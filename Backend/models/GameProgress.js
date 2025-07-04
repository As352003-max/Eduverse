// backend/models/GameProgress.js
const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    progress: { // Percentage completion of the module/game
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
    },
    score: { // Score achieved in the game/quiz
        type: Number,
        default: 0,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    hintsUsed: {
        type: Number,
        default: 0,
    },
    customData: { // Flexible field for game-specific data (e.g., quiz answers, puzzle state)
        type: mongoose.Schema.Types.Mixed,
    },
    lastAttemptedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Ensure unique combination of userId and moduleId
gameProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);
