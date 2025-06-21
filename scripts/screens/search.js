/* ===============================
   SEARCH SCREEN MANAGER
   Handles search functionality and filtering
   =============================== */

class SearchScreen {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('search-screen');
        this.currentFilter = 'all';
        this.currentQuery = '';
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    load() {
        // Focus search input when screen loads
        const searchInput = this.container.querySelector('#searchInput');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
        
        // Clear previous search
        this.clearSearch();
    }

    render() {
        this.container.innerHTML = `
            <div class="screen-header">
                <h1>Search Your Library</h1>
            </div>
            
            <div class="search-container">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search for songs, artists, or genres...">
                </div>
                
                <div class="search-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="title">Title</button>
                    <button class="filter-btn" data-filter="description">Description</button>
                    <button class="filter-btn" data-filter="category">Category</button>
                </div>
            </div>

            <div class="search-results" id="searchResults">
                ${this.getInitialContent()}
            </div>
        `;
    }

    setupEventListeners() {
        const searchInput = this.container.querySelector('#searchInput');
        const filterBtns = this.container.querySelectorAll('.filter-btn');

        // Search input with debouncing
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
                this.performSearch(searchInput.value);
            });
        });

        // Result actions
        this.container.addEventListener('click', (e) => {
            this.handleResultAction(e);
        });
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update button states
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    }

    performSearch(query) {
        this.currentQuery = query.trim();
        const resultsContainer = this.container.querySelector('#searchResults');

        if (!this.currentQuery) {
            resultsContainer.innerHTML = this.getInitialContent();
            return;
        }

        // Show loading state
        resultsContainer.innerHTML = this.getLoadingContent();

        // Simulate slight delay for better UX
        setTimeout(() => {
            const results = AudioXUtils.filterMusic(
                this.app.musicLibrary, 
                this.currentQuery, 
                this.currentFilter
            );

            if (results.length === 0) {
                resultsContainer.innerHTML = this.getEmptyResults();
            } else {
                resultsContainer.innerHTML = this.renderResults(results);
            }
        }, 200);
    }

    renderResults(results) {
        return `
            <div class="search-results-header">
                <h3>Found ${results.length} result${results.length !== 1 ? 's' : ''}</h3>
            </div>
            <div class="search-results-grid">
                ${results.map(music => this.createResultCard(music)).join('')}
            </div>
        `;
    }

    createResultCard(music) {
        const categoryInfo = AudioXUtils.getCategoryInfo(music.category);
        const highlightedTitle = AudioXUtils.highlightSearchTerm(music.title, this.currentQuery);
        const highlightedDescription = AudioXUtils.highlightSearchTerm(music.description || '', this.currentQuery);

        return `
            <div class="search-result-item" data-id="${music.id}">
                <div class="search-result-header">
                    <div class="search-result-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="search-result-info">
                        <h4>${highlightedTitle}</h4>
                        <span class="category-tag">${categoryInfo.name}</span>
                    </div>
                </div>
                
                ${music.description ? `
                    <div class="search-result-description">
                        ${highlightedDescription}
                    </div>
                ` : ''}
                
                <div class="search-result-actions">
                    <div class="result-meta">
                        <span class="result-date">${AudioXUtils.formatDate(music.dateAdded)}</span>
                    </div>
                    <div class="result-buttons">
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
            </div>
        `;
    }

    handleResultAction(e) {
        const actionBtn = e.target.closest('.action-btn');
        if (!actionBtn) return;

        const resultItem = actionBtn.closest('.search-result-item');
        const musicId = resultItem.dataset.id;

        e.preventDefault();
        e.stopPropagation();

        if (actionBtn.classList.contains('play-btn')) {
            this.playMusic(musicId);
        } else if (actionBtn.classList.contains('like-btn')) {
            this.app.toggleLike(musicId);
            this.refreshCurrentResults();
        } else if (actionBtn.classList.contains('edit-btn')) {
            this.editMusic(musicId);
        } else if (actionBtn.classList.contains('delete-btn')) {
            this.deleteMusic(musicId);
        }
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
            this.refreshCurrentResults();
        }
    }

    deleteMusic(musicId) {
        const music = this.app.musicLibrary.find(m => m.id === musicId);
        if (music && confirm(`Are you sure you want to delete "${music.title}"?`)) {
            this.app.deleteMusic(musicId);
            this.refreshCurrentResults();
        }
    }

    refreshCurrentResults() {
        if (this.currentQuery) {
            this.performSearch(this.currentQuery);
        }
    }

    clearSearch() {
        this.currentQuery = '';
        this.currentFilter = 'all';
        
        const searchInput = this.container.querySelector('#searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelector('[data-filter="all"]').classList.add('active');
        
        // Show initial content
        const resultsContainer = this.container.querySelector('#searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.getInitialContent();
        }
    }

    getInitialContent() {
        const recentMusic = this.app.musicLibrary
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 6);

        if (recentMusic.length === 0) {
            return `
                <div class="search-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Start searching your music library</h3>
                    <p>Type in the search box above to find your songs, artists, or genres.</p>
                </div>
            `;
        }

        return `
            <div class="search-suggestions">
                <h3>Recently Added</h3>
                <div class="search-results-grid">
                    ${recentMusic.map(music => this.createResultCard(music)).join('')}
                </div>
            </div>
        `;
    }

    getLoadingContent() {
        return `
            <div class="search-loading">
                <div class="search-loading-spinner"></div>
                <p>Searching your library...</p>
            </div>
        `;
    }

    getEmptyResults() {
        return `
            <div class="search-empty-state">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try searching with different keywords or check your spelling.</p>
                <div class="search-suggestions-buttons">
                    <button class="btn-secondary" onclick="document.getElementById('searchInput').value = ''; document.getElementById('searchInput').focus();">
                        <i class="fas fa-times"></i> Clear Search
                    </button>
                    <button class="btn-primary" onclick="app.showModal('addMusicModal')">
                        <i class="fas fa-plus"></i> Add New Music
                    </button>
                </div>
            </div>
        `;
    }

    update() {
        // Refresh current search results if any
        this.refreshCurrentResults();
    }

    // Get search statistics
    getStats() {
        return {
            totalSearchable: this.app.musicLibrary.length,
            categories: AudioXUtils.getCategories().map(cat => ({
                name: cat.name,
                count: this.app.musicLibrary.filter(m => m.category === cat.id).length
            }))
        };
    }
}

// Export for use in main app
window.SearchScreen = SearchScreen; 