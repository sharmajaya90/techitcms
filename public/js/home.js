/**
 * Home page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Set up category click handlers
    setupCategoryClickHandlers();
    
    // Add music button click handler
    setupAddMusicHandler();
    
    // Setup the back button handler
    setupBackButton();
    
    // Check URL parameters for showAddModal
    checkUrlParams();
});

// Check URL parameters
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const showAddModal = urlParams.get('showAddModal');
    
    if (showAddModal === 'true') {
        // Show the add music modal
        showAddMusicModal();
        
        // Clean the URL parameter without refreshing the page
        const newUrl = window.location.pathname;
        window.history.pushState({}, document.title, newUrl);
    }
}

// Setup category click handlers
function setupCategoryClickHandlers() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', async () => {
            const categoryId = card.id.replace('category-', '');
            await showMusicByCategory(categoryId);
        });
    });
}

// Display music for a specific category
async function showMusicByCategory(categoryId) {
    try {
        // Show loading state
        document.querySelector('.categories-section').style.display = 'none';
        document.querySelector('.music-library-section').style.display = 'block';
        document.getElementById('musicList').innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading music entries...</p>
            </div>
        `;
        
        // Fetch music for this category
        const response = await fetch(`/api/music/category/${categoryId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch music data');
        }
        
        const data = await response.json();
        
        // Update category title
        document.querySelector('.music-library-section h2').textContent = data.category.name;
        
        // Display music items
        displayMusic(data.music);
    } catch (error) {
        console.error('Error displaying music by category:', error);
        showMessage('Error loading music data', true);
    }
}

// Display music items in the UI
function displayMusic(musicItems) {
    const musicListEl = document.getElementById('musicList');
    
    if (!musicItems || musicItems.length === 0) {
        musicListEl.innerHTML = `
            <div class="col-12 text-center">
                <h3>No music found</h3>
                <p>Add some music to get started</p>
                <button class="btn btn-primary" id="addMusicBtn">
                    <i class="fas fa-plus"></i> Add Music
                </button>
            </div>
        `;
        
        // Add click handler for the add music button
        const addMusicBtn = document.getElementById('addMusicBtn');
        if (addMusicBtn) {
            addMusicBtn.addEventListener('click', () => {
                showAddMusicModal();
            });
        }
        
        return;
    }
    
    // Clear previous content
    musicListEl.innerHTML = '';
    
    // Create cards for each music item
    musicItems.forEach(music => {
        // Fix URLs for server-uploaded files
        const imageUrl = music.imageUrl.startsWith('http') 
            ? music.imageUrl 
            : music.imageUrl.startsWith('/uploads') 
                ? music.imageUrl 
                : `/${music.imageUrl}`;
                
        const audioUrl = music.audioUrl.startsWith('http') 
            ? music.audioUrl 
            : music.audioUrl.startsWith('/uploads') 
                ? music.audioUrl 
                : `/${music.audioUrl}`;
                
        const musicCard = document.createElement('div');
        musicCard.className = 'col-md-4 col-lg-3 mb-4';
        musicCard.innerHTML = `
            <div class="music-card card">
                <img src="${imageUrl}" class="card-img-top" alt="${music.title}">
                <div class="card-body">
                    <h5 class="card-title">${music.title}</h5>
                    <p class="card-text">${music.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-sm btn-primary play-btn" data-audio="${audioUrl}">
                            <i class="fas fa-play me-1"></i> Play
                        </button>
                        <div>
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${music._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${music._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="badge bg-info">${music.categoryName || ''}</span>
                    </div>
                    <audio class="audio-player mt-2" controls style="display: none;">
                        <source src="${audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        `;
        
        musicListEl.appendChild(musicCard);
    });
    
    // Add event handlers for buttons
    setupMusicCardHandlers();
}

// Setup event handlers for music card buttons
function setupMusicCardHandlers() {
    // Play button click handlers
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const audioPlayer = btn.closest('.card-body').querySelector('.audio-player');
            const audioUrl = btn.getAttribute('data-audio');
            
            // Set the correct source if not already set
            const audioSource = audioPlayer.querySelector('source');
            if (audioSource.src !== audioUrl && audioUrl) {
                audioSource.src = audioUrl;
                audioPlayer.load();
            }
            
            // Toggle player visibility
            if (audioPlayer.style.display === 'none') {
                audioPlayer.style.display = 'block';
                audioPlayer.play();
                btn.innerHTML = '<i class="fas fa-pause me-1"></i> Pause';
            } else {
                if (audioPlayer.paused) {
                    audioPlayer.play();
                    btn.innerHTML = '<i class="fas fa-pause me-1"></i> Pause';
                } else {
                    audioPlayer.pause();
                    btn.innerHTML = '<i class="fas fa-play me-1"></i> Play';
                }
            }
        });
    });
    
    // Edit button click handlers
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const musicId = btn.getAttribute('data-id');
            editMusic(musicId);
        });
    });
    
    // Delete button click handlers
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const musicId = btn.getAttribute('data-id');
            deleteMusic(musicId);
        });
    });
    
    // Like button click handlers
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const musicId = btn.getAttribute('data-id');
            
            try {
                const response = await fetch(`/api/music/${musicId}/like`, {
                    method: 'PUT'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to toggle like status');
                }
                
                const data = await response.json();
                
                // Toggle active class based on like status
                if (data.isLiked) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
                
            } catch (error) {
                console.error('Error toggling like:', error);
                showMessage('Failed to update like status', true);
            }
        });
    });
}

// Setup the back button handler
function setupBackButton() {
    const backButton = document.getElementById('backToCategories');
    
    if (backButton) {
        backButton.addEventListener('click', () => {
            document.querySelector('.categories-section').style.display = 'block';
            document.querySelector('.music-library-section').style.display = 'none';
        });
    }
}

// Setup the add music button handler
function setupAddMusicHandler() {
    const addMusicBtn = document.getElementById('addNewMusic');
    
    if (addMusicBtn) {
        addMusicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAddMusicModal();
        });
    }
    
    // Add music form submission
    const addMusicForm = document.getElementById('addMusicForm');
    if (addMusicForm) {
        addMusicForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addMusic(e.target);
        });
    }
    
    // Edit music form submission
    const editMusicForm = document.getElementById('editMusicForm');
    if (editMusicForm) {
        editMusicForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateMusic();
        });
    }
}

// Show the add music modal
function showAddMusicModal() {
    try {
        // Reset form
        const form = document.getElementById('addMusicForm');
        if (form) form.reset();
        
        // Show modal
        const modalElement = document.getElementById('addMusicModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (err) {
        // jQuery fallback
        $('#addMusicModal').modal('show');
    }
}

// Add new music
async function addMusic(form) {
    const formData = new FormData(form);
    const progressBar = document.querySelector('#uploadProgress');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    
    // Validate file sizes
    try {
        const imageFile = form.querySelector('[name="image"]').files[0];
        const audioFile = form.querySelector('[name="audio"]').files[0];
        
        validateFileSize(imageFile);
        validateFileSize(audioFile);
    } catch (error) {
        showMessage(error.message, true);
        return;
    }
    
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
        
        // Close modal
        try {
            // Bootstrap 5 method
            const modalElement = document.getElementById('addMusicModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        } catch (err) {
            // jQuery fallback
            $('#addMusicModal').modal('hide');
        }
        
        showMessage('Music added successfully!');
        
        // Check which view we're in and refresh it
        const category = formData.get('category');
        if (category) {
            showMusicByCategory(category);
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

// Edit music
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

        // Show modal
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

// Update music
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
        
        // Close modal
        try {
            // Bootstrap 5 method
            const modalElement = document.getElementById('editMusicModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        } catch (err) {
            // jQuery fallback
            $('#editMusicModal').modal('hide');
        }
        
        showMessage('Music updated successfully!');
        
        // Reload the current category view
        const category = formData.get('category');
        if (category) {
            showMusicByCategory(category);
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

// Delete music
async function deleteMusic(id) {
    if (!confirm('Are you sure you want to delete this music?')) return;

    try {
        const response = await fetch(`/api/music/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Music deleted successfully!');
            
            // Determine which view we're in and refresh it
            const categoryTitle = document.querySelector('.music-library-section h2').textContent;
            
            // Find the category ID from the title
            const categoryMapping = {
                'Work Out': 'workout',
                'Techno 90s': 'techno',
                'Quiet Hours': 'quiet',
                'Rap': 'rap',
                'Deep Focus': 'focus',
                'Beach Vibes': 'beach',
                'Pop Hits': 'pop',
                'Movie Classics': 'movie',
                'Folk Music': 'folk',
                'Travelling': 'travel',
                'For Kids': 'kids',
                '80s Hits': '80s'
            };
            
            const categoryId = categoryMapping[categoryTitle];
            if (categoryId) {
                showMusicByCategory(categoryId);
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