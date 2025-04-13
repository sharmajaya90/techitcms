const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login page
exports.getLoginPage = (req, res) => {
    res.render('pages/login', {
        pageTitle: 'Login',
        currentPage: 'login',
        error: req.query.error || null,
        scripts: ['auth']
    });
};

// Registration page
exports.getRegisterPage = (req, res) => {
    res.render('pages/register', {
        pageTitle: 'Register',
        currentPage: 'register',
        error: req.query.error || null,
        scripts: ['auth']
    });
};

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, contactNumber, confirmPassword } = req.body;
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            return res.redirect('/register?error=All fields are required');
        }
        
        if (password !== confirmPassword) {
            return res.redirect('/register?error=Passwords do not match');
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/register?error=Email already registered');
        }
        
        // Create new user
        const user = new User({
            name,
            email,
            password,
            contactNumber
        });
        
        await user.save();
        
        // Create and store JWT token in cookie
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.redirect('/register?error=Registration failed');
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate inputs
        if (!email || !password) {
            return res.redirect('/login?error=Email and password are required');
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/login?error=Invalid email or password');
        }
        
        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.redirect('/login?error=Invalid email or password');
        }
        
        // Create and store JWT token in cookie
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login?error=Login failed');
    }
};

// Logout user
exports.logoutUser = (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/login');
}; 