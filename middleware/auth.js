const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
exports.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        
        if (!token) {
            return res.redirect('/login');
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.redirect('/login');
        }
        
        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.redirect('/login');
    }
};

// Set current user (used on all routes)
exports.setCurrentUser = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.userId);
            
            if (user) {
                res.locals.currentUser = {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                };
            }
        }
        
        next();
    } catch (error) {
        res.locals.currentUser = null;
        next();
    }
}; 