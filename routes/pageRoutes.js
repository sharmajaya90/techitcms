const express = require('express');
const router = express.Router();

// Import controllers
const homeController = require('../controllers/homeController');
const searchController = require('../controllers/searchController');
const libraryController = require('../controllers/libraryController');
const likedController = require('../controllers/likedController');
const settingsController = require('../controllers/settingsController');
const authController = require('../controllers/authController');

// Import middleware
const { isAuthenticated } = require('../middleware/auth');

// Auth routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerUser);
router.get('/logout', authController.logoutUser);

// Protected routes
// Home page
router.get('/', isAuthenticated, homeController.getHomePage);

// Search page
router.get('/search', isAuthenticated, searchController.getSearchPage);
router.get('/api/search', isAuthenticated, searchController.searchMusic);

// Library page
router.get('/library', isAuthenticated, libraryController.getLibraryPage);
router.get('/api/library', isAuthenticated, libraryController.getAllMusic);

// Add music - redirect to home page with modal flag
router.get('/add-music', isAuthenticated, (req, res) => {
    res.redirect('/?showAddModal=true');
});

// Liked music
router.get('/liked', isAuthenticated, likedController.getLikedPage);
router.put('/api/music/:id/like', isAuthenticated, likedController.toggleLike);

// Settings page
router.get('/settings', isAuthenticated, settingsController.getSettingsPage);
router.put('/api/settings', settingsController.updateSettings);
router.post('/api/settings/clear-data', settingsController.clearData);

// Category routes
router.get('/api/music/category/:categoryId', homeController.getMusicByCategory);

module.exports = router;