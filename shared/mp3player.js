// Global MP3 Player component - Updated to use CSS classes
function initializeMP3Player() {
    // Check if MP3 player should be disabled on this page
    const currentPage = getCurrentPagePath();
    const pageSettings = window.SiteConfig.page[currentPage];
    
    if (pageSettings && pageSettings.disableMP3Player) {
        return; // Don't initialize on pages where it's disabled
    }
    
    const config = window.SiteConfig.mp3Player;
    let currentTrack = 0;
    let isPlaying = false;
    let audio = null;
    
    // localStorage keys for persistence
    const STORAGE_KEYS = {
        CURRENT_TRACK: 'mp3player_currentTrack',
        IS_PLAYING: 'mp3player_isPlaying',
        VOLUME: 'mp3player_volume',
        SHUFFLE: 'mp3player_shuffle',
        CURRENT_TIME: 'mp3player_currentTime'
    };
    
    // Save player state to localStorage
    function savePlayerState() {
        try {
            const state = {
                currentTrack: currentTrack,
                isPlaying: isPlaying,
                volume: volumeSlider ? volumeSlider.value : 50,
                shuffle: isShuffleEnabled,
                currentTime: audio ? audio.currentTime : 0
            };
            localStorage.setItem('mp3player_state', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save player state:', e);
        }
    }
    
    // Load player state from localStorage
    function loadPlayerState() {
        try {
            const savedState = localStorage.getItem('mp3player_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                currentTrack = state.currentTrack || 0;
                isPlaying = state.isPlaying || false;
                isShuffleEnabled = state.shuffle || false;
                return state;
            }
        } catch (e) {
            console.warn('Failed to load player state:', e);
        }
        return null;
    }
    
    // Adjust audio paths based on current page location
    const isInSubdirectory = window.location.pathname.split('/').length > 2;
    const audioPathPrefix = isInSubdirectory ? '../' : '';
    let playlist = config.defaultPlaylist.map(track => ({
        ...track,
        src: audioPathPrefix + track.src
    }));
    
    let isShuffleEnabled = false;
    
    // Create MP3 player HTML using CSS classes
    const playerHTML = `
        <div id="mp3-player" class="retro-panel mp3-player">
            <div class="retro-panel-header">
                <span class="retro-panel-title">♪ PLAYER</span>
                <button id="mp3-minimize" class="retro-minimize-btn">−</button>
            </div>
            
            <div id="mp3-content" class="mp3-content">
                <div id="track-info" class="mp3-track-info">
                    Select a track
                </div>
                
                <div class="mp3-progress-container">
                    <div id="progress-bar" class="mp3-progress-bar"></div>
                </div>
                
                <div id="controls" class="mp3-controls">
                    <button id="prev-btn" class="mp3-btn">⏮</button>
                    <button id="play-btn" class="mp3-btn">▶</button>
                    <button id="next-btn" class="mp3-btn">⏭</button>
                    <button id="shuffle-btn" class="mp3-btn" title="Toggle Shuffle">🔀</button>
                </div>
                
                <div class="mp3-volume-container">
                    <span class="mp3-volume-icon">🔊</span>
                    <input type="range" id="volume-slider" class="mp3-volume-slider" min="0" max="100" value="50">
                </div>
                
                <div class="custom-dropdown" id="playlist-dropdown">
                    <div class="dropdown-selected">
                        <span id="selected-track">Select Track...</span>
                        <span class="dropdown-arrow">▼</span>
                    </div>
                    <div class="dropdown-options">
                        ${playlist.map((track, index) => 
                            `<div class="dropdown-option" data-index="${index}" data-track="${track.title}">
                                ${track.title}
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert player into page
    document.body.insertAdjacentHTML('beforeend', playerHTML);
    
    // Get DOM elements
    const player = document.getElementById('mp3-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress-bar');
    const trackInfo = document.getElementById('track-info');
    const dropdown = document.getElementById('playlist-dropdown');
    const selectedTrack = document.getElementById('selected-track');
    const minimizeBtn = document.getElementById('mp3-minimize');
    const content = document.getElementById('mp3-content');
    
    // Initialize audio
    function createAudio() {
        if (audio) {
            audio.pause();
            audio = null;
        }
        
        if (playlist[currentTrack]) {
            audio = new Audio(playlist[currentTrack].src);
            audio.volume = volumeSlider.value / 100;
            
            // Restore playback position if available
            const savedState = loadPlayerState();
            if (savedState && savedState.currentTime > 0) {
                audio.currentTime = savedState.currentTime;
            }
            
            // Audio event listeners
            audio.addEventListener('loadstart', () => {
                trackInfo.textContent = `Loading: ${playlist[currentTrack].title}`;
                trackInfo.setAttribute('data-track', playlist[currentTrack].title);
            });
            
            audio.addEventListener('canplay', () => {
                trackInfo.textContent = playlist[currentTrack].title;
                trackInfo.setAttribute('data-track', playlist[currentTrack].title);
            });
            
            audio.addEventListener('error', () => {
                trackInfo.textContent = `Error: ${playlist[currentTrack].title}`;
                trackInfo.setAttribute('data-track', playlist[currentTrack].title);
                nextTrack();
            });
            
            audio.addEventListener('ended', () => {
                nextTrack();
            });
            
            audio.addEventListener('timeupdate', updateProgress);
        }
        updateSelectedTrack();
    }
    
    // Update progress bar
    function updateProgress() {
        if (audio && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = progress + '%';
        }
    }
    
    // Play/pause functionality
    function togglePlay() {
        if (!audio) {
            if (playlist.length > 0) {
                createAudio();
            } else {
                return;
            }
        }
        
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = '▶';
            isPlaying = false;
        } else {
            audio.play().catch(e => {
                console.error('Playback failed:', e);
                trackInfo.textContent = 'Playback failed';
            });
            playBtn.textContent = '⏸';
            isPlaying = true;
        }
        
        // Save state when play/pause changes
        savePlayerState();
    }
    
    // Next track
    function nextTrack() {
        if (playlist.length === 0) return;
        
        if (isShuffleEnabled) {
            // Get a random track different from the current one
            let newTrack;
            do {
                newTrack = Math.floor(Math.random() * playlist.length);
            } while (newTrack === currentTrack && playlist.length > 1);
            currentTrack = newTrack;
        } else {
            currentTrack = (currentTrack + 1) % playlist.length;
        }
        
        dropdown.value = currentTrack;
        createAudio();
        
        if (isPlaying) {
            audio.play().catch(e => console.error('Playback failed:', e));
            playBtn.textContent = '⏸';
        }
        
        // Save state when track changes
        savePlayerState();
    }
    
    // Previous track
    function prevTrack() {
        if (playlist.length === 0) return;
        
        if (isShuffleEnabled) {
            // Get a random track different from the current one
            let newTrack;
            do {
                newTrack = Math.floor(Math.random() * playlist.length);
            } while (newTrack === currentTrack && playlist.length > 1);
            currentTrack = newTrack;
        } else {
            currentTrack = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
        }
        
        dropdown.value = currentTrack;
        createAudio();
        
        if (isPlaying) {
            audio.play().catch(e => console.error('Playback failed:', e));
            playBtn.textContent = '⏸';
        }
        
        // Save state when track changes
        savePlayerState();
    }
    
    // Event listeners
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    
    shuffleBtn.addEventListener('click', () => {
        isShuffleEnabled = !isShuffleEnabled;
        shuffleBtn.style.opacity = isShuffleEnabled ? '1' : '0.5';
        savePlayerState();
    });
    
    volumeSlider.addEventListener('input', (e) => {
        if (audio) {
            audio.volume = e.target.value / 100;
        }
        savePlayerState();
    });
    
    dropdown.addEventListener('click', (e) => {
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Handle option selection
    dropdown.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(option.dataset.index);
            const wasPlaying = isPlaying;
            currentTrack = index;
            selectedTrack.textContent = playlist[currentTrack].title;
            selectedTrack.setAttribute('data-track', playlist[currentTrack].title);
            createAudio();
            
            if (wasPlaying) {
                togglePlay();
            }
            
            dropdown.classList.remove('active');
            savePlayerState();
        });
    });
    
    // Update selected track display
    function updateSelectedTrack() {
        if (playlist[currentTrack]) {
            selectedTrack.textContent = playlist[currentTrack].title;
            selectedTrack.setAttribute('data-track', playlist[currentTrack].title);
        }
    }
    
    minimizeBtn.addEventListener('click', () => {
        player.classList.toggle('minimized');
        minimizeBtn.textContent = player.classList.contains('minimized') ? '+' : '−';
    });
    
    // Keyboard shortcuts (only when player is visible)
    document.addEventListener('keydown', (e) => {
        // Only respond to shortcuts if no input is focused
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA' ||
            document.activeElement.tagName === 'SELECT') {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowright':
                    e.preventDefault();
                    nextTrack();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    prevTrack();
                    break;
            }
        }
    });
    
    // Load saved state and initialize
    const savedState = loadPlayerState();
    if (savedState && playlist.length > 0) {
        // Restore saved track (ensure it's within bounds)
        currentTrack = Math.min(savedState.currentTrack, playlist.length - 1);
        isShuffleEnabled = savedState.shuffle;
        
        // Restore volume
        if (volumeSlider && savedState.volume !== undefined) {
            volumeSlider.value = savedState.volume;
        }
        
        // Update shuffle button appearance
        if (shuffleBtn) {
            shuffleBtn.style.opacity = isShuffleEnabled ? '1' : '0.5';
        }
        
        createAudio();
        
        // Restore play state
        if (savedState.isPlaying) {
            // Small delay to ensure audio is loaded
            setTimeout(() => {
                togglePlay();
            }, 100);
        }
    } else if (playlist.length > 0) {
        // No saved state, start fresh
        currentTrack = 0;
        dropdown.value = 0;
        createAudio();
    }
    
    // Set up periodic saving of current time
    setInterval(() => {
        if (audio && isPlaying) {
            savePlayerState();
        }
    }, 5000); // Save every 5 seconds when playing
    
    // Save state before page unload
    window.addEventListener('beforeunload', () => {
        savePlayerState();
    });
    
    console.log('MP3 Player initialized with persistence');
}

// Helper function to get current page (shared with navbar)
function getCurrentPagePath() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
}


// Export function for global use
window.initializeMP3Player = initializeMP3Player;

// Export function to clear saved state (for debugging)
window.clearMP3PlayerState = function() {
    try {
        localStorage.removeItem('mp3player_state');
        console.log('MP3 Player state cleared');
    } catch (e) {
        console.warn('Failed to clear player state:', e);
    }
};