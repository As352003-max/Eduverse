const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');

// ✅ Save Quiz Result
router.post('/saveQuiz/:userId', async (req, res) => {
  const { userId } = req.params;
  const { timestampId, correctAnswers, totalQuestions } = req.body;

  if (!timestampId || correctAnswers === undefined || totalQuestions === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.collection('progress').doc(userId).set(
      {
        [timestampId]: {
          correctAnswers,
          totalQuestions,
          savedAt: new Date().toISOString()
        }
      },
      { merge: true }
    );

    console.log(`✅ Quiz saved for ${userId} at ${timestampId}`);
    return res.json({ success: true, message: 'Quiz result saved successfully' });
  } catch (error) {
    console.error('❌ Error saving quiz result:', error);
    return res.status(500).json({ error: 'Failed to save quiz result' });
  }
});

// ✅ Fetch Quiz + Video Analytics
router.get('/student/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userDoc = await db.collection('progress').doc(userId).get();

    if (!userDoc.exists) {
      console.log('ℹ️ No progress data for user:', userId);
      return res.json({ averageScore: 0, attemptsData: [], videoWatchData: [] });
    }

    const quizData = userDoc.data();
    let totalScore = 0, count = 0;
    const attemptsData = [];
    const videoWatchData = [];

    for (const key in quizData) {
      const attempt = quizData[key];

      // ✅ Handle Quiz Scores
      if (attempt.correctAnswers !== undefined && attempt.totalQuestions > 0) {
        const score = (attempt.correctAnswers / attempt.totalQuestions) * 100;
        totalScore += score;
        count++;

        const datePart = key.split('_')[0]; // extract YYYY-MM-DD
        attemptsData.push({ date: datePart, score: parseFloat(score.toFixed(2)) });
      }

      // ✅ Handle Video Progress
      if (key.startsWith('videoProgress')) {
        const parts = key.split('.');
        const dateTimePart = parts.slice(3).join('.');
        const isoTimestamp = dateTimePart.replace('.', 'T');
        const secondsWatched = attempt.secondsWatched || 0;

        videoWatchData.push({ timestamp: isoTimestamp, secondsWatched });
      }
    }

    videoWatchData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const averageScore = count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0;

    return res.json({ averageScore, attemptsData, videoWatchData });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
