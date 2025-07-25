const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin'); // Firebase Admin SDK
const User = require('../models/User'); // Your Mongoose User model
const { protect } = require('../middleware/authMiddleware'); // Your JWT protection middleware

// Helper to generate a JWT for your backend
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// Helper to generate a truly unique username if a conflict occurs
const generateUniqueUsername = async (baseUsername) => {
    let username = baseUsername;
    let counter = 0;
    let userExists = await User.findOne({ username: username });
    while (userExists) {
        // Append a short random string to ensure uniqueness
        username = `${baseUsername}_${Math.random().toString(36).substring(2, 8)}`;
        userExists = await User.findOne({ username: username });
        counter++;
        if (counter > 10) { // Prevent infinite loop in extreme cases
            throw new Error("Failed to generate a unique username after multiple attempts.");
        }
    }
    return username;
};


// @route   POST /api/auth/register
// @desc    Register a new user (for email/password or initial Firebase link if not handled by /firebase-auth)
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password, role, firebaseId, authType = 'email_password' } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ message: 'Please enter all required fields: username, email, role.' });
    }
    if (authType === 'email_password' && !password) {
        return res.status(400).json({ message: 'Password is required for email/password registration.' });
    }
    // Note: firebaseId is expected to be passed from frontend if using Firebase auth for registration
    // but typically Firebase sign-up is handled directly by Firebase SDK, then token sent to backend.
    // The /firebase-auth route below is more common for Firebase sign-in/up.
    if (authType === 'firebase' && !firebaseId) {
        return res.status(400).json({ message: 'Firebase ID is required for Firebase registration.' });
    }

    try {
        // Check if user already exists by email or username (for email/password or initial Firebase link)
        let userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with that email or username already exists.' });
        }

        // If authType is firebase, also check if firebaseId already exists
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
            // Ensure username is unique if it's a unique field in your schema
            const uniqueUsername = await generateUniqueUsername(username);
            newUser = await User.create({
                username: uniqueUsername,
                email,
                role,
                firebaseId, // Store the Firebase UID here
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
        // Handle MongoDB duplicate key error specifically for registration
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A user with that email or username already exists.' });
        }
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


// @route   POST /api/auth/firebase-auth
// @desc    Authenticate/Register user via Firebase ID Token
// @access  Public
router.post('/firebase-auth', async (req, res) => {
    const { token: idToken } = req.body; // Expecting the Firebase ID token in the 'token' field

    if (!idToken) {
        return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    try {
        // 1. Verify the Firebase ID token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseId = decodedToken.uid;
        const email = decodedToken.email; // Get email from Firebase token
        // Use Firebase display name if available, otherwise derive from email
        const firebaseDisplayName = decodedToken.name;
        const derivedUsername = email ? email.split('@')[0] : firebaseId; // Fallback if no email

        // 2. Try to find user in your MongoDB by firebaseId, then email, then username
        let user = await User.findOne({ firebaseId });

        if (!user && email) {
            // If not found by firebaseId, try by email (to link existing email-password accounts or handle re-logins)
            user = await User.findOne({ email });
            if (user && !user.firebaseId) {
                // If user found by email but no firebaseId, link it
                user.firebaseId = firebaseId;
                user.authType = 'firebase'; // Update authType if it was email_password
                await user.save();
                console.log(`Existing user ${user.username} linked with Firebase ID.`);
            }
        }

        if (!user) {
            // If still no user found, try by username. This is less reliable if usernames aren't unique.
            // Consider if you want to allow linking by username or prefer email/firebaseId.
            // For now, let's prioritize creating a truly unique one.
            const baseUsername = firebaseDisplayName || derivedUsername;
            const uniqueUsername = await generateUniqueUsername(baseUsername);

            user = await User.create({
                username: uniqueUsername,
                email: email,
                firebaseId: firebaseId,
                authType: 'firebase',
                role: 'student', // Default role for new Firebase users
                // Add default XP, level, badges if your schema requires them or has defaults
            });
            console.log(`New user ${user.username} created via Firebase.`);
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

        // --- CORRECTED ERROR HANDLING ---
        // Check if error.code exists and is a string before calling startsWith
        if (typeof error.code === 'string' && error.code.startsWith('auth/')) {
            // This is a Firebase Auth specific error (e.g., invalid token)
            return res.status(401).json({ message: `Firebase Auth Error: ${error.message}` });
        } else if (error.code === 11000) { // MongoDB duplicate key error (numeric code)
            // This handles cases where a username/email might already exist despite checks
            return res.status(409).json({ message: 'A user with this email or username already exists. Please try logging in or using a different account.' });
        }
        // Generic server error for other unexpected errors
        res.status(500).json({ message: 'Server error during Firebase authentication.', error: error.message });
    }
});


// @route   GET /api/auth/me
// @desc    Get user profile (protected route)
// @access  Private
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