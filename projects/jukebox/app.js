import { tracks, genres } from './tracks.js?v=live-order-20261030';

const $ = id => document.getElementById(id);
const portfolio = document.body.hasAttribute('data-jukebox-portfolio') || document.body.hasAttribute('data-jukebox-home');
const homeVisible = () => !portfolio || document.body.hasAttribute('data-jukebox-home');
const setText = (id, value) => { const element = $(id); if (element) element.textContent = value; };
const audio = new Audio();
audio.id = 'jukebox-audio'; audio.preload = 'auto'; audio.loop = !portfolio;
audio.setAttribute('aria-hidden', 'true'); audio.hidden = true;
document.body.appendChild(audio);
let scene, selected = 0, loaded = -1, busy = false, phase = 'browsing';
let operation = 0, deliberatelyStarted = false, fullPlayerVisible = false, visualOperation = null;
let volume = .35, dock, chooser, chooserOpener, machineObserver, seekTask;
let sceneHost, sceneTask;
const boundViews = new WeakSet();
const buttons = [], chooserButtons = [];
// Request only music someone has selected. Range-capable hosts stream normally;
// simple local servers get at most two buffered tracks so seeking still works.
const sourceCache = new Map(), rangeSources = new Set();
const MAX_BUFFER_BYTES = 20 * 1024 * 1024;
let sourceRequest = null;
function sourceFor(index) {
  const entry = sourceCache.get(index);
  if (!entry) return tracks[index].src;
  sourceCache.delete(index); sourceCache.set(index, entry);
  return entry.url;
}
function trimSources() {
  let bytes = [...sourceCache.values()].reduce((total, entry) => total + entry.bytes, 0);
  for (const [index, entry] of sourceCache) {
    if (sourceCache.size <= 2 && bytes <= MAX_BUFFER_BYTES) break;
    if (entry.url === audio.src) continue;
    sourceCache.delete(index); bytes -= entry.bytes; URL.revokeObjectURL(entry.url);
  }
}
function prepareSource(index) {
  if (sourceRequest && sourceRequest.index !== index) sourceRequest.controller.abort();
  if (sourceCache.has(index) || rangeSources.has(index)) return Promise.resolve(sourceFor(index));
  if (sourceRequest?.index === index) return sourceRequest.promise;
  sourceRequest?.controller.abort();
  const controller = new AbortController();
  const request = { index, controller, promise: null };
  const timer = setTimeout(() => controller.abort(), 12000);
  request.promise = (async () => {
    try {
      const response = await fetch(tracks[index].src, { headers: { Range: 'bytes=0-0' }, signal: controller.signal });
      if (!response.ok) throw new Error('Audio unavailable');
      if (response.status === 206) {
        rangeSources.add(index);
        await response.body?.cancel();
        return tracks[index].src;
      }
      const length = Number(response.headers.get('Content-Length'));
      if (length > MAX_BUFFER_BYTES) { await response.body?.cancel(); return tracks[index].src; }
      const blob = await response.blob();
      if (controller.signal.aborted || blob.size > MAX_BUFFER_BYTES) return tracks[index].src;
      const entry = { url: URL.createObjectURL(blob), bytes: blob.size };
      sourceCache.set(index, entry); trimSources();
      return sourceCache.has(index) ? entry.url : tracks[index].src;
    } catch { return tracks[index].src; } // Streaming remains available when buffering fails.
    finally {
      clearTimeout(timer);
      if (sourceRequest === request) sourceRequest = null;
    }
  })();
  sourceRequest = request;
  return request.promise;
}
try {
  volume = Math.max(0, Math.min(1, Number(localStorage.getItem('jukebox-demo-volume') ?? .35)));
  if (portfolio) {
    const remembered = tracks.findIndex(track => track.id === localStorage.getItem('jukebox-last-selection'));
    if (remembered >= 0) selected = remembered;
  }
} catch {}
// Pick a fresh shelf on entry. A remembered song is used only within that genre.
let activeGenre = genres[Math.floor(Math.random() * genres.length)];
if (tracks[selected].genre !== activeGenre) selected = tracks.findIndex(track => track.genre === activeGenre);
const genreIndices = genre => tracks.flatMap((track, index) => track.genre === genre ? [index] : []);
const visibleIndices = () => genreIndices(activeGenre);
const nextTrack = index => {
  const indices = genreIndices(tracks[index].genre);
  return indices[(indices.indexOf(index) + 1) % indices.length];
};
function createGenreControls(host) {
  if (!host || host.childElementCount) return;
  genres.forEach(genre => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.genre = genre;
    button.innerHTML = `${genre} <span>${genreIndices(genre).length}</span>`;
    button.addEventListener('click', () => {
      if (busy) return;
      const indices = genreIndices(genre);
      select(indices.includes(selected) ? selected : indices.includes(loaded) ? loaded : indices[0]);
    });
    host.appendChild(button);
  });
}
function syncGenres() {
  document.querySelectorAll('.jukebox-genres button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.genre === activeGenre));
    button.disabled = busy;
  });
  [buttons, chooserButtons].forEach(list => list.forEach((button, index) => {
    button.parentElement.hidden = tracks[index].genre !== activeGenre;
  }));
  setText('collection-count', `${activeGenre.toUpperCase()} / ${visibleIndices().length} DISCS`);
}
function browseBy(offset) {
  const indices = visibleIndices();
  select(indices[Math.max(0, Math.min(indices.length - 1, indices.indexOf(selected) + offset))]);
}
audio.volume = Number.isFinite(volume) ? volume : .35;
const time = seconds => `${Math.floor((seconds || 0) / 60)}:${String(Math.floor((seconds || 0) % 60)).padStart(2, '0')}`;
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" fill="currentColor"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm7 0h4v14h-4z" fill="currentColor"/></svg>';
const nextIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 10 7-10 7zM17 5h3v14h-3z" fill="currentColor"/></svg>';
const isPlaying = () => loaded >= 0 && !audio.paused && phase === 'playing';
function setPhase(next, message) {
  phase = next; document.body.dataset.phase = next;
  setText('phase-label', ({ browsing: 'READY TO LOAD', selecting: 'CHANGING DISC', inserting: 'LOADING DISC', playing: 'NOW PLAYING', paused: 'PAUSED', ejecting: 'EJECTING', error: 'PLAYBACK ERROR' })[next]);
  if (loaded >= 0) setText('now-subtitle', next === 'error' ? 'Press Play to retry' : tracks[loaded].subtitle);
  if (message) setText('status', message);
  updateControls();
  document.dispatchEvent(new CustomEvent('jukebox-statechange', { detail: { phase, selected, loaded, playing: isPlaying() } }));
}
function syncDock() {
  if (!dock) return;
  fullPlayerVisible = machineInView();
  dock.hidden = fullPlayerVisible;
  document.body.classList.toggle('jukebox-compact-visible', !fullPlayerVisible);
  const hasTrack = loaded >= 0;
  $('jukebox-music-button').hidden = hasTrack;
  $('jukebox-dock-player').hidden = !hasTrack;
  if (hasTrack) {
    $('jukebox-dock-title').textContent = tracks[loaded].title;
    $('jukebox-dock-state').textContent = busy ? 'CHANGING DISC' : phase === 'error' ? 'PRESS PLAY TO RETRY' : isPlaying() ? 'NOW PLAYING' : 'PAUSED';
    $('jukebox-dock-art').src = tracks[loaded].artwork;
    $('jukebox-dock-toggle').innerHTML = isPlaying() || busy ? pauseIcon : playIcon;
    $('jukebox-dock-toggle').setAttribute('aria-label', isPlaying() || busy ? 'Pause music' : 'Resume music');
  }
}
function updateControls() {
  const playing = isPlaying();
  if ($('jukebox-machine')) {
    $('play-pause').innerHTML = playing || busy ? pauseIcon : playIcon;
    $('play-pause').setAttribute('aria-label', playing || busy ? 'Pause playback' : loaded < 0 ? 'Play selected disc' : 'Resume playback');
    $('play-pause').setAttribute('title', playing || busy ? 'Pause' : 'Play');
    $('play-pause').disabled = false;
    $('eject').disabled = loaded < 0;
    $('insert').disabled = false;
    $('insert').textContent = loaded === selected ? playing || busy ? 'Pause this disc' : 'Play this disc' : 'Insert disc';
    $('seek').disabled = (busy && !seekTask) || loaded < 0;
    const indices = visibleIndices();
    $('browse-prev').disabled = selected === indices[0];
    $('browse-next').disabled = selected === indices.at(-1);
  }
  buttons.forEach((button, i) => {
    button.disabled = false; button.dataset.selected = String(i === selected);
    button.setAttribute('aria-current', i === loaded ? 'true' : 'false');
    button.querySelector('.track-action').textContent = i === loaded ? playing ? 'Playing' : 'Loaded' : i === selected ? 'Insert ↗' : 'Play ↗';
    button.setAttribute('aria-label', `${i === loaded ? 'Play or pause' : 'Insert and play'} ${tracks[i].title}`);
  });
  chooserButtons.forEach((button, i) => {
    button.setAttribute('aria-current', i === loaded ? 'true' : 'false');
    button.querySelector('.jukebox-choice-state').textContent = i === loaded ? playing ? 'Playing' : 'Resume' : 'Play';
  });
  syncGenres(); syncDock();
}
function select(index, move = true) {
  selected = Math.max(0, Math.min(tracks.length - 1, index));
  const track = tracks[selected];
  const changedGenre = activeGenre !== track.genre;
  if (changedGenre) {
    activeGenre = track.genre;
    scene?.setCollection(visibleIndices(), selected, { animate: move && homeVisible() });
  }
  const indices = visibleIndices();
  setText('selection-title', track.title);
  setText('selection-subtitle', `${track.genre} · ${track.subtitle}`);
  setText('selection-number', `${String(indices.indexOf(selected) + 1).padStart(2, '0')} / ${String(indices.length).padStart(2, '0')}`);
  if ($('stage')) $('stage').dataset.selection = String(selected);
  document.documentElement.style.setProperty('--disc-accent', track.color);
  if (move && !changedGenre) scene?.browse(selected);
  updateControls();
}
function rememberChoice(index) {
  if (!portfolio) return;
  try { localStorage.setItem('jukebox-last-selection', tracks[index].id); } catch {}
}
function updateTime() {
  if (!$('seek')) return;
  const duration = Number.isFinite(audio.duration) ? audio.duration : loaded >= 0 ? tracks[loaded].duration : 0;
  $('elapsed').textContent = time(audio.currentTime); $('duration').textContent = time(duration);
  if (document.activeElement !== $('seek')) $('seek').value = duration ? Math.round(audio.currentTime / duration * 1000) : 0;
  $('seek').setAttribute('aria-valuetext', `${time(audio.currentTime)} of ${time(duration)}`);
}
function machineInView() {
  const machine = $('jukebox-machine');
  if (!homeVisible() || !machine || !machine.getClientRects().length) return false;
  const rect = machine.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
}
function cancelTransition() {
  operation++;
  visualOperation = null;
  seekTask = null;
  // setLoaded resolves interrupted scene animations. Tokens prevent stale work
  // from replacing the current track when someone changes their mind quickly.
  scene?.setLoaded?.(loaded); scene?.lock(false); busy = false;
}
function playWithTimeout() {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Audio took too long to load.')), 15000); });
  return Promise.race([audio.play(), timeout]).finally(() => clearTimeout(timer));
}
function waitForMetadata() {
  if (audio.readyState >= 1) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const finish = error => {
      clearTimeout(timer); audio.removeEventListener('loadedmetadata', ready); audio.removeEventListener('error', failed);
      if (error) reject(error); else resolve();
    };
    const ready = () => finish();
    const failed = () => finish(new Error('Audio metadata unavailable.'));
    const timer = setTimeout(() => failed(), 12000);
    audio.addEventListener('loadedmetadata', ready); audio.addEventListener('error', failed);
  });
}
async function seekTo(fraction) {
  if (loaded < 0) return;
  const index = loaded;
  if (seekTask?.index === index && seekTask.token === operation) { seekTask.fraction = fraction; return; }
  const source = sourceFor(index);
  if ((audio.src === source && sourceCache.has(index) || rangeSources.has(index)) && Number.isFinite(audio.duration)) {
    audio.currentTime = fraction * audio.duration; updateTime(); return;
  }
  const resume = isPlaying();
  cancelTransition();
  const task = { index, token: operation, fraction, resume }; seekTask = task;
  busy = true; audio.pause(); updateControls();
  try {
    const prepared = await prepareSource(index);
    if (task.token !== operation) return;
    if (audio.src !== prepared) audio.src = prepared;
    await waitForMetadata();
    if (task.token !== operation) return;
    const appliedFraction = task.fraction;
    if (Number.isFinite(audio.duration)) audio.currentTime = appliedFraction * audio.duration;
    if (task.resume) await playWithTimeout();
    if (task.token !== operation) return;
    // A slider drag can continue while playback is buffering. Honor its last value.
    if (task.fraction !== appliedFraction && Number.isFinite(audio.duration)) audio.currentTime = task.fraction * audio.duration;
    setPhase(task.resume ? 'playing' : 'paused', `${tracks[index].title} ${task.resume ? 'playing' : 'paused'}.`);
  } catch {
    if (task.token === operation) { audio.pause(); setPhase('error', 'Could not seek this track. Press Play to retry.'); }
  } finally {
    if (task.token === operation) { seekTask = null; busy = false; updateControls(); updateTime(); trimSources(); }
  }
}
async function choose(index, { automatic = false, force = false } = {}) {
  if (!Number.isInteger(index) || !tracks[index]) return;
  if (!automatic) { deliberatelyStarted = true; rememberChoice(index); }
  if (loaded === index && !force) { select(index); await togglePlayback(); return; }
  cancelTransition();
  const token = operation, previous = loaded;
  const animate = !!scene && machineInView() && !automatic;
  visualOperation = animate ? token : null;
  busy = true;
  if (animate) scene.lock(true);
  select(index, !automatic);
  // New requests own playback immediately, including while a disc is moving.
  loaded = index;
  setText('now-title', tracks[index].title);
  setText('now-subtitle', tracks[index].subtitle);
  setPhase(animate ? 'inserting' : 'selecting', `Loading ${tracks[index].title}.`);
  audio.pause(); audio.muted = animate; audio.src = sourceFor(index);
  // Start within the user gesture, revealing sound after a visible insertion.
  const started = playWithTimeout().then(() => null, error => error);
  prepareSource(index);
  try {
    if (animate) {
      if (previous >= 0 && tracks[previous].genre === activeGenre) {
        setPhase('ejecting', `Returning ${tracks[previous].title}.`);
        await scene.eject(previous);
        if (token !== operation) return;
      }
      if (visualOperation === token) {
        setPhase('inserting', `Inserting ${tracks[index].title}.`);
        await scene.insert(index);
      }
    } else scene?.setLoaded?.(index);
    if (token !== operation) return;
    const error = await started;
    if (token !== operation) return;
    if (error) throw error;
    // A local file usually finishes buffering during insertion. Use it before
    // revealing sound; slower loads continue streaming and switch only on seek.
    const prepared = sourceFor(index);
    if (visualOperation === token && prepared !== audio.src) {
      audio.src = prepared;
      await playWithTimeout();
      if (token !== operation) return;
    }
    if (visualOperation === token) audio.currentTime = 0;
    audio.muted = false;
    setPhase(audio.paused ? 'paused' : 'playing', `Now playing ${tracks[index].title}.`);
  } catch (error) {
    if (token !== operation) return;
    audio.pause(); audio.muted = false; scene?.setLoaded?.(index);
    setPhase('error', `Could not play ${tracks[index].title}. Press Play to retry, or choose another disc.`);
    console.warn('Jukebox playback:', error.message);
  } finally {
    if (token === operation) { visualOperation = null; busy = false; scene?.lock(false); updateControls(); updateTime(); trimSources(); }
  }
}
async function togglePlayback() {
  if (loaded < 0) return choose(selected);
  deliberatelyStarted = true;
  if (busy || !audio.paused) {
    cancelTransition(); audio.pause(); audio.muted = false;
    setPhase('paused', `${tracks[loaded].title} paused.`); return;
  }
  cancelTransition();
  const token = operation;
  busy = true; updateControls();
  try {
    audio.muted = false;
    if (audio.error) { audio.src = sourceFor(loaded); audio.load(); }
    prepareSource(loaded);
    await playWithTimeout();
    if (token !== operation) return;
    setPhase('playing', `Now playing ${tracks[loaded].title}.`);
  } catch {
    if (token === operation) {
      audio.pause();
      setPhase('error', 'Playback could not start. Press Play to retry or choose another disc.');
    }
  } finally { if (token === operation) { busy = false; updateControls(); } }
}
async function eject() {
  if (loaded < 0) return;
  cancelTransition();
  const token = operation, index = loaded;
  busy = true; audio.pause(); audio.muted = false;
  const animate = !!scene && machineInView();
  if (animate) scene.lock(true);
  select(index); setPhase('ejecting', `Ejecting ${tracks[index].title}.`);
  try {
    if (animate) await scene.eject(index);
    else scene?.setLoaded?.(-1);
    if (token !== operation) return;
    loaded = -1; audio.removeAttribute('src'); audio.load();
    setText('now-title', 'Pick something good.');
    setText('now-subtitle', `${tracks.length} discs. A little room to listen.`);
    setPhase('browsing', `${tracks[index].title} returned to the collection.`);
  } finally { if (token === operation) { busy = false; scene?.lock(false); updateControls(); updateTime(); } }
}
function closeChooser(restoreFocus = true) {
  if (!chooser || chooser.hidden) return;
  chooser.hidden = true;
  $('jukebox-music-button').setAttribute('aria-expanded', 'false');
  $('jukebox-dock-choose').setAttribute('aria-expanded', 'false');
  if (restoreFocus) {
    const fallback = fullPlayerVisible ? $('play-pause') : loaded >= 0 ? $('jukebox-dock-choose') : $('jukebox-music-button');
    const target = chooserOpener?.getClientRects().length ? chooserOpener : fallback;
    target?.focus({ preventScroll: true });
  }
}
function openChooser(event) {
  if (!chooser.hidden) { closeChooser(); return; }
  chooserOpener = event.currentTarget; chooser.hidden = false;
  chooserOpener.setAttribute('aria-expanded', 'true');
  chooserButtons[visibleIndices().includes(loaded) ? loaded : selected].focus({ preventScroll: true });
}
function createCompactPlayer() {
  if (!portfolio || dock) return;
  dock = document.createElement('aside'); dock.id = 'jukebox-dock'; dock.hidden = true;
  dock.setAttribute('aria-label', 'Music player');
  dock.innerHTML = `<button id="jukebox-music-button" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="jukebox-chooser"><span aria-hidden="true">♫</span> Music</button>
    <div id="jukebox-dock-player" hidden><img id="jukebox-dock-art" alt="" width="38" height="38"><div class="jukebox-dock-copy"><span id="jukebox-dock-state">PAUSED</span><strong id="jukebox-dock-title"></strong></div><button id="jukebox-dock-toggle" type="button" aria-label="Resume music">${playIcon}</button><button id="jukebox-dock-next" type="button" aria-label="Next track">${nextIcon}</button><button id="jukebox-dock-choose" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="jukebox-chooser">Choose disc</button></div>`;
  document.body.appendChild(dock);
  chooser = document.createElement('section'); chooser.id = 'jukebox-chooser'; chooser.hidden = true;
  chooser.setAttribute('role', 'dialog'); chooser.setAttribute('aria-labelledby', 'jukebox-chooser-title');
  chooser.innerHTML = '<div class="jukebox-chooser-heading"><div><span>THE LISTENING ROOM</span><h2 id="jukebox-chooser-title">Choose a soundtrack</h2></div><button id="jukebox-chooser-close" type="button" aria-label="Close disc chooser">×</button></div><div id="jukebox-chooser-genres" class="jukebox-genres" role="group" aria-label="Browse music by genre"></div><ul id="jukebox-chooser-list"></ul><p>Plays continuously within each genre</p>';
  document.body.appendChild(chooser);
  createGenreControls($('jukebox-chooser-genres'));
  tracks.forEach((track, index) => {
    const li = document.createElement('li'), button = document.createElement('button'); button.type = 'button';
    button.innerHTML = `<img src="${track.artwork}" width="40" height="40" alt="" loading="lazy" decoding="async"><span class="jukebox-choice-copy"><strong>${track.title}</strong><span>${track.subtitle}</span></span><span class="jukebox-choice-state">Play</span>`;
    button.addEventListener('click', () => { choose(index); closeChooser(); });
    li.appendChild(button); $('jukebox-chooser-list').appendChild(li); chooserButtons.push(button);
  });
  $('jukebox-music-button').addEventListener('click', openChooser);
  $('jukebox-dock-choose').addEventListener('click', openChooser);
  $('jukebox-dock-toggle').addEventListener('click', togglePlayback);
  $('jukebox-dock-next').addEventListener('click', () => choose(nextTrack(loaded >= 0 ? loaded : selected), { force: true }));
  $('jukebox-chooser-close').addEventListener('click', () => closeChooser());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !chooser.hidden) { event.preventDefault(); closeChooser(); }
  });
  chooser.addEventListener('keydown', event => {
    const index = chooserButtons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const indices = visibleIndices();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? indices.length - 1 : (indices.indexOf(index) + (event.key === 'ArrowDown' ? 1 : -1) + indices.length) % indices.length;
    chooserButtons[indices[next]].focus({ preventScroll: true });
  });
  document.addEventListener('pointerdown', event => {
    if (!chooser.hidden && !chooser.contains(event.target) && !dock.contains(event.target)) closeChooser(false);
  });
  syncDock();
  machineObserver = new IntersectionObserver(() => {
    fullPlayerVisible = machineInView();
    if (fullPlayerVisible) closeChooser(false);
    syncDock();
  });
}
async function bindFullPlayer() {
  const machine = $('jukebox-machine');
  if (!machine) return;
  if (!boundViews.has(machine)) {
    boundViews.add(machine);
    buttons.length = 0;
    createGenreControls($('jukebox-genres'));
    $('volume').value = Math.round(audio.volume * 100);
    tracks.forEach((track, i) => {
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.className = 'track-button'; button.style.setProperty('--track-color', track.color);
      button.innerHTML = `<span class="track-number">${String(genreIndices(track.genre).indexOf(i) + 1).padStart(2, '0')}</span><img class="track-art" src="${track.artwork}" alt="" width="52" height="52" loading="lazy" decoding="async"><span class="track-copy"><span class="track-title">${track.title}</span><span class="track-meta">${track.subtitle}</span></span><span class="track-action">Play ↗</span>`;
      button.addEventListener('click', () => choose(i));
      button.addEventListener('focus', () => { if (!busy) select(i); });
      li.appendChild(button); $('track-list').appendChild(li); buttons.push(button);
    });
    $('browse-prev').addEventListener('click', () => browseBy(-1));
    $('browse-next').addEventListener('click', () => browseBy(1));
    $('insert').addEventListener('click', () => choose(selected));
    $('play-pause').addEventListener('click', togglePlayback);
    $('eject').addEventListener('click', eject);
    $('volume').addEventListener('input', event => {
      audio.volume = Number(event.target.value) / 100;
      try { localStorage.setItem('jukebox-demo-volume', String(audio.volume)); } catch {}
    });
    $('seek').addEventListener('input', event => {
      if (loaded >= 0) {
        const fraction = Number(event.target.value) / 1000;
        const duration = Number.isFinite(audio.duration) ? audio.duration : tracks[loaded].duration;
        $('elapsed').textContent = time(fraction * duration);
        $('seek').setAttribute('aria-valuetext', `${time(fraction * duration)} of ${time(duration)}`);
        seekTo(fraction);
      }
    });
    $('stage').addEventListener('keydown', event => {
      if (event.target !== $('stage')) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft') browseBy(-1);
      if (event.key === 'ArrowRight') browseBy(1);
      if (event.key === 'Home') select(visibleIndices()[0]);
      if (event.key === 'End') select(visibleIndices().at(-1));
      if (event.key === 'Enter' || event.key === ' ') choose(selected);
    });
    machineObserver?.observe(machine);
  }
  select(selected, false);
  setText('now-title', loaded >= 0 ? tracks[loaded].title : 'Pick something good.');
  setPhase(phase);
  updateTime();
  if (!homeVisible() || sceneHost === $('scene')) return sceneTask;
  const host = $('scene');
  if (!host) return;
  scene?.dispose();
  scene = null;
  sceneHost = host;
  sceneTask = (async () => {
    try {
      const { createScene } = await import('./scene.js?v=genre-orbit-3');
      const mounted = await createScene(host, tracks, choose, index => { if (!busy) select(index, false); });
      if (sceneHost !== host) { mounted.dispose(); return; }
      scene = mounted;
      scene.setCollection(visibleIndices(), selected); scene.setLoaded?.(loaded);
      const message = $('scene-message');
      if (message) message.hidden = true;
    } catch (error) {
      const message = $('scene-message');
      if (message) {
        message.hidden = false;
        message.textContent = portfolio ? 'The 3D preview is unavailable. Use the play button or Music menu to listen.' : 'The 3D preview is unavailable. You can still play every disc from the collection below.';
      }
      console.warn('Jukebox 3D:', error.message);
    }
  })();
  return sceneTask;
}

