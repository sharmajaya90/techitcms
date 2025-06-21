/* ===============================
   HOME SCREEN MANAGER
   Handles home screen functionality
   =============================== */

class HomeScreen {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('home-screen');
        this.currentCategory = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    load() {
        this.loadYourMusic();
        this.updateCategoryCounts();
    }

    render() {
        this.container.innerHTML = `
            <div class="screen-header">
                <h1 id="homeTitle">Your Library</h1>
                <div class="header-actions">
                    <button class="back-btn" id="backBtn" style="display: none;">
                        <i class="fas fa-arrow-left"></i> Back to Categories
                    </button>
                </div>
            </div>
            
            <div class="section your-music-section">
                <h2>Your Music</h2>
                <div class="music-grid" id="musicGrid">
                    <div class="loading">Loading...</div>
                </div>
            </div>

            <div class="section on-repeat-section">
                <h2>On Repeat</h2>
                <div class="categories-grid" id="categoriesGrid">
                    ${this.renderCategories()}
                </div>
            </div>
        `;
    }

    renderCategories() {
        const categories = AudioXUtils.getCategories().slice(0, 6); // First 6 categories for home
        return categories.map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <h3>${category.name}</h3>
                <p class="category-count">0 songs</p>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Category card clicks
        this.container.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                this.handleCategoryClick(categoryCard.dataset.category);
            }

            // Music card actions
            const musicCard = e.target.closest('.home-music-card');
            if (musicCard) {
                this.handleMusicCardClick(e, musicCard);
            }
        });

        // Back button
        const backBtn = this.container.querySelector('#backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showAllCategories());
        }
    }

    handleCategoryClick(categoryId) {
        this.currentCategory = categoryId;
        this.showCategoryMusic(categoryId);
    }

    handleMusicCardClick(e, musicCard) {
        const musicId = musicCard.dataset.id;
        const action = e.target.closest('.action-btn');
        
        if (action) {
            e.stopPropagation();
            
            if (action.classList.contains('like-btn')) {
                this.app.toggleLike(musicId);
            } else if (action.classList.contains('edit-btn')) {
                this.editMusic(musicId);
            } else if (action.classList.contains('delete-btn')) {
                this.deleteMusic(musicId);
            }
        } else {
            // Play music (simulate)
            this.playMusic(musicId);
        }
    }

    loadYourMusic() {
        const musicGrid = this.container.querySelector('#musicGrid');
        const recentMusic = this.app.musicLibrary.slice(0, 6);
        
        if (recentMusic.length === 0) {
            musicGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>No music in your library yet</h3>
                    <p>Add some music to get started!</p>
                    <button class="btn-primary" onclick="app.showModal('addMusicModal')">
                        <i class="fas fa-plus"></i> Add Music
                    </button>
                </div>
            `;
        } else {
            musicGrid.innerHTML = recentMusic.map(music => this.createHomeMusicCard(music)).join('');
        }
    }

    showCategoryMusic(categoryId) {
        const categoryInfo = AudioXUtils.getCategoryInfo(categoryId);
        const categoryMusic = this.app.musicLibrary.filter(music => music.category === categoryId);
        const musicGrid = this.container.querySelector('#musicGrid');
        const homeTitle = this.container.querySelector('#homeTitle');
        const backBtn = this.container.querySelector('#backBtn');
        
        // Update header
        homeTitle.textContent = categoryInfo.name;
        backBtn.style.display = 'flex';
        
        // Hide categories section
        const onRepeatSection = this.container.querySelector('.on-repeat-section');
        onRepeatSection.style.display = 'none';
        
        // Show category music
        if (categoryMusic.length === 0) {
            musicGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>No music in ${categoryInfo.name}</h3>
                    <p>Add some music to this category!</p>
                    <button class="btn-primary" onclick="app.showModal('addMusicModal')">
                        <i class="fas fa-plus"></i> Add Music
                    </button>
                </div>
            `;
        } else {
            musicGrid.innerHTML = categoryMusic.map(music => this.createHomeMusicCard(music)).join('');
        }
    }

    showAllCategories() {
        this.currentCategory = null;
        const homeTitle = this.container.querySelector('#homeTitle');
        const backBtn = this.container.querySelector('#backBtn');
        const onRepeatSection = this.container.querySelector('.on-repeat-section');
        
        // Reset header
        homeTitle.textContent = 'Your Library';
        backBtn.style.display = 'none';
        
        // Show categories section
        onRepeatSection.style.display = 'block';
        
        // Load your music again
        this.loadYourMusic();
    }

    updateCategoryCounts() {
        const categoryCards = this.container.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const categoryId = card.dataset.category;
            const count = this.app.musicLibrary.filter(music => music.category === categoryId).length;
            const countElement = card.querySelector('.category-count');
            if (countElement) {
                countElement.textContent = `${count} song${count !== 1 ? 's' : ''}`;
            }
        });
    }

    createHomeMusicCard(music) {
        const categoryInfo = AudioXUtils.getCategoryInfo(music.category);
        return `
            <div class="home-music-card" data-id="${music.id}">
                <div class="music-cover">
                    <i class="fas fa-music"></i>
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="music-info">
                    <h4>${AudioXUtils.sanitizeHTML(music.title)}</h4>
                    <p>${AudioXUtils.sanitizeHTML(music.description || 'No description')}</p>
                    <span class="music-category">${categoryInfo.name}</span>
                </div>
                <div class="music-actions">
                    <button class="action-btn like-btn ${music.liked ? 'liked' : ''}" 
                            title="${music.liked ? 'Unlike' : 'Like'} this song">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit this song">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete this song">
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
            // In a real app, you would start audio playback here
        }
    }

    editMusic(musicId) {
        const music = this.app.musicLibrary.find(m => m.id === musicId);
        if (music) {
            // Populate edit form
            document.getElementById('editMusicTitle').value = music.title;
            document.getElementById('editMusicDescription').value = music.description || '';
            document.getElementById('editMusicCategory').value = music.category;
            
            // Set form data attribute
            const editForm = document.getElementById('editMusicForm');
            editForm.dataset.musicId = musicId;
            
            // Setup form handler
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

    update() {
        if (this.currentCategory) {
            this.showCategoryMusic(this.currentCategory);
        } else {
            this.loadYourMusic();
        }
        this.updateCategoryCounts();
    }

    // Search within home screen
    searchInHome(query) {
        if (!query) {
            this.loadYourMusic();
            return;
        }

        const results = AudioXUtils.filterMusic(this.app.musicLibrary, query);
        const musicGrid = this.container.querySelector('#musicGrid');
        
        if (results.length === 0) {
            musicGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
        } else {
            musicGrid.innerHTML = results.map(music => this.createHomeMusicCard(music)).join('');
        }
    }

    // Get screen statistics
    getStats() {
        const totalMusic = this.app.musicLibrary.length;
        const categories = AudioXUtils.getCategories();
        const categoryStats = categories.map(cat => ({
            name: cat.name,
            count: this.app.musicLibrary.filter(m => m.category === cat.id).length
        }));

        return {
            totalMusic,
            categoryStats,
            recentlyAdded: this.app.musicLibrary
                .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                .slice(0, 5)
        };
    }
}

// Export for use in main app
window.HomeScreen = HomeScreen; 