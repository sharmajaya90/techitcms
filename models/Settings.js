const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        default: 'default' // We'll use a default user for demo purposes
    },
    theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'dark'
    },
    accentColor: {
        type: String,
        default: '#1E90FF'
    },
    showCategoriesInLibrary: {
        type: Boolean,
        default: true
    },
    groupByCategory: {
        type: Boolean,
        default: true
    },
    showRecentlyPlayed: {
        type: Boolean,
        default: true
    },
    autoplay: {
        type: Boolean,
        default: false
    },
    audioQuality: {
        type: String,
        enum: ['auto', 'high', 'medium', 'low'],
        default: 'auto'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Static method to get or create default settings
settingsSchema.statics.getSettings = async function(userId = 'default') {
    let settings = await this.findOne({ userId });
    
    if (!settings) {
        settings = await this.create({ userId });
    }
    
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema); 