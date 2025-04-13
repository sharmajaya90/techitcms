/**
 * Settings page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    const settingsTabs = document.querySelectorAll('[data-settings-tab]');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    
    // Theme settings
    const themeSelect = document.getElementById('themeSelect');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // Library settings
    const showCategoriesInLibrary = document.getElementById('showCategoriesInLibrary');
    const groupByCategory = document.getElementById('groupByCategory');
    const showRecentlyPlayed = document.getElementById('showRecentlyPlayed');
    
    // Playback settings
    const autoplayToggle = document.getElementById('autoplayToggle');
    const audioQualitySelect = document.getElementById('audioQualitySelect');
    
    // Account settings
    const clearDataBtn = document.getElementById('clearDataBtn');
    
    // Setup tab navigation
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            settingsTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all panels
            settingsPanels.forEach(panel => {
                panel.style.display = 'none';
            });
            
            // Show the selected panel
            const panelId = `${tab.dataset.settingsTab}-panel`;
            document.getElementById(panelId).style.display = 'block';
        });
    });
    
    // Setup theme select
    if (themeSelect) {
        themeSelect.addEventListener('change', updateSettings);
    }
    
    // Setup color options
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            colorOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Update settings
            updateSettings();
        });
    });
    
    // Setup library toggles
    if (showCategoriesInLibrary) {
        showCategoriesInLibrary.addEventListener('change', updateSettings);
    }
    
    if (groupByCategory) {
        groupByCategory.addEventListener('change', updateSettings);
    }
    
    if (showRecentlyPlayed) {
        showRecentlyPlayed.addEventListener('change', updateSettings);
    }
    
    // Setup playback toggles
    if (autoplayToggle) {
        autoplayToggle.addEventListener('change', updateSettings);
    }
    
    if (audioQualitySelect) {
        audioQualitySelect.addEventListener('change', updateSettings);
    }
    
    // Setup clear data button
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
    
    // Function to update settings
    async function updateSettings() {
        try {
            // Get current selected theme
            const theme = themeSelect ? themeSelect.value : null;
            
            // Get current selected accent color
            const activeColorOption = document.querySelector('.color-option.active');
            const accentColor = activeColorOption ? activeColorOption.dataset.color : null;
            
            // Get library settings
            const showCategoriesInLibraryValue = showCategoriesInLibrary ? showCategoriesInLibrary.checked : null;
            const groupByCategoryValue = groupByCategory ? groupByCategory.checked : null;
            const showRecentlyPlayedValue = showRecentlyPlayed ? showRecentlyPlayed.checked : null;
            
            // Get playback settings
            const autoplayValue = autoplayToggle ? autoplayToggle.checked : null;
            const audioQualityValue = audioQualitySelect ? audioQualitySelect.value : null;
            
            // Prepare settings object
            const settings = {
                theme,
                accentColor,
                showCategoriesInLibrary: showCategoriesInLibraryValue,
                groupByCategory: groupByCategoryValue,
                showRecentlyPlayed: showRecentlyPlayedValue,
                autoplay: autoplayValue,
                audioQuality: audioQualityValue
            };
            
            // Clean up undefined values
            Object.keys(settings).forEach(key => {
                if (settings[key] === null || settings[key] === undefined) {
                    delete settings[key];
                }
            });
            
            // Update settings
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update settings');
            }
            
            showMessage('Settings updated successfully');
            
            // Apply theme immediately
            applyTheme(theme, accentColor);
        } catch (error) {
            console.error('Error updating settings:', error);
            showMessage('Failed to update settings. Please try again.', true);
        }
    }
    
    // Function to clear all data
    async function clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/settings/clear-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmed: true })
            });
            
            if (!response.ok) {
                throw new Error('Failed to clear data');
            }
            
            showMessage('All data cleared successfully');
            
            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error clearing data:', error);
            showMessage('Failed to clear data. Please try again.', true);
        }
    }
    
    // Function to apply theme
    function applyTheme(theme, accentColor) {
        // Apply theme class to body
        document.body.classList.remove('theme-dark', 'theme-light');
        
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else if (theme === 'light') {
            document.body.classList.add('theme-light');
        } else if (theme === 'system') {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.add('theme-light');
            }
        }
        
        // Apply accent color
        if (accentColor) {
            document.documentElement.style.setProperty('--accent-color', accentColor);
        }
    }
}); 