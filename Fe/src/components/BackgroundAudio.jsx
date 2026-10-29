import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Single Audio Instance di luar komponen agar tidak hancur saat pindah page/route
let globalAudio = null;

export default function BackgroundAudio({ src = '/sounds/backsound.mp3' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Inisialisasi audio hanya sekali di tingkat global
    if (!globalAudio) {
      globalAudio = new Audio(src);
      globalAudio.loop = true;
    }

    // Sinkronkan state tombol dengan kondisi audio yang sedang berjalan
    setIsPlaying(!globalAudio.paused);

    // Listener untuk memperbarui UI tombol secara otomatis saat audio play/pause
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    globalAudio.addEventListener('play', handlePlay);
    globalAudio.addEventListener('pause', handlePause);

    return () => {
      globalAudio.removeEventListener('play', handlePlay);
      globalAudio.removeEventListener('pause', handlePause);
    };
  }, [src]);

  const toggleAudio = () => {
    if (!globalAudio) return;

    if (isPlaying) {
      globalAudio.pause();
    } else {
      globalAudio.play().catch((err) => {
        console.log('Autoplay ditahan browser / audio error:', err);
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tombol Melayang ON/OFF */}
      <button
        onClick={toggleAudio}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-md border cursor-pointer hover:scale-105 active:scale-95 ${
          isPlaying
            ? 'bg-[#261C19]/90 border-[#B38E5D] text-[#B38E5D] shadow-[#B38E5D]/30'
            : 'bg-[#261C19]/70 border-white/20 text-gray-400 hover:text-[#FAF5EF] hover:border-[#B38E5D]/50'
        }`}
        title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B38E5D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#B38E5D]"></span>
            </span>
            <Volume2 className="w-4 h-4 text-[#B38E5D] animate-bounce" />
            <span className="text-xs font-bold text-[#FAF5EF] tracking-wider uppercase">
              Musik ON
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
              Musik OFF
            </span>
          </>
        )}
      </button>
    </div>
  );
}