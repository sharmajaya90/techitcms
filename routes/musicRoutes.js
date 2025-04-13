const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Music = require('../models/Music');

// Configure multer for file uploads
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
    limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'File too large. Maximum file size is 200MB.' 
            });
        }
        return res.status(400).json({ message: err.message });
    }
    next(err);
};

// Get all music entries with optional category filter
router.get('/', async (req, res) => {
    try {
        let query = {};
        
        // Filter by category if provided
        if (req.query.category) {
            query.category = req.query.category;
        }
        
        const music = await Music.find(query).sort({ createdAt: -1 });
        res.json(music);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single music entry
router.get('/:id', async (req, res) => {
    try {
        const music = await Music.findById(req.params.id);
        if (!music) {
            return res.status(404).json({ message: 'Music not found' });
        }
        res.json(music);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new music entry
router.post('/', (req, res, next) => {
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, next);
        }
        
        // Continue with file processing
        createMusic(req, res);
    });
});

// Function to create music entry after upload
async function createMusic(req, res) {
    try {
        const { title, description, category } = req.body;
        
        // Check if files exist
        if (!req.files || !req.files['image'] || !req.files['audio']) {
            return res.status(400).json({ message: 'Both image and audio files are required' });
        }
        
        // Store paths with the /uploads prefix for proper URL access
        const imagePath = req.files['image'][0].path;
        const audioPath = req.files['audio'][0].path;
        
        // Format URLs correctly for web access
        const imageUrl = '/uploads/' + imagePath.split('/').pop();
        const audioUrl = '/uploads/' + audioPath.split('/').pop();

        const music = new Music({
            title,
            description,
            category: category || 'pop', // Default to pop if no category provided
            imageUrl,
            audioUrl
        });

        const newMusic = await music.save();
        res.status(201).json(newMusic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Update music entry
router.put('/:id', (req, res, next) => {
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, next);
        }
        
        // Continue with update processing
        updateMusic(req, res);
    });
});

// Function to update music entry after upload
async function updateMusic(req, res) {
    try {
        const { title, description, category } = req.body;
        const updateData = { title, description };
        
        // Update category if provided
        if (category) {
            updateData.category = category;
        }

        if (req.files['image']) {
            // Format image URL correctly for web access
            const imagePath = req.files['image'][0].path;
            updateData.imageUrl = '/uploads/' + imagePath.split('/').pop();
        }
        if (req.files['audio']) {
            // Format audio URL correctly for web access
            const audioPath = req.files['audio'][0].path;
            updateData.audioUrl = '/uploads/' + audioPath.split('/').pop();
        }

        const updatedMusic = await Music.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedMusic) {
            return res.status(404).json({ message: 'Music not found' });
        }
        res.json(updatedMusic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Delete music entry
router.delete('/:id', async (req, res) => {
    try {
        const music = await Music.findById(req.params.id);
        if (!music) {
            return res.status(404).json({ message: 'Music not found' });
        }

        // Delete associated files
        const fs = require('fs');
        
        if (music.imageUrl) {
            try {
                // Convert URL path to filesystem path
                const imagePath = music.imageUrl.replace('/uploads/', 'uploads/');
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (error) {
                console.error('Error deleting image file:', error);
            }
        }
        
        if (music.audioUrl) {
            try {
                // Convert URL path to filesystem path
                const audioPath = music.audioUrl.replace('/uploads/', 'uploads/');
                if (fs.existsSync(audioPath)) {
                    fs.unlinkSync(audioPath);
                }
            } catch (error) {
                console.error('Error deleting audio file:', error);
            }
        }

        // Use findByIdAndDelete instead of remove()
        await Music.findByIdAndDelete(req.params.id);
        res.json({ message: 'Music deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 