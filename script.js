// Audio X - Interactive Functionality

class AudioXApp {
    constructor() {
        this.currentScreen = 'home';
        this.musicLibrary = this.loadMusicLibrary();
        this.likedSongs = this.loadLikedSongs();
        this.settings = this.loadSettings();
        this.searchQuery = '';
        this.searchFilter = 'all';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.loadInitialData();
        this.updateUI();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        document.querySelector('.btn-settings').addEventListener('click', () => {
            this.showScreen('settings');
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.performSearch();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Library controls
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSortChange(e));
        });

        document.getElementById('groupByCategory').addEventListener('change', (e) => {
            this.updateLibraryView();
        });

        // Settings
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleSettingsTab(e));
        });

        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleThemeChange(e));
        });

        document.getElementById('accentColor').addEventListener('change', (e) => {
            this.handleAccentColorChange(e);
        });

        // Modal controls
        document.getElementById('addMusicBtn').addEventListener('click', () => {
            this.showModal('addMusicModal');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.showModal('logoutModal');
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e));
        });

        // Modal background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(e);
            });
        });

        // Form submissions
        document.getElementById('addMusicForm').addEventListener('submit', (e) => {
            this.handleAddMusic(e);
        });

        document.getElementById('editMusicForm').addEventListener('submit', (e) => {
            this.handleEditMusic(e);
        });

        // Logout confirmation
        document.getElementById('cancelLogout').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirmLogout').addEventListener('click', () => {
            this.handleLogout();
        });

        // Category cards (Home screen)
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleCategoryClick(e));
        });

        // Clear data button
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.handleClearData();
        });
    }

    // Add event listeners for playlist cards after they're created
    setupPlaylistCardListeners() {
        document.querySelectorAll('.playlist-card').forEach(card => {
            card.addEventListener('click', (e) => this.handlePlaylistClick(e));
        });
    }

    // Navigation
    handleNavigation(e) {
        e.preventDefault();
        const screen = e.currentTarget.dataset.screen;
        this.showScreen(screen);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
        
        // Load screen-specific data
        this.loadScreenData(screenName);
    }

    loadScreenData(screenName) {
        switch(screenName) {
            case 'home':
                this.loadHomeData();
                break;
            case 'search':
                this.loadSearchData();
                break;
            case 'library':
                this.loadLibraryData();
                break;
            case 'liked':
                this.loadLikedData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    // Data Loading
    loadInitialData() {
        // Simulate loading delay
        setTimeout(() => {
            this.loadHomeData();
        }, 1000);
    }

    loadHomeData() {
        const musicGrid = document.getElementById('musicGrid');
        const recentMusic = this.musicLibrary.slice(0, 6);
        
        if (recentMusic.length === 0) {
            musicGrid.innerHTML = '<div class="empty-state"><i class="fas fa-music"></i><h3>No music in your library yet</h3><p>Add some music to get started!</p></div>';
        } else {
            musicGrid.innerHTML = recentMusic.map(music => this.createMusicCard(music)).join('');
        }
    }

    loadSearchData() {
        if (this.searchQuery) {
            this.performSearch();
        }
    }

    loadLibraryData() {
        const libraryContent = document.querySelector('.library-content');
        
        // Update playlist song counts
        this.updatePlaylistCounts();
        
        // Setup playlist card event listeners
        this.setupPlaylistCardListeners();
        
        if (this.musicLibrary.length === 0) {
            libraryContent.innerHTML = '<div class="empty-state"><i class="fas fa-music"></i><h3>Your library is empty</h3><p>Start by adding some music!</p></div>';
        } else {
            libraryContent.innerHTML = this.musicLibrary.map(music => this.createMusicListItem(music)).join('');
        }
    }

    // Update playlist song counts
    updatePlaylistCounts() {
        const categories = ['work-out', 'techno-90s', 'quiet-hours', 'rap', 'deep-focus', 
                          'beach-vibes', 'pop-hits', 'movie-classics', 'folk-music', 
                          'travelling', 'for-kids', '80s-hits'];
        
        categories.forEach(category => {
            const count = this.musicLibrary.filter(music => music.category === category).length;
            const playlistCard = document.querySelector(`[data-category="${category}"] .playlist-count`);
            if (playlistCard) {
                playlistCard.textContent = `${count} song${count !== 1 ? 's' : ''}`;
            }
        });
    }

    loadLikedData() {
        const likedContent = document.querySelector('.liked-content');
        const likedCount = document.getElementById('likedCount');
        const mostLikedCategory = document.getElementById('mostLikedCategory');
        const recentlyLiked = document.getElementById('recentlyLiked');
        
        likedCount.textContent = this.likedSongs.length;
        
        if (this.likedSongs.length === 0) {
            likedContent.innerHTML = '<div class="empty-state"><i class="fas fa-heart"></i><h3>No liked songs yet</h3><p>Like some songs to see them here!</p></div>';
            mostLikedCategory.textContent = '-';
            recentlyLiked.textContent = '-';
        } else {
            likedContent.innerHTML = this.likedSongs.map(song => this.createMusicListItem(song)).join('');
            
            // Calculate most liked category
            const categories = this.likedSongs.reduce((acc, song) => {
                acc[song.category] = (acc[song.category] || 0) + 1;
                return acc;
            }, {});
            
            const topCategory = Object.keys(categories).reduce((a, b) => 
                categories[a] > categories[b] ? a : b
            );
            
            mostLikedCategory.textContent = this.formatCategoryName(topCategory);
            
            // Most recent liked song
            const recent = this.likedSongs[this.likedSongs.length - 1];
            recentlyLiked.textContent = recent ? recent.title : '-';
        }
    }

    loadSettingsData() {
        // Settings are already loaded in applySettings()
    }

    // Search Functionality
    performSearch() {
        const results = this.musicLibrary.filter(music => {
            if (!this.searchQuery) return false;
            
            const query = this.searchQuery.toLowerCase();
            
            switch(this.searchFilter) {
                case 'title':
                    return music.title.toLowerCase().includes(query);
                case 'description':
                    return music.description.toLowerCase().includes(query);
                case 'category':
                    return music.category.toLowerCase().includes(query);
                default:
                    return music.title.toLowerCase().includes(query) ||
                           music.description.toLowerCase().includes(query) ||
                           music.category.toLowerCase().includes(query);
            }
        });

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const searchResults = document.querySelector('.search-results');
        
        if (results.length === 0) {
            if (this.searchQuery) {
                searchResults.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No results found</h3><p>Try a different search term</p></div>';
            } else {
                searchResults.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>Search for music to get started</h3></div>';
            }
        } else {
            searchResults.innerHTML = `
                <div class="search-results-grid">
                    ${results.map(music => this.createMusicCard(music)).join('')}
                </div>
            `;
        }
    }

    handleFilterChange(e) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.searchFilter = e.target.dataset.filter;
        this.performSearch();
    }

    // Library Management
    handleSortChange(e) {
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        const sortType = e.target.dataset.sort;
        this.sortLibrary(sortType);
        this.loadLibraryData();
    }

    sortLibrary(sortType) {
        switch(sortType) {
            case 'recent':
                this.musicLibrary.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'az':
                this.musicLibrary.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                // Keep original order for 'all'
                break;
        }
    }

    updateLibraryView() {
        this.loadLibraryData();
    }

    // Category Handling (Home screen)
    handleCategoryClick(e) {
        const category = e.currentTarget.dataset.category;
        this.showCategoryMusic(category);
    }

    // Playlist Handling (Library screen)
    handlePlaylistClick(e) {
        const category = e.currentTarget.dataset.category;
        this.showPlaylistMusic(category);
    }

    showCategoryMusic(category) {
        const categoryMusic = this.musicLibrary.filter(music => music.category === category);
        const musicGrid = document.getElementById('musicGrid');
        
        // Show back button
        document.getElementById('backBtn').style.display = 'flex';
        
        // Update header
        document.querySelector('#home-screen .screen-header h1').textContent = this.formatCategoryName(category);
        
        if (categoryMusic.length === 0) {
            musicGrid.innerHTML = `<div class="empty-state"><i class="fas fa-music"></i><h3>No music in ${this.formatCategoryName(category)}</h3><p>Add some music to this category!</p></div>`;
        } else {
            musicGrid.innerHTML = categoryMusic.map(music => this.createMusicCard(music)).join('');
        }
    }

    showPlaylistMusic(category) {
        const playlistMusic = this.musicLibrary.filter(music => music.category === category);
        const libraryContent = document.querySelector('.library-content');
        
        // Update the section header
        const sectionHeader = document.querySelector('#library-screen .section:last-child h2');
        sectionHeader.textContent = this.formatCategoryName(category);
        
        if (playlistMusic.length === 0) {
            libraryContent.innerHTML = `<div class="empty-state"><i class="fas fa-music"></i><h3>No music in ${this.formatCategoryName(category)}</h3><p>Add some music to this category!</p></div>`;
        } else {
            libraryContent.innerHTML = playlistMusic.map(music => this.createMusicListItem(music)).join('');
        }
    }

    // Settings Management
    handleSettingsTab(e) {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        e.target.classList.add('active');
        
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const tabName = e.target.dataset.tab;
        document.getElementById(`${tabName}-panel`).classList.add('active');
    }

    handleThemeChange(e) {
        const theme = e.target.value;
        this.settings.theme = theme;
        this.applyTheme(theme);
        this.saveSettings();
    }

    handleAccentColorChange(e) {
        const color = e.target.value;
        this.settings.accentColor = color;
        this.applyAccentColor(color);
        this.saveSettings();
    }

    applySettings() {
        this.applyTheme(this.settings.theme);
        this.applyAccentColor(this.settings.accentColor);
        
        // Apply other settings
        document.getElementById('showCategories').checked = this.settings.showCategories;
        document.getElementById('groupSongs').checked = this.settings.groupSongs;
        document.getElementById('showRecentlyPlayed').checked = this.settings.showRecentlyPlayed;
        document.getElementById('autoplay').checked = this.settings.autoplay;
        document.getElementById('audioQuality').value = this.settings.audioQuality;
        document.getElementById('accentColor').value = this.settings.accentColor;
        
        // Set theme radio button
        document.querySelector(`input[name="theme"][value="${this.settings.theme}"]`).checked = true;
    }

    applyTheme(theme) {
        const body = document.body;
        
        switch(theme) {
            case 'light':
                body.classList.add('light-theme');
                break;
            case 'dark':
                body.classList.remove('light-theme');
                break;
            case 'system':
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    body.classList.remove('light-theme');
                } else {
                    body.classList.add('light-theme');
                }
                break;
        }
    }

    applyAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);
    }

    handleClearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.musicLibrary = [];
            this.likedSongs = [];
            this.saveMusicLibrary();
            this.saveLikedSongs();
            this.updateUI();
            alert('All data has been cleared.');
        }
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(e) {
        if (e && e.target) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        } else {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    }

    // Music Management
    handleAddMusic(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const musicData = {
            id: Date.now().toString(),
            title: formData.get('musicTitle') || document.getElementById('musicTitle').value,
            description: formData.get('musicDescription') || document.getElementById('musicDescription').value,
            category: formData.get('musicCategory') || document.getElementById('musicCategory').value,
            dateAdded: new Date().toISOString(),
            liked: false
        };

        // Validate required fields
        if (!musicData.title || !musicData.category) {
            alert('Please fill in all required fields.');
            return;
        }

        this.musicLibrary.push(musicData);
        this.saveMusicLibrary();
        this.closeModal();
        this.updateUI();
        
        // Reset form
        e.target.reset();
        
        alert('Music added successfully!');
    }

    handleEditMusic(e) {
        e.preventDefault();
        
        const musicId = e.target.dataset.musicId;
        const music = this.musicLibrary.find(m => m.id === musicId);
        
        if (music) {
            const formData = new FormData(e.target);
            music.title = formData.get('editMusicTitle') || document.getElementById('editMusicTitle').value;
            music.description = formData.get('editMusicDescription') || document.getElementById('editMusicDescription').value;
            music.category = formData.get('editMusicCategory') || document.getElementById('editMusicCategory').value;
            
            this.saveMusicLibrary();
            this.closeModal();
            this.updateUI();
            
            alert('Music updated successfully!');
        }
    }

    deleteMusic(musicId) {
        if (confirm('Are you sure you want to delete this music?')) {
            this.musicLibrary = this.musicLibrary.filter(m => m.id !== musicId);
            this.likedSongs = this.likedSongs.filter(m => m.id !== musicId);
            this.saveMusicLibrary();
            this.saveLikedSongs();
            this.updateUI();
        }
    }

    toggleLike(musicId) {
        const music = this.musicLibrary.find(m => m.id === musicId);
        
        if (music) {
            music.liked = !music.liked;
            
            if (music.liked) {
                this.likedSongs.push({...music});
            } else {
                this.likedSongs = this.likedSongs.filter(m => m.id !== musicId);
            }
            
            this.saveMusicLibrary();
            this.saveLikedSongs();
            this.updateUI();
        }
    }

    // UI Creation Methods
    createMusicCard(music) {
        return `
            <div class="music-card" data-id="${music.id}">
                <div class="music-cover">
                    <i class="fas fa-music"></i>
                </div>
                <div class="music-info">
                    <h4>${music.title}</h4>
                    <p>${music.description || 'No description'}</p>
                    <span class="music-category">${this.formatCategoryName(music.category)}</span>
                </div>
                <div class="music-actions">
                    <button class="action-btn like-btn ${music.liked ? 'liked' : ''}" onclick="app.toggleLike('${music.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="app.editMusic('${music.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="app.deleteMusic('${music.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createMusicListItem(music) {
        return `
            <div class="music-list-item" data-id="${music.id}">
                <div class="music-info">
                    <h4>${music.title}</h4>
                    <p>${music.description || 'No description'}</p>
                    <span class="music-category">${this.formatCategoryName(music.category)}</span>
                </div>
                <div class="music-actions">
                    <button class="action-btn like-btn ${music.liked ? 'liked' : ''}" onclick="app.toggleLike('${music.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="app.editMusic('${music.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="app.deleteMusic('${music.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    editMusic(musicId) {
        const music = this.musicLibrary.find(m => m.id === musicId);
        
        if (music) {
            // Populate edit form
            document.getElementById('editMusicTitle').value = music.title;
            document.getElementById('editMusicDescription').value = music.description || '';
            document.getElementById('editMusicCategory').value = music.category;
            
            // Set form data attribute
            document.getElementById('editMusicForm').dataset.musicId = musicId;
            
            this.showModal('editMusicModal');
        }
    }

    // Utility Methods
    formatCategoryName(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    updateUI() {
        this.loadScreenData(this.currentScreen);
    }

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            // Simulate logout
            alert('Logged out successfully!');
            this.closeModal();
            // In a real app, you would redirect to login page
        }
    }

    // Data Persistence
    loadMusicLibrary() {
        const saved = localStorage.getItem('audioX_musicLibrary');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Return demo data
        return [
            {
                id: '1',
                title: 'Energetic Workout Mix',
                description: 'High-energy tracks for your workout sessions',
                category: 'work-out',
                dateAdded: new Date(Date.now() - 86400000).toISOString(),
                liked: true
            },
            {
                id: '2',
                title: 'Classic 90s Techno',
                description: 'The best techno hits from the 90s',
                category: 'techno-90s',
                dateAdded: new Date(Date.now() - 172800000).toISOString(),
                liked: false
            },
            {
                id: '3',
                title: 'Peaceful Evening',
                description: 'Calm and relaxing music for quiet hours',
                category: 'quiet-hours',
                dateAdded: new Date(Date.now() - 259200000).toISOString(),
                liked: true
            }
        ];
    }

    loadLikedSongs() {
        const saved = localStorage.getItem('audioX_likedSongs');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Return liked songs from demo data
        return this.loadMusicLibrary().filter(music => music.liked);
    }

    loadSettings() {
        const saved = localStorage.getItem('audioX_settings');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            theme: 'dark',
            accentColor: '#1db954',
            showCategories: true,
            groupSongs: true,
            showRecentlyPlayed: true,
            autoplay: true,
            audioQuality: 'auto'
        };
    }

    saveMusicLibrary() {
        localStorage.setItem('audioX_musicLibrary', JSON.stringify(this.musicLibrary));
    }

    saveLikedSongs() {
        localStorage.setItem('audioX_likedSongs', JSON.stringify(this.likedSongs));
    }

    saveSettings() {
        localStorage.setItem('audioX_settings', JSON.stringify(this.settings));
    }
}

