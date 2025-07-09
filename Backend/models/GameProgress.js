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
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    score: {
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
    customData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    lastAttemptedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

gameProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);