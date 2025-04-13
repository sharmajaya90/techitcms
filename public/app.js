document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    setupEventListeners();
    handleCategories();
    loadMusic();
});

// Set up event listeners
function setupEventListeners() {
    // New playlist button (opens the Add Music modal)
    document.getElementById('addNewMusic').addEventListener('click', (e) => {
        e.preventDefault();
        const addMusicModal = new bootstrap.Modal(document.getElementById('addMusicModal'));
        addMusicModal.show();
    });

    // Category click handlers
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.id.split('-')[1]; // Extract category ID (e.g., "workout" from "category-workout")
            showMusicByCategory(categoryId);
        });
    });

    // Back to categories button
    document.getElementById('backToCategories').addEventListener('click', () => {
        document.querySelector('.categories-section').style.display = 'block';
        document.querySelector('.music-library-section').style.display = 'none';
    });

    // Play button in the banner
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', () => {
            showAllMusic();
        });
    }

    // Add Music Form
    document.getElementById('addMusicForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addMusic();
    });

    // Edit Music Form
    document.getElementById('editMusicForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateMusic();
    });

    // File input change listeners to validate size
    document.querySelector('#addMusicForm [name="image"]').addEventListener('change', validateFileSize);
    document.querySelector('#addMusicForm [name="audio"]').addEventListener('change', validateFileSize);
    document.querySelector('#editMusicForm [name="image"]').addEventListener('change', validateFileSize);
    document.querySelector('#editMusicForm [name="audio"]').addEventListener('change', validateFileSize);
}

// Handle category interactions and initialize with sample data if needed
function handleCategories() {
    // Populate each category with sample data if no items in the database
    fetchMusicForCategory('workout', 'Work Out');
    fetchMusicForCategory('techno', 'Techno 90s');
    fetchMusicForCategory('quiet', 'Quiet Hours');
    fetchMusicForCategory('rap', 'Rap');
    fetchMusicForCategory('focus', 'Deep Focus');
    fetchMusicForCategory('beach', 'Beach Vibes');
    fetchMusicForCategory('pop', 'Pop Hits');
    fetchMusicForCategory('movie', 'Movie Classics');
    fetchMusicForCategory('folk', 'Folk Music');
    fetchMusicForCategory('travel', 'Travelling');
    fetchMusicForCategory('kids', 'For Kids');
    fetchMusicForCategory('80s', '80s Hits');
}

// Function to validate file size
function validateFileSize(e) {
    const file = e.target.files[0];
    if (file && file.size > 200 * 1024 * 1024) { // 200MB in bytes
        showMessage(`File ${file.name} is too large. Maximum file size is 200MB.`, true);
        e.target.value = ''; // Clear the file input
    }
}

// Show message helper
function showMessage(message, isError = false) {
    const statusMsg = document.getElementById('statusMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    if (isError) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        statusMsg.style.display = 'none';
        
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    } else {
        statusMsg.textContent = message;
        statusMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        
        setTimeout(() => {
            statusMsg.style.display = 'none';
        }, 5000);
    }
}

// Load all music
async function loadMusic() {
    try {
        const response = await fetch('/api/music');
        const music = await response.json();
        
        // Store music data globally for category filtering
        window.allMusicData = music;
        
        // Generate sample data if no music entries exist
        if (music.length === 0) {
            createSampleMusicData();
        }
    } catch (error) {
        console.error('Error loading music:', error);
        showMessage('Failed to load music data. Please refresh the page.', true);
    }
}

