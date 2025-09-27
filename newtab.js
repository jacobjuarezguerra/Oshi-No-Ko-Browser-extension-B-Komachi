

// Generate array of 20 background images with character names
let images;

// Character/scene descriptions for each image
const imageNames = [
  "Mem-cho - Cheerful Explorer",        // bg1.jpg
  "Mem-cho - Summer Garden Dreams",     // bg2.jpg
  "Kana, Akane & Mem-cho - Portrait Trio", // bg3.jpg
  "B-Komachi - Sweet Valentine",        // bg4.jpg
  "B-Komachi - Dark Performance",       // bg5.jpg
  "B-Komachi - POP IN 2",          // bg6.jpg
  "B-Komachi - Halloween Special",      // bg7.jpg
  "B-Komachi - Festive Celebration",    // bg8.jpg
  "Mem-cho - Casual Style",             // bg9.jpg
  "B-Komachi - Traditional Kimono",     // bg10.jpg
  "B-Komachi - Christmas Performance",  // bg11.jpg
  "B-Komachi - Stage Debut",            // bg12.jpg
  "B-Komachi - Unity Photo",            // bg13.jpg
  "B-Komachi - Concert Lights",         // bg14.jpg
  "B-Komachi - Stage Energy",           // bg15.jpg
  "B-Komachi - Winter Dreams",          // bg16.jpg
  "Mem-cho - Contemplative Moment",        // bg17.jpg
  "B-Komachi - Live Performance",       // bg18.jpg
  "B-Komachi - Final Stage",            // bg19.jpg
  "New Background",                     // bg20.jpg
];

let currentIndex = 0;
let rotationInterval;
let currentLayer = 1; // Track which background layer is active
let currentSong = null; // Track currently playing song
let songQueue = []; // Queue of { index, version }
let currentSongIndex = 0; // Index in queue
let currentSpeed = 5; // Current rotation speed in seconds
let lastVolume = 50; // Store last volume before mute
let uiHidden = false; // UI visibility state
let pauseMusicOnTabHidden = true; // Pause music when tab hidden
let currentSongCount = 10; // Number of songs available for current version
let currentVersion = 'piano'; // Current selected version
let currentPlayingVersion = 'piano'; // Version of currently playing song
let playHistory = []; // History of played songs for backtracking
let isBacktracking = false; // Flag to prevent adding to history when backtracking

// Function to update song select options
function updateSongSelect() {
  songSelect.innerHTML = '';
  for (let i = 0; i < currentSongCount; i++) {
    const option = document.createElement('option');
    option.value = i;
    let suffix = '';
    if (currentVersion === 'piano') suffix = ' (Piano)';
    else if (currentVersion === 'instrumental') suffix = ' (Instrumental)';
    option.textContent = songInfo[i].name + suffix;
    songSelect.appendChild(option);
  }
}

// Notification function
function showNotification(message) {
  const notif = document.getElementById('notification');
  if (notif) {
    notif.textContent = message;
    notif.style.display = 'block';
    setTimeout(() => {
      notif.style.display = 'none';
    }, 3000);
  }
}

// Format time in mm:ss
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Update queue display
function updateQueueDisplay() {
  const queueDiv = document.getElementById('queueDisplay');
  queueDiv.innerHTML = '';
  if (songQueue.length === 0) {
    queueDiv.innerHTML = '<p style="margin: 0; color: #cc5580;">No songs in queue</p>';
  } else {
    songQueue.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.style.display = 'flex';
      itemDiv.style.alignItems = 'center';
      itemDiv.style.marginBottom = '5px';

      const text = document.createElement('span');
      text.textContent = `${index + 1}. ${songInfo[item.index].name} (${item.version})`;
      text.style.flex = '1';
      text.style.color = '#333';
      itemDiv.appendChild(text);

      if (index > 0) {
        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.style.marginLeft = '5px';
        upBtn.style.fontSize = '10px';
        upBtn.style.padding = '2px 5px';
        upBtn.style.cursor = 'pointer';
        upBtn.style.background = 'rgba(0, 255, 0, 0.2)';
        upBtn.style.border = '1px solid rgba(0, 255, 0, 0.5)';
        upBtn.style.borderRadius = '3px';
        upBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          [songQueue[index], songQueue[index - 1]] = [songQueue[index - 1], songQueue[index]];
          updateQueueDisplay();
        });
        itemDiv.appendChild(upBtn);
      }

      if (index < songQueue.length - 1) {
        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.style.marginLeft = '5px';
        downBtn.style.fontSize = '10px';
        downBtn.style.padding = '2px 5px';
        downBtn.style.cursor = 'pointer';
        downBtn.style.background = 'rgba(255, 165, 0, 0.2)';
        downBtn.style.border = '1px solid rgba(255, 165, 0, 0.5)';
        downBtn.style.borderRadius = '3px';
        downBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          [songQueue[index], songQueue[index + 1]] = [songQueue[index + 1], songQueue[index]];
          updateQueueDisplay();
        });
        itemDiv.appendChild(downBtn);
      }

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.style.marginLeft = '5px';
      removeBtn.style.fontSize = '10px';
      removeBtn.style.padding = '2px 5px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.background = 'rgba(255, 0, 0, 0.2)';
      removeBtn.style.border = '1px solid rgba(255, 0, 0, 0.5)';
      removeBtn.style.borderRadius = '3px';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        songQueue.splice(index, 1);
        updateQueueDisplay();
      });
      itemDiv.appendChild(removeBtn);

      queueDiv.appendChild(itemDiv);
    });
  }
}

