import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export default function MusicPlayerBar() {
  const { currentTrack, isPlaying, togglePlay, handleNext, handlePrev, currentTime, duration, seek } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Update posisi slider jika sedang tidak digeser oleh user
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime || 0);
    }
  }, [currentTime, isSeeking]);

  if (!currentTrack) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
// 1. Handler saat slider digeser
const handleSliderChange = (e) => {
  setProgress(Number(e.target.value));
};

// 2. Handler saat slider dilepas
const handleSliderCommit = () => {
  // Gunakan state 'progress' langsung, BUKAN e.target.value
  if (duration > 0 && !isNaN(progress)) {
    const targetTime = (progress / 100) * duration;
    seek(targetTime);
  }

  // Beri delay 200ms agar currentTime di Context sempat ter-update
  // sebelum useEffect diaktifkan kembali
  setTimeout(() => {
    setIsSeeking(false);
  }, 200);
};

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 px-6 py-3 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* INFORMASI LAGU */}
      <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
        <img
          src={currentTrack.cover_url || '/default-cover.png'}
          alt={currentTrack.title}
          className="w-12 h-12 rounded object-cover bg-zinc-800 flex-shrink-0"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Cover'; }}
        />
        <div className="truncate">
          <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
          <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* KONTROL PLAY & SLIDER PROGRESS BAR */}
      <div className="flex flex-col items-center gap-2 w-full md:w-2/4">
        <div className="flex items-center gap-5">
          <button
            onClick={handlePrev}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
            title="Lagu Sebelumnya"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition cursor-pointer shadow-lg shadow-emerald-500/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
            title="Lagu Selanjutnya"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Slider Detik / Seekbar */}
        <div className="flex items-center gap-3 w-full text-xs text-zinc-400">
          <span>{formatTime(isSeeking ? seekValue : currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration && duration > 0 ? duration : 100}
            value={seekValue}
            onMouseDown={() => setIsSeeking(true)}
            onTouchStart={() => setIsSeeking(true)}
            onChange={handleSliderChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* ICON VOLUME */}
      <div className="hidden md:flex items-center justify-end w-1/4 gap-2 text-zinc-400">
        <Volume2 size={30} />
      </div>

    </div>
  );
}