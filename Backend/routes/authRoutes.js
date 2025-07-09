const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin'); // Firebase Admin SDK
const User = require('../models/User'); // Your Mongoose User model
const { protect } = require('../middleware/authMiddleware'); // Your JWT protection middleware

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

router.post('/register', async (req, res) => {
    const { username, email, password, role, firebaseId, authType = 'email_password' } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ message: 'Please enter all required fields: username, email, role.' });
    }
    if (authType === 'email_password' && !password) {
        return res.status(400).json({ message: 'Password is required for email/password registration.' });
    }
    if (authType === 'firebase' && !firebaseId) {
        return res.status(400).json({ message: 'Firebase ID is required for Firebase registration.' });
    }

    try {
        // Check if user already exists by email or username
        let userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with that email or username already exists.' });
        }

        // Check if firebaseId already exists if authType is firebase
        if (authType === 'firebase' && firebaseId) {
            userExists = await User.findOne({ firebaseId });
            if (userExists) {
                return res.status(400).json({ message: 'A user with this Firebase ID already exists.' });
            }
        }

        let newUser;
        if (authType === 'email_password') {
            // For email/password registration, password will be hashed by pre-save hook in User model
            newUser = await User.create({
                username,
                email,
                password,
                role,
                authType,
            });
        } else if (authType === 'firebase') {
            newUser = await User.create({
                username,
                email,
                role,
                firebaseId,
                authType,
            });
        } else {
            return res.status(400).json({ message: 'Invalid authentication type provided.' });
        }

        if (newUser) {
            const token = generateToken(newUser._id);
            res.status(201).json({
                message: 'User registered successfully.',
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    totalXp: newUser.totalXp,
                    currentLevel: newUser.currentLevel,
                    badges: newUser.badges,
                },
                token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received.' });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (for email/password users)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        const user = await User.findOne({ email, authType: 'email_password' });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.json({
                message: 'Logged in successfully.',
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    totalXp: user.totalXp,
                    currentLevel: user.currentLevel,
                    badges: user.badges,
                },
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});


router.post('/firebase-auth', async (req, res) => {
    const { token: idToken } = req.body; // Expecting the Firebase ID token in the 'token' field

    if (!idToken) {
        return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    try {
        // Verify the Firebase ID token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseId = decodedToken.uid;
        const email = decodedToken.email; // Get email from Firebase token
        const username = decodedToken.name || decodedToken.email.split('@')[0]; // Use name or derive from email

        // Find user in your MongoDB. If not found, create a new one.
        let user = await User.findOne({ firebaseId });

        if (!user) {
           
            user = await User.create({
                username,
                email,
                firebaseId,
                authType: 'firebase',
                role: 'student', // Default role for new Firebase users
            });
        }

        // Generate a custom JWT for your backend
        const backendToken = generateToken(user._id);

        res.status(200).json({
            message: 'Firebase token verified, backend token issued.',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                totalXp: user.totalXp,
                currentLevel: user.currentLevel,
                badges: user.badges,
            },
            token: backendToken,
        });

    } catch (error) {
        console.error('Firebase token verification or user creation/login error:', error);
        // Firebase Admin SDK errors often have a 'code' property
        if (error.code && error.code.startsWith('auth/')) {
            return res.status(401).json({ message: `Firebase Auth Error: ${error.message}` });
        }
        res.status(500).json({ message: 'Server error during Firebase authentication.', error: error.message });
    }
});


router.get('/me', protect, async (req, res) => {
    // req.user is populated by the protect middleware
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        totalXp: req.user.totalXp,
        currentLevel: req.user.currentLevel,
        badges: req.user.badges,
    });
});

module.exports = router;
