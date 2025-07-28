const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningModule', required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  readContents: [{ type: mongoose.Schema.Types.ObjectId }],   // ✅ store read content ids
  watchedVideos: [{ type: mongoose.Schema.Types.ObjectId }],  // ✅ store watched videos
  quizResults: [
    {
      contentId: { type: mongoose.Schema.Types.ObjectId },
      score: Number,
      total: Number,
      answers: [String],
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ModuleProgress', moduleProgressSchema);
