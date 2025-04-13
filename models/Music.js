const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['workout', 'techno', 'quiet', 'rap', 'focus', 'beach', 'pop', 'movie', 'folk', 'travel', 'kids', '80s'],
        default: 'pop'
    },
    imageUrl: {
        type: String,
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    likedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual field for display name of category 
musicSchema.virtual('categoryName').get(function() {
    const categoryMapping = {
        'workout': 'Work Out',
        'techno': 'Techno 90s',
        'quiet': 'Quiet Hours',
        'rap': 'Rap',
        'focus': 'Deep Focus',
        'beach': 'Beach Vibes',
        'pop': 'Pop Hits',
        'movie': 'Movie Classics',
        'folk': 'Folk Music',
        'travel': 'Travelling',
        'kids': 'For Kids',
        '80s': '80s Hits'
    };
    return categoryMapping[this.category] || 'Unknown';
});

// Make sure virtuals are included when converting to JSON/Object
musicSchema.set('toJSON', { virtuals: true });
musicSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Music', musicSchema); 