// Song information
const songInfo = [
  { name: "POP IN 2 - B-Komachi", files: { piano: "Piano/song1P.mp3", normal: "Normal/song1.mp3", instrumental: "Instrumental/song1I.mp3" }, file: "Piano/song1P.mp3", element: null },
  { name: "SIGN IS B - B-Komachi", files: { piano: "Piano/song2P.mp3", normal: "Normal/song2.mp3", instrumental: "Instrumental/song2I.mp3" }, file: "Piano/song2P.mp3", element: null },
  { name: "IDOL - YOASOBI", files: { piano: "Piano/song3P.mp3", normal: "Normal/song3.mp3", instrumental: "Instrumental/song3I.mp3" }, file: "Piano/song3P.mp3", element: null },
  { name: "STAR☆T☆RAIN - B-Komachi", files: { piano: "Piano/song4P.mp3", normal: "Normal/song4.mp3", instrumental: "Instrumental/song4I.mp3" }, file: "Piano/song4P.mp3", element: null },
  { name: "HEART's♡KISS - B-Komachi", files: { piano: "Piano/song5P.mp3", normal: "Normal/song5.mp3", instrumental: "Instrumental/song5I.mp3" }, file: "Piano/song5P.mp3", element: null },
  { name: "Mephisto - QUEEN BEE", files: { piano: "Piano/song6P.mp3", normal: "Normal/song6.mp3", instrumental: "Instrumental/song6I.mp3" }, file: "Piano/song6P.mp3", element: null },
  { name: "FATAL - GEMN", files: { piano: "Piano/song7P.mp3", normal: "Normal/song7.mp3", instrumental: "Instrumental/song7I.mp3" }, file: "Piano/song7P.mp3", element: null },
  { name: "Burning - Hitsujibungaku", files: { piano: "Piano/song8P.mp3", normal: "Normal/song8.mp3", instrumental: "Instrumental/song8I.mp3" }, file: "Piano/song8P.mp3", element: null },
  { name: "FULL MOON...! - Kana Arima", files: { piano: "Piano/song9P.mp3", normal: "Normal/song9.mp3", instrumental: "Instrumental/song9I.mp3" }, file: "Piano/song9P.mp3", element: null },
  { name: "GREEN PEPPER CALISTHENICS - Kana Arima", files: { piano: "Piano/song10P.mp3", normal: "Normal/song10.mp3", instrumental: "Instrumental/song10I.mp3" }, file: "Piano/song10P.mp3", element: null },
  { name: "Say What? - B Komachi", files: { piano: "Piano/song11P.mp3", normal: "Normal/song11.mp3", instrumental: "Instrumental/song11I.mp3" }, file: "Piano/song11P.mp3", element: null },
  { name: "Deep Sea 52Hz", files: { piano: "Piano/song12P.mp3", normal: "Normal/song12.mp3", instrumental: "Instrumental/song12I.mp3" }, file: "Piano/song12P.mp3", element: null }
];


