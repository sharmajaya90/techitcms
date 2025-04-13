const Music = require('../models/Music');
const Category = require('../models/Category');

// Liked songs page controller
exports.getLikedPage = async (req, res) => {
    try {
        // Get liked songs
        const likedSongs = await Music.find({ isLiked: true }).sort('-likedAt');
        
        // Get most liked category
        const mostLikedCategory = await getMostLikedCategory();
        
        // Get most recently liked song
        const recentlyLiked = likedSongs.length > 0 ? likedSongs[0].title : '-';
        
        // Render liked songs page
        res.render('pages/liked', {
            pageTitle: 'Liked Songs',
            currentPage: 'liked',
            likedSongs,
            mostLikedCategory,
            recentlyLiked,
            scripts: ['liked']
        });
    } catch (error) {
        console.error('Error in getLikedPage:', error);
        res.status(500).send('Server error');
    }
};

// Toggle like status for a song
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the music
        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ message: 'Music not found' });
        }
        
        // Toggle like status
        music.isLiked = !music.isLiked;
        
        // Update likedAt timestamp if liked
        if (music.isLiked) {
            music.likedAt = new Date();
        } else {
            music.likedAt = null;
        }
        
        await music.save();
        
        res.json({
            id: music._id,
            isLiked: music.isLiked
        });
    } catch (error) {
        console.error('Error in toggleLike:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to determine most liked category
async function getMostLikedCategory() {
    try {
        // Aggregate to count likes by category
        const categoryLikes = await Music.aggregate([
            { $match: { isLiked: true } },
            { $group: { 
                _id: '$category', 
                count: { $sum: 1 } 
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        
        if (categoryLikes.length === 0) {
            return '-';
        }
        
        // Get category name
        const categoryId = categoryLikes[0]._id;
        const category = await Category.findOne({ id: categoryId });
        
        return category ? category.name : '-';
    } catch (error) {
        console.error('Error getting most liked category:', error);
        return '-';
    }
}