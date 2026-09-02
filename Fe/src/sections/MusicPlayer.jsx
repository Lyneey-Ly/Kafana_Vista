import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    toggleMute,
    handleNext,
    handlePrev,
    seek,
    changeVolume,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!isSeeking && duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration, isSeeking]);

  if (!currentTrack) return null;
// Gantilah bagian handleSliderCommit dan handler slider di MusicPlayerBar:
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

  const formatTime = (time) => {
    if (!time || isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 text-white flex items-center justify-between z-50 shadow-2xl transition-all duration-300">
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        <div className="relative group cursor-pointer">
          <img
            src={currentTrack.cover_url || '/default-cover.png'}
            alt={currentTrack.title}
            className={`w-14 h-14 rounded-full shadow-lg object-cover ring-2 ring-emerald-500/30 transition-all duration-700 ${
              isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''
            }`}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Cover'; }}
          />
          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold hover:text-emerald-400 cursor-pointer truncate text-white transition-colors">
              {currentTrack.title || 'Unknown Title'}
            </h4>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 h-full animate-bounce"></span>
                <span className="w-0.5 bg-emerald-400 h-2/3 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-0.5 bg-emerald-400 h-4/5 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer truncate transition-colors">
            {currentTrack.artist || 'Unknown Artist'}
          </p>
        </div>

        <button 
          onClick={() => setIsLiked(!isLiked)} 
          className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
        >
          <svg className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-2 w-2/4 max-w-[650px]">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle} 
            className={`transition-all duration-200 cursor-pointer p-1 rounded-full hover:scale-110 ${
              isShuffle ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          </button>

          <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>

          <button 
            onClick={togglePlay} 
            className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-full p-3 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button onClick={handleNext} className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>

          <button 
            onClick={toggleRepeat} 
            className={`transition-all duration-200 cursor-pointer p-1 rounded-full hover:scale-110 ${
              isRepeat ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
          </button>
        </div>

        <div className="w-full flex items-center gap-3 text-xs text-zinc-400 font-medium">
          <span className="w-10 text-right font-mono">{formatTime(isSeeking ? (progress / 100) * duration : currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onMouseDown={() => setIsSeeking(true)}
              onTouchStart={() => setIsSeeking(true)}
              onChange={handleSliderChange}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              style={{
                background: `linear-gradient(to right, #10b981 ${progress}%, #3f3f46 ${progress}%)`
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 group-hover:h-2 transition-all"
            />
          </div>
          <span className="w-10 text-left font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="w-1/4 flex justify-end items-center gap-3 text-zinc-400">
        <button onClick={toggleMute} className="hover:text-white transition-colors cursor-pointer">
          {isMuted || volume === 0 ? (
            <svg className="w-5 h-5 fill-current text-rose-400" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #10b981 ${(isMuted ? 0 : volume) * 100}%, #3f3f46 ${(isMuted ? 0 : volume) * 100}%)`
          }}
          className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:h-2 transition-all"
        />
      </div>

    </div>
  );
}