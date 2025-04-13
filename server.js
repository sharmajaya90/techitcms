const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

// Import authentication middleware
const { setCurrentUser } = require('./middleware/auth');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Production security and performance middleware
if (isProduction) {
  // Enable compression for all responses
  app.use(compression());
  
  // Enable Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https://source.unsplash.com", "https://*"],
        "media-src": ["'self'", "https://*"],
        "script-src": ["'self'", "'unsafe-inline'"] // For EJS templates
      }
    }
  }));
}

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Set current user for all routes
app.use(setCurrentUser);

// Serve static files with caching for production
if (isProduction) {
  const staticOptions = {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true
  };
  app.use(express.static(path.join(__dirname, 'public'), staticOptions));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// MongoDB Connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music-cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// File Upload Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|mp3/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type - only jpeg, jpg, png, and mp3 are allowed'));
    }
});

// Routes
app.use('/api/music', require('./routes/musicRoutes'));
app.use('/', require('./routes/pageRoutes'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    if (isProduction) {
        // Don't expose error details in production
        res.status(500).send('Server error');
    } else {
        res.status(500).send(`Server error: ${err.message}`);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // For production, you might want to exit in critical situations
    // process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}); 