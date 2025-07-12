const mongoose = require('mongoose');

const VocabVanguardGameSchema = new mongoose.Schema({
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
    currentWord: {
        word: { type: String, required: true },
        definition: { type: String },
        hint: { type: String },
        imageUrl: { type: String }
    },
    guessesMade: {
        type: Number,
        default: 0
    },
    maxGuesses: {
        type: Number,
        default: 6
    },
    incorrectLetters: {
        type: [String],
        default: []
    },
    correctlyGuessedLetters: {
        type: [String],
        default: []
    },
    completed: {
        type: Boolean,
        default: false
    },
    won: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    xpEarned: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('VocabVanguardGame', VocabVanguardGameSchema);