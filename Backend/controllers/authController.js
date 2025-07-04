// Backend/controllers/authController.js
const User = require('../models/User'); // Import your User model
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JSON Web Tokens
const admin = require('../config/firebaseAdmin'); // Import Firebase Admin SDK

// Utility function to generate JWT
const generateToken = (userId, role) => {
  const payload = {
    user: {
      id: userId,
      role: role
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  const { username, email, password, role, firebaseUid } = req.body; // firebaseUid is optional, comes from client-side Firebase auth

  try {
    // Check if user already exists by email or username in your DB
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User with that email or username already exists.' });
    }

    // Hash password for your backend's database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance for your MongoDB
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student', // Default role if not provided
      firebaseUid // Store Firebase UID if available
    });

    await user.save(); // Save the user to MongoDB

    // Generate JWT for your backend's authentication system
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid
      }
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    // console.error(err); // For detailed debugging
    if (err.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: 'User with that email or username already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (for users registered through your backend)
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email in your database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @route   POST /api/auth/firebase-auth
// @desc    Handles Firebase ID Token verification and creates/logs in user in backend DB
// @access  Public
exports.firebaseAuth = async (req, res) => {
  const { idToken, username, email, role } = req.body; // Expect idToken from Firebase client

  if (!idToken) {
    return res.status(400).json({ message: 'Firebase ID token is required.' });
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const firebaseEmail = decodedToken.email;

    // Check if user already exists in your MongoDB by firebaseUid or email
    let user = await User.findOne({ $or: [{ firebaseUid }, { email: firebaseEmail }] });

    if (!user) {
      // If user doesn't exist, create a new one in your DB
      // Use email and potentially username from Firebase decoded token,
      // or prompt user for username if it's not present in token/req.body
      const newUsername = username || decodedToken.name || firebaseEmail.split('@')[0];
      const userRole = role || 'student'; // Default role

      user = new User({
        username: newUsername,
        email: firebaseEmail,
        firebaseUid,
        role: userRole,
        password: Math.random().toString(36).slice(-10) // Dummy password if not using backend password auth
      });
      await user.save();
    } else {
      // If user exists but firebaseUid is missing (e.g., user registered with email/pass first)
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    // Generate your backend's JWT for this user
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Firebase authentication successful and user synchronized.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid
      }
    });

  } catch (err) {
    console.error('Firebase Auth backend error:', err.message);
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Firebase ID token expired. Please re-authenticate.' });
    }
    res.status(500).json({ message: 'Server error during Firebase authentication.' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current authenticated user's profile
// @access  Private (requires token)
exports.getMe = async (req, res) => {
    try {
        // req.user.id is set by your authentication middleware
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Get user profile error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};