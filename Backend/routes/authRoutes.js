const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

const generateUniqueUsername = async (baseUsername) => {
    let username = baseUsername;
    let counter = 0;
    let userExists = await User.findOne({ username });
    while (userExists) {
        username = `${baseUsername}_${Math.random().toString(36).substring(2, 8)}`;
        userExists = await User.findOne({ username });
        counter++;
        if (counter > 10) throw new Error('Failed to generate a unique username.');
    }
    return username;
};

router.post('/register', async (req, res) => {
    const { username, email, password, role, firebaseId, authType = 'email_password' } = req.body;
    if (!username || !email || !role) return res.status(400).json({ message: 'Missing required fields.' });
    if (authType === 'email_password' && !password) return res.status(400).json({ message: 'Password is required.' });
    if (authType === 'firebase' && !firebaseId) return res.status(400).json({ message: 'Firebase ID required.' });

    try {
        let userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'User already exists.' });
        if (authType === 'firebase' && firebaseId) {
            userExists = await User.findOne({ firebaseId });
            if (userExists) return res.status(400).json({ message: 'Firebase ID already exists.' });
        }

        let newUser;
        if (authType === 'email_password') {
            newUser = await User.create({ username, email, password, role, authType });
        } else if (authType === 'firebase') {
            const uniqueUsername = await generateUniqueUsername(username);
            newUser = await User.create({ username: uniqueUsername, email, firebaseId, role, authType });
        } else return res.status(400).json({ message: 'Invalid authentication type.' });

        const token = generateToken(newUser._id);
        res.status(201).json({
            message: 'User registered successfully',
            user: { _id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, totalXp: newUser.totalXp, currentLevel: newUser.currentLevel, badges: newUser.badges },
            token
        });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Duplicate email or username.' });
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
    try {
        const user = await User.findOne({ email, authType: 'email_password' });
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            return res.json({
                message: 'Login successful',
                user: { _id: user._id, username: user.username, email: user.email, role: user.role, totalXp: user.totalXp, currentLevel: user.currentLevel, badges: user.badges },
                token
            });
        }
        res.status(401).json({ message: 'Invalid email or password.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

router.post('/firebase-auth', async (req, res) => {
    const { token: idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Firebase token required.' });
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const firebaseId = decoded.uid;
        const email = decoded.email;
        const displayName = decoded.name || (email ? email.split('@')[0] : firebaseId);

        let user = await User.findOne({ firebaseId });
        if (!user && email) {
            user = await User.findOne({ email });
            if (user && !user.firebaseId) {
                user.firebaseId = firebaseId;
                user.authType = 'firebase';
                await user.save();
            }
        }
        if (!user) {
            const uniqueUsername = await generateUniqueUsername(displayName);
            user = await User.create({ username: uniqueUsername, email, firebaseId, authType: 'firebase', role: 'student' });
        }

        const backendToken = generateToken(user._id);
        res.status(200).json({
            message: 'Firebase authentication successful',
            user: { _id: user._id, username: user.username, email: user.email, role: user.role, totalXp: user.totalXp, currentLevel: user.currentLevel, badges: user.badges },
            token: backendToken
        });
    } catch (error) {
        if (typeof error.code === 'string' && error.code.startsWith('auth/')) return res.status(401).json({ message: `Firebase Auth Error: ${error.message}` });
        if (error.code === 11000) return res.status(409).json({ message: 'Duplicate user detected.' });
        res.status(500).json({ message: 'Server error during Firebase authentication.', error: error.message });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        totalXp: req.user.totalXp,
        currentLevel: req.user.currentLevel,
        badges: req.user.badges
    });
});

module.exports = router;
