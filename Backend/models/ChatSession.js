const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    role: { // 'user' or 'model'
        type: String,
        required: true,
        enum: ['user', 'model'],
    },
    parts: [{ // Array of text parts, compatible with Gemini API structure
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
    history: [chatMessageSchema], // Array of messages in the conversation
    lastActive: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Ensure unique session per user
chatSessionSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
