const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
    markTextAsRead,
    updateVideoWatchTime,
    recordQuizResult
} = require('../controllers/progressController');

function getToday() {
    return new Date().toISOString().split('T')[0];
}

router.post('/read', protect, async (req, res) => {
    // --- ADD THESE LOGS ---
    console.log('--- Inside progressRoutes /read handler ---');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.originalUrl);
    console.log('Request Headers:', req.headers);
    console.log('req.body (before destructuring):', req.body); // THIS IS THE KEY LOG
    // --- END ADDED LOGS ---

    const userId = req.user._id;
    const { moduleId, contentId } = req.body; // <--- This is the line that's failing

    if (!moduleId || contentId == null) {
        return res.status(400).json({ error: 'Missing required fields: moduleId, contentId' });
    }
    try {
        await markTextAsRead(userId, moduleId, contentId);
        res.status(200).json({ message: 'Text marked as read successfully.' });
    } catch (error) {
        console.error('Error marking text as read:', error);
        res.status(500).json({ error: error.message || 'Failed to mark text as read.' });
    }
});

router.post('/watch', protect, async (req, res) => {
    // --- ADD THESE LOGS ---
    console.log('--- Inside progressRoutes /watch handler ---');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.originalUrl);
    console.log('Request Headers:', req.headers);
    console.log('req.body (before destructuring):', req.body); // THIS IS THE KEY LOG
    // --- END ADDED LOGS ---

    const userId = req.user._id;
    const { moduleId, contentId, watchTime } = req.body;

    if (!moduleId || contentId == null || watchTime == null) {
        return res.status(400).json({ error: 'Missing required fields: moduleId, contentId, watchTime.' });
    }
    try {
        await updateVideoWatchTime(userId, moduleId, contentId, watchTime);
        res.status(200).json({ message: 'Watch time saved successfully.' });
    } catch (error) {
        console.error('🔥 Error saving watch time:', error);
        res.status(500).json({ error: error.message || 'Failed to save watch time.' });
    }
});

router.post('/quiz', protect, async (req, res) => {
    // ... (no changes needed here unless you want to add the same logs for quiz) ...
    const userId = req.user._id;
    const { moduleId, contentId, score, answers } = req.body;

    const isCorrect = (score === answers.length && answers.length > 0);

    console.log("📥 Received quiz POST:", { userId, moduleId, contentId, score, answers, isCorrect }); // Existing log

    if (!moduleId || contentId == null || score == null || !answers) {
        return res.status(400).json({ error: 'Missing required fields: moduleId, contentId, score, answers.' });
    }
    try {
        await recordQuizResult(userId, moduleId, contentId, isCorrect);
        res.status(200).json({ message: 'Quiz progress saved successfully.' });
    } catch (error) {
        console.error('🔥 Error saving quiz result:', error);
        res.status(500).json({ error: error.message || 'Failed to save quiz result.' });
    }
});

module.exports = router;