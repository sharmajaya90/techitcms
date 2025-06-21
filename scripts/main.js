/* ===============================
   AUDIO X - MAIN APPLICATION
   Core application logic and coordination
   =============================== */

class AudioXApp {
    constructor() {
        this.currentScreen = 'home';
        this.musicLibrary = this.loadMusicLibrary();
        this.likedSongs = this.loadLikedSongs();
        this.settings = this.loadSettings();
        
        // Screen instances
        this.screens = {};
        
        // Initialize after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            // Load components first
            await this.loadComponents();
            
            // Initialize screen managers
            this.initializeScreens();
            
            // Setup global event listeners
            this.setupEventListeners();
            
            // Apply settings
            this.applySettings();
            
            // Show initial screen
            this.showScreen('home');
            
            AudioXUtils.showToast('Audio X loaded successfully!', 'success');
        } catch (error) {
            console.error('Failed to initialize Audio X:', error);
            AudioXUtils.showToast('Failed to load application', 'error');
        }
    }

    async loadComponents() {
        const container = document.getElementById('screen-container');
        const modalsContainer = document.getElementById('modals-container');
        
        if (!container || !modalsContainer) {
            throw new Error('Required containers not found');
        }

        // Load screen templates
        container.innerHTML = `
            <section class="screen active" id="home-screen"></section>
            <section class="screen" id="search-screen"></section>
            <section class="screen" id="library-screen"></section>
            <section class="screen" id="liked-screen"></section>
            <section class="screen" id="settings-screen"></section>
        `;

        // Load modals
        modalsContainer.innerHTML = this.getModalsHTML();
    }

    initializeScreens() {
        // Initialize screen managers if they exist
        if (window.HomeScreen) {
            this.screens.home = new HomeScreen(this);
        }
        if (window.SearchScreen) {
            this.screens.search = new SearchScreen(this);
        }
        if (window.LibraryScreen) {
            this.screens.library = new LibraryScreen(this);
        }
        if (window.LikedScreen) {
            this.screens.liked = new LikedScreen(this);
        }
        if (window.SettingsScreen) {
            this.screens.settings = new SettingsScreen(this);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        document.querySelector('.btn-settings').addEventListener('click', () => {
            this.showScreen('settings');
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Modal controls
        this.setupModalListeners();

        // Global logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.showModal('logoutModal'));
        }

        // System theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.settings.theme === 'system') {
                this.applyTheme('system');
            }
        });

        // Window resize
        window.addEventListener('resize', AudioXUtils.throttle(() => {
            this.handleResize();
        }, 250));
    }

    setupModalListeners() {
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

        // Logout confirmation
        const cancelLogout = document.getElementById('cancelLogout');
        const confirmLogout = document.getElementById('confirmLogout');
        
        if (cancelLogout) {
            cancelLogout.addEventListener('click', () => this.closeModal());
        }
        
        if (confirmLogout) {
            confirmLogout.addEventListener('click', () => this.handleLogout());
        }
    }

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
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Load screen-specific data
            if (this.screens[screenName] && this.screens[screenName].load) {
                this.screens[screenName].load();
            }
        }
    }

    handleKeyboard(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.showScreen('search');
                    break;
                case 'h':
                    e.preventDefault();
                    this.showScreen('home');
                    break;
                case 'l':
                    e.preventDefault();
                    this.showScreen('library');
                    break;
            }
        }

        // Escape key to close modals
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    handleResize() {
        // Handle responsive changes
        if (AudioXUtils.isMobile()) {
            // Mobile-specific adjustments
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            // Focus first input if available
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
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
        
        // Clear any form data
        document.querySelectorAll('.modal form').forEach(form => {
            form.reset();
        });
    }

    // Data Management
    addMusic(musicData) {
        const validationErrors = AudioXUtils.validateMusicData(musicData);
        if (validationErrors.length > 0) {
            AudioXUtils.showToast(validationErrors.join(', '), 'error');
            return false;
        }

        const newMusic = {
            ...musicData,
            id: AudioXUtils.generateId(),
            dateAdded: new Date().toISOString(),
            liked: false
        };

        this.musicLibrary.push(newMusic);
        this.saveMusicLibrary();
        this.updateAllScreens();
        
        AudioXUtils.showToast('Music added successfully!', 'success');
        return true;
    }

    updateMusic(musicId, updatedData) {
        const index = this.musicLibrary.findIndex(m => m.id === musicId);
        if (index === -1) {
            AudioXUtils.showToast('Music not found', 'error');
            return false;
        }

        const validationErrors = AudioXUtils.validateMusicData(updatedData);
        if (validationErrors.length > 0) {
            AudioXUtils.showToast(validationErrors.join(', '), 'error');
            return false;
        }

        this.musicLibrary[index] = { ...this.musicLibrary[index], ...updatedData };
        
        // Update in liked songs if present
        const likedIndex = this.likedSongs.findIndex(m => m.id === musicId);
        if (likedIndex !== -1) {
            this.likedSongs[likedIndex] = { ...this.likedSongs[likedIndex], ...updatedData };
            this.saveLikedSongs();
        }

        this.saveMusicLibrary();
        this.updateAllScreens();
        
        AudioXUtils.showToast('Music updated successfully!', 'success');
        return true;
    }

    deleteMusic(musicId) {
        this.musicLibrary = this.musicLibrary.filter(m => m.id !== musicId);
        this.likedSongs = this.likedSongs.filter(m => m.id !== musicId);
        
        this.saveMusicLibrary();
        this.saveLikedSongs();
        this.updateAllScreens();
        
        AudioXUtils.showToast('Music deleted successfully!', 'success');
    }

    toggleLike(musicId) {
        const music = this.musicLibrary.find(m => m.id === musicId);
        if (!music) return;

        music.liked = !music.liked;

        if (music.liked) {
            if (!this.likedSongs.find(m => m.id === musicId)) {
                this.likedSongs.push(AudioXUtils.deepClone(music));
            }
        } else {
            this.likedSongs = this.likedSongs.filter(m => m.id !== musicId);
        }

        this.saveMusicLibrary();
        this.saveLikedSongs();
        this.updateAllScreens();
    }

    updateAllScreens() {
        Object.values(this.screens).forEach(screen => {
            if (screen.update) {
                screen.update();
            }
        });
    }

    // Settings Management
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply setting immediately
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'accentColor':
                this.applyAccentColor(value);
                break;
        }
    }

    applySettings() {
        this.applyTheme(this.settings.theme);
        this.applyAccentColor(this.settings.accentColor);
    }

    applyTheme(theme) {
        const body = document.body;
        
        switch (theme) {
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

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            AudioXUtils.showToast('Logged out successfully!', 'success');
            this.closeModal();
            // In a real app, redirect to login page
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.musicLibrary = [];
            this.likedSongs = [];
            this.saveMusicLibrary();
            this.saveLikedSongs();
            this.updateAllScreens();
            AudioXUtils.showToast('All data cleared successfully!', 'success');
        }
    }

    // Data Persistence
    loadMusicLibrary() {
        try {
            const saved = localStorage.getItem('audioX_musicLibrary');
            return saved ? JSON.parse(saved) : AudioXUtils.generateDemoData();
        } catch (e) {
            console.error('Failed to load music library:', e);
            return AudioXUtils.generateDemoData();
        }
    }

    loadLikedSongs() {
        try {
            const saved = localStorage.getItem('audioX_likedSongs');
            if (saved) {
                return JSON.parse(saved);
            }
            // Return liked songs from demo data
            return this.loadMusicLibrary().filter(music => music.liked);
        } catch (e) {
            console.error('Failed to load liked songs:', e);
            return [];
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('audioX_settings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
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
        try {
            localStorage.setItem('audioX_musicLibrary', JSON.stringify(this.musicLibrary));
        } catch (e) {
            console.error('Failed to save music library:', e);
            AudioXUtils.showToast('Failed to save music library', 'error');
        }
    }

    saveLikedSongs() {
        try {
            localStorage.setItem('audioX_likedSongs', JSON.stringify(this.likedSongs));
        } catch (e) {
            console.error('Failed to save liked songs:', e);
            AudioXUtils.showToast('Failed to save liked songs', 'error');
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('audioX_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
            AudioXUtils.showToast('Failed to save settings', 'error');
        }
    }

    // Modal HTML Templates
    getModalsHTML() {
        return `
            <!-- Add Music Modal -->
            <div class="modal" id="addMusicModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Music</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form class="modal-form" id="addMusicForm">
                        <div class="form-group">
                            <label for="musicTitle">Title</label>
                            <input type="text" id="musicTitle" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="musicDescription">Description</label>
                            <textarea id="musicDescription" name="description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="musicCategory">Category</label>
                            <select id="musicCategory" name="category" required>
                                <option value="">Select a category</option>
                                ${AudioXUtils.getCategories().map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="coverImage">Cover Image</label>
                            <input type="file" id="coverImage" name="coverImage" accept="image/*">
                            <small>Maximum file size: 200MB</small>
                        </div>
                        <div class="form-group">
                            <label for="audioFile">Audio File</label>
                            <input type="file" id="audioFile" name="audioFile" accept="audio/*" required>
                            <small>Maximum file size: 200MB</small>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Music Modal -->
            <div class="modal" id="editMusicModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Music</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form class="modal-form" id="editMusicForm">
                        <div class="form-group">
                            <label for="editMusicTitle">Title</label>
                            <input type="text" id="editMusicTitle" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="editMusicDescription">Description</label>
                            <textarea id="editMusicDescription" name="description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="editMusicCategory">Category</label>
                            <select id="editMusicCategory" name="category" required>
                                <option value="">Select a category</option>
                                ${AudioXUtils.getCategories().map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editCoverImage">Cover Image</label>
                            <input type="file" id="editCoverImage" name="coverImage" accept="image/*">
                            <small>Leave empty to keep current image. Maximum file size: 200MB</small>
                        </div>
                        <div class="form-group">
                            <label for="editAudioFile">Audio File</label>
                            <input type="file" id="editAudioFile" name="audioFile" accept="audio/*">
                            <small>Leave empty to keep current audio. Maximum file size: 200MB</small>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn-primary">Update</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Logout Confirmation Modal -->
            <div class="modal" id="logoutModal">
                <div class="modal-content small">
                    <div class="modal-header">
                        <h2>Confirm Logout</h2>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to log out from Audio X?</p>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" id="cancelLogout">Cancel</button>
                        <button type="button" class="btn-danger" id="confirmLogout">Log Out</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the application
window.AudioXApp = AudioXApp;
window.app = new AudioXApp(); 