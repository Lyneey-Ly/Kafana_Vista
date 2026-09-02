import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Gamepad2, 
  Zap, 
  Volume2, 
  VolumeX, 
  Brain, 
  Sparkles,
  Award
} from 'lucide-react';

// KONFIGURASI 4 TOMBOL WARNA DAN FREKUENSI NADA (Hz)
const BUTTON_CONFIG = [
  {
    id: 'gold',
    label: 'Emas',
    bg: 'bg-[#C5A059]',
    activeBg: 'bg-[#f0c87d]',
    glow: 'shadow-[0_0_35px_#C5A059]',
    border: 'border-[#C5A059]',
    freq: 523.25 // Nada C5
  },
  {
    id: 'green',
    label: 'Hijau',
    bg: 'bg-[#10B981]',
    activeBg: 'bg-[#34D399]',
    glow: 'shadow-[0_0_35px_#10B981]',
    border: 'border-[#10B981]',
    freq: 261.63 // Nada C4
  },
  {
    id: 'red',
    label: 'Merah',
    bg: 'bg-[#E11D48]',
    activeBg: 'bg-[#F43F5E]',
    glow: 'shadow-[0_0_35px_#E11D48]',
    border: 'border-[#E11D48]',
    freq: 329.63 // Nada E4
  },
  {
    id: 'blue',
    label: 'Biru',
    bg: 'bg-[#3B82F6]',
    activeBg: 'bg-[#60A5FA]',
    glow: 'shadow-[0_0_35px_#3B82F6]',
    border: 'border-[#3B82F6]',
    freq: 392.00 // Nada G4
  }
];

