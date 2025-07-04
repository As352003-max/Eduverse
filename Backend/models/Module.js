// backend/models/Module.js
const mongoose = require('mongoose');

const moduleContentPieceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'quiz', 'puzzle', 'simulation', 'drag-and-drop'],
        required: true,
    },
    data: { // Flexible field to store content specific to the type (e.g., text, quiz questions)
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    gradeLevel: {
        min: { type: Number, required: true, min: 1 },
        max: { type: Number, required: true, min: 1 },
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    content: [moduleContentPieceSchema], // Array of content pieces for the module
    xpAward: { // XP awarded upon module completion
        type: Number,
        default: 100,
    },
    // Add other fields as needed, e.g., imageUrl, tags, prerequisites
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
