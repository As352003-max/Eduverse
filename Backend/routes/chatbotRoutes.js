const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST /api/chatbot/message — send message to Gemini and get response
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

        // Clean history to avoid sending _id to Gemini
        const chatHistoryForGemini = session.history.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(p => ({ text: p.text }))
        }));

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const chat = model.startChat({
            history: chatHistoryForGemini,
            generationConfig: { maxOutputTokens: 500 },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

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
        console.error('❌ Error interacting with chatbot:', error.response?.data || error.stack || error.message);
        res.status(500).json({
            message: 'Server error interacting with chatbot.',
            error: error.response?.data || error.message,
        });
    }
});

// GET /api/chatbot/sessions — fetch all sessions with optional filters
router.get('/sessions', protect, async (req, res) => {
    const { title, dateFrom, dateTo } = req.query;
    const userId = req.user.id;

    const query = { userId };

    if (title) {
        query.title = { $regex: new RegExp(title, 'i') };
    }

    if (dateFrom || dateTo) {
        query.updatedAt = {};
        if (dateFrom) query.updatedAt.$gte = new Date(dateFrom);
        if (dateTo) query.updatedAt.$lte = new Date(dateTo);
    }

    try {
        const sessions = await ChatSession.find(query).sort({ updatedAt: -1 });
        res.status(200).json(sessions);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ message: 'Failed to fetch chat sessions.', error: err.message });
    }
});

// POST /api/chatbot/new-session — create a new session
router.post('/new-session', protect, async (req, res) => {
    const { title } = req.body;
    const userId = req.user.id;

    try {
        const session = new ChatSession({
            userId,
            title: title || 'New Chat Session',
            history: [],
        });

        await session.save();
        res.status(201).json({ message: 'New session created.', session });
    } catch (err) {
        console.error('Error creating session:', err);
        res.status(500).json({ message: 'Failed to create chat session.', error: err.message });
    }
});

// PUT /api/chatbot/session/:sessionId/rename — rename a session
router.put('/session/:sessionId/rename', protect, async (req, res) => {
    const { sessionId } = req.params;
    const { title } = req.body;

    try {
        const session = await ChatSession.findOneAndUpdate(
            { _id: sessionId, userId: req.user.id },
            { title },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Session renamed.', session });
    } catch (err) {
        console.error('Error renaming session:', err);
        res.status(500).json({ message: 'Failed to rename session.', error: err.message });
    }
});

module.exports = router;
