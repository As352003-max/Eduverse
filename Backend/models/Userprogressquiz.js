const mongoose = require('mongoose');

const userQuizProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
  textRead: [{ type: Number }],
  quizStats: [
    {
      contentIndex: Number,
      attempts: Number,
      correct: Number
    }
  ],
  videoWatchTime: {
    type: Map,
    of: Number
  }
}, { timestamps: true });

// Safe export
module.exports = mongoose.models.UserQuizProgress || mongoose.model('UserQuizProgress', userQuizProgressSchema);
