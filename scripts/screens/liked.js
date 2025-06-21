/* ===============================
   LIKED SONGS SCREEN MANAGER
   Handles liked songs and statistics
   =============================== */

class LikedScreen {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('liked-screen');
        this.currentSort = 'recent';
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    load() {
        this.loadLikedSongs();
        this.updateStats();
    }

    render() {
        this.container.innerHTML = `
            <div class="liked-header">
                <div class="liked-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="liked-info">
                    <h2>Playlist</h2>
                    <h1>Liked Songs</h1>
                    <p><span id="likedCount">0</span> liked songs</p>
                </div>
            </div>

            <div class="liked-stats" id="likedStats">
                ${this.renderEmptyStats()}
            </div>

            <div class="liked-content">
                <div class="liked-content-header">
                    <h3>Your Liked Songs</h3>
                    <div class="liked-sort-options">
                        <button class="liked-sort-btn active" data-sort="recent">Recently Liked</button>
                        <button class="liked-sort-btn" data-sort="az">A-Z</button>
                        <button class="liked-sort-btn" data-sort="category">Category</button>
                    </div>
                </div>
                <div class="liked-songs-list" id="likedSongsList">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Sort buttons
        this.container.querySelectorAll('.liked-sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveSort(e.target.dataset.sort);
                this.loadLikedSongs();
            });
        });

        // Song actions
        this.container.addEventListener('click', (e) => {
            this.handleSongAction(e);
        });
    }

    setActiveSort(sort) {
        this.currentSort = sort;
        
        // Update button states
        this.container.querySelectorAll('.liked-sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelector(`[data-sort="${sort}"]`).classList.add('active');
    }

    handleSongAction(e) {
        const actionBtn = e.target.closest('.action-btn');
        if (!actionBtn) return;

        const songItem = actionBtn.closest('.liked-song-item');
        const musicId = songItem.dataset.id;

        e.preventDefault();
        e.stopPropagation();

        if (actionBtn.classList.contains('play-btn')) {
            this.playMusic(musicId);
        } else if (actionBtn.classList.contains('unlike-btn')) {
            this.unlikeMusic(musicId);
        } else if (actionBtn.classList.contains('edit-btn')) {
            this.editMusic(musicId);
        } else if (actionBtn.classList.contains('delete-btn')) {
            this.deleteMusic(musicId);
        }
    }

    loadLikedSongs() {
        const likedSongsList = this.container.querySelector('#likedSongsList');
        const likedCount = this.container.querySelector('#likedCount');
        
        // Update count
        likedCount.textContent = this.app.likedSongs.length;

        if (this.app.likedSongs.length === 0) {
            likedSongsList.innerHTML = this.getEmptyLikedState();
            return;
        }

        // Sort liked songs
        const sortedSongs = AudioXUtils.sortBy(this.app.likedSongs, this.currentSort);

        // Render songs
        likedSongsList.innerHTML = sortedSongs.map((music, index) => 
            this.createLikedSongItem(music, index + 1)
        ).join('');
    }

    createLikedSongItem(music, index) {
        const categoryInfo = AudioXUtils.getCategoryInfo(music.category);
        return `
            <div class="liked-song-item" data-id="${music.id}">
                <div class="liked-song-info">
                    <span class="liked-song-number">${index}</span>
                    <div class="liked-song-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="liked-song-details">
                        <h4>${AudioXUtils.sanitizeHTML(music.title)}</h4>
                        <p>${AudioXUtils.sanitizeHTML(music.description || 'No description')}</p>
                    </div>
                </div>
                <div class="liked-song-meta">
                    <span class="category-tag">${categoryInfo.name}</span>
                    <span class="liked-date">${AudioXUtils.formatDate(music.dateAdded)}</span>
                </div>
                <div class="liked-actions">
                    <button class="action-btn play-btn" title="Play song">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn unlike-btn" title="Remove from liked songs">
                        <i class="fas fa-heart-broken"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit song">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete song">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    playMusic(musicId) {
        const music = this.app.likedSongs.find(m => m.id === musicId);
        if (music) {
            AudioXUtils.showToast(`Now playing: ${music.title}`, 'success');
        }
    }

    unlikeMusic(musicId) {
        this.app.toggleLike(musicId);
        this.update();
        AudioXUtils.showToast('Removed from liked songs', 'success');
    }

    editMusic(musicId) {
        const music = this.app.likedSongs.find(m => m.id === musicId);
        if (music) {
            // Populate edit form
            document.getElementById('editMusicTitle').value = music.title;
            document.getElementById('editMusicDescription').value = music.description || '';
            document.getElementById('editMusicCategory').value = music.category;
            
            // Setup form handler
            const editForm = document.getElementById('editMusicForm');
            editForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleEditSubmit(e, musicId);
            };
            
            this.app.showModal('editMusicModal');
        }
    }

