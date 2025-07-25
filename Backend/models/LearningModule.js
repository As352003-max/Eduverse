const mongoose = require('mongoose');

const contentPieceSchema = new mongoose.Schema({
    title: { type: String }, // Added title for content pieces, as used in previous data
    type: {
        type: String,
        enum: ['video', 'text', 'quiz'], // Only these types are allowed now
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Use Mixed to allow flexible data for each content type
        required: true
    }
});

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    content: [contentPieceSchema]
});

const learningModuleSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    gradeLevel: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    topics: [topicSchema], // Modules now have topics
    xpAward: { type: Number, default: 100 },
    thumbnailUrl: { type: String } // Added for consistency with frontend display
}, { timestamps: true });

module.exports = mongoose.model('LearningModule', learningModuleSchema);