// Change background image to next in sequence
function changeBackgroundSequential() {
  currentIndex = (currentIndex + 1) % images.length;
  
  // Use alternating layers for smooth transition
  const nextLayer = currentLayer === 1 ? 2 : 1;
  const currentLayerEl = document.getElementById(`backgroundLayer${currentLayer}`);
  const nextLayerEl = document.getElementById(`backgroundLayer${nextLayer}`);

  if (nextLayerEl) {
    // Set new image on inactive layer
    nextLayerEl.style.backgroundImage = `url(${images[currentIndex]})`;
  }

  if (currentLayerEl && nextLayerEl) {
    // Fade out current layer and fade in new layer
    currentLayerEl.classList.remove('active');
    nextLayerEl.classList.add('active');

    // Update current layer tracker
    currentLayer = nextLayer;
  }

  // Update current image display with character name
  const currentImageEl = document.getElementById('currentImage');
  if (currentImageEl) {
    const lang = pageLang ? pageLang.value : 'en-US';
    const t = translations[lang] || translations['en-US'];
    currentImageEl.textContent = `${t.currentImagePrefix} ${imageNames[currentIndex]}`;
  }
  
  // Save current index
  chrome.storage.local.set({currentIndex: currentIndex});

  // Add some sparkle effect
  createSparkleEffect();
}

// Change background image randomly
function changeBackgroundRandom() {
  // Get random index different from current
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * images.length);
  } while (newIndex === currentIndex && images.length > 1);

  currentIndex = newIndex;

  // Use alternating layers for smooth transition
  const nextLayer = currentLayer === 1 ? 2 : 1;
  const currentLayerEl = document.getElementById(`backgroundLayer${currentLayer}`);
  const nextLayerEl = document.getElementById(`backgroundLayer${nextLayer}`);

  if (nextLayerEl) {
    // Set new image on inactive layer
    nextLayerEl.style.backgroundImage = `url(${images[currentIndex]})`;
  }

  if (currentLayerEl && nextLayerEl) {
    // Fade out current layer and fade in new layer
    currentLayerEl.classList.remove('active');
    nextLayerEl.classList.add('active');

    // Update current layer tracker
    currentLayer = nextLayer;
  }

  // Update current image display with character name
  const currentImageEl = document.getElementById('currentImage');
  if (currentImageEl) {
    const lang = pageLang ? pageLang.value : 'en-US';
    const t = translations[lang] || translations['en-US'];
    currentImageEl.textContent = `${t.currentImagePrefix} ${imageNames[currentIndex]}`;
  }

  // Save current index
  chrome.storage.local.set({currentIndex: currentIndex});

  // Add some sparkle effect
  createSparkleEffect();
}

// Create sparkle effect when changing wallpapers
function createSparkleEffect() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.style.position = 'fixed';
      sparkle.style.left = Math.random() * 100 + 'vw';
      sparkle.style.top = Math.random() * 100 + 'vh';
      sparkle.style.width = Math.random() * 40 + 20 + 'px';
      sparkle.style.height = sparkle.style.width;
      sparkle.style.backgroundImage = `url(StarPink.svg)`;
      sparkle.style.backgroundSize = 'contain';
      sparkle.style.backgroundRepeat = 'no-repeat';
      sparkle.style.backgroundPosition = 'center';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.zIndex = '500';
      sparkle.style.animation = 'fadeOut 2s ease-out forwards';

      document.body.appendChild(sparkle);

      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 2000);
    }, i * 200);
  }
}

// Add CSS for sparkle animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
  }
