// backend/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API with key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// @route   POST /api/chatbot/message
// @desc    Send message to AI chatbot and get response, with session persistence
// @access  Private
router.post('/message', protect, async (req, res) => {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
        let session;
        if (sessionId) {
            session = await ChatSession.findById(sessionId);
        } else {
            session = await ChatSession.findOne({ userId });
        }

        if (!session) {
            session = new ChatSession({ userId, history: [] });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Prepare chat history for Gemini API.
        // IMPORTANT FIX: Do NOT include the current user message in the history passed to startChat.
        // It will be added by chat.sendMessage()
        const chatHistoryForGemini = session.history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: msg.parts
        }));

        const chat = model.startChat({
            history: chatHistoryForGemini,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // Send the new user message. This will add it to the conversation history
        // within the Gemini model's context for the current turn.
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Now, update your local session history with both the user's message and the AI's response
        session.history.push({ role: 'user', parts: [{ text: message }] });
        session.history.push({ role: 'model', parts: [{ text: responseText }] });
        session.lastActive = Date.now();
        await session.save();

        res.status(200).json({
            message: 'AI response received.',
            response: responseText,
            sessionId: session._id,
            history: session.history,
        });

    } catch (error) {
        console.error('Error interacting with chatbot:', error.response?.data || error.message);
        res.status(500).json({ message: 'Server error interacting with chatbot.', error: error.message });
    }
});

// @route   GET /api/chatbot/session/:sessionId
// @desc    Get a specific chat session's history
// @access  Private
router.get('/session/:sessionId', protect, async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;

    try {
        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: 'Chat session not found or unauthorized.' });
        }
        res.status(200).json(session);
    } catch (error) {
        console.error('Error fetching chat session:', error);
        res.status(500).json({ message: 'Server error fetching chat session.', error: error.message });
    }
});

module.exports = router;
