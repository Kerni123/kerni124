document.addEventListener('DOMContentLoaded', () => {
  // === Elemente ===
  const startScreen = document.getElementById('startScreen');
  const bgVideo = document.getElementById('bgVideo');
  const volumeControl = document.getElementById('volumeControl');
  const musicPlayer = document.getElementById('musicPlayer');
  const customText = document.getElementById('customText');

  const playerAudio = new Audio();
  const coverArt = document.getElementById('coverArt');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');
  const playPauseIcon = document.getElementById('playPauseIcon');

  // === Playlist ===
  const playlist = [
    { src: 'media/sounds/SpotiMate.io - Gemstone - Don Toliver.mp3', cover: 'media/pictures/callback.jpg', title: 'Gemstone', artist: 'Don Toliver' },
    { src: 'media/sounds/Playboi Carti - EVIL J0RDAN (Official Audio).mp3', cover: 'media/pictures/Evil.png', title: 'Evil Jordan', artist: 'Playboi Carti' },
    { src: 'media/sounds/SpotiMate.io - the acronym _with Destroy Lonely_ - Ken Carson.mp3', cover: 'media/pictures/the acronym.jpg', title: 'the acronym', artist: 'Ken Carson' },
    { src: 'media/sounds/Don Toliver - ATM [Official Video].mp3', cover: 'media/pictures/atm.jpg', title: 'ATM', artist: 'Don Toliver' },
    { src: 'media/sounds/Don Toliver -FWU [OfficialMusicVideo].mp3', cover: 'media/pictures/FWU.jpeg', title: 'FWU', artist: 'Don Toliver' },
    { src: 'media/sounds/Ken Carson - ss (Official Audio).mp3', cover: 'media/pictures/SS.jpeg', title: 'SS', artist: 'Ken Carson' },

    ];

  let currentTrackIndex = 0;
  let isPlaying = false;

  // === Track laden ===
  function loadTrack(index) {
    const track = playlist[index];
    playerAudio.src = track.src;
    coverArt.src = track.cover;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    progressBar.value = 0;
  }

  // === Play/Pause ===
  function togglePlay() {
    if (isPlaying) {
      playerAudio.pause();
      playPauseIcon.src = 'media/icons/play.png';
    } else {
      playerAudio.play().catch(() => {});
      playPauseIcon.src = 'media/icons/pause.png';
    }
    isPlaying = !isPlaying;
  }

  // === Navigation ===
  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playerAudio.play();
  }

  function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playerAudio.play();
  }

  // === Events Player ===
  playPauseBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', prevTrack);
  nextBtn.addEventListener('click', nextTrack);

  playerAudio.addEventListener('ended', () => {
    isPlaying = false;
    playPauseIcon.src = 'media/icons/play.png';
    nextTrack();
  });

  playerAudio.addEventListener('timeupdate', () => {
    if (playerAudio.duration) {
      progressBar.value = (playerAudio.currentTime / playerAudio.duration) * 100;
    }
  });

  progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * playerAudio.duration;
    playerAudio.currentTime = seekTime;
  });

  // === Hintergrundvideo laden ===
  bgVideo.src = 'media/video/Don Toliver - FWU [Official Music Video] - Don Toliver (1080p, h264, youtube).mp4';
  bgVideo.muted = true;

  // === Startscreen Klick ===
  startScreen.addEventListener('click', () => {
    startScreen.style.display = 'none';
    bgVideo.play().catch(() => {});
    playerAudio.play().then(() => {
      isPlaying = true;
      playPauseIcon.src = 'media/icons/pause.png';
    }).catch(() => {});

    if (volumeControl) volumeControl.classList.add('visible');
    if (musicPlayer) musicPlayer.classList.add('visible');
    if (customText) customText.classList.add('visible');
  });

  // === Lautstärke (Icon + Bar) ===
  const volumeTrack = volumeControl.querySelector('.volume-track');
  const volumeFill = document.getElementById('volumeFill');
  const volumeIcon = volumeControl.querySelector('.volume-icon');

  let isDragging = false;
  let masterVolume = 1;
  let lastVolume = 1;
  let isMuted = false;

  function setVolume(vol, fromUser = false, fromIconClick = false) {
    masterVolume = Math.max(0, Math.min(1, vol));
    volumeFill.style.width = `${masterVolume * 100}%`;
    playerAudio.volume = masterVolume;
    bgVideo.volume = masterVolume;

    // Icon automatisch nur, wenn von Bar oder automatischer Änderung
    if (!fromIconClick) {
      if (masterVolume === 0 && !isMuted) {
        isMuted = true;
        volumeIcon.src = 'media/icons/mute.png';
      } else if (masterVolume > 0 && isMuted) {
        isMuted = false;
        volumeIcon.src = 'media/icons/volume.png';
      }
    }

    // Bar benutzt → unmute
    if (fromUser && masterVolume > 0 && isMuted) {
      isMuted = false;
      volumeIcon.src = 'media/icons/volume.png';
    }
  }

  function getVolumeFromX(clientX) {
    const rect = volumeTrack.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  }

  function mute() {
    lastVolume = masterVolume || 1;
    isMuted = true;
    setVolume(0, false, true);
    volumeIcon.src = 'media/icons/mute.png';
  }

  function unmute() {
    isMuted = false;
    setVolume(lastVolume, false, true);
    volumeIcon.src = 'media/icons/volume.png';
  }

  volumeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted ? unmute() : mute();
  });

  // === Drag + Klick auf Bar ===
  volumeTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    setVolume(getVolumeFromX(e.clientX), true, false);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setVolume(getVolumeFromX(e.clientX), true, false);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch
  volumeTrack.addEventListener('touchstart', (e) => {
    setVolume(getVolumeFromX(e.touches[0].clientX), true, false);
  });

  // === Initialisierung ===
  loadTrack(currentTrackIndex);
  setVolume(1);

});