    handleEditSubmit(e, musicId) {
        const formData = new FormData(e.target);
        const updatedData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category')
        };

        if (this.app.updateMusic(musicId, updatedData)) {
            this.app.closeModal();
            this.update();
        }
    }

    deleteMusic(musicId) {
        const music = this.app.likedSongs.find(m => m.id === musicId);
        if (music && confirm(`Are you sure you want to delete "${music.title}"?`)) {
            this.app.deleteMusic(musicId);
            this.update();
        }
    }

    updateStats() {
        const statsContainer = this.container.querySelector('#likedStats');
        
        if (this.app.likedSongs.length === 0) {
            statsContainer.innerHTML = this.renderEmptyStats();
            return;
        }

        const stats = AudioXUtils.calculateLikedStats(this.app.likedSongs);
        statsContainer.innerHTML = this.renderStats(stats);
    }

    renderStats(stats) {
        return `
            <div class="stat">
                <h4>Total Liked</h4>
                <p class="highlight">${stats.totalLiked}</p>
            </div>
            <div class="stat">
                <h4>Most Liked Category</h4>
                <p>${stats.mostLikedCategory || 'None'}</p>
            </div>
            <div class="stat">
                <h4>Recently Liked</h4>
                <p>${stats.recentlyLiked || 'None'}</p>
            </div>
        `;
    }

    renderEmptyStats() {
        return `
            <div class="stat">
                <h4>Total Liked</h4>
                <p class="highlight">0</p>
            </div>
            <div class="stat">
                <h4>Most Liked Category</h4>
                <p>None yet</p>
            </div>
            <div class="stat">
                <h4>Recently Liked</h4>
                <p>None yet</p>
            </div>
        `;
    }

    getEmptyLikedState() {
        return `
            <div class="liked-empty">
                <div class="heart-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <h3>No liked songs yet</h3>
                <p>Songs you like will appear here. Go to your library and start liking songs!</p>
                <div class="liked-empty-actions">
                    <button class="btn-primary" onclick="app.showScreen('library')">
                        <i class="fas fa-book"></i> Go to Library
                    </button>
                    <button class="btn-secondary" onclick="app.showScreen('search')">
                        <i class="fas fa-search"></i> Search Songs
                    </button>
                </div>
            </div>
        `;
    }

    update() {
        this.loadLikedSongs();
        this.updateStats();
    }

    // Search within liked songs
    searchInLiked(query) {
        if (!query) {
            this.loadLikedSongs();
            return;
        }

        const results = AudioXUtils.filterMusic(this.app.likedSongs, query);
        const likedSongsList = this.container.querySelector('#likedSongsList');
        
        if (results.length === 0) {
            likedSongsList.innerHTML = `
                <div class="liked-empty">
                    <div class="heart-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No liked songs found</h3>
                    <p>No liked songs match your search criteria.</p>
                </div>
            `;
        } else {
            likedSongsList.innerHTML = results.map((music, index) => 
                this.createLikedSongItem(music, index + 1)
            ).join('');
        }
    }

    // Export liked songs (future feature)
    exportLikedSongs() {
        if (this.app.likedSongs.length === 0) {
            AudioXUtils.showToast('No liked songs to export', 'warning');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            totalSongs: this.app.likedSongs.length,
            songs: this.app.likedSongs.map(song => ({
                title: song.title,
                description: song.description,
                category: song.category,
                dateAdded: song.dateAdded
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `liked-songs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        AudioXUtils.showToast('Liked songs exported successfully!', 'success');
    }

    // Get liked songs statistics
    getStats() {
        const stats = AudioXUtils.calculateLikedStats(this.app.likedSongs);
        const categoryBreakdown = AudioXUtils.getCategories().map(cat => ({
            name: cat.name,
            icon: cat.icon,
            count: this.app.likedSongs.filter(song => song.category === cat.id).length
        })).filter(cat => cat.count > 0);

        return {
            ...stats,
            categoryBreakdown,
            averageLikesPerDay: this.calculateAverageLikesPerDay(),
            likedSongsHistory: this.getLikedSongsHistory()
        };
    }

    calculateAverageLikesPerDay() {
        if (this.app.likedSongs.length === 0) return 0;

        const dates = this.app.likedSongs.map(song => new Date(song.dateAdded));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const daysDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));

        return (this.app.likedSongs.length / daysDiff).toFixed(2);
    }

    getLikedSongsHistory() {
        // Group liked songs by date for potential chart display
        const history = {};
        this.app.likedSongs.forEach(song => {
            const date = new Date(song.dateAdded).toDateString();
            history[date] = (history[date] || 0) + 1;
        });
        return history;
    }
}

// Export for use in main app
window.LikedScreen = LikedScreen; 