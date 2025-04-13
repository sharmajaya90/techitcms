/**
 * Search page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Search input and button
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Search filters
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    // Search results container
    const searchResultsContainer = document.getElementById('searchResults');
    
    // Add event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter button click handlers
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // If there's a search term, perform search with new filter
            if (searchInput.value.trim()) {
                performSearch();
            }
        });
    });
    
    // Function to perform search
    async function performSearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            searchResultsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>Please enter a search term</h3>
                </div>
            `;
            return;
        }
        
        // Get active filter
        const activeFilter = document.querySelector('[data-filter].active').dataset.filter;
        
        // Show loading state
        searchResultsContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Searching...</p>
            </div>
        `;
        
        try {
            // Fetch search results
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&filter=${activeFilter}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const data = await response.json();
            
            // Display results
            displaySearchResults(data.results);
        } catch (error) {
            console.error('Error searching:', error);
            searchResultsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>An error occurred during search</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
    
    // Function to display search results
    function displaySearchResults(results) {
        if (!results || results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>No results found</h3>
                    <p>Try a different search term or filter</p>
                </div>
            `;
            return;
        }
        
        // Clear previous results
        searchResultsContainer.innerHTML = '';
        
        // Create cards for each result
        results.forEach(music => {
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
                    
            const resultCard = document.createElement('div');
            resultCard.className = 'col-md-4 col-lg-3 mb-4';
            resultCard.innerHTML = `
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
            
            searchResultsContainer.appendChild(resultCard);
        });
        
        // Add event listeners for buttons
        setupResultCardHandlers();
    }
    
    // Setup event handlers for result card buttons
    function setupResultCardHandlers() {
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
}); 