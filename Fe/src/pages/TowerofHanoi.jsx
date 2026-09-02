import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers, 
  Settings, 
  FastForward, 
  Undo2, 
  Redo2, 
  Award, 
  BookOpen, 
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// KONFIGURASI TEMA VISUAL
const THEMES = {
  kafana: {
    id: 'kafana',
    name: 'Kafana Gold & Charcoal',
    bg: 'bg-[#FAF6F0]',
    cardBg: 'bg-[#261C19]',
    cardText: 'text-[#FAF6F0]',
    accent: 'bg-[#C5A059]',
    accentText: 'text-[#C5A059]',
    accentBorder: 'border-[#C5A059]',
    pegBg: 'bg-[#C5A059]/30',
    pegPole: 'bg-[#C5A059]',
    diskGradients: [
      'from-[#D4AF37] to-[#AA7C11]',
      'from-[#E6C280] to-[#C5A059]',
      'from-[#B8860B] to-[#8B6508]',
      'from-[#FFD700] to-[#DAA520]',
      'from-[#F0E68C] to-[#BDB76B]',
      'from-[#CD853F] to-[#8B4513]',
      'from-[#D2B48C] to-[#A0522D]',
      'from-[#F5DEB3] to-[#CD853F]',
    ]
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bg: 'bg-[#0D0F18]',
    cardBg: 'bg-[#16192B]',
    cardText: 'text-[#00F0FF]',
    accent: 'bg-[#FF007F]',
    accentText: 'text-[#FF007F]',
    accentBorder: 'border-[#FF007F]',
    pegBg: 'bg-[#00F0FF]/20',
    pegPole: 'bg-[#00F0FF]',
    diskGradients: [
      'from-[#FF007F] to-[#7900FF]',
      'from-[#00F0FF] to-[#0047FF]',
      'from-[#39FF14] to-[#008000]',
      'from-[#FFE600] to-[#FF5500]',
      'from-[#BF00FF] to-[#4B0082]',
      'from-[#FF003C] to-[#990000]',
      'from-[#00FFFF] to-[#008B8B]',
      'from-[#FF1493] to-[#C71585]',
    ]
  },
  rustic: {
    id: 'rustic',
    name: 'Retro Rustic Wood',
    bg: 'bg-[#2D221E]',
    cardBg: 'bg-[#3E2F28]',
    cardText: 'text-[#E8D8C8]',
    accent: 'bg-[#D4A373]',
    accentText: 'text-[#D4A373]',
    accentBorder: 'border-[#D4A373]',
    pegBg: 'bg-[#D4A373]/20',
    pegPole: 'bg-[#D4A373]',
    diskGradients: [
      'from-[#A3B18A] to-[#588157]',
      'from-[#D4A373] to-[#A3704C]',
      'from-[#E9C46A] to-[#F4A261]',
      'from-[#E76F51] to-[#264653]',
      'from-[#CCD5AE] to-[#E9EDC9]',
      'from-[#FAEDCD] to-[#D4A373]',
      'from-[#BC6C25] to-[#283618]',
      'from-[#8D5B4C] to-[#5C3D2E]',
    ]
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    bg: 'bg-[#0A0A0A]',
    cardBg: 'bg-[#171717]',
    cardText: 'text-[#E5E5E5]',
    accent: 'bg-[#E5E5E5]',
    accentText: 'text-[#E5E5E5]',
    accentBorder: 'border-[#E5E5E5]',
    pegBg: 'bg-[#E5E5E5]/20',
    pegPole: 'bg-[#E5E5E5]',
    diskGradients: [
      'from-[#FFFFFF] to-[#A3A3A3]',
      'from-[#E5E5E5] to-[#737373]',
      'from-[#D4D4D4] to-[#525252]',
      'from-[#A3A3A3] to-[#404040]',
      'from-[#8C8C8C] to-[#262626]',
      'from-[#737373] to-[#171717]',
      'from-[#525252] to-[#0A0A0A]',
      'from-[#404040] to-[#000000]',
    ]
  }
};

