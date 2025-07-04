// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your User model is here

// Middleware to protect routes (ensure user is logged in and token is valid)
const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token using your JWT_SECRET from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID from the decoded token payload
            // .select('-password') excludes the password field from the returned user object
            req.user = await User.findById(decoded.id).select('-password');

            // If user not found (e.g., user deleted from DB after token was issued)
            if (!req.user) {
                // Set status before throwing error for clearer handling
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Call next() to pass control to the next middleware or route handler
        } catch (error) {
            console.error('Auth middleware error:', error.message);
            // Handle specific JWT errors
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Not authorized, token invalid or malformed' });
            } else if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            // Generic error for other token failures
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token was provided in the header at all
    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' });
    }
};

// Middleware to authorize users based on roles
// Usage: authorizeRoles('admin', 'teacher')
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // This middleware assumes 'protect' has already run and set req.user
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role (${req.user?.role || 'none'}) is not authorized to access this route` });
        }
        next(); // User has required role, proceed
    };
};

// Export both functions as properties of an object
module.exports = { protect, authorizeRoles };