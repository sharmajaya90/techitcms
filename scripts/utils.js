/* ===============================
   AUDIO X - UTILITY FUNCTIONS
   Helper functions for data management and formatting
   =============================== */

class AudioXUtils {
    // Format category names for display
    static formatCategoryName(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Format date for display
    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    // Debounce function for search
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Sanitize HTML to prevent XSS
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Highlight search terms in text
    static highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-match-highlight">$1</span>');
    }

    // Get all available categories
    static getCategories() {
        return [
            { id: 'work-out', name: 'Work Out', icon: '🏃‍♂️' },
            { id: 'techno-90s', name: 'Techno 90s', icon: '🎧' },
            { id: 'quiet-hours', name: 'Quiet Hours', icon: '🌙' },
            { id: 'rap', name: 'Rap', icon: '🎤' },
            { id: 'deep-focus', name: 'Deep Focus', icon: '🧘‍♂️' },
            { id: 'beach-vibes', name: 'Beach Vibes', icon: '🏖️' },
            { id: 'pop-hits', name: 'Pop Hits', icon: '🎵' },
            { id: 'movie-classics', name: 'Movie Classics', icon: '🎬' },
            { id: 'folk-music', name: 'Folk Music', icon: '🪕' },
            { id: 'travelling', name: 'Travelling', icon: '✈️' },
            { id: 'for-kids', name: 'For Kids', icon: '🧸' },
            { id: '80s-hits', name: '80s Hits', icon: '📻' }
        ];
    }

    // Get category info by ID
    static getCategoryInfo(categoryId) {
        return this.getCategories().find(cat => cat.id === categoryId) || 
               { id: categoryId, name: this.formatCategoryName(categoryId), icon: '🎵' };
    }

    // Validate music data
    static validateMusicData(data) {
        const errors = [];
        
        if (!data.title || data.title.trim().length === 0) {
            errors.push('Title is required');
        }
        
        if (!data.category || data.category.trim().length === 0) {
            errors.push('Category is required');
        }
        
        if (data.title && data.title.length > 100) {
            errors.push('Title must be less than 100 characters');
        }
        
        if (data.description && data.description.length > 500) {
            errors.push('Description must be less than 500 characters');
        }
        
        return errors;
    }

    // Sort array by multiple criteria
    static sortBy(array, sortKey) {
        const sortedArray = [...array];
        
        switch (sortKey) {
            case 'recent':
                return sortedArray.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            case 'az':
                return sortedArray.sort((a, b) => a.title.localeCompare(b.title));
            case 'za':
                return sortedArray.sort((a, b) => b.title.localeCompare(a.title));
            case 'category':
                return sortedArray.sort((a, b) => a.category.localeCompare(b.category));
            default:
                return sortedArray;
        }
    }

    // Group array by category
    static groupByCategory(array) {
        return array.reduce((groups, item) => {
            const category = item.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    }

    // Filter array by search criteria
    static filterMusic(musicArray, searchQuery, filterType = 'all') {
        if (!searchQuery) return musicArray;
        
        const query = searchQuery.toLowerCase();
        
        return musicArray.filter(music => {
            switch (filterType) {
                case 'title':
                    return music.title.toLowerCase().includes(query);
                case 'description':
                    return music.description && music.description.toLowerCase().includes(query);
                case 'category':
                    return music.category.toLowerCase().includes(query) ||
                           this.formatCategoryName(music.category).toLowerCase().includes(query);
                default:
                    return music.title.toLowerCase().includes(query) ||
                           (music.description && music.description.toLowerCase().includes(query)) ||
                           music.category.toLowerCase().includes(query) ||
                           this.formatCategoryName(music.category).toLowerCase().includes(query);
            }
        });
    }

    // Calculate statistics for liked songs
    static calculateLikedStats(likedSongs) {
        if (likedSongs.length === 0) {
            return {
                mostLikedCategory: null,
                recentlyLiked: null,
                totalLiked: 0,
                categoryDistribution: {}
            };
        }

        // Count songs by category
        const categoryCount = likedSongs.reduce((acc, song) => {
            acc[song.category] = (acc[song.category] || 0) + 1;
            return acc;
        }, {});

        // Find most liked category
        const mostLikedCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b
        );

        // Get most recently liked song
        const sortedByDate = [...likedSongs].sort((a, b) => 
            new Date(b.dateAdded) - new Date(a.dateAdded)
        );
        const recentlyLiked = sortedByDate[0];

        return {
            mostLikedCategory: this.formatCategoryName(mostLikedCategory),
            recentlyLiked: recentlyLiked ? recentlyLiked.title : null,
            totalLiked: likedSongs.length,
            categoryDistribution: categoryCount
        };
    }

    // Show toast notification
    static showToast(message, type = 'success', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#1db954' : 
                           type === 'error' ? '#e22134' : 
                           type === 'warning' ? '#ff9500' : '#007bff'
        });

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after duration
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Check if device is mobile
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Check if device is touch enabled
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get storage usage percentage
    static getStorageUsage() {
        try {
            const used = JSON.stringify(localStorage).length;
            const total = 5 * 1024 * 1024; // 5MB estimate for localStorage
            return Math.min((used / total) * 100, 100);
        } catch (e) {
            return 0;
        }
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if object is empty
    static isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate demo music data
    static generateDemoData() {
        return [
            {
                id: this.generateId(),
                title: 'Energetic Workout Mix',
                description: 'High-energy tracks perfect for your workout sessions and cardio',
                category: 'work-out',
                dateAdded: new Date(Date.now() - 86400000).toISOString(),
                liked: true
            },
            {
                id: this.generateId(),
                title: 'Classic 90s Techno Vibes',
                description: 'The best techno hits from the golden age of electronic music',
                category: 'techno-90s',
                dateAdded: new Date(Date.now() - 172800000).toISOString(),
                liked: false
            },
            {
                id: this.generateId(),
                title: 'Peaceful Evening Meditation',
                description: 'Calm and relaxing ambient music for quiet contemplation',
                category: 'quiet-hours',
                dateAdded: new Date(Date.now() - 259200000).toISOString(),
                liked: true
            },
            {
                id: this.generateId(),
                title: 'Urban Hip Hop Collection',
                description: 'Fresh beats and lyrical mastery from contemporary artists',
                category: 'rap',
                dateAdded: new Date(Date.now() - 345600000).toISOString(),
                liked: false
            },
            {
                id: this.generateId(),
                title: 'Deep Focus Flow State',
                description: 'Minimalist compositions designed to enhance concentration',
                category: 'deep-focus',
                dateAdded: new Date(Date.now() - 432000000).toISOString(),
                liked: true
            }
        ];
    }
}

// Export for use in other files
window.AudioXUtils = AudioXUtils; 