// Show music by category
function showMusicByCategory(categoryId) {
    const musicLibrarySection = document.querySelector('.music-library-section');
    const categoriesSection = document.querySelector('.categories-section');
    
    // Hide categories, show music library
    categoriesSection.style.display = 'none';
    musicLibrarySection.style.display = 'block';
    
    // Update title based on category
    const categoryTitle = document.querySelector('.music-library-section h2');
    const categoryDisplayNames = {
        'workout': 'Work Out',
        'techno': 'Techno 90s',
        'quiet': 'Quiet Hours',
        'rap': 'Rap',
        'focus': 'Deep Focus',
        'beach': 'Beach Vibes',
        'pop': 'Pop Hits',
        'movie': 'Movie Classics',
        'folk': 'Folk Music',
        'travel': 'Travelling',
        'kids': 'For Kids',
        '80s': '80s Hits'
    };
    
    categoryTitle.textContent = categoryDisplayNames[categoryId] || 'Your Music';
    
    // Display music for this category
    if (window.allMusicData && window.allMusicData.length > 0) {
        // Filter by category if data is available
        const filteredMusic = window.allMusicData.filter(item => 
            item.category === categoryId || !item.category // Include items without category during transition
        );
        displayMusic(filteredMusic);
    } else {
        // Fallback to sample data if no data available
        fetchMusicForCategory(categoryId, categoryDisplayNames[categoryId]);
    }
}

// Show all music
function showAllMusic() {
    const musicLibrarySection = document.querySelector('.music-library-section');
    const categoriesSection = document.querySelector('.categories-section');
    
    // Hide categories, show music library
    categoriesSection.style.display = 'none';
    musicLibrarySection.style.display = 'block';
    
    // Update title
    const categoryTitle = document.querySelector('.music-library-section h2');
    categoryTitle.textContent = 'All Music';
    
    // Display all music
    if (window.allMusicData) {
        displayMusic(window.allMusicData);
    } else {
        // Fallback to sample data
        fetchAllSampleMusic();
    }
}

// Fetch music for a specific category (with fallback to sample data)
async function fetchMusicForCategory(categoryId, categoryName) {
    try {
        // Try to fetch from API first
        const response = await fetch(`/api/music?category=${categoryId}`);
        const music = await response.json();
        
        // If no data, generate sample data
        if (music.length === 0) {
            // Create sample data for this category
            return getSampleMusicForCategory(categoryId, categoryName);
        }
        
        return music;
    } catch (error) {
        console.error(`Error fetching ${categoryName} music:`, error);
        // Fallback to sample data
        return getSampleMusicForCategory(categoryId, categoryName);
    }
}

// Display music in the UI
function displayMusic(music) {
    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';

    if (!music || music.length === 0) {
        musicList.innerHTML = '<div class="col-12 text-center"><h3>No music entries found. Add some music!</h3></div>';
        return;
    }

    music.forEach(item => {
        // Fix URLs for server-uploaded files
        const imageUrl = item.imageUrl.startsWith('http') 
            ? item.imageUrl 
            : item.imageUrl.startsWith('/uploads') 
                ? item.imageUrl 
                : `/${item.imageUrl}`;
                
        const audioUrl = item.audioUrl.startsWith('http') 
            ? item.audioUrl 
            : item.audioUrl.startsWith('/uploads') 
                ? item.audioUrl 
                : `/${item.audioUrl}`;

        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6';
        col.innerHTML = `
            <div class="card music-card">
                <img src="${imageUrl}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                    <audio controls class="audio-player">
                        <source src="${audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="btn-group">
                        <button class="btn btn-primary btn-sm" onclick="editMusic('${item._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteMusic('${item._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        musicList.appendChild(col);
    });
}

// Get sample music for a specific category
function getSampleMusicForCategory(categoryId, categoryName) {
    const sampleMusic = [];
    
    // Generate 5 sample items for each category
    for (let i = 1; i <= 5; i++) {
        sampleMusic.push({
            _id: `sample-${categoryId}-${i}`,
            title: `${categoryName} Track ${i}`,
            description: `This is a sample ${categoryName.toLowerCase()} track for demonstration purposes.`,
            category: categoryId,
            categoryName: categoryName,
            // Use HTTPS URLs for sample data to avoid mixed content issues
            imageUrl: `https://source.unsplash.com/random/300x300/?${categoryId.toLowerCase()}&sig=${i}`,
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        });
    }
    
    return sampleMusic;
}

