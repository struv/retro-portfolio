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
    let playlist = [...config.defaultPlaylist];
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
                
                <select id="playlist-select" class="mp3-playlist-select">
                    <option value="">Select Track...</option>
                    ${playlist.map((track, index) => 
                        `<option value="${index}">${track.title}</option>`
                    ).join('')}
                </select>
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
    const playlistSelect = document.getElementById('playlist-select');
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
        
        playlistSelect.value = currentTrack;
        createAudio();
        
        if (isPlaying) {
            audio.play().catch(e => console.error('Playback failed:', e));
            playBtn.textContent = '⏸';
        }
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
        
        playlistSelect.value = currentTrack;
        createAudio();
        
        if (isPlaying) {
            audio.play().catch(e => console.error('Playback failed:', e));
            playBtn.textContent = '⏸';
        }
    }
    
    // Event listeners
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    
    shuffleBtn.addEventListener('click', () => {
        isShuffleEnabled = !isShuffleEnabled;
        shuffleBtn.style.opacity = isShuffleEnabled ? '1' : '0.5';
    });
    
    volumeSlider.addEventListener('input', (e) => {
        if (audio) {
            audio.volume = e.target.value / 100;
        }
    });
    
    playlistSelect.addEventListener('change', (e) => {
        if (e.target.value !== '') {
            const wasPlaying = isPlaying;
            currentTrack = parseInt(e.target.value);
            createAudio();
            
            if (wasPlaying) {
                togglePlay();
            }
        }
    });
    
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
    
    // Auto-select first track if available
    if (playlist.length > 0) {
        currentTrack = 0;
        playlistSelect.value = 0;
        createAudio();
    }
    
    console.log('MP3 Player initialized');
}

// Helper function to get current page (shared with navbar)
function getCurrentPagePath() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
}

// Export function for global use
window.initializeMP3Player = initializeMP3Player;