`;

// Initialize extension
async function init() {
  images = Array.from({length: 19}, (_, i) => `bg${i + 1}.jpg`);
  songInfo.forEach((song, index) => {
    const audioEl = document.getElementById(`song${index + 1}`);
    if (audioEl) {
      song.element = audioEl;
      song.file = song.files.piano; // Default to piano version
      audioEl.src = song.file;
      audioEl.load();
    }
  });

  // Populate song select
  updateSongSelect();
  showNotification('📱 Using local content');

  // Load saved index
  chrome.storage.local.get(['currentIndex'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      currentIndex = 0;
    } else if (result.currentIndex !== undefined && result.currentIndex < images.length) {
      currentIndex = result.currentIndex;
    }

    // Preload all background images
    images.forEach(imgSrc => {
      const img = new Image();
      img.src = imgSrc;
    });

    // Set initial background on the active layer
    const activeLayer = document.getElementById(`backgroundLayer${currentLayer}`);
    if (activeLayer) {
      activeLayer.style.backgroundImage = `url(${images[currentIndex]})`;
    }
    const currentImageEl = document.getElementById('currentImage');
    if (currentImageEl) {
      const lang = pageLang ? pageLang.value : 'en-US';
      const t = translations[lang] || translations['en-US'];
      currentImageEl.textContent = `${t.currentImagePrefix} ${imageNames[currentIndex]}`;
    }
  });
  
  // Load saved settings
  chrome.storage.sync.get({rotationSpeed: 5, pageLang: 'en-US', voiceLang: 'en-US', pauseMusicOnTabHidden: true}, (result) => {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      return;
    }

    const speed = result.rotationSpeed;
    currentSpeed = speed;
    document.getElementById('rotationSpeed').value = speed;
    document.getElementById('speedValue').textContent = speed + 's';

    pageLang.value = result.pageLang;
    voiceLang.value = result.voiceLang;
    pauseMusicOnTabHidden = result.pauseMusicOnTabHidden;
    document.getElementById('pauseMusicOnTabHidden').checked = pauseMusicOnTabHidden;

    // Update page text
    updatePageText(result.pageLang);

    // Set up rotation
    rotationInterval = setInterval(changeBackgroundSequential, speed * 1000);

    // Listen for page language changes
    pageLang.addEventListener('change', () => {
      updatePageText(pageLang.value);
    });
  
    // Listen for pause music toggle
    const pauseMusicCheckbox = document.getElementById('pauseMusicOnTabHidden');
    if (pauseMusicCheckbox) {
      pauseMusicCheckbox.addEventListener('change', () => {
        pauseMusicOnTabHidden = pauseMusicCheckbox.checked;
      });
    }
  });
}

// Function to update all text based on selected language
function updatePageText(lang) {
  const t = translations[lang] || translations['en-US'];

  // Settings panel
  document.querySelector('#settingsPanel h3').textContent = t.settingsTitle;
  document.querySelector('label[for="rotationSpeed"]').childNodes[0].textContent = t.rotationSpeed;
  document.querySelector('label[for="pageLang"]').textContent = t.pageLanguage;
  document.querySelector('label[for="voiceLang"]').textContent = t.voiceLanguage;
  document.getElementById('saveSettings').textContent = t.saveSettings;
  document.getElementById('closeSettings').textContent = t.close;

  // Footer
  document.querySelector('.footer-left span').textContent = t.copyright;
  document.getElementById('nextWallpaper').textContent = t.nextWallpaper;
  document.getElementById('randomWallpaper').textContent = t.random;
  document.querySelector('.footer-link[target="_blank"]').textContent = t.watchAnime;

  // Search
  document.getElementById('searchInput').placeholder = t.searchPlaceholder;

  // Suggestions
  const suggestions = document.querySelectorAll('.search-suggestion');
  suggestions[0].textContent = t.suggestion1;
  suggestions[1].textContent = t.suggestion2;
  suggestions[2].textContent = t.suggestion3;
  suggestions[3].textContent = t.suggestion4;
  suggestions[4].textContent = t.suggestion5;

  // Version options
  const songVersionSelect = document.getElementById('songVersion');
  if (songVersionSelect) {
    songVersionSelect.options[0].textContent = `⭐ ${t.songVersionPiano}`;
    songVersionSelect.options[1].textContent = `🎵 ${t.songVersionNormal}`;
    songVersionSelect.options[2].textContent = `🎼 ${t.songVersionInstrumental}`;
  }

  // Queue buttons
  const addToQueueBtn = document.getElementById('addToQueueBtn');
  if (addToQueueBtn) {
    addToQueueBtn.textContent = t.addToQueue;
  }
  const viewQueueBtn = document.getElementById('viewQueueBtn');
  if (viewQueueBtn) {
    viewQueueBtn.textContent = t.viewQueue;
  }

  // Pause music text
  const pauseMusicText = document.getElementById('pauseMusicText');
  if (pauseMusicText) {
    pauseMusicText.textContent = t.pauseMusicText;
  }


  // Logo
  const logoElement = document.querySelector('.search-logo');
  if (logoElement) {
    logoElement.style.backgroundImage = lang === 'ja-JP' ? `url(logojp.png)` : `url(logo.png)`;
  }

  // Update current image display
  const currentImageEl = document.getElementById('currentImage');
  if (currentImageEl) {
    const currentImageName = imageNames[currentIndex];
    currentImageEl.textContent = `${t.currentImagePrefix} ${currentImageName}`;
  }

  // Current song will be updated dynamically
}

// Settings panel functionality
window.addEventListener('load', () => {
  console.log('Initializing extension');
  console.log('DOM ready state:', document.readyState);

  // Add CSS for sparkle animation
  document.head.appendChild(style);
  console.log('Style appended');

  const settingsBtn = document.getElementById('settingsBtn');
  if (!settingsBtn) {
    console.error('settingsBtn element not found');
    return;
  }
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettings = document.getElementById('closeSettings');
  const saveSettings = document.getElementById('saveSettings');
  const rotationSpeedSlider = document.getElementById('rotationSpeed');
  const speedValue = document.getElementById('speedValue');
  const pageLang = document.getElementById('pageLang');
  const voiceLang = document.getElementById('voiceLang');

  // Populate voice language select with all languages
  languages.forEach(lang => {
    const voiceOption = document.createElement('option');
    voiceOption.value = lang.code;
    voiceOption.textContent = lang.name;
    voiceLang.appendChild(voiceOption);
  });

  // Populate page language select with supported languages only
  const supportedPageLangs = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文' }
  ];
  supportedPageLangs.forEach(lang => {
    const pageOption = document.createElement('option');
    pageOption.value = lang.code;
    pageOption.textContent = lang.name;
    pageLang.appendChild(pageOption);
  });

  // Close settings
  closeSettings.addEventListener('click', () => {
    settingsPanel.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      settingsPanel.style.display = 'none';
    }, 300);
  });
  
  // Update speed display
  rotationSpeedSlider.addEventListener('input', () => {
    speedValue.textContent = rotationSpeedSlider.value + 's';
  });
  
  // Save settings with validation
  saveSettings.addEventListener('click', () => {
    const speed = parseInt(rotationSpeedSlider.value);
    const pageLanguage = pageLang.value;
    const voiceLanguage = voiceLang.value;
    const pauseMusic = document.getElementById('pauseMusicOnTabHidden').checked;

    if (speed < 1 || speed > 60) {
      alert('⚠️ Speed must be between 1 and 60 seconds!');
      return;
    }

    chrome.storage.sync.set({rotationSpeed: speed, pageLang: pageLanguage, voiceLang: voiceLanguage, pauseMusicOnTabHidden: pauseMusic}, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        alert('❌ Failed to save settings. Please try again.');
        return;
      }

      // Update page text
      updatePageText(pageLanguage);

      currentSpeed = speed;
      pauseMusicOnTabHidden = pauseMusic;
      // Restart rotation with new speed
      clearInterval(rotationInterval);
      rotationInterval = setInterval(changeBackgroundSequential, speed * 1000);

      // Show success feedback
      const originalText = saveSettings.textContent;
      saveSettings.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
      saveSettings.textContent = '✅ Saved!';
      setTimeout(() => {
        saveSettings.textContent = originalText;
        saveSettings.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)';
      }, 1000);
    });
  });
  
  // Add slide out animation CSS
  const animationStyle = document.createElement('style');
  animationStyle.textContent = `
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  `;
  document.head.appendChild(animationStyle);
  
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Space bar to manually change wallpaper
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      changeBackgroundSequential();
      // Reset the rotation timer
      clearInterval(rotationInterval);
      rotationInterval = setInterval(changeBackgroundSequential, currentSpeed * 1000);
    }
    
    // S key to toggle settings
    if (e.code === 'KeyS' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (document.activeElement === document.body) {
        settingsBtn.click();
      }
    }
  });
  
  // Add footer functionality
  const nextWallpaperBtn = document.getElementById('nextWallpaper');
  const randomWallpaperBtn = document.getElementById('randomWallpaper');
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const micButton = document.getElementById('micButton');
  const cameraButton = document.getElementById('cameraButton');
  const searchBox = document.getElementById('searchBox');
  const searchSuggestions = document.getElementById('searchSuggestions');

  // Music controls
  const musicControls = document.getElementById('musicControls');
  const prevBtn = document.getElementById('prevBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const nextBtn = document.getElementById('nextBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePercentEl = document.getElementById('volumePercent');
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const song1Audio = document.getElementById('song1');
  const song2Audio = document.getElementById('song2');
  const currentSongDisplay = document.getElementById('currentSong');
  const currentSongInline = document.getElementById('currentSongInline');
  const songSelect = document.getElementById('songSelect');
  const songVersion = document.getElementById('songVersion');
  const addToQueueBtn = document.getElementById('addToQueueBtn');

  // Initialize song elements
  songInfo.forEach((song, index) => {
    const audioEl = document.getElementById(`song${index + 1}`);
    if (audioEl) {
      song.element = audioEl;
      // Preload the audio
      audioEl.load();
    }
  });

  // Progress bar control
  if (progressBar) {
    progressBar.addEventListener('input', () => {
      if (currentSong && currentSong.duration) {
        const time = (progressBar.value / 100) * currentSong.duration;
        currentSong.currentTime = time;
      }
    });
  }

  // Initial volume percentage
  if (volumePercentEl) {
    volumePercentEl.textContent = volumeSlider.value + '%';
  }

  // Check for missing elements
  if (!song1Audio) {
    console.error('song1Audio element not found');
  }
  if (!song2Audio) {
    console.error('song2Audio element not found');
  }
  if (!currentSongDisplay) {
    console.error('currentSongDisplay element not found');
  }
  
  // Settings panel functionality
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (settingsPanel.style.display === 'block') {
      settingsPanel.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        settingsPanel.style.display = 'none';
      }, 300);
    } else {
      settingsPanel.style.display = 'block';
      settingsPanel.style.animation = 'slideIn 0.3s ease-out forwards';
    }
  });

  // UI toggle functionality
  const uiToggleBtn = document.getElementById('uiToggleBtn');
  const uiElements = [
    document.querySelector('.search-container'),
    document.getElementById('settingsBtn'),
    document.getElementById('currentImage'),
    document.querySelector('.footer'),
    document.querySelector('.search-logo'),
    ...document.querySelectorAll('.star-decoration')
  ];

  uiToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    uiHidden = !uiHidden;
    uiElements.forEach(el => {
      if (el) {
        el.classList.toggle('hidden');
      }
    });
    const icon = document.getElementById('uiToggleIcon');
    if (icon) {
      icon.src = uiHidden ? `eyecrossed.svg` : `eye.svg`;
    }
    // Hide button background when UI is hidden
    if (uiHidden) {
      uiToggleBtn.style.background = 'none';
      uiToggleBtn.style.boxShadow = 'none';
    } else {
      uiToggleBtn.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #ff1493 100%)';
      uiToggleBtn.style.boxShadow = '0 4px 15px rgba(255, 107, 157, 0.4)';
    }
  });

  // Close settings when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.settings-panel') && !settingsBtn.contains(e.target)) {
      if (settingsPanel.style.display === 'block') {
        settingsPanel.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
          settingsPanel.style.display = 'none';
        }, 300);
      }
    }
  });
  
  
  
  // Search input focus/blur effects
  if (searchInput && searchBox) {
    searchInput.addEventListener('focus', () => {
      searchBox.classList.add('focused');
    });
    
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        searchBox.classList.remove('focused');
        if (searchSuggestions) {
          searchSuggestions.style.display = 'none';
        }
      }, 200);
    });
  }
  
  // Show suggestions on input
  if (searchInput && searchSuggestions) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        searchSuggestions.style.display = 'block';
      } else {
        searchSuggestions.style.display = 'none';
      }

      // Toggle scrollbar based on content overflow
      setTimeout(() => {
        if (query.length === 0) {
          searchInput.style.overflowY = 'hidden';
        } else if (searchInput.scrollHeight > searchInput.clientHeight) {
          searchInput.style.overflowY = 'auto';
        } else {
          searchInput.style.overflowY = 'hidden';
        }
      }, 0);
    });
  }
  
  // Handle search
  function performSearch(query) {
    if (query.trim()) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.location.href = searchUrl;
    }
  }
  
  // Search button click
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch(searchInput.value);
    });
  }
  
  // Enter key search
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      }
    });
  }
  
  // Suggestion clicks
  const suggestions = document.querySelectorAll('.search-suggestion');
  suggestions.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
      const query = suggestion.getAttribute('data-query');
      if (searchInput) {
        searchInput.value = query;
      }
      performSearch(query);
    });
  });

  // Voice search
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let isListening = false;

    micButton.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.lang = voiceLang.value;
        recognition.start();
      }
    });

    recognition.onstart = () => {
      isListening = true;
      micButton.classList.add('listening');
      micButton.title = 'Click to stop listening';
    };

    recognition.onend = () => {
      isListening = false;
      micButton.classList.remove('listening');
      micButton.title = 'Voice Search';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert('Voice search failed: ' + event.error);
      isListening = false;
      micButton.classList.remove('listening');
    };
  } else {
    micButton.style.display = 'none';
  }

  // Image search
  cameraButton.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = 'https://images.google.com/';
  });

  // Update current song display
  function updateCurrentSongDisplay() {
    const lang = pageLang ? pageLang.value : 'en-US';
    const t = translations[lang] || translations['en-US'];
    if (currentSong) {
      const currentSongInfo = songInfo[currentSongIndex];
      let suffix = '';
      if (currentPlayingVersion === 'piano') suffix = ' (Piano)';
      else if (currentPlayingVersion === 'instrumental') suffix = ' (Instrumental)';
      const songText = `${t.songPrefix}${currentSongInfo.name}${suffix}`;
      if (currentSongDisplay) {
        currentSongDisplay.innerHTML = songText;
        currentSongDisplay.classList.add('playing');
      }
      if (currentSongInline) {
        currentSongInline.innerHTML = songText;
      }
    } else {
      const noSongText = t.noSongPlaying;
      if (currentSongDisplay) {
        currentSongDisplay.textContent = noSongText;
        currentSongDisplay.classList.remove('playing');
      }
      if (currentSongInline) {
        currentSongInline.textContent = noSongText;
      }
    }
  }

  // Play current song
  function playCurrentSong() {
    if (songInfo.length > 0) {
      const songToPlay = songInfo[currentSongIndex];
      stopAllMusic();

      songToPlay.element.volume = volumeSlider.value / 100;

      const tryPlay = () => {
        songToPlay.element.play().catch(error => {
          console.log('Could not play audio:', error);
          if (songToPlay.element.readyState < 2) {
            // Not loaded yet, wait for canplay
            songToPlay.element.addEventListener('canplay', () => {
              songToPlay.element.play().catch(err => {
                showNotification('Could not play ' + songToPlay.name + '. Make sure the audio file exists.');
              });
            }, { once: true });
          } else {
            showNotification('Could not play ' + songToPlay.name + '. Make sure the audio file exists.');
          }
        });
      };

      tryPlay();

      currentSong = songToPlay.element;

      // Add to play history if not backtracking
      if (!isBacktracking && (playHistory.length === 0 || playHistory[playHistory.length - 1] !== currentSongIndex)) {
        playHistory.push(currentSongIndex);
      }
      isBacktracking = false; // Reset flag

      // Add progress bar listeners
      currentSong.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(currentSong.duration);
      });
      currentSong.addEventListener('timeupdate', () => {
        if (currentSong.duration) {
          const progress = (currentSong.currentTime / currentSong.duration) * 100;
          progressBar.value = progress;
          currentTimeEl.textContent = formatTime(currentSong.currentTime);
        }
      });

      updateCurrentSongDisplay();
      playPauseBtn.textContent = '⏸';
    }
  }

  // Music control functions
  function stopAllMusic() {
    songInfo.forEach(song => {
      if (song.element) {
        song.element.pause();
        song.element.currentTime = 0;
      }
    });
    currentSong = null;
    updateCurrentSongDisplay();
    playPauseBtn.textContent = '▶';
    // Reset progress bar
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
  }

  // Music button event listeners
  prevBtn.addEventListener('click', () => {
    if (playHistory.length > 1) {
      currentSongIndex = playHistory[playHistory.length - 2]; // get second last
      currentPlayingVersion = currentVersion;
      isBacktracking = true;
      playCurrentSong();
    } else {
      currentSongIndex = (currentSongIndex - 1 + currentSongCount) % currentSongCount;
      currentPlayingVersion = currentVersion;
      playCurrentSong();
    }
  });

  playPauseBtn.addEventListener('click', () => {
    if (currentSong && !currentSong.paused) {
      currentSong.pause();
      playPauseBtn.textContent = '▶';
    } else if (currentSong && currentSong.paused) {
      // Unpause current song
      currentSong.play();
      playPauseBtn.textContent = '⏸';
      updateCurrentSongDisplay();
    } else {
      // No current song, start new
      if (songQueue.length > 0) {
        // If queue exists, play first in queue
        const nextItem = songQueue.shift();
        currentSongIndex = nextItem.index;
        currentPlayingVersion = nextItem.version;
        // Set the file to the queued version
        const song = songInfo[nextItem.index];
        song.file = song.files[nextItem.version];
        song.element.src = song.file;
        song.element.load();
        // Update queue display if visible
        const queueDiv = document.getElementById('queueDisplay');
        if (queueDiv && queueDiv.style.display !== 'none') {
          updateQueueDisplay();
        }
      }
      currentPlayingVersion = currentVersion;
      playCurrentSong();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (songQueue.length > 0) {
      const nextItem = songQueue.shift();
      currentSongIndex = nextItem.index;
      currentPlayingVersion = nextItem.version;
      // Set the file to the queued version
      const song = songInfo[nextItem.index];
      song.file = song.files[nextItem.version];
      song.element.src = song.file;
      song.element.load();
      // Update queue display if visible
      const queueDiv = document.getElementById('queueDisplay');
      if (queueDiv && queueDiv.style.display !== 'none') {
        updateQueueDisplay();
      }
    } else {
      currentSongIndex = (currentSongIndex + 1) % currentSongCount;
      currentPlayingVersion = currentVersion;
    }
    playCurrentSong();
  });

  // Volume control
  volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value / 100;
    songInfo.forEach(song => {
      if (song.element) {
        song.element.volume = volume;
      }
    });
    // Update speaker icon
    const speakerIcon = document.getElementById('speakerIcon');
    if (speakerIcon) {
      speakerIcon.src = volume === 0 ? `Speakermuted.svg` : `Speaker.svg`;
    }
    // Update volume percentage
    volumePercentEl.textContent = volumeSlider.value + '%';
  });

  // Speaker icon click to toggle mute
  const speakerIcon = document.getElementById('speakerIcon');
  if (speakerIcon) {
    speakerIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (volumeSlider.value > 0) {
        lastVolume = volumeSlider.value;
        volumeSlider.value = 0;
      } else {
        volumeSlider.value = lastVolume;
      }
      volumeSlider.dispatchEvent(new Event('input'));
    });
  }

  // Populate song select
  if (songSelect) {
    songInfo.forEach((song, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = song.name;
      songSelect.appendChild(option);
    });
  }

  // Song version change
  if (songVersion) {
    songVersion.addEventListener('change', () => {
      const version = songVersion.value;
      currentVersion = version;
      currentSongCount = (version === 'piano') ? 10 : 12;
  
      songInfo.forEach((song, index) => {
        if (song.element && song.element !== currentSong) {
          const newSrc = song.files[version];
          song.file = newSrc;
          song.element.src = newSrc;
          song.element.load();
        }
      });
  
      // Update song selector options
      updateSongSelect();
  
      console.log('Song version changed to:', version, 'songs:', currentSongCount);
    });
  }

  // Add to queue
  if (addToQueueBtn) {
    addToQueueBtn.addEventListener('click', () => {
      const selectedIndex = parseInt(songSelect.value);
      if (!isNaN(selectedIndex) && songInfo[selectedIndex]) {
        const currentVersion = songVersion.value;
        if (!songQueue.some(item => item.index === selectedIndex && item.version === currentVersion)) {
          songQueue.push({ index: selectedIndex, version: currentVersion });
          showNotification('Added to queue: ' + songInfo[selectedIndex].name + ' (' + currentVersion + ')');
          // Update queue display if visible
          const queueDiv = document.getElementById('queueDisplay');
          if (queueDiv && queueDiv.style.display !== 'none') {
            updateQueueDisplay();
          }
        } else {
          showNotification('Song already in queue');
        }
      }
    });
  }

  // View queue button
  const viewQueueBtn = document.getElementById('viewQueueBtn');
  if (viewQueueBtn) {
    viewQueueBtn.addEventListener('click', () => {
      const queueDiv = document.getElementById('queueDisplay');
      if (queueDiv.style.display === 'none') {
        updateQueueDisplay();
        queueDiv.style.display = 'block';
      } else {
        queueDiv.style.display = 'none';
      }
    });
  }

  // Auto-play next song when current ends
  songInfo.forEach((song, index) => {
    if (song.element) {
      song.element.addEventListener('ended', () => {
        if (currentSong === song.element) {
          if (songQueue.length > 0) {
            const nextItem = songQueue.shift();
            currentSongIndex = nextItem.index;
            currentPlayingVersion = nextItem.version;
            // Set the file to the queued version
            const nextSong = songInfo[nextItem.index];
            nextSong.file = nextSong.files[nextItem.version];
            nextSong.element.src = nextSong.file;
            nextSong.element.load();
            // Update queue display if visible
            const queueDiv = document.getElementById('queueDisplay');
            if (queueDiv && queueDiv.style.display !== 'none') {
              updateQueueDisplay();
            }
          } else {
            currentSongIndex = (currentSongIndex + 1) % currentSongCount;
            currentPlayingVersion = currentVersion;
          }
          playCurrentSong();
        }
      });
    }
  });
  
  // Next wallpaper functionality
  nextWallpaperBtn.addEventListener('click', (e) => {
    e.preventDefault();
    changeBackgroundSequential();
    // Reset the rotation timer
    clearInterval(rotationInterval);
    rotationInterval = setInterval(changeBackgroundSequential, currentSpeed * 1000);
  });

  // Random wallpaper functionality
  randomWallpaperBtn.addEventListener('click', (e) => {
    e.preventDefault();
    changeBackgroundRandom();
    // Reset the rotation timer
    clearInterval(rotationInterval);
    rotationInterval = setInterval(changeBackgroundSequential, currentSpeed * 1000);
  });
  

  // Initialize the extension
  console.log('About to call init()');
  (async () => {
    await init();
    console.log('Init() completed');
  })();

  // Pause music when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentSong && !currentSong.paused && pauseMusicOnTabHidden) {
      currentSong.pause();
      playPauseBtn.textContent = '▶';
    }
  });
});