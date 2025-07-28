const express = require('express');
const router = express.Router();
const ModuleProgress = require('../models/ModuleProgress');

// ✅ Mark Text as Read
router.post('/read', async (req, res) => {
  try {
    const { userId, moduleId, contentId } = req.body;
    if (!userId || !moduleId || !contentId) return res.status(400).json({ error: 'Missing fields' });

    await ModuleProgress.updateOne(
      { userId, moduleId },
      { $addToSet: { readContents: contentId } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Text marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Track Video Watch
router.post('/watch', async (req, res) => {
  try {
    const { userId, moduleId, contentId } = req.body;
    if (!userId || !moduleId || !contentId) return res.status(400).json({ error: 'Missing fields' });

    await ModuleProgress.updateOne(
      { userId, moduleId },
      { $addToSet: { watchedVideos: contentId } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Video watch recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Record Quiz Result
router.post('/quiz', async (req, res) => {
  try {
    const { userId, moduleId, contentId, score, total, answers } = req.body;
    if (!userId || !moduleId || !contentId) return res.status(400).json({ error: 'Missing fields' });

    await ModuleProgress.updateOne(
      { userId, moduleId },
      { $push: { quizResults: { contentId, score, total, answers } } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Quiz result saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