// Fetch all sample music (used when showing "All Music" view)
function fetchAllSampleMusic() {
    const categories = ['workout', 'techno', 'quiet', 'rap', 'focus', 'beach', 'pop', 'movie', 'folk', 'travel', 'kids', '80s'];
    const categoryNames = {
        'workout': 'Work Out',
        'techno': 'Techno 90s',
        'quiet': 'Quiet Hours',
        'rap': 'Rap',
        'focus': 'Deep Focus',
        'beach': 'Beach Vibes',
        'pop': 'Pop Hits',
        'movie': 'Movie Classics',
        'folk': 'Folk Music',
        'travel': 'Travelling',
        'kids': 'For Kids',
        '80s': '80s Hits'
    };
    
    let allMusic = [];
    
    categories.forEach(categoryId => {
        // Get 1 sample track from each category
        const categoryMusic = getSampleMusicForCategory(categoryId, categoryNames[categoryId]);
        allMusic.push(categoryMusic[0]);
    });
    
    displayMusic(allMusic);
    return allMusic;
}

// Create sample music data if database is empty
function createSampleMusicData() {
    fetchAllSampleMusic();
    showMessage('Sample music data has been loaded for demonstration purposes.');
}

async function addMusic() {
    const form = document.getElementById('addMusicForm');
    const formData = new FormData(form);
    const progressBar = document.querySelector('#uploadProgress');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    
    // Show progress bar
    progressBar.classList.remove('d-none');
    progressBarInner.style.width = '0%';
    progressBarInner.textContent = '0%';
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        // Use XMLHttpRequest for progress monitoring
        const xhr = new XMLHttpRequest();
        
        // Create a promise to handle the response
        const uploadPromise = new Promise((resolve, reject) => {
            xhr.open('POST', '/api/music', true);
            
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressBarInner.style.width = percentComplete + '%';
                    progressBarInner.textContent = percentComplete + '%';
                }
            };
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    try {
                        reject(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject({ message: 'Upload failed with status ' + xhr.status });
                    }
                }
            };
            
            xhr.onerror = function() {
                reject({ message: 'Network error occurred during upload' });
            };
            
            xhr.send(formData);
        });
        
        // Wait for upload to complete
        const result = await uploadPromise;
        
        // Hide progress bar and reset its state
        progressBar.classList.add('d-none');
        progressBarInner.style.width = '0%';
        progressBarInner.textContent = '';
        
        // Reset form and close modal
        form.reset();
        
        // Try both methods for closing the modal
        try {
            // Bootstrap 5 method
            const modalElement = document.getElementById('addMusicModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // jQuery fallback
                $('#addMusicModal').modal('hide');
            }
        } catch (err) {
            // jQuery fallback if Bootstrap 5 method fails
            $('#addMusicModal').modal('hide');
        }
        
        showMessage('Music added successfully!');
        
        // Reload music data
        loadMusic();
        
        // Show the music in the appropriate category
        const category = formData.get('category');
        if (category) {
            showMusicByCategory(category);
        } else {
            showAllMusic();
        }
    } catch (error) {
        console.error('Error adding music:', error);
        
        // Hide progress bar
        progressBar.classList.add('d-none');
        
        showMessage(error.message || 'Failed to add music. Please try again.', true);
    } finally {
        submitButton.disabled = false;
    }
}

