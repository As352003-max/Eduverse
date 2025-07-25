const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');

router.get('/student/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`Fetching data for userId: ${userId}`);

    const userDoc = await db.collection('progress').doc(userId).get();

    if (!userDoc.exists) {
      console.log('User document does not exist, returning empty data');
      return res.json({ averageScore: 0, attemptsData: [], videoWatchData: [] });
    }

    const quizData = userDoc.data();
    console.log('Fetched quiz data:', quizData);

    let totalScore = 0;
    let count = 0;
    const attemptsData = [];

    // Video watch points array — each entry is { timestamp: ISO string, secondsWatched: number }
    const videoWatchData = [];

    for (const timestampId in quizData) {
      const attempt = quizData[timestampId];
      const correct = attempt.correctAnswers ?? 0;
      const total = attempt.totalQuestions ?? 0;

      // Calculate quiz scores if valid
      if (typeof correct === 'number' && typeof total === 'number' && total > 0) {
        const score = (correct / total) * 100;
        totalScore += score;
        count++;

        const datePart = timestampId.split('_')[0]; // Extract 'YYYY-MM-DD'

        console.log(`Calculated score for ${datePart}: ${score}`);

        attemptsData.push({
          date: datePart,
          score: parseFloat(score.toFixed(2)),
        });
      }

      // Collect video watch time points
      if (timestampId.startsWith('videoProgress')) {
        // Example key: "videoProgress.687a965dd9d3e3b3acec2cc0.0.2025-07-20.12:53:41"
        const parts = timestampId.split('.');
        const dateTimePart = parts.slice(3).join('.'); // e.g., '2025-07-20.12:53:41'
        const isoTimestamp = dateTimePart.replace('.', 'T'); // e.g., '2025-07-20T12:53:41'

        const secondsWatched = quizData[timestampId] || 0;

        videoWatchData.push({
          timestamp: isoTimestamp,
          secondsWatched,
        });

        console.log(`Video progress point: ${isoTimestamp} = ${secondsWatched}s`);
      }
    }

    // Sort video watch points by timestamp ascending
    videoWatchData.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate average quiz score
    const averageScore = count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0;

    console.log('Calculated average score:', averageScore);

    // Return the data with video watch points (not summed)
    return res.json({ averageScore, attemptsData, videoWatchData });
  } catch (error) {
    console.error('❌ Error fetching quiz analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