export default function SimonSays() {
  // STATE PERMAINAN
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('simon_says_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [activeButton, setActiveButton] = useState(null);
  const [isDisplayingSequence, setIsDisplayingSequence] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // AUDIO CONTEXT REF (WEB AUDIO API)
  const audioCtxRef = useRef(null);

  // INISIALISASI WEB AUDIO API
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // FUNGSI MEMBUNYIKAN SUARA NADA SYNTHESIZER
  const playTone = useCallback((frequency, duration = 300, type = 'sine') => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.error("Audio error:", e);
    }
  }, [getAudioContext, isMuted]);

  // NADA NING NONG / WRONG TONE SAAT GAME OVER
  const playErrorSound = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio error:", e);
    }
  }, [getAudioContext, isMuted]);

  // DEMONSTRASI URUTAN WARNA OLEH KOMPUTER
  const playSequence = useCallback((currentSequence) => {
    setIsDisplayingSequence(true);
    setPlayerStep(0);

    // Hitung kecepatan berdasarkan ronde (semakin tinggi ronde, interval semakin cepat 600ms -> 200ms)
    const flashDuration = Math.max(200, 500 - currentSequence.length * 20);
    const gapDuration = Math.max(100, 250 - currentSequence.length * 10);

    currentSequence.forEach((buttonIndex, index) => {
      const delay = index * (flashDuration + gapDuration) + 500;

      setTimeout(() => {
        const config = BUTTON_CONFIG[buttonIndex];
        setActiveButton(config.id);
        playTone(config.freq, flashDuration);

        setTimeout(() => {
          setActiveButton(null);
          // Jika sudah di urutan terakhir, buka giliran pemain
          if (index === currentSequence.length - 1) {
            setTimeout(() => {
              setIsDisplayingSequence(false);
            }, gapDuration);
          }
        }, flashDuration);
      }, delay);
    });
  }, [playTone]);

  // MEMULAI PERMAINAN / LEVEL BARU
  const startNewGame = () => {
    getAudioContext();
    const firstColorIndex = Math.floor(Math.random() * 4);
    const newSeq = [firstColorIndex];

    setSequence(newSeq);
    setRound(1);
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);

    playSequence(newSeq);
  };

  // KONTROL INPUT KLIK PEMAIN
  const handleButtonClick = (buttonIndex) => {
    if (isDisplayingSequence || isGameOver || !isStarted) return;

    getAudioContext();
    const config = BUTTON_CONFIG[buttonIndex];

    // Animasi tekan tombol & bunyi
    setActiveButton(config.id);
    playTone(config.freq, 250);

    setTimeout(() => {
      setActiveButton(null);
    }, 200);

    // Cek apakah tombol yang ditekan sesuai urutan
    if (buttonIndex === sequence[playerStep]) {
      const nextStep = playerStep + 1;

      // Pemain berhasil menyelesaikan seluruh urutan di ronde ini
      if (nextStep === sequence.length) {
        const newScore = score + 10;
        const newRound = round + 1;
        setScore(newScore);
        setRound(newRound);

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('simon_says_highscore', newScore.toString());
        }

        // Tambahkan 1 warna acak baru untuk ronde berikutnya
        const nextColorIndex = Math.floor(Math.random() * 4);
        const nextSequence = [...sequence, nextColorIndex];
        setSequence(nextSequence);

        // Beri jeda sebentar sebelum komputer mendemonstrasikan urutan berikutnya
        setTimeout(() => {
          playSequence(nextSequence);
        }, 800);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // PERMAINAN BERAKHIR (SALAH MENGINGAT WARNA)
      playErrorSound();
      setIsGameOver(true);
      setIsStarted(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6">

        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Brain className="w-4 h-4 text-[#C5A059]" />
            <span>Mini Game Memori • Kafana Vista</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#261C19]">
            Simon Says <span className="text-[#C5A059]">Anak Kost</span>
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-md mx-auto">
            Uji dan pertajam daya ingat visual warna kamu sebelum tanggal tua melanda!
          </p>
        </div>

        {/* STATISTIK DASHBOARD */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-4 md:p-6 rounded-3xl border border-[#C5A059]/30 shadow-xl flex items-center justify-between gap-2">
          
          {/* SKOR & RONDE */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FAF6F0]/10 rounded-2xl border border-white/10 text-[#C5A059]">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Ronde / Skor
              </span>
              <span className="text-lg md:text-2xl font-black text-[#FAF6F0] font-mono">
                R{round} <span className="text-[#C5A059] text-base font-sans">({score} Poin)</span>
              </span>
            </div>
          </div>

          {/* HIGH SCORE */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FAF6F0]/10 rounded-2xl border border-white/10 text-[#C5A059]">
              <Trophy className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Rekor Tertinggi
              </span>
              <span className="text-lg md:text-2xl font-black text-[#C5A059] font-mono">
                {highScore}
              </span>
            </div>
          </div>

          {/* TOMBOL MUTE AUDIO */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-[#1A1311] hover:bg-[#322521] text-[#C5A059] rounded-2xl border border-slate-800 transition cursor-pointer"
            title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* AREA MAIN GAME: CIRCULAR / QUADRANT SIMON PADS */}
        <div className="relative w-full aspect-square max-w-[380px] mx-auto p-4 bg-[#261C19] rounded-full border-4 border-[#C5A059]/40 shadow-2xl flex items-center justify-center">
          
          {/* GRID 4 PAD UTAMA */}
          <div className="grid grid-cols-2 gap-3.5 w-full h-full p-2">
            {BUTTON_CONFIG.map((btn, idx) => {
              const isActive = activeButton === btn.id;

              return (
                <button
                  key={btn.id}
                  disabled={isDisplayingSequence || !isStarted || isGameOver}
                  onClick={() => handleButtonClick(idx)}
                  className={`w-full h-full border-4 rounded-3xl transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${
                    btn.border
                  } ${
                    isActive 
                      ? `${btn.activeBg} ${btn.glow} scale-95 border-white z-10` 
                      : `${btn.bg} opacity-80 hover:opacity-100 hover:scale-[1.02]`
                  }`}
                />
              );
            })}
          </div>

          {/* BADGE CENTRAL STATUS & CONTROLLER */}
          <div className="absolute inset-0 m-auto w-32 h-32 md:w-36 md:h-36 bg-[#1A1311] border-4 border-[#261C19] rounded-full shadow-2xl flex flex-col items-center justify-center p-2 text-center z-20">
            {!isStarted ? (
              <button
                onClick={startNewGame}
                className="w-full h-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] rounded-full font-black text-xs md:text-sm flex flex-col items-center justify-center gap-1 transition shadow-lg cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Mulai</span>
              </button>
            ) : isDisplayingSequence ? (
              <div className="space-y-1 animate-pulse">
                <Sparkles className="w-6 h-6 text-[#C5A059] mx-auto" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A059] block">
                  Simak Pola...
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <Gamepad2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  Giliranmu!
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">
                  {playerStep}/{sequence.length} Langkah
                </span>
              </div>
            )}
          </div>

        </div>

        {/* HINT CARA BERMAIN */}
        <div className="bg-[#261C19] text-slate-300 p-4 rounded-2xl border border-slate-800 text-xs text-center space-y-1">
          <p className="font-bold text-[#C5A059]">💡 Cara Bermain:</p>
          <p className="leading-relaxed">
            Perhatikan urutan nyala tombol warna, lalu tirukan urutannya secara tepat. Setiap ronde sukses, panjang urutan warna akan bertambah!
          </p>
        </div>

      </div>

      {/* MODAL OVERLAY GAME OVER */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border-2 border-[#C5A059]/50 text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500 text-rose-500 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                Salah Ingat Warna!
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                Game Over
              </h3>
              <p className="text-xs text-slate-300">
                Memori ingatanmu terhenti di ronde ke-{round}. Coba tingkatkan konsentrasi lagi!
              </p>
            </div>

            {/* STATISTIK AKHIR */}
            <div className="bg-[#1A1311] border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Skor Akhir</span>
                <span className="text-xl font-black text-[#C5A059] font-mono">{score} Poin</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Rekor Tertinggi</span>
                <span className="text-xl font-black text-[#C5A059] font-mono">{highScore} Poin</span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={startNewGame}
              className="w-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3.5 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Coba Lagi
            </button>

          </div>
        </div>
      )}

    </div>
  );
}