function syncPage() {
  closeChooser(false);
  // The full deck stays mounted while reading. Finish its visual movement
  // without replacing the playing source, seeking, or cancelling audio work.
  if (!homeVisible() && scene) {
    const inserting = visualOperation !== null;
    visualOperation = null;
    scene.setLoaded?.(loaded); scene.lock(false);
    if (inserting) audio.muted = false;
  }
  bindFullPlayer();
  fullPlayerVisible = machineInView();
  updateControls();
}

createCompactPlayer();
audio.addEventListener('timeupdate', updateTime);
audio.addEventListener('loadedmetadata', updateTime);
audio.addEventListener('pause', () => { if (!busy && audio.paused && loaded >= 0 && phase === 'playing' && !audio.ended) setPhase('paused', 'Playback paused.'); });
audio.addEventListener('error', () => { if (!busy && audio.error && loaded >= 0) setPhase('error', 'This audio could not be loaded. Press Play to retry or choose another disc.'); });
audio.addEventListener('ended', () => {
  if (portfolio && audio.ended && deliberatelyStarted && !busy && loaded >= 0) choose(nextTrack(loaded), { automatic: true, force: true });
});
select(selected); setPhase('browsing', portfolio ? 'Silent until you choose a disc.' : 'Choose a genre, then use the arrows or drag to browse.');
document.addEventListener('portfolio-pagechange', syncPage);
await bindFullPlayer();
updateControls();
window.addEventListener('pagehide', event => {
  // Leaving the page pauses playback; ordinary in-page scrolling never does.
  cancelTransition(); audio.pause(); audio.muted = false;
  if (loaded >= 0) setPhase('paused', `${tracks[loaded].title} paused.`);
  sourceRequest?.controller.abort();
  if (!event.persisted) {
    scene?.dispose(); machineObserver?.disconnect();
    sourceCache.forEach(entry => URL.revokeObjectURL(entry.url)); sourceCache.clear();
  }
});
