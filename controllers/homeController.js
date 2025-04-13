const Category = require('../models/Category');
const Music = require('../models/Music');

// Home page controller
exports.getHomePage = async (req, res) => {
    try {
        // Get all categories
        const categories = await Category.getAllCategories();
        
        // Render home page
        res.render('pages/home', {
            pageTitle: 'Home',
            currentPage: 'home',
            categories,
            scripts: ['home']
        });
    } catch (error) {
        console.error('Error in getHomePage:', error);
        res.status(500).send('Server error');
    }
};

// Get music by category
exports.getMusicByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        // Get category info
        const category = await Category.findOne({ id: categoryId });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        // Get music in category
        const music = await Music.find({ category: categoryId }).sort('-createdAt');
        
        res.json({
            category,
            music
        });
    } catch (error) {
        console.error('Error in getMusicByCategory:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 