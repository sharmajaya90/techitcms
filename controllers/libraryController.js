const Music = require('../models/Music');
const Category = require('../models/Category');

// Library page controller
exports.getLibraryPage = async (req, res) => {
    try {
        // Get all categories
        const categories = await Category.getAllCategories();
        
        // Render library page
        res.render('pages/library', {
            pageTitle: 'My Library',
            currentPage: 'library',
            categories,
            scripts: ['library']
        });
    } catch (error) {
        console.error('Error in getLibraryPage:', error);
        res.status(500).send('Server error');
    }
};

// Get all music for library
exports.getAllMusic = async (req, res) => {
    try {
        const { sort } = req.query;
        
        let sortOption = '-createdAt'; // Default to newest first
        
        if (sort === 'alphabetical') {
            sortOption = 'title';
        } else if (sort === 'recent') {
            sortOption = '-createdAt';
        }
        
        // Get all music
        const music = await Music.find().sort(sortOption);
        
        // Group by category if requested
        if (req.query.grouped === 'true') {
            const categories = await Category.getAllCategories();
            const categoryMap = new Map(categories.map(cat => [cat.id, {
                ...cat.toObject(),
                music: []
            }]));
            
            // Add music to appropriate categories
            music.forEach(item => {
                if (categoryMap.has(item.category)) {
                    categoryMap.get(item.category).music.push(item);
                }
            });
            
            // Convert map to array of category objects with music
            const groupedMusic = Array.from(categoryMap.values());
            
            // Only include categories with music
            const filteredGroups = groupedMusic.filter(group => group.music.length > 0);
            
            return res.json({ grouped: true, categories: filteredGroups });
        }
        
        // Return flat list
        res.json({ grouped: false, music });
    } catch (error) {
        console.error('Error in getAllMusic:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 