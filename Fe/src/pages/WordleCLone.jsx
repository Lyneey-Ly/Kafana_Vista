import React, { useState, useEffect, useCallback } from "react";

// Bank kata 5 huruf (Bahasa Indonesia)
const WORD_LIST = [
  "RUMAH", "SURAT", "POHON", "HUJAN", "BULAN",
  "KAPAL", "CERIA", "MANIS", "DAPUR", "MACAN",
  "PASAR", "TANAH", "WAKTU", "BEBAS", "BEBAN"
];

// Baris tombol pada virtual keyboard
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"]
];

export default function WordleClone() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("IN_PROGRESS"); // 'IN_PROGRESS', 'WON', 'LOST'
  const [toastMessage, setToastMessage] = useState("");

  // Inisialisasi atau reset game
  const startNewGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    setTargetWord(WORD_LIST[randomIndex]);
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("IN_PROGRESS");
    setToastMessage("");
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Notifikasi singkat di layar
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2000);
  };

  // Evaluasi status warna huruf per tebakan (Hijau, Kuning, Abu-abu)
  const getGuessStatuses = (guess) => {
    const statuses = Array(5).fill("absent");
    const targetLetters = targetWord.split("");

    // Pass 1: Tandai huruf & posisi yang tepat (Hijau)
    for (let i = 0; i < 5; i++) {
      if (guess[i] === targetWord[i]) {
        statuses[i] = "correct";
        targetLetters[i] = null;
      }
    }

    // Pass 2: Tandai huruf yang ada tetapi posisi salah (Kuning)
    for (let i = 0; i < 5; i++) {
      if (statuses[i] !== "correct") {
        const index = targetLetters.indexOf(guess[i]);
        if (index !== -1) {
          statuses[i] = "present";
          targetLetters[index] = null;
        }
      }
    }

    return statuses;
  };

  // Agregasi warna terbaik untuk setiap tombol virtual keyboard
  const getLetterStatuses = () => {
    const letterStatuses = {};
    guesses.forEach((guess) => {
      const statuses = getGuessStatuses(guess);
      guess.split("").forEach((char, index) => {
        const currentStatus = letterStatuses[char];
        const newStatus = statuses[index];

        if (newStatus === "correct") {
          letterStatuses[char] = "correct";
        } else if (newStatus === "present" && currentStatus !== "correct") {
          letterStatuses[char] = "present";
        } else if (!currentStatus) {
          letterStatuses[char] = "absent";
        }
      });
    });
    return letterStatuses;
  };

  const letterStatuses = getLetterStatuses();

  // Pengolahan input huruf, Enter, dan Backspace
  const handleKeyPress = useCallback(
    (key) => {
      if (gameStatus !== "IN_PROGRESS") return;

      const upperKey = key.toUpperCase();

      if (upperKey === "ENTER") {
        if (currentGuess.length !== 5) {
          showToast("Kata harus 5 huruf!");
          return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess === targetWord) {
          setGameStatus("WON");
        } else if (newGuesses.length === 6) {
          setGameStatus("LOST");
        }
      } else if (upperKey === "BACKSPACE" || upperKey === "DELETE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(upperKey) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + upperKey);
      }
    },
    [currentGuess, gameStatus, guesses, targetWord]
  );

  // Listener input keyboard fisik komputer
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e.key);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 font-sans select-none">
      {/* Header Utama */}
      <header className="w-full max-w-md border-b border-slate-800 pb-3 mb-2 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-widest text-emerald-400">WORDLE</h1>
        <button
          onClick={startNewGame}
          className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          Reset
        </button>
      </header>

      {/* Pop-up Pesan Peringatan */}
      {toastMessage && (
        <div className="fixed top-16 bg-white text-slate-950 px-4 py-2 rounded-md font-bold text-sm shadow-xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Grid Papan Permainan (6x5) */}
      <main className="grid grid-rows-6 gap-1.5 my-auto">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = guesses[rowIndex];
          const statuses = guess ? getGuessStatuses(guess) : [];

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                let letter = "";
                let statusClass = "border-slate-800 bg-slate-900/50 text-white";

                if (guess) {
                  letter = guess[colIndex];
                  const status = statuses[colIndex];
                  if (status === "correct") statusClass = "bg-emerald-600 border-emerald-600 text-white";
                  else if (status === "present") statusClass = "bg-amber-500 border-amber-500 text-white";
                  else if (status === "absent") statusClass = "bg-slate-800 border-slate-800 text-slate-400";
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || "";
                  if (letter) statusClass = "border-slate-500 bg-slate-900 text-white scale-105";
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-black rounded transition-all duration-300 ${statusClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </main>

      {/* Virtual Keyboard */}
      <footer className="w-full max-w-md flex flex-col gap-1.5 mb-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 touch-manipulation">
            {row.map((key) => {
              const status = letterStatuses[key];
              let keyBg = "bg-slate-700 hover:bg-slate-600 text-white";

              if (status === "correct") keyBg = "bg-emerald-600 text-white";
              else if (status === "present") keyBg = "bg-amber-500 text-white";
              else if (status === "absent") keyBg = "bg-slate-900 text-slate-600";

              const isWideKey = key === "ENTER" || key === "DELETE";

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`${
                    isWideKey ? "px-3 sm:px-4 text-xs font-bold" : "w-8 sm:w-10 text-sm font-bold"
                  } h-12 ${keyBg} rounded-md flex items-center justify-center transition active:scale-95`}
                >
                  {key === "DELETE" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </footer>

      {/* Modal Hasil Akhir Game */}
      {gameStatus !== "IN_PROGRESS" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xs w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-2">
              {gameStatus === "WON" ? "🎉 SELAMAT!" : "💔 GAME OVER"}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {gameStatus === "WON"
                ? `Kamu berhasil menebak kata dalam ${guesses.length} kesempatan!`
                : "Kamu kehabisan kesempatan tebakan."}
            </p>
            <div className="bg-slate-950 p-3 rounded-xl mb-6 border border-slate-800">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Kata Rahasia</span>
              <span className="text-xl font-bold text-emerald-400 tracking-widest">{targetWord}</span>
            </div>
            <button
              onClick={startNewGame}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 transition shadow-lg active:scale-95"
            >
              Main Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}