async function editMusic(id) {
    try {
        const response = await fetch(`/api/music/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch music data');
        }
        
        const music = await response.json();

        const form = document.getElementById('editMusicForm');
        form.querySelector('[name="id"]').value = music._id;
        form.querySelector('[name="title"]').value = music.title;
        form.querySelector('[name="description"]').value = music.description;
        
        // Set category if available
        if (music.category && form.querySelector('[name="category"]')) {
            form.querySelector('[name="category"]').value = music.category;
        }

        // Try both methods for showing the modal
        try {
            // Bootstrap 5 method
            const modalElement = document.getElementById('editMusicModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } catch (err) {
            // jQuery fallback
            $('#editMusicModal').modal('show');
        }
    } catch (error) {
        console.error('Error loading music for edit:', error);
        showMessage('Error loading music data for editing', true);
    }
}

async function updateMusic() {
    const form = document.getElementById('editMusicForm');
    const id = form.querySelector('[name="id"]').value;
    const formData = new FormData(form);
    const progressBar = document.querySelector('#editUploadProgress');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    
    // Show progress bar
    progressBar.classList.remove('d-none');
    progressBarInner.style.width = '0%';
    progressBarInner.textContent = '0%';
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        // Use XMLHttpRequest for progress monitoring
        const xhr = new XMLHttpRequest();
        
        // Create a promise to handle the response
        const uploadPromise = new Promise((resolve, reject) => {
            xhr.open('PUT', `/api/music/${id}`, true);
            
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressBarInner.style.width = percentComplete + '%';
                    progressBarInner.textContent = percentComplete + '%';
                }
            };
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    try {
                        reject(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject({ message: 'Update failed with status ' + xhr.status });
                    }
                }
            };
            
            xhr.onerror = function() {
                reject({ message: 'Network error occurred during update' });
            };
            
            xhr.send(formData);
        });
        
        // Wait for upload to complete
        const result = await uploadPromise;
        
        // Hide progress bar and reset its state
        progressBar.classList.add('d-none');
        progressBarInner.style.width = '0%';
        progressBarInner.textContent = '';
        
        // Reset form and close modal
        form.reset();
        
        // Try both methods for closing the modal
        try {
            // Bootstrap 5 method
            const modalElement = document.getElementById('editMusicModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // jQuery fallback
                $('#editMusicModal').modal('hide');
            }
        } catch (err) {
            // jQuery fallback
            $('#editMusicModal').modal('hide');
        }
        
        showMessage('Music updated successfully!');
        
        // Reload music data
        loadMusic();
        
        // Check which view we're in and refresh it
        const category = formData.get('category');
        if (category) {
            showMusicByCategory(category);
        } else {
            showAllMusic();
        }
    } catch (error) {
        console.error('Error updating music:', error);
        
        // Hide progress bar
        progressBar.classList.add('d-none');
        
        showMessage(error.message || 'Failed to update music. Please try again.', true);
    } finally {
        submitButton.disabled = false;
    }
}

async function deleteMusic(id) {
    if (!confirm('Are you sure you want to delete this music?')) return;

    try {
        const response = await fetch(`/api/music/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Music deleted successfully!');
            
            // Reload music data and refresh the current view
            await loadMusic();
            
            // Determine which view we're in and refresh it
            const categoryTitle = document.querySelector('.music-library-section h2').textContent;
            if (categoryTitle === 'All Music') {
                showAllMusic();
            } else {
                // Find the category ID from the title
                const categoryEntry = Object.entries({
                    'workout': 'Work Out',
                    'techno': 'Techno 90s',
                    'quiet': 'Quiet Hours',
                    'rap': 'Rap',
                    'focus': 'Deep Focus',
                    'beach': 'Beach Vibes',
                    'pop': 'Pop Hits',
                    'movie': 'Movie Classics',
                    'folk': 'Folk Music',
                    'travel': 'Travelling',
                    'kids': 'For Kids',
                    '80s': '80s Hits'
                }).find(([_, name]) => name === categoryTitle);
                
                if (categoryEntry) {
                    showMusicByCategory(categoryEntry[0]);
                } else {
                    showAllMusic();
                }
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete music');
        }
    } catch (error) {
        console.error('Error deleting music:', error);
        showMessage('Failed to delete music. Please try again.', true);
    }
} 