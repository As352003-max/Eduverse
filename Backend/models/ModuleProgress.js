const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
}, { timestamps: true });

const ModuleProgress = mongoose.model('ModuleProgress', moduleProgressSchema);

module.exports = ModuleProgress;
