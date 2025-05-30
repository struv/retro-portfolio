// Global MP3 Player component
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
    
    // Create MP3 player HTML
    const playerHTML = `
        <div id="mp3-player" style="
            position: fixed;
            bottom: ${config.position.bottom};
            left: ${config.position.left};
            background: rgba(0, 0, 51, 0.9);
            border: 2px solid var(--primary);
            padding: 1rem;
            z-index: 15;
            min-width: 250px;
            font-family: 'VT323', monospace;
            box-shadow: 0 0 20px var(--primary);
            border-radius: 4px;
            backdrop-filter: blur(10px);
        ">
            <div id="mp3-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                border-bottom: 1px solid var(--secondary);
                padding-bottom: 0.5rem;
            ">
                <span style="color: var(--accent); font-weight: bold; font-size: 1.2rem;">♪ PLAYER</span>
                <button id="mp3-minimize" style="
                    background: none;
                    border: none;
                    color: var(--secondary);
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">−</button>
            </div>
            
            <div id="mp3-content">
                <div id="track-info" style="
                    color: var(--text);
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    min-height: 1.5rem;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                ">
                    Select a track
                </div>
                
                <div id="progress-container" style="
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    margin-bottom: 1.5rem;
                    border-radius: 2px;
                    overflow: hidden;
                ">
                    <div id="progress-bar" style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, var(--primary), var(--secondary));
                        transition: width 0.1s ease;
                    "></div>
                </div>
                
                <div id="controls" style="
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                ">
                    <button id="prev-btn" class="mp3-btn" style="
                        background: var(--primary);
                        border: 1px solid var(--secondary);
                        color: var(--text);
                        padding: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                        min-width: 2.5rem;
                        border-radius: 2px;
                        font-family: 'VT323', monospace;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    ">⏮</button>
                    <button id="play-btn" class="mp3-btn" style="
                        background: var(--primary);
                        border: 1px solid var(--secondary);
                        color: var(--text);
                        padding: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                        min-width: 2.5rem;
                        border-radius: 2px;
                        font-family: 'VT323', monospace;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    ">▶</button>
                    <button id="next-btn" class="mp3-btn" style="
                        background: var(--primary);
                        border: 1px solid var(--secondary);
                        color: var(--text);
                        padding: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                        min-width: 2.5rem;
                        border-radius: 2px;
                        font-family: 'VT323', monospace;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    ">⏭</button>
                </div>
                
                <div id="volume-container" style="
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                ">
                    <span style="color: var(--text); font-size: 0.9rem;">🔊</span>
                    <input type="range" id="volume-slider" min="0" max="100" value="50" style="
                        flex: 1;
                        height: 4px;
                        background: rgba(255, 255, 255, 0.2);
                        outline: none;
                        border-radius: 2px;
                    ">
                </div>
                
                <select id="playlist-select" style="
                    width: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    border: 1px solid var(--secondary);
                    color: var(--text);
                    padding: 0.25rem;
                    border-radius: 2px;
                    font-family: 'VT323', monospace;
                    font-size: 1rem;
                ">
                    <option value="">Select Track...</option>
                    ${playlist.map((track, index) => 
                        `<option value="${index}">${track.title}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        
        <style>
        .mp3-btn:hover {
            background: var(--secondary);
            box-shadow: 0 0 10px var(--secondary);
        }
        
        .mp3-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        #volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--accent);
            cursor: pointer;
            box-shadow: 0 0 5px var(--primary);
        }
        
        #mp3-player.minimized #mp3-content {
            display: none;
        }
        
        #mp3-player.minimized {
            min-width: auto;
        }
        
        @media (max-width: 600px) {
            #mp3-player {
                bottom: 1rem !important;
                right: 1rem !important;
                left: 1rem !important;
                min-width: auto;
            }
        }
        </style>
    `;
    
    // Insert player into page
    document.body.insertAdjacentHTML('beforeend', playerHTML);
    
    // Get DOM elements
    const player = document.getElementById('mp3-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
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
            });
            
            audio.addEventListener('canplay', () => {
                trackInfo.textContent = playlist[currentTrack].title;
            });
            
            audio.addEventListener('error', () => {
                trackInfo.textContent = `Error: ${playlist[currentTrack].title}`;
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
        
        currentTrack = (currentTrack + 1) % playlist.length;
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
        
        currentTrack = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
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