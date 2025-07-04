// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: { // The user who created the project
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'reviewed', 'planning', 'on-hold'],
        default: 'pending',
    },
    dueDate: {
        type: Date,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
    technologies: [{ // Array of strings for technologies used
        type: String,
    }],
    githubLink: {
        type: String,
    },
    liveLink: {
        type: String,
    },
    members: [{ // Array of users collaborating on the project
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Add other fields as needed, e.g., comments, attachments
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
