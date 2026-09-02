import React, { useState, useEffect, useCallback } from 'react';
import { 
  RotateCcw, 
  Undo2, 
  Timer, 
  Trophy, 
  Gamepad2, 
  History, 
  User, 
  Bot,
  Sparkles, 
  Cpu
} from 'lucide-react';

// Kombinasi Kemenangan Grid 4x4 (4 Simbol Sejajar)
const WINNING_COMBINATIONS = [
  // Horizontal (Baris)
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  // Vertikal (Kolom)
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  // Diagonal
  [0, 5, 10, 15],
  [3, 6, 9, 12]
];

const TURN_TIME_LIMIT = 10; // 10 Detik per langkah

export default function TicTacToeSuper() {
  // STATE PERMAINAN
  const [board, setBoard] = useState(Array(16).fill(null));
  const [turn, setTurn] = useState('X'); // 'X' = Pemain 1, 'O' = Pemain 2 / Komputer
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [winner, setWinner] = useState(null); // 'X', 'O', atau 'DRAW'
  const [winningLine, setWinningLine] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ xWins: 0, oWins: 0, draws: 0 });

  // STATE MODE & KOMPUTER
  const [gameMode, setGameMode] = useState('pvai'); // 'pvp' | 'pvai'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [isThinking, setIsThinking] = useState(false);

  // CEK KONDISI KEMENANGAN
  const checkWinner = useCallback((currentBoard) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c, d] = combo;
      if (
        currentBoard[a] && 
        currentBoard[a] === currentBoard[b] && 
        currentBoard[a] === currentBoard[c] && 
        currentBoard[a] === currentBoard[d]
      ) {
        return { winnerSymbol: currentBoard[a], line: combo };
      }
    }

    if (currentBoard.every(cell => cell !== null)) {
      return { winnerSymbol: 'DRAW', line: [] };
    }

    return null;
  }, []);

  // HELPER KOMPUTER: CARI SEL KOSONG
  const getEmptyIndices = (currentBoard) => {
    return currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);
  };

  // HELPER KOMPUTER: CEK LANGKAH MENANG / CEGAH LAWAN
  const findWinningOrBlockingMove = (currentBoard, symbol) => {
    for (let combo of WINNING_COMBINATIONS) {
      const symbolsInCombo = combo.map((idx) => currentBoard[idx]);
      const matchCount = symbolsInCombo.filter((s) => s === symbol).length;
      const nullCount = symbolsInCombo.filter((s) => s === null).length;

      if (matchCount === 3 && nullCount === 1) {
        return combo.find((idx) => currentBoard[idx] === null);
      }
    }
    return null;
  };

  // ALGORITMA TAKTIS KOMPUTER
  const calculateAiMove = useCallback((currentBoard, level) => {
    const emptyIndices = getEmptyIndices(currentBoard);
    if (emptyIndices.length === 0) return null;

    // LEVEL EASY: Pilih acak murni
    if (level === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // LEVEL MEDIUM: Utamakan menang 1 langkah & blokir kemenangan lawan
    if (level === 'medium') {
      const winMove = findWinningOrBlockingMove(currentBoard, 'O');
      if (winMove !== null && winMove !== undefined) return winMove;

      const blockMove = findWinningOrBlockingMove(currentBoard, 'X');
      if (blockMove !== null && blockMove !== undefined) return blockMove;

      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // LEVEL HARD: Taktik Berlapis (Menang -> Blokir -> Buat 3 Sejajar -> Pusat -> Sudut)
    if (level === 'hard') {
      // 1. Ambil kemenangan jika ada
      const winMove = findWinningOrBlockingMove(currentBoard, 'O');
      if (winMove !== null && winMove !== undefined) return winMove;

      // 2. Blokir kemenangan lawan jika ada
      const blockMove = findWinningOrBlockingMove(currentBoard, 'X');
      if (blockMove !== null && blockMove !== undefined) return blockMove;

      // 3. Cari jebakan 3 sejajar untuk O
      for (let combo of WINNING_COMBINATIONS) {
        const symbolsInCombo = combo.map((idx) => currentBoard[idx]);
        const oCount = symbolsInCombo.filter((s) => s === 'O').length;
        const nullCount = symbolsInCombo.filter((s) => s === null).length;
        if (oCount === 2 && nullCount === 2) {
          const emptySlots = combo.filter((idx) => currentBoard[idx] === null);
          return emptySlots[Math.floor(Math.random() * emptySlots.length)];
        }
      }

      // 4. Blokir potensi 3 sejajar lawan
      for (let combo of WINNING_COMBINATIONS) {
        const symbolsInCombo = combo.map((idx) => currentBoard[idx]);
        const xCount = symbolsInCombo.filter((s) => s === 'X').length;
        const nullCount = symbolsInCombo.filter((s) => s === null).length;
        if (xCount === 2 && nullCount === 2) {
          const emptySlots = combo.filter((idx) => currentBoard[idx] === null);
          return emptySlots[Math.floor(Math.random() * emptySlots.length)];
        }
      }

      // 5. Prioritaskan area tengah grid [5, 6, 9, 10]
      const centers = [5, 6, 9, 10].filter((idx) => currentBoard[idx] === null);
      if (centers.length > 0) {
        return centers[Math.floor(Math.random() * centers.length)];
      }

      // 6. Prioritaskan area sudut [0, 3, 12, 15]
      const corners = [0, 3, 12, 15].filter((idx) => currentBoard[idx] === null);
      if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
      }

      // 7. Acak sisanya
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    return emptyIndices[0];
  }, []);

  // FUNGSI UTAMA EKSEKUSI LANGKAH
  const makeMove = useCallback((index, currentTurn) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentTurn;
    setBoard(newBoard);

    const row = Math.floor(index / 4) + 1;
    const col = (index % 4) + 1;

    // Catat ke riwayat
    setHistory((prev) => [
      ...prev,
      { player: currentTurn, index, row, col, previousBoard: board }
    ]);

    const result = checkWinner(newBoard);

    if (result) {
      setWinner(result.winnerSymbol);
      setIsTimerActive(false);

      if (result.winnerSymbol === 'X') {
        setWinningLine(result.line);
        setStats((prev) => ({ ...prev, xWins: prev.xWins + 1 }));
      } else if (result.winnerSymbol === 'O') {
        setWinningLine(result.line);
        setStats((prev) => ({ ...prev, oWins: prev.oWins + 1 }));
      } else if (result.winnerSymbol === 'DRAW') {
        setStats((prev) => ({ ...prev, draws: prev.draws + 1 }));
      }
    } else {
      setTurn(currentTurn === 'X' ? 'O' : 'X');
      setTimeLeft(TURN_TIME_LIMIT);
    }
  }, [board, winner, checkWinner]);

  // EFEK GILIRAN KOMPUTER
  useEffect(() => {
    if (gameMode === 'pvai' && turn === 'O' && !winner && isTimerActive) {
      setIsThinking(true);
      const timerId = setTimeout(() => {
        const aiIndex = calculateAiMove(board, difficulty);
        if (aiIndex !== null) {
          makeMove(aiIndex, 'O');
        }
        setIsThinking(false);
      }, 600); // Delay berpikir 600ms agar natural

      return () => clearTimeout(timerId);
    }
  }, [turn, gameMode, winner, board, difficulty, calculateAiMove, makeMove, isTimerActive]);

  // COUNTDOWN TIMER PER GILIRAN
  useEffect(() => {
    if (winner || !isTimerActive || isThinking) return;

    if (timeLeft === 0) {
      // Waktu habis, otomatis ganti pemain
      const nextTurn = turn === 'X' ? 'O' : 'X';
      setTurn(nextTurn);
      setTimeLeft(TURN_TIME_LIMIT);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, turn, winner, isTimerActive, isThinking]);

  // HANDLE KLIK SEL OLEH PEMAIN
  const handleCellClick = (index) => {
    if (isThinking || (gameMode === 'pvai' && turn === 'O')) return;
    makeMove(index, turn);
  };

  // FITUR UNDO MOVE (TARIK LANGKAH)
  const handleUndo = () => {
    if (history.length === 0 || winner || isThinking) return;

    if (gameMode === 'pvai') {
      // Pada mode AI, kembalikan 2 langkah sekaligus (Langkah Komputer + Langkah Pemain)
      if (history.length >= 2) {
        const targetMove = history[history.length - 2];
        setBoard(targetMove.previousBoard);
        setTurn('X');
        setHistory((prev) => prev.slice(0, -2));
      } else if (history.length === 1) {
        const targetMove = history[0];
        setBoard(targetMove.previousBoard);
        setTurn('X');
        setHistory([]);
      }
    } else {
      // Pada mode PvP, kembalikan 1 langkah
      const lastMove = history[history.length - 1];
      setBoard(lastMove.previousBoard);
      setTurn(lastMove.player);
      setHistory((prev) => prev.slice(0, -1));
    }

    setTimeLeft(TURN_TIME_LIMIT);
  };

  // RESET PAPAN / MAIN LAGI
  const handleReset = () => {
    setBoard(Array(16).fill(null));
    setTurn('X');
    setTimeLeft(TURN_TIME_LIMIT);
    setWinner(null);
    setWinningLine([]);
    setHistory([]);
    setIsTimerActive(true);
    setIsThinking(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Gamepad2 className="w-4 h-4 text-[#C5A059]" />
            <span>Mini Game Taktis • Kafana Vista</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#261C19]">
            Tic-Tac-Toe Super <span className="text-[#C5A059]">4x4</span>
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-md mx-auto">
            Susun 4 simbol sejajar untuk menang. Tantang teman atau adu taktik lawan Komputer!
          </p>
        </div>

        {/* PANEL PENGATURAN MODE & KESULITAN */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* PILIH MODE LAWAN */}
          <div className="flex items-center justify-between bg-[#1A1311] p-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-extrabold text-slate-400 pl-2 uppercase tracking-wider">
              Lawan:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => { setGameMode('pvai'); handleReset(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'pvai' 
                    ? 'bg-[#C5A059] text-[#261C19]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" /> Komputer
              </button>
              <button
                onClick={() => { setGameMode('pvp'); handleReset(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'pvp' 
                    ? 'bg-[#C5A059] text-[#261C19]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> 2 Pemain
              </button>
            </div>
          </div>

          {/* PILIH LEVEL KESULITAN (KHUSUS MODE KOMPUTER) */}
          <div className="flex items-center justify-between bg-[#1A1311] p-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-extrabold text-slate-400 pl-2 uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#C5A059]" /> Level AI:
            </span>
            <div className="flex gap-1">
              {[
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard 🔥' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  disabled={gameMode !== 'pvai'}
                  onClick={() => { setDifficulty(lvl.id); handleReset(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition disabled:opacity-30 cursor-pointer ${
                    difficulty === lvl.id && gameMode === 'pvai'
                      ? 'bg-[#C5A059] text-[#261C19]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* STATISTIK & TURN BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* TURN INDICATOR & TIMER */}
          <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FAF6F0]/10 rounded-2xl border border-white/10">
                {gameMode === 'pvai' && turn === 'O' ? (
                  <Bot className="w-5 h-5 text-[#E11D48]" />
                ) : (
                  <User className="w-5 h-5 text-[#C5A059]" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Giliran
                </span>
                <span className={`text-lg font-black ${turn === 'X' ? 'text-[#C5A059]' : 'text-[#E11D48]'}`}>
                  {gameMode === 'pvai' ? (
                    turn === 'X' ? 'Pemain (X)' : isThinking ? 'AI Berpikir...' : 'Komputer (O)'
                  ) : (
                    `Pemain ${turn}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1A1311] px-3.5 py-2 rounded-2xl border border-slate-800">
              <Timer className={`w-4 h-4 ${timeLeft <= 3 ? 'text-rose-500 animate-bounce' : 'text-[#C5A059]'}`} />
              <span className={`font-mono text-lg font-black ${timeLeft <= 3 ? 'text-rose-500' : 'text-[#FAF6F0]'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* STATISTIK SKOR */}
          <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl flex justify-around items-center text-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {gameMode === 'pvai' ? 'Pemain (X)' : 'Pemain X'}
              </span>
              <span className="text-2xl font-black text-[#C5A059] font-mono">{stats.xWins}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Seri
              </span>
              <span className="text-2xl font-black text-slate-300 font-mono">{stats.draws}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {gameMode === 'pvai' ? 'Komputer (O)' : 'Pemain O'}
              </span>
              <span className="text-2xl font-black text-[#E11D48] font-mono">{stats.oWins}</span>
            </div>
          </div>

          {/* CONTROL BUTTONS */}
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || winner !== null || isThinking}
              className="flex-1 bg-[#261C19] hover:bg-[#322521] disabled:opacity-50 text-[#C5A059] border border-[#C5A059]/30 py-3.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Undo2 className="w-4 h-4" /> Tarik Langkah
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Reset Papan
            </button>
          </div>

        </div>

        {/* MAIN GAME AREA: GRID & SIDEBAR HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* GRID BOARD 4x4 */}
          <div className="lg:col-span-7 bg-[#261C19] p-4 md:p-6 rounded-3xl border-2 border-[#C5A059]/30 shadow-2xl space-y-4">
            
            {/* OVERLAY / BANNER KEMENANGAN */}
            {winner && (
              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#C5A059] flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#261C19] text-[#C5A059] rounded-xl">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#261C19]">
                      {winner === 'DRAW' 
                        ? 'Hasil Pertandingan Seri!' 
                        : gameMode === 'pvai' && winner === 'O' 
                        ? 'Komputer Menang!' 
                        : gameMode === 'pvai' && winner === 'X' 
                        ? 'Kamu Menang Lawan AI!' 
                        : `Pemain ${winner} Menang!`}
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      {winner === 'DRAW' ? 'Semua sel terisi penuh.' : 'Selamat atas trik taktisnya!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-[#261C19] hover:bg-[#322521] text-[#C5A059] px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  Main Lagi
                </button>
              </div>
            )}

            {/* 16 CELLS GRID */}
            <div className="grid grid-cols-4 gap-2.5 md:gap-3 aspect-square w-full max-w-[420px] mx-auto">
              {board.map((cell, index) => {
                const isWinningCell = winningLine.includes(index);

                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={cell !== null || winner !== null || isThinking || (gameMode === 'pvai' && turn === 'O')}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border font-black text-2xl md:text-4xl cursor-pointer ${
                      isWinningCell
                        ? 'bg-[#C5A059]/30 border-[#C5A059] shadow-[0_0_20px_#C5A059] animate-pulse scale-95'
                        : cell
                        ? 'bg-[#1A1311] border-slate-800'
                        : 'bg-[#1A1311]/70 hover:bg-[#322521] border-slate-800/80 hover:border-[#C5A059]/50'
                    }`}
                  >
                    {cell === 'X' && (
                      <span className="text-[#C5A059] drop-shadow-[0_0_8px_#C5A059]">X</span>
                    )}
                    {cell === 'O' && (
                      <span className="text-[#E11D48] drop-shadow-[0_0_8px_#E11D48]">O</span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* SIDEBAR PANEL HISTORY LANGKAH */}
          <div className="lg:col-span-5 bg-[#261C19] text-[#FAF6F0] p-5 rounded-3xl border border-[#C5A059]/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-[#C5A059] flex items-center gap-2">
                <History className="w-4 h-4" /> Catatan Riwayat Langkah
              </h3>
              <span className="text-[10px] bg-[#1A1311] text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
                {history.length} Langkah
              </span>
            </div>

            {/* LOG LIST */}
            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {history.length > 0 ? (
                history.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-[#1A1311] p-3 rounded-2xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#261C19] border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-400">
                        {idx + 1}
                      </span>
                      <span className={`font-black ${step.player === 'X' ? 'text-[#C5A059]' : 'text-[#E11D48]'}`}>
                        {gameMode === 'pvai' 
                          ? step.player === 'X' ? 'Pemain (X)' : 'Komputer (O)'
                          : `Pemain ${step.player}`}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono">
                      Baris {step.row}, Kolom {step.col}
                    </span>
                  </div>
                )).reverse()
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-slate-600" />
                  <p>Belum ada langkah yang dicatat.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}