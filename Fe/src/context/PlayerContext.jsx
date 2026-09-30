import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext();

// Helper untuk format URL backend — sinkron dengan api.js (VITE_API_URL) agar tidak 404/CORS localhost vs 127.0.0.1
export const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
  // Hilangkan /api suffix jika ada agar storage tetap di root
  const base = backendUrl.replace(/\/api\/?$/, '');
  const cleanPath = url.replace(/^\//, '');
  return cleanPath.startsWith('storage/') ? `${base}/${cleanPath}` : `${base}/storage/${cleanPath}`;
};

export const PlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const audioRef = useRef(new Audio());
  const currentTrack = playlist[currentIndex] || null;

  // Handle Next Track
  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;

    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      return;
    }

    if (isShuffle) {
      let randomIndex = Math.floor(Math.random() * playlist.length);
      while (randomIndex === currentIndex && playlist.length > 1) {
        randomIndex = Math.floor(Math.random() * playlist.length);
      }
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
    setIsPlaying(true);
  }, [playlist.length, isRepeat, isShuffle, currentIndex]);

  // Handle Prev Track
  const handlePrev = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

  // Audio Playback Sync Effect — hanya reload jika URL track berubah, bukan saat playlist ref berubah
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack) return;

    const rawAudioUrl = currentTrack.audio_url || currentTrack.url;
    const fullAudioUrl = getFullUrl(rawAudioUrl);

    // Bandingkan pathname agar tidak tertipu localhost vs 127.0.0.1 / encoded char
    let needLoad = false;
    try {
      const cur = audio.src ? new URL(audio.src).pathname : '';
      const nxt = fullAudioUrl ? new URL(fullAudioUrl).pathname : '';
      needLoad = cur !== nxt || !audio.src;
    } catch {
      needLoad = audio.src !== fullAudioUrl;
    }

    if (needLoad) {
      audio.src = fullAudioUrl;
      audio.load();
    }

    audio.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') console.error('Playback error:', err);
      });
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, isPlaying]); // sengaja tidak depend pada playlist/currentIndex agar tidak reset saat filter/search ubah array

  // Sinkron volume/mute terpisah agar tidak trigger load()
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Audio Event Listeners (Timeupdate, Metadata, DurationChange, Seeked)
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      // Jangan timpa currentTime saat user sedang drag/seeking (biar slider tidak jitter)
      if (!audio.seeking) setCurrentTime(audio.currentTime || 0);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handleSeeked = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('seeked', handleSeeked);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('seeked', handleSeeked);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleNext]);

  // Actions
  const playTrack = (trackList, index = 0) => {
    if (playlist[index]?.id === trackList[index]?.id && currentIndex === index && isPlaying) {
      togglePlay();
      return;
    }
    setPlaylist(trackList);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying((prev) => !prev);
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  const toggleRepeat = () => setIsRepeat((prev) => !prev);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      changeVolume(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const seek = (seconds) => {
    const audio = audioRef.current;
    if (!audio || isNaN(seconds) || !isFinite(seconds)) return;
    // Guard: jangan seek jika metadata belum siap / duration invalid
    const d = audio.duration;
    if (!d || !isFinite(d) || d <= 0) {
      // Jika duration belum ada, tetap clamp ke 0..seekable
      const clamped = Math.max(0, seconds);
      try { audio.currentTime = clamped; setCurrentTime(clamped); } catch {}
      return;
    }
    const clamped = Math.max(0, Math.min(seconds, d));
    try {
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    } catch (e) {
      console.warn('Seek gagal:', e);
    }
  };

  const changeVolume = (val) => {
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) audioRef.current.volume = val;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, // Mengirim objek track asli (tanpa merubah properti URL di sini agar tidak double wrap)
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        playTrack,
        togglePlay,
        toggleShuffle,
        toggleRepeat,
        toggleMute,
        handleNext,
        handlePrev,
        seek,
        changeVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);