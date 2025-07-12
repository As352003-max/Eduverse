const mongoose = require('mongoose');

const MathMazeGameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    mazeId: {
        type: String,
        required: true
    },
    mazeLayout: {
        type: [[Number]],
        required: true
    },
    currentPosition: {
        row: { type: Number, required: true },
        col: { type: Number, required: true }
    },
    targetPosition: {
        row: { type: Number, required: true },
        col: { type: Number, required: true }
    },
    currentProblem: {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        problemType: { type: String, required: true }
    },
    pathTaken: {
        type: [{ row: Number, col: Number }],
        default: []
    },
    movesCount: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    incorrectAttempts: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    },
    xpEarned: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('MathMazeGame', MathMazeGameSchema);