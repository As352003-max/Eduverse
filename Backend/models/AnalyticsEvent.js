// In your backend Mongoose schema for AnalyticsEvent
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        index: true,
    },
    profile: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Optional for Anonymous
        },
        kind: {
            type: String,
            // FIX: Change to lowercase enum values to match frontend
            enum: ['user', 'child', 'anonymous'], // Changed here!
            default: 'anonymous', // Also change default for consistency
        },
    },
    eventData: {
        type: Object,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    initiatedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;