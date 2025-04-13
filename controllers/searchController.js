const Music = require('../models/Music');
const Category = require('../models/Category');

// Search page controller
exports.getSearchPage = async (req, res) => {
    try {
        // Get all categories for filter options
        const categories = await Category.getAllCategories();
        
        // Render search page
        res.render('pages/search', {
            pageTitle: 'Search',
            currentPage: 'search',
            categories,
            scripts: ['search']
        });
    } catch (error) {
        console.error('Error in getSearchPage:', error);
        res.status(500).send('Server error');
    }
};

// API endpoint for search functionality
exports.searchMusic = async (req, res) => {
    try {
        const { query, filter } = req.query;
        
        if (!query) {
            return res.json({ results: [] });
        }
        
        let searchQuery = {};
        
        // Create search query based on filter
        if (filter === 'title') {
            searchQuery = { title: { $regex: query, $options: 'i' } };
        } else if (filter === 'description') {
            searchQuery = { description: { $regex: query, $options: 'i' } };
        } else if (filter === 'category') {
            // First find matching categories
            const categories = await Category.find({ 
                name: { $regex: query, $options: 'i' }
            });
            
            const categoryIds = categories.map(cat => cat.id);
            searchQuery = { category: { $in: categoryIds } };
        } else {
            // 'all' filter - search in title, description, and category
            const categories = await Category.find({ 
                name: { $regex: query, $options: 'i' }
            });
            
            const categoryIds = categories.map(cat => cat.id);
            
            searchQuery = {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $in: categoryIds } }
                ]
            };
        }
        
        // Execute search and sort by relevance
        const results = await Music.find(searchQuery).sort('-createdAt').limit(50);
        
        res.json({ results });
    } catch (error) {
        console.error('Error in searchMusic:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 