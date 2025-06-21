/* ===============================
   SETTINGS SCREEN MANAGER
   Handles application settings and preferences
   =============================== */

class SettingsScreen {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('settings-screen');
        this.currentTab = 'appearance';
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    load() {
        this.loadCurrentSettings();
        this.updateStorageInfo();
    }

    render() {
        this.container.innerHTML = `
            <div class="screen-header">
                <h1>Settings</h1>
            </div>

            <div class="settings-container">
                <div class="settings-nav">
                    <button class="settings-tab active" data-tab="appearance">
                        <i class="fas fa-paint-brush"></i>
                        <span>Appearance</span>
                    </button>
                    <button class="settings-tab" data-tab="library">
                        <i class="fas fa-book"></i>
                        <span>Library</span>
                    </button>
                    <button class="settings-tab" data-tab="playback">
                        <i class="fas fa-play"></i>
                        <span>Playback</span>
                    </button>
                    <button class="settings-tab" data-tab="account">
                        <i class="fas fa-user"></i>
                        <span>Account</span>
                    </button>
                </div>

                <div class="settings-content">
                    ${this.renderAllPanels()}
                </div>
            </div>
        `;
    }

    renderAllPanels() {
        return `
            <!-- Appearance Panel -->
            <div class="settings-panel active" id="appearance-panel">
                <h3>Appearance Settings</h3>
                
                <div class="setting-group">
                    <label>Theme</label>
                    <div class="setting-description">Choose your preferred color theme</div>
                    <div class="theme-options">
                        <div class="radio-option">
                            <input type="radio" id="theme-dark" name="theme" value="dark">
                            <span>Dark</span>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="theme-light" name="theme" value="light">
                            <span>Light</span>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="theme-system" name="theme" value="system">
                            <span>System</span>
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <label>Accent Color</label>
                    <div class="setting-description">Customize the primary accent color</div>
                    <div class="color-picker-group">
                        <input type="color" id="accentColor" value="#1db954">
                        <div class="color-preview" id="colorPreview"></div>
                    </div>
                </div>
            </div>

            <!-- Library Panel -->
            <div class="settings-panel" id="library-panel">
                <h3>Library Settings</h3>
                
                <div class="setting-group">
                    <label>Display Options</label>
                    <div class="setting-description">Customize how your library is displayed</div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="showCategories">
                        <span>Show category badges</span>
                    </div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="groupSongs">
                        <span>Group songs by category</span>
                    </div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="showRecentlyPlayed">
                        <span>Show recently played section</span>
                    </div>
                </div>

                <div class="setting-group">
                    <label>Quick Actions</label>
                    <div class="quick-actions">
                        <button class="quick-action-btn" id="exportLibraryBtn">
                            <i class="fas fa-download"></i>
                            Export Library
                        </button>
                        <button class="quick-action-btn" id="importLibraryBtn">
                            <i class="fas fa-upload"></i>
                            Import Library
                        </button>
                        <button class="quick-action-btn btn-danger" id="clearLibraryBtn">
                            <i class="fas fa-trash"></i>
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>

            <!-- Playback Panel -->
            <div class="settings-panel" id="playback-panel">
                <h3>Playback Settings</h3>
                
                <div class="setting-group">
                    <label>Audio Quality</label>
                    <div class="setting-description">Choose your preferred audio quality</div>
                    <select id="audioQuality">
                        <option value="auto">Automatic</option>
                        <option value="high">High Quality</option>
                        <option value="normal">Normal Quality</option>
                        <option value="low">Data Saver</option>
                    </select>
                </div>

                <div class="setting-group">
                    <label>Playback Options</label>
                    <div class="setting-description">Configure how music plays</div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="autoplay">
                        <span>Autoplay similar songs</span>
                    </div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="crossfade">
                        <span>Crossfade between songs</span>
                    </div>
                </div>
            </div>

            <!-- Account Panel -->
            <div class="settings-panel" id="account-panel">
                <h3>Account Settings</h3>
                
                <div class="setting-group">
                    <label>Account Type</label>
                    <div class="setting-description">Your current subscription status</div>
                    <span class="account-type">Pro Account</span>
                </div>

                <div class="setting-group">
                    <label>Storage Usage</label>
                    <div class="setting-description">Local storage usage for your data</div>
                    <div class="storage-info">
                        <div class="storage-bar">
                            <div class="storage-used" id="storageUsed" style="width: 0%"></div>
                        </div>
                        <p id="storageText">0% of storage used</p>
                    </div>
                </div>

                <div class="setting-group">
                    <label>Data Management</label>
                    <div class="setting-description">Manage your app data and preferences</div>
                    <div class="quick-actions">
                        <button class="btn-danger" id="clearDataBtn">
                            <i class="fas fa-exclamation-triangle"></i>
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tab navigation
        this.container.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.settings-tab').dataset.tab);
            });
        });

        // Theme settings
        this.container.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.app.updateSetting('theme', e.target.value);
            });
        });

        // Accent color
        const accentColorInput = this.container.querySelector('#accentColor');
        accentColorInput.addEventListener('change', (e) => {
            this.app.updateSetting('accentColor', e.target.value);
            this.updateColorPreview(e.target.value);
        });

        // Library settings
        this.setupLibrarySettings();

        // Playback settings
        this.setupPlaybackSettings();

        // Account actions
        this.setupAccountActions();
    }

    setupLibrarySettings() {
        const settings = ['showCategories', 'groupSongs', 'showRecentlyPlayed'];
        
        settings.forEach(setting => {
            const checkbox = this.container.querySelector(`#${setting}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.app.updateSetting(setting, e.target.checked);
                });
            }
        });

        // Quick actions
        const exportBtn = this.container.querySelector('#exportLibraryBtn');
        const importBtn = this.container.querySelector('#importLibraryBtn');
        const clearLibraryBtn = this.container.querySelector('#clearLibraryBtn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportLibrary());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importLibrary());
        }

        if (clearLibraryBtn) {
            clearLibraryBtn.addEventListener('click', () => this.app.clearAllData());
        }
    }

    setupPlaybackSettings() {
        const audioQuality = this.container.querySelector('#audioQuality');
        if (audioQuality) {
            audioQuality.addEventListener('change', (e) => {
                this.app.updateSetting('audioQuality', e.target.value);
            });
        }

        const playbackSettings = ['autoplay', 'crossfade'];
        playbackSettings.forEach(setting => {
            const checkbox = this.container.querySelector(`#${setting}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.app.updateSetting(setting, e.target.checked);
                });
            }
        });
    }

    setupAccountActions() {
        const clearDataBtn = this.container.querySelector('#clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        this.container.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.container.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        this.container.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        this.container.querySelector(`#${tabName}-panel`).classList.add('active');
    }

    loadCurrentSettings() {
        const settings = this.app.settings;

        // Theme settings
        const themeRadio = this.container.querySelector(`input[name="theme"][value="${settings.theme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }

        // Accent color
        const accentColorInput = this.container.querySelector('#accentColor');
        if (accentColorInput) {
            accentColorInput.value = settings.accentColor;
            this.updateColorPreview(settings.accentColor);
        }

        // Library settings
        const librarySettings = ['showCategories', 'groupSongs', 'showRecentlyPlayed'];
        librarySettings.forEach(setting => {
            const checkbox = this.container.querySelector(`#${setting}`);
            if (checkbox && settings[setting] !== undefined) {
                checkbox.checked = settings[setting];
            }
        });

        // Playback settings
        const audioQuality = this.container.querySelector('#audioQuality');
        if (audioQuality && settings.audioQuality) {
            audioQuality.value = settings.audioQuality;
        }

        const playbackSettings = ['autoplay', 'crossfade'];
        playbackSettings.forEach(setting => {
            const checkbox = this.container.querySelector(`#${setting}`);
            if (checkbox && settings[setting] !== undefined) {
                checkbox.checked = settings[setting];
            }
        });
    }

    updateColorPreview(color) {
        const preview = this.container.querySelector('#colorPreview');
        if (preview) {
            preview.style.background = color;
        }
    }

    updateStorageInfo() {
        const storageUsed = this.container.querySelector('#storageUsed');
        const storageText = this.container.querySelector('#storageText');
        
        if (storageUsed && storageText) {
            const usage = AudioXUtils.getStorageUsage();
            storageUsed.style.width = `${usage}%`;
            storageText.textContent = `${usage.toFixed(1)}% of storage used`;
        }
    }

    exportLibrary() {
        if (this.app.musicLibrary.length === 0) {
            AudioXUtils.showToast('No music library to export', 'warning');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            musicLibrary: this.app.musicLibrary,
            likedSongs: this.app.likedSongs,
            settings: this.app.settings
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audio-x-library-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        AudioXUtils.showToast('Library exported successfully!', 'success');
    }

    importLibrary() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.musicLibrary && Array.isArray(data.musicLibrary)) {
                        if (confirm('This will replace your current library. Continue?')) {
                            this.app.musicLibrary = data.musicLibrary;
                            this.app.likedSongs = data.likedSongs || [];
                            
                            if (data.settings) {
                                this.app.settings = { ...this.app.settings, ...data.settings };
                            }
                            
                            this.app.saveMusicLibrary();
                            this.app.saveLikedSongs();
                            this.app.saveSettings();
                            this.app.applySettings();
                            this.app.updateAllScreens();
                            
                            AudioXUtils.showToast('Library imported successfully!', 'success');
                            this.loadCurrentSettings();
                        }
                    } else {
                        AudioXUtils.showToast('Invalid library file format', 'error');
                    }
                } catch (error) {
                    AudioXUtils.showToast('Failed to import library file', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            AudioXUtils.showToast('All data cleared successfully!', 'success');
            
            // Reload the page to reset everything
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    // Reset settings to defaults
    resetToDefaults() {
        if (confirm('Reset all settings to default values?')) {
            this.app.settings = {
                theme: 'dark',
                accentColor: '#1db954',
                showCategories: true,
                groupSongs: true,
                showRecentlyPlayed: true,
                autoplay: true,
                audioQuality: 'auto'
            };
            
            this.app.saveSettings();
            this.app.applySettings();
            this.loadCurrentSettings();
            
            AudioXUtils.showToast('Settings reset to defaults', 'success');
        }
    }

    update() {
        this.updateStorageInfo();
    }

    // Get settings statistics
    getStats() {
        return {
            currentTheme: this.app.settings.theme,
            accentColor: this.app.settings.accentColor,
            librarySize: this.app.musicLibrary.length,
            likedSongs: this.app.likedSongs.length,
            storageUsage: AudioXUtils.getStorageUsage(),
            settingsCount: Object.keys(this.app.settings).length
        };
    }
}

// Export for use in main app
window.SettingsScreen = SettingsScreen; 