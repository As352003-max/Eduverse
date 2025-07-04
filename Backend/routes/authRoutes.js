// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin'); // Correctly import your initialized admin instance

const User = require('../models/User'); // Assuming your User model is here

// Helper function to generate JWT for your backend
const generateToken = (id, role) => { // Added role to token payload
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { // Include role in JWT
        expiresIn: '1h', // Token valid for 1 hour
    });
};

// @route   POST /api/auth/register
// @desc    Register user (traditional email/password)
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password, role, grade, parent_id } = req.body; // Destructure all fields

    if (!username || !email || !password || !role) { // Ensure all required fields are checked
        return res.status(400).json({ message: 'Please enter all required fields: username, email, password, role.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Create new user with authType 'email_password'
        user = new User({
            username,
            email,
            password, // Password will be hashed by pre-save hook
            role,
            grade: role === 'student' ? grade : undefined, // Only set grade for students
            parent_id: role === 'student' && parent_id ? parent_id : undefined, // Only set parent_id for students
            authType: 'email_password'
        });
        await user.save();

        const token = generateToken(user._id, user.role); // Generate token with user role

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                totalXp: user.totalXp,
                currentLevel: user.currentLevel
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user (traditional email/password)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        const user = await User.findOne({ email });

        // IMPORTANT: Check if user exists AND if authType is 'email_password' before matching password
        if (!user || user.authType !== 'email_password' || !(await user.matchPassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials. User not found or password incorrect.' });
        }

        const token = generateToken(user._id, user.role); // Generate token with user role
        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                totalXp: user.totalXp,
                currentLevel: user.currentLevel
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// @route   POST /api/auth/firebase-auth
// @desc    Authenticate/Register user via Firebase ID Token
// @access  Public
router.post('/firebase-auth', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    try {
        // Verify the Firebase ID token using the 'admin' object imported from your config
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseId = decodedToken.uid;
        const email = decodedToken.email;
        const username = decodedToken.name || (email ? email.split('@')[0] : 'user'); // Use name or derive from email, or default

        // Try to find user by firebaseId or email
        let user = await User.findOne({ $or: [{ firebaseId }, { email }] });

        if (user) {
            // If user exists, update firebaseId if missing (for existing users linking Firebase)
            if (!user.firebaseId) {
                user.firebaseId = firebaseId;
                user.authType = 'firebase'; // Update authType if linking
                await user.save();
            }
        } else {
            // User does not exist, create new user
            user = new User({
                username,
                email,
                firebaseId,
                authType: 'firebase', // Mark as Firebase authenticated
                role: 'student', // Default role for new Firebase users (adjust if needed)
                // Do NOT set password here for Firebase authenticated users
            });
            await user.save();
        }

        const token = generateToken(user._id, user.role); // Generate your backend JWT with role

        res.json({
            message: 'Firebase authentication successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                totalXp: user.totalXp,
                currentLevel: user.currentLevel,
                // ... include other necessary user fields
            }
        });

    } catch (error) {
        console.error('Firebase Auth error:', error.message);
        res.status(401).json({ message: 'Invalid Firebase ID token or authentication failed', error: error.message });
    }
});

module.exports = router;