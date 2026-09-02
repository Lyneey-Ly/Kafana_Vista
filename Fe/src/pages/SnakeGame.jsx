import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  Gamepad2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
const INITIAL_DIRECTION = 'RIGHT';
const INITIAL_SPEED = 150;

const generateFood = (currentSnake) => {
  let newFood;
  while (!newFood || currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }
  return newFood;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(() => generateFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake_game_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const directionRef = useRef(direction);
  const lastProcessedDirectionRef = useRef(direction);

  const changeDirection = useCallback((newDir) => {
    const lastDir = lastProcessedDirectionRef.current;
    
    if (newDir === 'UP' && lastDir !== 'DOWN') setDirection('UP');
    if (newDir === 'DOWN' && lastDir !== 'UP') setDirection('DOWN');
    if (newDir === 'LEFT' && lastDir !== 'RIGHT') setDirection('LEFT');
    if (newDir === 'RIGHT' && lastDir !== 'LEFT') setDirection('RIGHT');
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPaused(false);
    setIsStarted(true);
  };

  const togglePause = () => {
    if (!isStarted) {
      resetGame();
      return;
    }
    if (!isGameOver) {
      setIsPaused(prev => !prev);
    }
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (isGameOver) {
          resetGame();
        } else {
          togglePause();
        }
        return;
      }

      if (isGameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, isGameOver, isPaused, isStarted]);

  useEffect(() => {
    if (isGameOver || isPaused || !isStarted) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;
        lastProcessedDirectionRef.current = currentDir;

        switch (currentDir) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
          default:
            break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        if (head.x === food.x && head.y === food.y) {
          const newSnake = [head, ...prevSnake];
          const newScore = score + 10;
          setScore(newScore);

          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake_game_highscore', newScore.toString());
          }

          setFood(generateFood(newSnake));
          setSpeed(Math.max(60, INITIAL_SPEED - Math.floor(newScore / 30) * 10));
          return newSnake;
        }

        return [head, ...prevSnake.slice(0, -1)];
      });
    };

    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [food, isGameOver, isPaused, isStarted, score, highScore, speed]);

  const renderCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFoodCell = food.x === x && food.y === y;

        let cellStyle = "bg-[#261C19]/40 border border-[#FAF6F0]/5";

        if (isHead) {
          cellStyle = "bg-[#C5A059] shadow-[0_0_12px_#C5A059] rounded-sm z-10";
        } else if (isBody) {
          cellStyle = "bg-[#9C7A3C] rounded-xs border border-[#1A1311]";
        } else if (isFoodCell) {
          cellStyle = "bg-[#E11D48] shadow-[0_0_10px_#E11D48] rounded-full animate-pulse transform scale-90";
        }

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-full h-full transition-all duration-75 ${cellStyle}`}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Gamepad2 className="w-4 h-4 text-[#C5A059]" />
            <span>Mini Game Arcade • Kafana Vista</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#261C19]">
            Ular Klasik <span className="text-[#C5A059]">Anak Kost</span>
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-md mx-auto">
            Kendalikan ular, santap makanan krispi, dan cetak rekor tertinggi tanpa menabrak tembok!
          </p>
        </div>

        <div className="bg-[#261C19] text-[#FAF6F0] p-4 md:p-6 rounded-3xl border border-[#C5A059]/30 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FAF6F0]/10 rounded-2xl border border-white/10 text-[#C5A059]">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Skor
              </span>
              <span className="text-lg md:text-2xl font-black text-[#FAF6F0] font-mono">
                {score}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FAF6F0]/10 rounded-2xl border border-white/10 text-[#C5A059]">
              <Trophy className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Rekor
              </span>
              <span className="text-lg md:text-2xl font-black text-[#C5A059] font-mono">
                {highScore}
              </span>
            </div>
          </div>

          <button
            onClick={togglePause}
            className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold transition shadow-md cursor-pointer shrink-0"
          >
            {!isStarted ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Mulai</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Lanjut</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Jeda</span>
              </>
            )}
          </button>
        </div>

        <div className="relative w-full aspect-square max-w-[440px] mx-auto bg-[#1A1311] p-2 rounded-3xl border-4 border-[#261C19] shadow-2xl overflow-hidden">
          <div className="grid grid-cols-20 grid-rows-20 w-full h-full gap-0.5 rounded-2xl overflow-hidden">
            {renderCells()}
          </div>

          {!isStarted && !isGameOver && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-[#C5A059]/20 border border-[#C5A059] text-[#C5A059] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Siap Berburu Makanan?</h3>
                <p className="text-xs text-slate-300">Gunakan panah keyboard atau D-Pad di bawah.</p>
              </div>
              <button
                onClick={resetGame}
                className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Mulai Permainan
              </button>
            </div>
          )}

          {isStarted && isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
              <h3 className="text-2xl font-black text-[#C5A059]">Permainan Dijeda</h3>
              <p className="text-xs text-slate-300">Tekan spasi atau tombol lanjut untuk melanjutkan</p>
              <button
                onClick={togglePause}
                className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] px-6 py-2.5 rounded-2xl font-black text-sm transition cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 bg-rose-500/20 border border-rose-500 text-rose-500 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Game Over</span>
                <h3 className="text-2xl font-black text-white">Ular Menabrak Batas!</h3>
                <p className="text-xs text-slate-300">Kamu berhasil mengumpulkan skor total:</p>
                <div className="text-3xl font-black text-[#C5A059] font-mono pt-1">{score}</div>
              </div>

              <div className="bg-[#261C19] border border-slate-800 rounded-2xl p-3 w-full max-w-xs flex justify-between items-center text-xs text-slate-300">
                <span>Rekor Tertinggi:</span>
                <span className="font-bold text-[#C5A059] font-mono">{highScore}</span>
              </div>

              <button
                onClick={resetGame}
                className="w-full max-w-xs bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#261C19] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl max-w-[320px] mx-auto space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center mb-1">
            D-Pad Navigasi Mobile
          </span>
          
          <div className="flex justify-center">
            <button
              onClick={() => changeDirection('UP')}
              disabled={isGameOver || isPaused}
              className="w-12 h-12 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-700 active:scale-95 rounded-2xl flex items-center justify-center transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => changeDirection('LEFT')}
              disabled={isGameOver || isPaused}
              className="w-12 h-12 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-700 active:scale-95 rounded-2xl flex items-center justify-center transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => changeDirection('RIGHT')}
              disabled={isGameOver || isPaused}
              className="w-12 h-12 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-700 active:scale-95 rounded-2xl flex items-center justify-center transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => changeDirection('DOWN')}
              disabled={isGameOver || isPaused}
              className="w-12 h-12 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-700 active:scale-95 rounded-2xl flex items-center justify-center transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}