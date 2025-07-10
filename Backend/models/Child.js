const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Child name is required'],
        trim: true,
        minlength: [2, 'Child name must be at least 2 characters long'],
        maxlength: [50, 'Child name cannot exceed 50 characters']
    },
    dob: {
        type: Date,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    learningPreferences: {
        type: [String],
        required: false,
        enum: ['visual', 'auditory', 'reading/writing', 'kinesthetic'],
        default: []
    },
    gradeLevel: {
        type: String,
        required: false,
        trim: true,
        maxlength: 50
    },
    currentXp: {
        type: Number,
        default: 0,
        min: 0
    },
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    modulesCompleted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        default: []
    }],
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Child = mongoose.model('Child', ChildSchema);

module.exports = Child;
