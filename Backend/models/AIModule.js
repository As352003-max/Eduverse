const mongoose = require('mongoose');

const aiModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    gradeLevel: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    concepts: [{ type: String }], // e.g., 'Machine Learning', 'Neural Networks'
    content: [{ // Array of learning chunks
        type: { type: String, enum: ['text', 'quiz', 'puzzle', 'simulation', 'video'], required: true },
        data: mongoose.Schema.Types.Mixed // Flexible field to store content for different types
    }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    xpAward: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('AIModule', aiModuleSchema);