export default function TowerOfHanoi() {
  // STATE KONFIGURASI GAME & TEMA
  const [diskCount, setDiskCount] = useState(3);
  const [themeKey, setThemeKey] = useState('kafana');
  const [isMuted, setIsMuted] = useState(false);
  const theme = THEMES[themeKey];

  // STATE STRUKTUR DATA STACK (LIFO)
  const [pegs, setPegs] = useState({ A: [], B: [], C: [] });
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // STATE UNDO / REDO STACKS
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // STATE BOT AUTOPILOT (REKURSIF)
  const [isBotActive, setIsBotActive] = useState(false);
  const [isBotPaused, setIsBotPaused] = useState(false);
  const [botSpeed, setBotSpeed] = useState(400); // ms
  const [botQueue, setBotQueue] = useState([]);

  // STATE MODAL & ERROR FEEDBACK
  const [activeModal, setActiveModal] = useState(null); // 'edu' | 'victory' | 'settings' | null
  const [errorMessage, setErrorMessage] = useState(null);
  const [stats, setStats] = useState({});

  // REFS
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  // MINIMUM MOVES FORMULA: 2^n - 1
  const minMoves = Math.pow(2, diskCount) - 1;

  // WEB AUDIO API SYNTHESIZER
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'lift') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'drop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(392, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.12);
          noteGain.gain.setValueAtTime(0.2, now + idx * 0.12);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
          
          noteOsc.start(now + idx * 0.12);
          noteOsc.stop(now + idx * 0.12 + 0.3);
        });
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  }, [getAudioContext, isMuted]);

  // LOAD LOCAL STORAGE STATS
  useEffect(() => {
    const savedStats = localStorage.getItem('hanoi_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }
  }, []);

  // INISIALISASI GAME STATE
  const initializeGame = useCallback((count = diskCount) => {
    // Top of stack is at the end of the array (LIFO)
    // Disk size represented by numbers 1..N (N is largest)
    const initialStack = Array.from({ length: count }, (_, i) => count - i);
    
    setPegs({
      A: initialStack,
      B: [],
      C: []
    });
    setSelectedPeg(null);
    setMoves(0);
    setTimer(0);
    setIsTimerRunning(false);
    setIsVictory(false);
    setUndoStack([]);
    setRedoStack([]);
    setIsBotActive(false);
    setIsBotPaused(false);
    setBotQueue([]);
    setErrorMessage(null);
    setActiveModal(null);

    if (timerRef.current) clearInterval(timerRef.current);
  }, [diskCount]);

  useEffect(() => {
    initializeGame(diskCount);
  }, [diskCount, initializeGame]);

  // TIMER HANDLER
  useEffect(() => {
    if (isTimerRunning && !isVictory && !isBotPaused) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, isVictory, isBotPaused]);

  // FORMATTER WAKTU (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // TRIGGER ERROR FEEDBACK
  const triggerError = (msg) => {
    playSound('error');
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 2000);
  };

  // EKSEKUSI PERPINDAHAN STACK (LIFO POP -> PUSH)
  const executeMove = useCallback((fromPeg, toPeg, isBot = false) => {
    if (fromPeg === toPeg) {
      setSelectedPeg(null);
      return false;
    }

    const sourceStack = [...pegs[fromPeg]];
    const targetStack = [...pegs[toPeg]];

    if (sourceStack.length === 0) {
      triggerError(`Tiang ${fromPeg} kosong! Tidak ada cakram untuk diambil.`);
      setSelectedPeg(null);
      return false;
    }

    // PEEK top of stacks
    const diskToMove = sourceStack[sourceStack.length - 1]; // POP item
    const topTargetDisk = targetStack[targetStack.length - 1]; // PEEK item

    // VALIDASI UKURAN: LIFO & Rule Tower of Hanoi
    if (topTargetDisk !== undefined && diskToMove > topTargetDisk) {
      triggerError(`Aturan Dilanggar! Cakram ${diskToMove} lebih besar dari Cakram ${topTargetDisk}.`);
      setSelectedPeg(null);
      return false;
    }

    // PUSH & POP OPERASI STACK
    sourceStack.pop();
    targetStack.push(diskToMove);

    // CATAT HISTORI UNTUK UNDO
    if (!isBot) {
      setUndoStack((prev) => [...prev, { pegsSnapshot: pegs, movesSnapshot: moves }]);
      setRedoStack([]);
    }

    const newPegs = {
      ...pegs,
      [fromPeg]: sourceStack,
      [toPeg]: targetStack
    };

    setPegs(newPegs);
    setMoves((prev) => prev + 1);
    setSelectedPeg(null);
    playSound('drop');

    if (!isTimerRunning && !isBot) {
      setIsTimerRunning(true);
    }

    // CEK KONDISI KEMENANGAN (Semua cakram pindah ke Tiang C)
    if (targetStack.length === diskCount && toPeg === 'C') {
      setIsVictory(true);
      setIsTimerRunning(false);
      setIsBotActive(false);
      playSound('victory');

      // SIMPAN REKOR TERBAIK
      const currentDiskKey = `disk_${diskCount}`;
      const existingRecord = stats[currentDiskKey];
      
      if (!existingRecord || moves + 1 < existingRecord.moves || (moves + 1 === existingRecord.moves && timer < existingRecord.time)) {
        const newStats = {
          ...stats,
          [currentDiskKey]: { moves: moves + 1, time: timer }
        };
        setStats(newStats);
        localStorage.setItem('hanoi_stats', JSON.stringify(newStats));
      }

      setTimeout(() => setActiveModal('victory'), 500);
    }

    return true;
  }, [pegs, moves, isTimerRunning, diskCount, playSound, stats, timer]);

  // HANDLE SELEKSI CLICK / TAP TIANG
  const handlePegClick = (pegKey) => {
    if (isVictory || isBotActive) return;

    if (!selectedPeg) {
      // Step 1: Ambil Cakram dari Tiang Asal
      if (pegs[pegKey].length === 0) {
        triggerError(`Tiang ${pegKey} kosong!`);
        return;
      }
      setSelectedPeg(pegKey);
      playSound('lift');
    } else {
      // Step 2: Letakkan Cakram ke Tiang Tujuan
      executeMove(selectedPeg, pegKey);
    }
  };

  // HANDLER UNDO & REDO
  const handleUndo = () => {
    if (undoStack.length === 0 || isVictory || isBotActive) return;

    const lastState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, { pegsSnapshot: pegs, movesSnapshot: moves }]);
    setPegs(lastState.pegsSnapshot);
    setMoves(lastState.movesSnapshot);
    setUndoStack((prev) => prev.slice(0, -1));
    setSelectedPeg(null);
    playSound('lift');
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || isVictory || isBotActive) return;

    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, { pegsSnapshot: pegs, movesSnapshot: moves }]);
    setPegs(nextState.pegsSnapshot);
    setMoves(nextState.movesSnapshot);
    setRedoStack((prev) => prev.slice(0, -1));
    setSelectedPeg(null);
    playSound('drop');
  };

  // DRAG & DROP HANDLERS (NATIVE HTML5)
  const handleDragStart = (e, pegKey) => {
    if (isVictory || isBotActive) return;
    e.dataTransfer.setData('sourcePeg', pegKey);
    setSelectedPeg(pegKey);
    playSound('lift');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPegKey) => {
    e.preventDefault();
    const sourcePegKey = e.dataTransfer.getData('sourcePeg');
    if (sourcePegKey) {
      executeMove(sourcePegKey, targetPegKey);
    }
  };

  // BOT AUTOPILOT - ALGORITMA REKURSIF HANOI O(2^n - 1)
  const generateHanoiMoves = (n, source, target, auxiliary, moveList = []) => {
    if (n > 0) {
      generateHanoiMoves(n - 1, source, auxiliary, target, moveList);
      moveList.push({ from: source, to: target });
      generateHanoiMoves(n - 1, auxiliary, target, source, moveList);
    }
    return moveList;
  };

  const startAutoSolver = () => {
    initializeGame(diskCount);
    const movesSequence = generateHanoiMoves(diskCount, 'A', 'C', 'B');
    setBotQueue(movesSequence);
    setIsBotActive(true);
    setIsBotPaused(false);
    setIsTimerRunning(true);
  };

  // EKSEKUSI BOT TIMER LOOP
  useEffect(() => {
    if (!isBotActive || isBotPaused || botQueue.length === 0) return;

    const botTimer = setTimeout(() => {
      const nextMove = botQueue[0];
      executeMove(nextMove.from, nextMove.to, true);
      setBotQueue((prev) => prev.slice(1));
    }, botSpeed);

    return () => clearTimeout(botTimer);
  }, [isBotActive, isBotPaused, botQueue, botSpeed, executeMove]);

  // HITUNG RATING BINTANG KEMENANGAN
  const getStarRating = () => {
    if (moves === minMoves) return { stars: '⭐⭐⭐', label: 'Sempurna! Algoritma Optimal' };
    if (moves <= Math.floor(minMoves * 1.5)) return { stars: '⭐⭐', label: 'Sangat Baik! Efisien' };
    return { stars: '⭐', label: 'Berhasil! Tingkatkan Efisiensi' };
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500 font-sans p-4 md:p-8 flex flex-col items-center justify-between`}>
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* HEADER & TOP NAVBAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-700/30 pb-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className={`p-3 rounded-2xl ${theme.cardBg} ${theme.accentText} border ${theme.accentBorder} shadow-lg`}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xs font-black uppercase tracking-widest ${theme.accentText}`}>
                Struktur Data & Game Edukasi
              </span>
              <h1 className={`text-2xl md:text-3xl font-black ${theme.cardText} tracking-tight`}>
                Menara Hanoi <span className={theme.accentText}>(Stack LIFO)</span>
              </h1>
            </div>
          </div>

          {/* UTILITY BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('edu')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold ${theme.cardBg} ${theme.cardText} border ${theme.accentBorder}/40 hover:border-amber-500 transition cursor-pointer shadow-md`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Konsep Stack</span>
            </button>

            <button
              onClick={() => setActiveModal('settings')}
              className={`p-2.5 rounded-xl ${theme.cardBg} ${theme.cardText} border ${theme.accentBorder}/40 hover:border-amber-500 transition cursor-pointer shadow-md`}
              title="Pengaturan Tema & Disk"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl ${theme.cardBg} ${theme.cardText} border ${theme.accentBorder}/40 hover:border-amber-500 transition cursor-pointer shadow-md`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* DASHBOARD KONTROL & STATISTIK */}
        <div className={`p-4 md:p-6 rounded-3xl ${theme.cardBg} border ${theme.accentBorder}/30 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-4 items-center`}>
          
          {/* JUMLAH CAKRAM */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Jumlah Cakram
            </span>
            <div className="flex items-center gap-2">
              <select
                value={diskCount}
                disabled={isBotActive || moves > 0}
                onChange={(e) => setDiskCount(Number(e.target.value))}
                className={`bg-black/30 text-white font-mono font-bold text-sm px-3 py-1.5 rounded-xl border border-gray-700 focus:outline-none disabled:opacity-50 cursor-pointer`}
              >
                {[3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num} className="bg-gray-900 text-white">
                    {num} Cakram
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKOR LANGKAH & IDEAL */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Langkah / Min Ideal
            </span>
            <div className="text-lg md:text-xl font-black font-mono">
              <span className={theme.accentText}>{moves}</span>
              <span className="text-gray-500 text-sm"> / {minMoves}</span>
            </div>
          </div>

          {/* TIMER DURASI */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Durasi Waktu
            </span>
            <div className="text-lg md:text-xl font-black font-mono text-white">
              {formatTime(timer)}
            </div>
          </div>

          {/* UNDO / REDO / RESET ACTION */}
          <div className="flex items-center justify-end gap-1.5 col-span-2 md:col-span-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0 || isBotActive || isVictory}
              className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-white transition cursor-pointer"
              title="Undo Move (Pop State)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0 || isBotActive || isVictory}
              className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-white transition cursor-pointer"
              title="Redo Move (Push State)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => initializeGame(diskCount)}
              className={`flex items-center gap-1.5 px-3 py-2 ${theme.accent} text-black font-extrabold text-xs rounded-xl shadow-md transition hover:opacity-90 cursor-pointer`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

        </div>

        {/* PANEL AUTOPILOT BOT (REKURSIF) */}
        <div className={`p-3 md:p-4 rounded-2xl ${theme.cardBg}/80 border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">Auto-Solver Bot (Algoritma Rekursif):</span>
          </div>

          <div className="flex items-center gap-3">
            {!isBotActive ? (
              <button
                onClick={startAutoSolver}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Jalankan Bot
              </button>
            ) : (
              <button
                onClick={() => setIsBotPaused(!isBotPaused)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm"
              >
                {isBotPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                {isBotPaused ? 'Lanjut Bot' : 'Jeda Bot'}
              </button>
            )}

            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-gray-800">
              <FastForward className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] text-gray-400 font-extrabold">KECEPATAN:</span>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={1100 - botSpeed}
                onChange={(e) => setBotSpeed(1100 - Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* NOTIFIKASI ERROR VALIDASI ATURAN */}
        {errorMessage && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* BOARD AREA: 3 STACK PEGS (A, B, C) */}
        <div className={`relative w-full h-[360px] md:h-[420px] rounded-3xl ${theme.cardBg} border-2 ${theme.accentBorder}/30 shadow-2xl p-4 md:p-6 flex items-end justify-between gap-2 md:gap-6 overflow-hidden`}>
          
          {['A', 'B', 'C'].map((pegKey) => {
            const stack = pegs[pegKey];
            const isSelected = selectedPeg === pegKey;
            const topDiskSize = stack.length > 0 ? stack[stack.length - 1] : null;

            return (
              <div
                key={pegKey}
                onClick={() => handlePegClick(pegKey)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, pegKey)}
                className={`relative flex-1 h-full flex flex-col items-center justify-end rounded-2xl transition-all cursor-pointer p-2 ${
                  isSelected 
                    ? 'bg-amber-500/10 border-2 border-dashed border-amber-400' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* LABEL PEAG / STACK HEADER */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-gray-700/50 text-[11px] font-black font-mono">
                  <span className={theme.accentText}>Tiang {pegKey}</span>
                  <span className="text-gray-500">
                    ({stack.length > 0 ? `Top: #${topDiskSize}` : 'Empty'})
                  </span>
                </div>

                {/* TIANG VERTIKAL */}
                <div className={`absolute bottom-6 w-3 md:w-4 rounded-t-full ${theme.pegPole} opacity-80 h-[240px] md:h-[280px] shadow-md`} />

                {/* ALAS TIANG (PEG BASE) */}
                <div className={`w-full h-4 rounded-xl ${theme.pegPole} z-10 shadow-lg mb-1`} />

                {/* TUMPUKAN CAKRAM STACK (LIFO: Render dari bawah ke atas) */}
                <div className="w-full flex flex-col-reverse items-center gap-1 z-20 pb-4">
                  {stack.map((diskSize, index) => {
                    const isTopDisk = index === stack.length - 1;
                    const widthPercent = 30 + (diskSize / diskCount) * 65; // Dynamic width
                    const gradientClass = theme.diskGradients[(diskSize - 1) % theme.diskGradients.length];

                    return (
                      <div
                        key={`${diskSize}-${index}`}
                        draggable={isTopDisk && !isVictory && !isBotActive}
                        onDragStart={(e) => isTopDisk && handleDragStart(e, pegKey)}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-7 md:h-9 rounded-xl bg-gradient-to-r ${gradientClass} border border-white/20 shadow-lg flex items-center justify-center font-mono font-black text-xs text-black/80 transition-all duration-300 ${
                          isTopDisk ? 'cursor-grab active:cursor-grabbing hover:brightness-110 shadow-amber-500/20 shadow-md ring-2 ring-white/30' : 'opacity-90'
                        } ${isSelected && isTopDisk ? '-translate-y-3 ring-4 ring-amber-400' : ''}`}
                      >
                        {diskSize}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>

        {/* HINT CARA MAIN & INFORMASI STACK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className={`p-3 rounded-2xl ${theme.cardBg} border border-gray-800 flex items-center gap-3`}>
            <Layers className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              <strong className="text-white">LIFO (Last In, First Out):</strong> Hanya cakram teratas yang dapat diambil (Pop) dan diletakkan (Push).
            </p>
          </div>

          <div className={`p-3 rounded-2xl ${theme.cardBg} border border-gray-800 flex items-center gap-3`}>
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              <strong className="text-white">Aturan Ukuran:</strong> Dilarang menumpuk cakram besar di atas cakram yang lebih kecil.
            </p>
          </div>

          <div className={`p-3 rounded-2xl ${theme.cardBg} border border-gray-800 flex items-center gap-3`}>
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              <strong className="text-white">Target Game:</strong> Pindahkan seluruh tumpukan cakram dari Tiang A ke Tiang C.
            </p>
          </div>
        </div>

      </div>

      {/* MODAL EDUKASI STRUKTUR DATA STACK & REKURSI */}
      {activeModal === 'edu' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className={`max-w-2xl w-full ${theme.cardBg} border border-amber-500/40 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto relative`}>
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-black">Edukasi CS: Stack & Algoritma Rekursif</h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <div className="bg-black/40 p-4 rounded-2xl border border-gray-800 space-y-2">
                <h3 className="font-bold text-amber-400 text-base">1. Apa itu Struktur Data Stack?</h3>
                <p>
                  Stack (Tumpukan) adalah struktur data linier yang mengikuti prinsip <strong>LIFO (Last In, First Out)</strong>. Elemen yang terakhir dimasukkan adalah elemen yang pertama kali dikeluarkan.
                </p>
                <ul className="list-disc list-inside space-y-1 font-mono text-xs text-amber-200/80 pt-1">
                  <li><strong>Push:</strong> Menambahkan cakram ke puncak tiang.</li>
                  <li><strong>Pop:</strong> Mengambil cakram teratas dari tiang.</li>
                  <li><strong>Peek:</strong> Memeriksa ukuran cakram teratas untuk validasi aturan.</li>
                </ul>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-gray-800 space-y-2">
                <h3 className="font-bold text-amber-400 text-base">2. Algoritma Rekursif & Call Stack</h3>
                <p>
                  Penyelesaian Menara Hanoi menggunakan metode Divide and Conquer secara rekursif:
                </p>
                <div className="bg-gray-950 p-3 rounded-xl font-mono text-xs text-emerald-400 border border-gray-800">
                  {`function solveHanoi(n, source, target, aux) {
  if (n === 1) { move(source, target); return; }
  solveHanoi(n - 1, source, aux, target);
  move(source, target);
  solveHanoi(n - 1, aux, target, source);
}`}
                </div>
                <p className="text-xs text-gray-400">
                  Kompleksitas waktu algoritma ini adalah <code className="text-amber-400 font-mono">O(2^n - 1)</code>. Untuk {diskCount} cakram, dibutuhkan minimum {minMoves} langkah ideal.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className={`w-full py-3 ${theme.accent} text-black font-black text-sm rounded-2xl hover:opacity-90 transition cursor-pointer shadow-lg`}
            >
              Paham, Lanjutkan Permainan
            </button>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN TEMA & DISK */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${theme.cardBg} border border-amber-500/40 text-white rounded-3xl p-6 space-y-6 shadow-2xl relative`}>
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black">Pengaturan Game</h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-gray-300 uppercase tracking-wider block">Pilih Tema Visual</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(THEMES).map((key) => (
                    <button
                      key={key}
                      onClick={() => setThemeKey(key)}
                      className={`p-3 rounded-2xl border text-left font-bold transition cursor-pointer ${
                        themeKey === key 
                          ? 'border-amber-400 bg-amber-500/20 text-white' 
                          : 'border-gray-800 bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {THEMES[key].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className={`w-full py-3 ${theme.accent} text-black font-black text-sm rounded-2xl hover:opacity-90 transition cursor-pointer shadow-lg`}
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL KEMENANGAN (VICTORY MODAL) */}
      {activeModal === 'victory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
          <div className={`max-w-md w-full ${theme.cardBg} border-2 border-amber-400 text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden`}>
            
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-400 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">Selesai Sempurna!</span>
              <h2 className="text-2xl md:text-3xl font-black text-white">Menara Berhasil Dipindah</h2>
              <p className="text-xs text-gray-300 pt-1">{getStarRating().label}</p>
              <div className="text-2xl pt-1">{getStarRating().stars}</div>
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 grid grid-cols-2 gap-4 text-center text-xs">
              <div>
                <span className="text-gray-400 uppercase font-extrabold block text-[10px]">Total Langkah</span>
                <span className="text-lg font-black text-amber-400 font-mono">{moves} / {minMoves}</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-extrabold block text-[10px]">Waktu Tempuh</span>
                <span className="text-lg font-black text-amber-400 font-mono">{formatTime(timer)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => initializeGame(diskCount)}
                className={`w-full py-3 ${theme.accent} text-black font-black text-sm rounded-2xl hover:opacity-90 transition cursor-pointer shadow-lg flex items-center justify-center gap-2`}
              >
                <RotateCcw className="w-4 h-4" /> Main Lagi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}