/**
 * Library page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-lib-filter]');
    // Category grouping switch
    const showCategoriesSwitch = document.getElementById('showCategoriesSwitch');
    // Add music button
    const addNewMusicBtn = document.getElementById('addNewMusicLibrary');
    // Container elements
    const categoryGroupsContainer = document.getElementById('categoryGroups');
    const libraryListContainer = document.getElementById('libraryList');
    
    // Add event listeners
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Load library with selected filter
            loadLibrary();
        });
    });
    
    showCategoriesSwitch.addEventListener('change', loadLibrary);
    
    if (addNewMusicBtn) {
        addNewMusicBtn.addEventListener('click', showAddMusicModal);
    }
    
    // Load library on page load
    loadLibrary();
    
    // Function to load library items
    async function loadLibrary() {
        // Show loading state
        libraryListContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading your library...</p>
            </div>
        `;
        
        // Get active filter
        const activeFilter = document.querySelector('[data-lib-filter].active').dataset.libFilter;
        // Check if grouping is enabled
        const groupByCategory = showCategoriesSwitch.checked;
        
        try {
            // Determine sort method based on filter
            let sortMethod = 'recent';
            if (activeFilter === 'alphabetical') {
                sortMethod = 'alphabetical';
            } else if (activeFilter === 'recent') {
                sortMethod = 'recent';
            }
            
            // Fetch library items
            const response = await fetch(`/api/library?sort=${sortMethod}&grouped=${groupByCategory}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch library data');
            }
            
            const data = await response.json();
            
            // Display items based on grouping preference
            if (data.grouped) {
                displayGroupedLibrary(data.categories);
            } else {
                displayFlatLibrary(data.music);
            }
        } catch (error) {
            console.error('Error loading library:', error);
            libraryListContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>Error loading library</h3>
                    <p>${error.message || 'Please try again later'}</p>
                </div>
            `;
        }
    }
    
    // Display library items grouped by category
    function displayGroupedLibrary(categories) {
        // Clear previous content
        categoryGroupsContainer.innerHTML = '';
        libraryListContainer.innerHTML = '';
        
        if (!categories || categories.length === 0) {
            libraryListContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>Your library is empty</h3>
                    <p>Add some music to get started</p>
                    <button class="btn btn-primary mt-3" id="addEmptyLibraryBtn">
                        <i class="fas fa-plus"></i> Add Music
                    </button>
                </div>
            `;
            
            // Add click handler for the add music button
            const addEmptyLibraryBtn = document.getElementById('addEmptyLibraryBtn');
            if (addEmptyLibraryBtn) {
                addEmptyLibraryBtn.addEventListener('click', showAddMusicModal);
            }
            
            return;
        }
        
        // Create section for each category
        categories.forEach(category => {
            if (!category.music || category.music.length === 0) return;
            
            const categorySection = document.createElement('div');
            categorySection.className = 'mb-5';
            categorySection.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>${category.name}</h3>
                </div>
                <div class="row category-items" id="category-items-${category.id}"></div>
            `;
            
            categoryGroupsContainer.appendChild(categorySection);
            
            // Add music items to this category section
            const categoryItemsContainer = categorySection.querySelector(`#category-items-${category.id}`);
            
            category.music.forEach(music => {
                const musicCard = createMusicCard(music);
                categoryItemsContainer.appendChild(musicCard);
            });
        });
        
        // Add event listeners to buttons
        setupMusicCardHandlers();
    }
    
    // Display library items in a flat list
    function displayFlatLibrary(musicItems) {
        // Hide category groups container
        categoryGroupsContainer.innerHTML = '';
        
        if (!musicItems || musicItems.length === 0) {
            libraryListContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>Your library is empty</h3>
                    <p>Add some music to get started</p>
                    <button class="btn btn-primary mt-3" id="addEmptyLibraryBtn">
                        <i class="fas fa-plus"></i> Add Music
                    </button>
                </div>
            `;
            
            // Add click handler for the add music button
            const addEmptyLibraryBtn = document.getElementById('addEmptyLibraryBtn');
            if (addEmptyLibraryBtn) {
                addEmptyLibraryBtn.addEventListener('click', showAddMusicModal);
            }
            
            return;
        }
        
        // Clear previous content
        libraryListContainer.innerHTML = '';
        
        // Create cards for each music item
        musicItems.forEach(music => {
            const musicCard = createMusicCard(music);
            libraryListContainer.appendChild(musicCard);
        });
        
        // Add event listeners to buttons
        setupMusicCardHandlers();
    }
    
    // Create a music card element
    function createMusicCard(music) {
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
                            <button class="btn btn-sm btn-outline-danger like-btn ${music.isLiked ? 'active' : ''}" data-id="${music._id}">
                                <i class="fas fa-heart"></i>
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
        
        return musicCard;
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
    
    // Show add music modal
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
}); 