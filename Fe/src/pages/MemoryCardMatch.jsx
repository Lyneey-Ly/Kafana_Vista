import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Timer as TimerIcon, 
  Sparkles, 
  Brain, 
  Zap 
} from 'lucide-react';

const KOST_ICONS = [
  { icon: '🍕', label: 'Pizza Promo' },
  { icon: '🍜', label: 'Mie Instan' },
  { icon: '☕', label: 'Kopi Hitam' },
  { icon: '🏠', label: 'Kamar Kost' },
  { icon: '🔑', label: 'Kunci Kamar' },
  { icon: '🍳', label: 'Telur Ceplok' },
  { icon: '🛵', label: 'Motor Ojol' },
  { icon: '🛏️', label: 'Kasur Empuk' }
];

export default function MemoryCardMatch() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  const timerRef = useRef(null);

  // LOGIKA SHUFFLE DENGAN ANIMASI TRANSISI
  const handleShuffle = useCallback(() => {
    if (isShuffling) return;

    // 1. Kunci grid & tutup semua kartu terlebih dahulu
    setIsShuffling(true);
    setIsLocked(true);
    setFlippedCards([]);

    // 2. Delay singkat agar animasi kartu mengecil/runtuh selesai (350ms)
    setTimeout(() => {
      const duplicatedIcons = [...KOST_ICONS, ...KOST_ICONS];
      const shuffled = duplicatedIcons
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          id: index,
          pairId: item.label,
          icon: item.icon,
          label: item.label
        }));

      setCards(shuffled);
      setMatchedCards([]);
      setMoves(0);
      setTimer(0);
      setIsTimerRunning(false);
      setIsVictoryModalOpen(false);

      if (timerRef.current) clearInterval(timerRef.current);

      // 3. Kembalikan kartu ke posisi normal
      setTimeout(() => {
        setIsShuffling(false);
        setIsLocked(false);
      }, 300);
    }, 350);
  }, [isShuffling]);

  useEffect(() => {
    handleShuffle();
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardClick = (index) => {
    if (
      isLocked || 
      isShuffling ||
      flippedCards.includes(index) || 
      matchedCards.includes(cards[index].id)
    ) {
      return;
    }

    if (!isTimerRunning && matchedCards.length < cards.length) {
      setIsTimerRunning(true);
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        const newMatched = [...matchedCards, firstCard.id, secondCard.id];
        setMatchedCards(newMatched);
        setFlippedCards([]);
        setIsLocked(false);

        if (newMatched.length === cards.length) {
          setIsTimerRunning(false);
          setTimeout(() => {
            setIsVictoryModalOpen(true);
          }, 600);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const getPerformanceRating = () => {
    if (moves <= 12) return { stars: '⭐⭐⭐', grade: 'Otak Jenius S3 Anak Kost!' };
    if (moves <= 20) return { stars: '⭐⭐', grade: 'Cukup Hemat Daya Ingat!' };
    return { stars: '⭐', grade: 'Butuh Asupan Kopi Tambahan!' };
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Brain className="w-4 h-4 text-[#C5A059]" />
            <span>Mini Game Interaktif • Kafana Vista</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#261C19]">
            Asah Otak <span className="text-[#C5A059]">Anak Kost</span>
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-md mx-auto">
            Temukan 8 pasang ikon kehidupan kost sebelum daya ingat hilang di tanggal tua!
          </p>
        </div>

        {/* DASHBOARD STATISTIK GAME */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-4 md:p-6 rounded-3xl border border-[#C5A059]/30 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FAF6F0]/10 rounded-2xl border border-white/10 text-[#C5A059]">
              <TimerIcon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Durasi
              </span>
              <span className="text-lg md:text-2xl font-black text-[#FAF6F0] font-mono">
                {formatTime(timer)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FAF6F0]/10 rounded-2xl border border-white/10 text-[#C5A059]">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Langkah
              </span>
              <span className="text-lg md:text-2xl font-black text-[#C5A059] font-mono">
                {moves} <span className="text-xs text-slate-400 font-sans">Kali</span>
              </span>
            </div>
          </div>

          {/* TOMBOL ACAK DENGAN ANIMASI SPIN */}
          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold transition shadow-md cursor-pointer shrink-0 disabled:opacity-70"
          >
            <RotateCcw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isShuffling ? 'Mengacak...' : 'Acak Kartu'}
            </span>
          </button>
        </div>

        {/* GAME GRID (4x4 = 16 KARTU) */}
        <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-lg mx-auto aspect-square">
          {cards.map((card, index) => {
            const isFlipped = flippedCards.includes(index) || matchedCards.includes(card.id);
            const isMatched = matchedCards.includes(card.id);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                style={{
                  transitionDelay: isShuffling ? `${(index % 4) * 40}ms` : '0ms'
                }}
                className={`w-full h-full cursor-pointer [perspective:1000px] transition-all duration-300 transform ${
                  isShuffling 
                    ? 'scale-0 rotate-180 opacity-0' 
                    : 'scale-100 rotate-0 opacity-100'
                }`}
              >
                <div
                  className={`relative w-full h-full rounded-2xl md:rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-md ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  <div className="absolute inset-0 w-full h-full bg-[#261C19] border-2 border-[#C5A059]/40 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-2 [backface-visibility:hidden] hover:border-[#C5A059] transition-colors">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-[#C5A059]/30 flex items-center justify-center bg-[#C5A059]/10">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#C5A059]" />
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 w-full h-full bg-white border-2 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      isMatched 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-emerald-200 shadow-inner' 
                        : 'border-[#C5A059]'
                    }`}
                  >
                    <span className="text-3xl md:text-5xl select-none transform hover:scale-110 transition-transform">
                      {card.icon}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-extrabold text-[#261C19] mt-1 text-center truncate w-full px-1">
                      {card.label}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL REWARD KEMENANGAN */}
      {isVictoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border border-[#C5A059]/50 text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#C5A059]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 bg-[#C5A059]/20 border border-[#C5A059] text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#C5A059]">
                Kemenangan Mutlak!
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                Memori Anak Kost Juara
              </h3>
              <p className="text-xs text-slate-300">
                {getPerformanceRating().grade}
              </p>
              <div className="text-lg pt-1">{getPerformanceRating().stars}</div>
            </div>

            <div className="bg-[#1A1311] border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Durasi</span>
                <span className="text-lg font-black text-[#C5A059] font-mono">{formatTime(timer)}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Percobaan</span>
                <span className="text-lg font-black text-[#C5A059] font-mono">{moves} Langkah</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className="w-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                {isShuffling ? 'Mengacak...' : 'Main Lagi / Acak Kartu'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}