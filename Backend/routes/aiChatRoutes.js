// backend/routes/aiChatRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // <-- CORRECTED: Import 'protect' using destructuring
// const AIChat = require('../models/AIChat'); // If you have an AI Chat model

// @route   GET /api/ai-chat/history
// @desc    Get AI chat history for the logged-in user
// @access  Private
router.get('/history', protect, async (req, res) => { // <-- CORRECTED: Use 'protect' here
    try {
        // In a real app, you would fetch chat history for req.user._id
        // Example: const chatHistory = await AIChat.find({ userId: req.user._id }).sort({ timestamp: 1 });
        const dummyChatHistory = [ // Replace with actual database fetch
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
        // Here you would integrate with your actual AI service (e.g., OpenAI API or Gemini API)
        // For now, let's return a simple mock response
        const aiResponse = `AI received: "${message}". I'm still processing that thought!`;

        res.status(200).json({ sender: 'ai', message: aiResponse });
    } catch (error) {
        console.error('Error sending message to AI:', error);
        res.status(500).json({ message: 'Server error when communicating with AI.' });
    }
});

module.exports = router;