const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    order: {
        type: Number,
        default: 0
    }
});

// Static method to get all categories or create defaults if none exist
categorySchema.statics.getAllCategories = async function() {
    const categories = await this.find().sort('order');
    
    if (categories.length === 0) {
        const defaultCategories = [
            { id: 'workout', name: 'Work Out', order: 1 },
            { id: 'techno', name: 'Techno 90s', order: 2 },
            { id: 'quiet', name: 'Quiet Hours', order: 3 },
            { id: 'rap', name: 'Rap', order: 4 },
            { id: 'focus', name: 'Deep Focus', order: 5 },
            { id: 'beach', name: 'Beach Vibes', order: 6 },
            { id: 'pop', name: 'Pop Hits', order: 7 },
            { id: 'movie', name: 'Movie Classics', order: 8 },
            { id: 'folk', name: 'Folk Music', order: 9 },
            { id: 'travel', name: 'Travelling', order: 10 },
            { id: 'kids', name: 'For Kids', order: 11 },
            { id: '80s', name: '80s Hits', order: 12 }
        ];
        
        await this.insertMany(defaultCategories);
        return this.find().sort('order');
    }
    
    return categories;
};

module.exports = mongoose.model('Category', categorySchema); 