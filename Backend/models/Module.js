const mongoose = require('mongoose');

const moduleContentPieceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['text', 'quiz', 'puzzle', 'simulation', 'drag-and-drop', 'video'],
        required: true,
    },
    data: {
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
    category: {
        type: String,
        required: true,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    gradeLevel: {
        min: { type: Number, required: true, min: 1 },
        max: { type: Number, required: true, min: 1 },
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
        required: true,
    },
    content: [moduleContentPieceSchema],
    xpAward: {
        type: Number,
        default: 100,
    },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
