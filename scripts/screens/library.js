/* ===============================
   LIBRARY SCREEN MANAGER
   Handles library management and playlists
   =============================== */

class LibraryScreen {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('library-screen');
        this.currentSort = 'recent';
        this.groupByCategory = true;
        this.currentPlaylist = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    load() {
        this.loadPlaylists();
        this.loadLibraryContent();
    }

    render() {
        this.container.innerHTML = `
            <div class="screen-header">
                <h1>My Library</h1>
                <button class="btn-primary" id="addMusicBtn">
                    <i class="fas fa-plus"></i> Add Music
                </button>
            </div>

            <div class="playlists-section">
                <h2>Your Playlists</h2>
                <div class="playlists-grid" id="playlistsGrid">
                    ${this.renderPlaylists()}
                </div>
            </div>

            <div class="library-controls">
                <div class="sort-controls">
                    <button class="sort-btn active" data-sort="recent">Recently Added</button>
                    <button class="sort-btn" data-sort="az">A-Z</button>
                    <button class="sort-btn" data-sort="category">Category</button>
                </div>
                <div class="view-controls">
                    <label>
                        <input type="checkbox" id="groupByCategoryCheckbox" checked>
                        <span>Group by Category</span>
                    </label>
                </div>
            </div>

            <div class="library-content">
                <div class="library-header">
                    <h3 id="libraryTitle">All Songs</h3>
                    <div class="library-stats" id="libraryStats">
                        ${this.app.musicLibrary.length} songs
                    </div>
                </div>
                <div class="library-grid" id="libraryGrid">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        `;
    }

