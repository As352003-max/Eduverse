const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/ai-chat/history
// @desc    Get AI chat history for the logged-in user
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        // Replace this mock data with a real database query if needed
        const dummyChatHistory = [
            { id: 1, sender: 'user', message: 'Hello AI, how are you?' },
            { id: 2, sender: 'ai', message: 'I am an AI, I do not have feelings, but I am ready to assist you!' },
            { id: 3, sender: 'user', message: 'Can you help me learn about React?' }
        ];

        res.status(200).json({ history: dummyChatHistory });
    } catch (error) {
        console.error('Error fetching AI chat history:', error);
        res.status(500).json({ message: 'Server error fetching chat history.' });
    }
});

// @route   POST /api/ai-chat/send
// @desc    Send a message to the AI and get a response
// @access  Private
router.post('/send', protect, async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        // Placeholder AI logic – you can replace this with Gemini/OpenAI logic later
        const aiResponse = `AI received: "${message}". I'm still processing that thought!`;

        res.status(200).json({ sender: 'ai', message: aiResponse });
    } catch (error) {
        console.error('Error sending message to AI:', error);
        res.status(500).json({ message: 'Server error when communicating with AI.' });
    }
});

module.exports = router;
