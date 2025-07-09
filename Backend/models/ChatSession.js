const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'model'],
    },
    parts: [{
        text: {
            type: String,
            required: true,
        },
    }],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        default: 'Untitled Session',
    },
    history: [chatMessageSchema],
    lastActive: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Removed the unique index so users can have multiple sessions


// Optional: only if you want to enforce one session per user
// chatSessionSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