    renderPlaylists() {
        const categories = AudioXUtils.getCategories();
        return categories.map(category => `
            <div class="playlist-card" data-category="${category.id}">
                <div class="playlist-icon">${category.icon}</div>
                <h3>${category.name}</h3>
                <p class="playlist-count">0 songs</p>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Add music button
        const addMusicBtn = this.container.querySelector('#addMusicBtn');
        addMusicBtn.addEventListener('click', () => {
            this.setupAddMusicForm();
            this.app.showModal('addMusicModal');
        });

        // Sort buttons
        this.container.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveSort(e.target.dataset.sort);
                this.loadLibraryContent();
            });
        });

        // Group by category checkbox
        const groupCheckbox = this.container.querySelector('#groupByCategoryCheckbox');
        groupCheckbox.addEventListener('change', (e) => {
            this.groupByCategory = e.target.checked;
            this.loadLibraryContent();
        });

        // Playlist clicks
        this.container.addEventListener('click', (e) => {
            const playlistCard = e.target.closest('.playlist-card');
            if (playlistCard) {
                this.handlePlaylistClick(playlistCard.dataset.category);
            }

            // Library item actions
            const libraryItem = e.target.closest('.library-list-item');
            if (libraryItem) {
                this.handleLibraryItemClick(e, libraryItem);
            }
        });
    }

    setActiveSort(sort) {
        this.currentSort = sort;
        
        // Update button states
        this.container.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelector(`[data-sort="${sort}"]`).classList.add('active');
    }

    handlePlaylistClick(categoryId) {
        this.currentPlaylist = this.currentPlaylist === categoryId ? null : categoryId;
        
        // Update playlist card states
        this.container.querySelectorAll('.playlist-card').forEach(card => {
            card.classList.remove('active');
        });
        
        if (this.currentPlaylist) {
            this.container.querySelector(`[data-category="${categoryId}"]`).classList.add('active');
        }
        
        this.loadLibraryContent();
    }

    handleLibraryItemClick(e, libraryItem) {
        const actionBtn = e.target.closest('.action-btn');
        if (!actionBtn) return;

        const musicId = libraryItem.dataset.id;
        e.preventDefault();
        e.stopPropagation();

        if (actionBtn.classList.contains('play-btn')) {
            this.playMusic(musicId);
        } else if (actionBtn.classList.contains('like-btn')) {
            this.app.toggleLike(musicId);
            this.update();
        } else if (actionBtn.classList.contains('edit-btn')) {
            this.editMusic(musicId);
        } else if (actionBtn.classList.contains('delete-btn')) {
            this.deleteMusic(musicId);
        }
    }

    loadPlaylists() {
        const playlistCards = this.container.querySelectorAll('.playlist-card');
        playlistCards.forEach(card => {
            const categoryId = card.dataset.category;
            const count = this.app.musicLibrary.filter(music => music.category === categoryId).length;
            const countElement = card.querySelector('.playlist-count');
            if (countElement) {
                countElement.textContent = `${count} song${count !== 1 ? 's' : ''}`;
            }
        });
    }

    loadLibraryContent() {
        const libraryGrid = this.container.querySelector('#libraryGrid');
        const libraryTitle = this.container.querySelector('#libraryTitle');
        const libraryStats = this.container.querySelector('#libraryStats');

        // Filter by current playlist if selected
        let musicToShow = this.currentPlaylist 
            ? this.app.musicLibrary.filter(music => music.category === this.currentPlaylist)
            : this.app.musicLibrary;

        // Update title and stats
        if (this.currentPlaylist) {
            const categoryInfo = AudioXUtils.getCategoryInfo(this.currentPlaylist);
            libraryTitle.textContent = categoryInfo.name;
        } else {
            libraryTitle.textContent = 'All Songs';
        }
        libraryStats.textContent = `${musicToShow.length} song${musicToShow.length !== 1 ? 's' : ''}`;

        // Sort music
        musicToShow = AudioXUtils.sortBy(musicToShow, this.currentSort);

        if (musicToShow.length === 0) {
            libraryGrid.innerHTML = this.getEmptyLibraryContent();
            return;
        }

        if (this.groupByCategory && !this.currentPlaylist) {
            this.renderGroupedLibrary(musicToShow, libraryGrid);
        } else {
            this.renderSimpleLibrary(musicToShow, libraryGrid);
        }
    }

    renderSimpleLibrary(musicArray, container) {
        container.innerHTML = musicArray.map(music => this.createLibraryItem(music)).join('');
    }

    renderGroupedLibrary(musicArray, container) {
        const groupedMusic = AudioXUtils.groupByCategory(musicArray);
        const categories = AudioXUtils.getCategories();
        
        let html = '<div class="library-grouped">';
        
        categories.forEach(category => {
            const categoryMusic = groupedMusic[category.id];
            if (categoryMusic && categoryMusic.length > 0) {
                html += `
                    <div class="library-group">
                        <div class="library-group-header">
                            <span class="library-group-icon">${category.icon}</span>
                            <h4 class="library-group-title">${category.name}</h4>
                            <span class="library-group-count">${categoryMusic.length} song${categoryMusic.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="library-group-items">
                            ${categoryMusic.map(music => this.createLibraryItem(music)).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    createLibraryItem(music) {
        const categoryInfo = AudioXUtils.getCategoryInfo(music.category);
        return `
            <div class="library-list-item" data-id="${music.id}">
                <div class="library-item-info">
                    <div class="library-item-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="library-item-details">
                        <h4>${AudioXUtils.sanitizeHTML(music.title)}</h4>
                        <p>${AudioXUtils.sanitizeHTML(music.description || 'No description')}</p>
                        <div class="library-item-meta">
                            <span class="category-tag">${categoryInfo.name}</span>
                            <span class="date-added">${AudioXUtils.formatDate(music.dateAdded)}</span>
                        </div>
                    </div>
                </div>
                <div class="library-item-actions">
                    <button class="action-btn play-btn" title="Play song">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn like-btn ${music.liked ? 'liked' : ''}" 
                            title="${music.liked ? 'Unlike' : 'Like'} this song">
                        <i class="fas fa-heart"></i>
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
        const music = this.app.musicLibrary.find(m => m.id === musicId);
        if (music) {
            AudioXUtils.showToast(`Now playing: ${music.title}`, 'success');
        }
    }

    editMusic(musicId) {
        const music = this.app.musicLibrary.find(m => m.id === musicId);
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
        const music = this.app.musicLibrary.find(m => m.id === musicId);
        if (music && confirm(`Are you sure you want to delete "${music.title}"?`)) {
            this.app.deleteMusic(musicId);
            this.update();
        }
    }

    setupAddMusicForm() {
        const addForm = document.getElementById('addMusicForm');
        addForm.onsubmit = (e) => {
            e.preventDefault();
            this.handleAddSubmit(e);
        };
    }

    handleAddSubmit(e) {
        const formData = new FormData(e.target);
        const musicData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category')
        };

        if (this.app.addMusic(musicData)) {
            this.app.closeModal();
            this.update();
        }
    }

    getEmptyLibraryContent() {
        if (this.currentPlaylist) {
            const categoryInfo = AudioXUtils.getCategoryInfo(this.currentPlaylist);
            return `
                <div class="library-empty">
                    <i class="fas fa-music"></i>
                    <h3>No songs in ${categoryInfo.name}</h3>
                    <p>Add some music to this playlist to get started!</p>
                    <button class="btn-primary" onclick="app.showModal('addMusicModal')">
                        <i class="fas fa-plus"></i> Add Music
                    </button>
                </div>
            `;
        }

        return `
            <div class="library-empty">
                <i class="fas fa-music"></i>
                <h3>Your library is empty</h3>
                <p>Start building your music collection by adding your first song!</p>
                <button class="btn-primary" onclick="app.showModal('addMusicModal')">
                    <i class="fas fa-plus"></i> Add Your First Song
                </button>
            </div>
        `;
    }

    update() {
        this.loadPlaylists();
        this.loadLibraryContent();
    }

    // Search within library
    searchInLibrary(query) {
        if (!query) {
            this.loadLibraryContent();
            return;
        }

        const results = AudioXUtils.filterMusic(this.app.musicLibrary, query);
        const libraryGrid = this.container.querySelector('#libraryGrid');
        
        if (results.length === 0) {
            libraryGrid.innerHTML = `
                <div class="library-empty">
                    <i class="fas fa-search"></i>
                    <h3>No results found in library</h3>
                    <p>Try a different search term</p>
                </div>
            `;
        } else {
            this.renderSimpleLibrary(results, libraryGrid);
        }
    }

    // Get library statistics
    getStats() {
        const total = this.app.musicLibrary.length;
        const liked = this.app.likedSongs.length;
        const categories = AudioXUtils.getCategories().map(cat => ({
            name: cat.name,
            count: this.app.musicLibrary.filter(m => m.category === cat.id).length
        }));

        return {
            totalSongs: total,
            likedSongs: liked,
            categories: categories.filter(cat => cat.count > 0),
            recentlyAdded: this.app.musicLibrary
                .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                .slice(0, 10)
        };
    }
}

// Export for use in main app
window.LibraryScreen = LibraryScreen; 