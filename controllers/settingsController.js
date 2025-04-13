const Settings = require('../models/Settings');
const Music = require('../models/Music');
const fs = require('fs');
const path = require('path');

// Settings page controller
exports.getSettingsPage = async (req, res) => {
    try {
        // Get user settings
        const settings = await Settings.getSettings();
        
        // Calculate storage usage
        const storageUsed = await calculateStorageUsage();
        
        // Render settings page
        res.render('pages/settings', {
            pageTitle: 'Settings',
            currentPage: 'settings',
            settings,
            storageUsed,
            scripts: ['settings']
        });
    } catch (error) {
        console.error('Error in getSettingsPage:', error);
        res.status(500).send('Server error');
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const { 
            theme, 
            accentColor, 
            showCategoriesInLibrary, 
            groupByCategory,
            showRecentlyPlayed,
            autoplay,
            audioQuality
        } = req.body;
        
        // Get current settings
        const settings = await Settings.getSettings();
        
        // Update fields if provided
        if (theme) settings.theme = theme;
        if (accentColor) settings.accentColor = accentColor;
        if (showCategoriesInLibrary !== undefined) settings.showCategoriesInLibrary = showCategoriesInLibrary;
        if (groupByCategory !== undefined) settings.groupByCategory = groupByCategory;
        if (showRecentlyPlayed !== undefined) settings.showRecentlyPlayed = showRecentlyPlayed;
        if (autoplay !== undefined) settings.autoplay = autoplay;
        if (audioQuality) settings.audioQuality = audioQuality;
        
        settings.lastUpdated = new Date();
        await settings.save();
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error in updateSettings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear all data
exports.clearData = async (req, res) => {
    try {
        const { confirmed } = req.body;
        
        if (!confirmed) {
            return res.status(400).json({ message: 'Confirmation required' });
        }
        
        // Get all music to delete files
        const allMusic = await Music.find();
        
        // Delete all files
        for (const music of allMusic) {
            // Delete image file if it exists
            if (music.imageUrl) {
                const imagePath = path.join(__dirname, '..', music.imageUrl.replace(/^\//, ''));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            // Delete audio file if it exists
            if (music.audioUrl) {
                const audioPath = path.join(__dirname, '..', music.audioUrl.replace(/^\//, ''));
                if (fs.existsSync(audioPath)) {
                    fs.unlinkSync(audioPath);
                }
            }
        }
        
        // Delete all music entries
        await Music.deleteMany({});
        
        res.json({
            success: true,
            message: 'All data cleared successfully'
        });
    } catch (error) {
        console.error('Error in clearData:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to calculate storage usage
async function calculateStorageUsage() {
    try {
        const totalStorage = 5 * 1024 * 1024 * 1024; // 5GB in bytes
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        
        let used = 0;
        
        // Make sure uploads directory exists
        if (fs.existsSync(uploadsDir)) {
            // Get all files in uploads directory
            const files = getAllFiles(uploadsDir);
            
            // Calculate total size
            for (const file of files) {
                const stats = fs.statSync(file);
                used += stats.size;
            }
        }
        
        // Convert to human readable format
        const usedGB = (used / (1024 * 1024 * 1024)).toFixed(1);
        const totalGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(1);
        const percentage = Math.round((used / totalStorage) * 100);
        
        return {
            used: `${usedGB}GB`,
            total: `${totalGB}GB`,
            percentage
        };
    } catch (error) {
        console.error('Error calculating storage usage:', error);
        return {
            used: '0GB',
            total: '5GB',
            percentage: 0
        };
    }
}

// Helper function to get all files in a directory recursively
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    
    return fileList;
} 