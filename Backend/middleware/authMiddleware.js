const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            return next();

        } catch (error) {
            console.error('Auth middleware error:', error.message);

            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            } else if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Not authorized, token invalid' });
            }

            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'No token, authorization denied' });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role (${req.user?.role || 'none'}) is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