// Additional CSS for music cards and list items
const additionalStyles = `
<style>
.music-card, .music-list-item {
    background-color: var(--tertiary-bg);
    border-radius: var(--border-radius);
    padding: 20px;
    border: 1px solid var(--border-color);
    transition: var(--transition);
    margin-bottom: 15px;
}

.music-card:hover, .music-list-item:hover {
    background-color: var(--hover-bg);
    transform: translateY(-2px);
    box-shadow: var(--box-shadow);
}

.music-cover {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--accent-color), #1ed760);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    color: white;
    font-size: 1.5rem;
}

.music-info h4 {
    margin-bottom: 8px;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.music-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.music-category {
    background-color: var(--accent-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.music-actions {
    display: flex;
    gap: 8px;
    margin-top: 15px;
    justify-content: flex-end;
}

.action-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn:hover {
    background-color: var(--hover-bg);
    color: var(--text-primary);
}

.like-btn.liked {
    background-color: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

.delete-btn:hover {
    background-color: #e22134;
    color: white;
    border-color: #e22134;
}

.search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.music-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.music-list-item .music-info {
    flex: 1;
}

.music-list-item .music-actions {
    margin-top: 0;
}

@media (max-width: 768px) {
    .search-results-grid {
        grid-template-columns: 1fr;
    }
    
    .music-list-item {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .music-list-item .music-actions {
        margin-top: 15px;
        align-self: flex-end;
    }
}
</style>
`;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add additional styles
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
    
    // Initialize the app
    window.app = new AudioXApp();
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (window.app && window.app.settings.theme === 'system') {
        window.app.applyTheme('system');
    }
}); 