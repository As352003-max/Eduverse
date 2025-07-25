const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');

router.get('/student/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`Fetching data for userId: ${userId}`);

    const userDoc = await db.collection('progress').doc(userId).get();

    if (!userDoc.exists) {
      return res.json({ averageScore: 0, attemptsData: [], videoWatchData: [] });
    }

    const quizData = userDoc.data();

    let totalScore = 0;
    let count = 0;
    const attemptsData = [];

    // For video watch times, store array of {timestamp, secondsWatched}
    const videoWatchData = [];

    for (const timestampId in quizData) {
      const attempt = quizData[timestampId];
      const correct = attempt.correctAnswers ?? 0;
      const total = attempt.totalQuestions ?? 0;

      if (typeof correct === 'number' && typeof total === 'number' && total > 0) {
        const score = (correct / total) * 100;
        totalScore += score;
        count++;

        const datePart = timestampId.split('_')[0];
        attemptsData.push({
          date: datePart,
          score: parseFloat(score.toFixed(2)),
        });
      }

      if (timestampId.startsWith('videoProgress')) {
        // For video progress keys: videoProgress.{userId}.{contentId}.{timestamp}
        // Extract full timestamp for x-axis in frontend
        // Example key: "videoProgress.687a965dd9d3e3b3acec2cc0.0.2025-07-20.12:53:41"

        // Extract date + time part after userId and contentId
        // This will be everything after the third dot
        // split by '.' and join the rest for full timestamp string
        const parts = timestampId.split('.');
        const fullTimestamp = parts.slice(3).join('.'); // e.g., '2025-07-20.12:53:41'
        // Replace dot between date and time with 'T' for ISO standard
        const isoTimestamp = fullTimestamp.replace('.', 'T');

        const secondsWatched = quizData[timestampId] || 0;

        videoWatchData.push({
          timestamp: isoTimestamp,
          secondsWatched,
        });
      }
    }

    // Sort videoWatchData by timestamp ascending
    videoWatchData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const averageScore = count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0;

    return res.json({ averageScore, attemptsData, videoWatchData });
  } catch (error) {
    console.error('❌ Error fetching quiz analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
