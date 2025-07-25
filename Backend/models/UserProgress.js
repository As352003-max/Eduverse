const UserProgress = require('../models/UserProgress');

async function markTextAsRead(userId, moduleId, contentId) {
  await UserProgress.updateOne(
    { userId, moduleId },
    {
      $set: {
        [`read.${contentId}`]: true,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
}

async function updateVideoWatchTime(userId, moduleId, contentId, watchTime) {
  await UserProgress.updateOne(
    { userId, moduleId },
    {
      $set: {
        [`videoWatchTime.${contentId}`]: watchTime,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
}

async function recordQuizResult(userId, moduleId, score, total) {
  await UserProgress.updateOne(
    { userId, moduleId },
    {
      $set: {
        quizScore: score,
        quizTotal: total,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
}

module.exports = {
  markTextAsRead,
  updateVideoWatchTime,
  recordQuizResult,
};
