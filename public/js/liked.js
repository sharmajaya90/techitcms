/**
 * Liked Songs page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Find all music cards and fix their URLs
    fixMediaUrls();
    
    // Elements
    const likedList = document.getElementById('likedList');
    const likedSongsCount = document.getElementById('likedSongsCount');
    const playAllButton = document.querySelector('.play-all-button');
    
    // Add event listener for play all button
    if (playAllButton) {
        playAllButton.addEventListener('click', playAllLikedSongs);
    }
    
    // Setup unlike buttons
    setupUnlikeButtons();
    
    // Setup play buttons
    setupPlayButtons();
    
    // Fix URLs for all media elements
    function fixMediaUrls() {
        // Fix image URLs
        document.querySelectorAll('.music-card img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/uploads/')) {
                img.src = src.startsWith('/') ? src : `/${src}`;
            }
        });
        
        // Fix audio URLs
        document.querySelectorAll('.audio-player source').forEach(source => {
            const src = source.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/uploads/')) {
                source.src = src.startsWith('/') ? src : `/${src}`;
            }
        });
        
        // Fix data-audio attributes
        document.querySelectorAll('.play-btn').forEach(btn => {
            const dataAudio = btn.getAttribute('data-audio');
            if (dataAudio && !dataAudio.startsWith('http') && !dataAudio.startsWith('/uploads/')) {
                btn.setAttribute('data-audio', dataAudio.startsWith('/') ? dataAudio : `/${dataAudio}`);
            }
        });
    }
    
    // Function to setup unlike buttons
    function setupUnlikeButtons() {
        const unlikeButtons = document.querySelectorAll('.unlike-btn');
        
        unlikeButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const musicId = btn.getAttribute('data-id');
                
                try {
                    const response = await fetch(`/api/music/${musicId}/like`, {
                        method: 'PUT'
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to unlike song');
                    }
                    
                    // Remove the card from the list
                    const card = btn.closest('.col-md-4');
                    card.remove();
                    
                    // Update the count
                    const currentCount = parseInt(likedSongsCount.textContent);
                    likedSongsCount.textContent = currentCount - 1;
                    
                    // If no liked songs left, show empty state
                    if (currentCount - 1 <= 0) {
                        likedList.innerHTML = `
                            <div class="col-12 text-center">
                                <h3>No liked songs yet</h3>
                                <p>Start exploring and like songs to add them to your collection</p>
                            </div>
                        `;
                    }
                    
                    showMessage('Song removed from liked songs');
                } catch (error) {
                    console.error('Error unliking song:', error);
                    showMessage('Failed to unlike song. Please try again.', true);
                }
            });
        });
    }
    
    // Function to setup play buttons
    function setupPlayButtons() {
        const playButtons = document.querySelectorAll('.play-btn');
        
        playButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const audioPlayer = btn.closest('.card-body').querySelector('.audio-player');
                const audioUrl = btn.getAttribute('data-audio');
                
                // Set the correct source if not already set
                if (audioUrl) {
                    const audioSource = audioPlayer.querySelector('source');
                    if (audioSource.src !== audioUrl) {
                        audioSource.src = audioUrl;
                        audioPlayer.load();
                    }
                }
                
                // Stop any other playing audio
                document.querySelectorAll('.audio-player').forEach(player => {
                    if (player !== audioPlayer && !player.paused) {
                        player.pause();
                        const playBtn = player.closest('.card-body').querySelector('.play-btn');
                        playBtn.innerHTML = '<i class="fas fa-play me-1"></i> Play';
                    }
                });
                
                // Toggle player state
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
    }
    
    // Function to play all liked songs
    function playAllLikedSongs() {
        // Get all audio players
        const audioPlayers = document.querySelectorAll('.audio-player');
        
        if (audioPlayers.length === 0) {
            return;
        }
        
        // Pause all currently playing
        audioPlayers.forEach(player => {
            if (!player.paused) {
                player.pause();
                const playBtn = player.closest('.card-body').querySelector('.play-btn');
                playBtn.innerHTML = '<i class="fas fa-play me-1"></i> Play';
            }
        });
        
        // Play the first one
        const firstPlayer = audioPlayers[0];
        firstPlayer.style.display = 'block';
        firstPlayer.play();
        
        // Update the button
        const playBtn = firstPlayer.closest('.card-body').querySelector('.play-btn');
        playBtn.innerHTML = '<i class="fas fa-pause me-1"></i> Pause';
        
        // Set up sequential playback
        let currentIndex = 0;
        
        // When one song ends, play the next one
        audioPlayers.forEach((player, index) => {
            player.addEventListener('ended', () => {
                if (index < audioPlayers.length - 1) {
                    // Update current player UI
                    player.style.display = 'none';
                    const currentPlayBtn = player.closest('.card-body').querySelector('.play-btn');
                    currentPlayBtn.innerHTML = '<i class="fas fa-play me-1"></i> Play';
                    
                    // Play next song
                    const nextPlayer = audioPlayers[index + 1];
                    nextPlayer.style.display = 'block';
                    nextPlayer.play();
                    
                    // Update next player UI
                    const nextPlayBtn = nextPlayer.closest('.card-body').querySelector('.play-btn');
                    nextPlayBtn.innerHTML = '<i class="fas fa-pause me-1"></i> Pause';
                }
            });
        });
    }
}); 