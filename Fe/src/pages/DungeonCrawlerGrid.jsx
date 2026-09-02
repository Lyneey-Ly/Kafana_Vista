import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Sword, 
  Heart, 
  Zap, 
  Key, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Package, 
  RotateCcw, 
  Sparkles, 
  Skull, 
  DoorClosed, 
  DoorOpen, 
  Footprints, 
  Crown,
  Award,
  Trophy,
  Coins,
  Crosshair,
  Flame,
  ShieldAlert,
  Sparkle
} from 'lucide-react';

// KONFIGURASI UKURAN GRID MATRIKS & JANGKAUAN PANDANG
const GRID_SIZE = 16;
const VISION_RADIUS = 3.5;

// TIPE TILE GRID
const TILE_TYPES = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  LOCKED_DOOR: 3,
  KEY: 4,
  CHEST: 5,
  HEALTH_POTION: 6,
  MANA_POTION: 7,
  STAIRS: 8,
  ENEMY: 9
};

// DATABASE MONSTER DENGAN VARIASI PER LANTAI KOST
const MONSTERS_BY_FLOOR = {
  1: [
    { name: 'Tikus Got Garang', hp: 30, maxHp: 30, atk: 7, def: 2, exp: 20, gold: 15, icon: '🐀' },
    { name: 'Kecoa Terbang Pembunuh', hp: 25, maxHp: 25, atk: 9, def: 1, exp: 25, gold: 20, icon: '🪳' }
  ],
  2: [
    { name: 'Kucing Rebutan Wilayah', hp: 45, maxHp: 45, atk: 12, def: 4, exp: 35, gold: 30, icon: '🐈' },
    { name: 'Nyamuk Demam Berdarah', hp: 35, maxHp: 35, atk: 15, def: 2, exp: 40, gold: 25, icon: '🦟' }
  ],
  3: [
    { name: 'Hantu Penunggu Kamar Mandi', hp: 65, maxHp: 65, atk: 18, def: 6, exp: 60, gold: 50, icon: '👻' },
    { name: 'Goblin Pencuri Sandal', hp: 60, maxHp: 60, atk: 16, def: 7, exp: 55, gold: 45, icon: '👺' }
  ],
  4: [
    { name: 'Skeleton Penghuni Basement', hp: 90, maxHp: 90, atk: 22, def: 10, exp: 85, gold: 75, icon: '💀' },
    { name: 'Tuyul Pembobol Tabungan', hp: 75, maxHp: 75, atk: 25, def: 5, exp: 90, gold: 120, icon: '👶' }
  ],
  5: [
    { name: 'Ibu Kost SuperAdmin (BOSS)', hp: 220, maxHp: 220, atk: 35, def: 18, exp: 300, gold: 500, icon: '👵' }
  ]
};

// DATABASE EQUIPMENT (SENJATA & ARMOR)
const EQUIPMENT_DATABASE = {
  weapons: [
    { name: 'Sapu Lidi Sakti', atkBonus: 5, desc: 'Senjata klasik pengusir debu dan kecoa.' },
    { name: 'Sandal Jepit Swallow Emas', atkBonus: 10, desc: 'Memiliki akurasi lempar 99%.' },
    { name: 'Pedang Raket Nyamuk Listrik', atkBonus: 18, desc: 'Setruman mematikan bertegangan tinggi.' },
    { name: 'Tombak Galon Mineral', atkBonus: 28, desc: 'Daya hantam berat meremukkan musuh.' }
  ],
  armors: [
    { name: 'Kaos Partai Tipis', defBonus: 3, desc: 'Cukup untuk menahan angin malam.' },
    { name: 'Jaket Parasut Ojol', defBonus: 7, desc: 'Tahan angin dan cipratan air hujan.' },
    { name: 'Zirah Sarung Tenun Pelindung', defBonus: 13, desc: 'Hangat dan memiliki ketahanan magis.' },
    { name: 'Rompi Anti-Tagihan Telat', defBonus: 22, desc: 'Pertahanan mutlak dari ketukan pintu keras.' }
  ]
};

export default function DungeonCrawlerGrid() {
  // STATE PETA & DUNGEON
  const [floor, setFloor] = useState(1);
  const [grid, setGrid] = useState([]);
  const [exploredTiles, setExploredTiles] = useState({});

  // STATE KARAKTER
  const [player, setPlayer] = useState({
    x: 1,
    y: 1,
    hp: 100,
    maxHp: 100,
    mp: 40,
    maxMp: 40,
    level: 1,
    exp: 0,
    maxExp: 50,
    atk: 12,
    def: 3,
    crit: 10,
    gold: 0,
    keys: 0,
    weapon: EQUIPMENT_DATABASE.weapons[0],
    armor: EQUIPMENT_DATABASE.armors[0],
    inventory: {
      hpPotions: 2,
      mpPotions: 1
    }
  });

  // STATE BATTLE TURN-BASED
  const [battleState, setBattleState] = useState(null); // { enemy, enemyHp, turn, log }
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // LOG AKTIVITAS / EVENT LOG
  const [eventLogs, setEventLogs] = useState([
    'Selamat datang di Penjelajah Labirin Anak Kost! Cari tangga untuk turun ke lantai berikutnya.'
  ]);

  const audioCtxRef = useRef(null);

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

      if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'pickup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'door') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'attack') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'levelup') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
          noteGain.gain.setValueAtTime(0.15, now + idx * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
          noteOsc.start(now + idx * 0.1);
          noteOsc.stop(now + idx * 0.1 + 0.25);
        });
      } else if (type === 'victory') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.15);
          noteGain.gain.setValueAtTime(0.2, now + idx * 0.15);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);
          noteOsc.start(now + idx * 0.15);
          noteOsc.stop(now + idx * 0.15 + 0.4);
        });
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  }, [getAudioContext, isMuted]);

  // LOG EVENT HELPER
  const addLog = (msg) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 19)]);
  };

  // GENERASI LABIRIN PROSEDURAL
  const generateDungeon = useCallback((targetFloor) => {
    // Inisialisasi grid penuh dinding (Wall = 0)
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(TILE_TYPES.WALL));

    // Carve Ruangan (Rooms)
    const rooms = [];
    const roomCount = 5;

    for (let r = 0; r < roomCount; r++) {
      const w = Math.floor(Math.random() * 3) + 3; // Lebar 3-5
      const h = Math.floor(Math.random() * 3) + 3; // Tinggi 3-5
      const x = Math.floor(Math.random() * (GRID_SIZE - w - 2)) + 1;
      const y = Math.floor(Math.random() * (GRID_SIZE - h - 2)) + 1;

      // Lubangi ruangan
      for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
          newGrid[i][j] = TILE_TYPES.FLOOR;
        }
      }

      rooms.push({ x: Math.floor(x + w / 2), y: Math.floor(y + h / 2), x1: x, y1: y, w, h });
    }

    // Hubungkan ruangan dengan Koridor
    for (let i = 0; i < rooms.length - 1; i++) {
      let cur = rooms[i];
      let next = rooms[i + 1];

      let cx = cur.x;
      let cy = cur.y;

      while (cx !== next.x) {
        newGrid[cy][cx] = TILE_TYPES.FLOOR;
        cx += cx < next.x ? 1 : -1;
      }
      while (cy !== next.y) {
        newGrid[cy][cx] = TILE_TYPES.FLOOR;
        cy += cy < next.y ? 1 : -1;
      }
    }

    // Posisi Pemain di Ruangan Pertama
    const startPos = { x: rooms[0].x, y: rooms[0].y };

    // Posisi Tangga/Exit di Ruangan Terakhir
    const lastRoom = rooms[rooms.length - 1];
    newGrid[lastRoom.y][lastRoom.x] = TILE_TYPES.STAIRS;

    // Sebar Item, Kunci, Pintu Terkunci & Musuh
    const emptyTiles = [];
    for (let i = 1; i < GRID_SIZE - 1; i++) {
      for (let j = 1; j < GRID_SIZE - 1; j++) {
        if (newGrid[i][j] === TILE_TYPES.FLOOR && (j !== startPos.x || i !== startPos.y)) {
          emptyTiles.push({ x: j, y: i });
        }
      }
    }

    // Shuffle empty tiles
    emptyTiles.sort(() => Math.random() - 0.5);

    // Letakkan Pintu Terkunci & Kunci
    if (emptyTiles.length > 0) {
      const keyPos = emptyTiles.pop();
      newGrid[keyPos.y][keyPos.x] = TILE_TYPES.KEY;
    }

    // Letakkan Peti Harta (Chest)
    if (emptyTiles.length > 0) {
      const chestPos = emptyTiles.pop();
      newGrid[chestPos.y][chestPos.x] = TILE_TYPES.CHEST;
    }

    // Letakkan Potion HP & MP
    if (emptyTiles.length > 0) {
      const hpPos = emptyTiles.pop();
      newGrid[hpPos.y][hpPos.x] = TILE_TYPES.HEALTH_POTION;
    }
    if (emptyTiles.length > 0) {
      const mpPos = emptyTiles.pop();
      newGrid[mpPos.y][mpPos.x] = TILE_TYPES.MANA_POTION;
    }

    // Sebar Musuh
    const monsterTemplates = MONSTERS_BY_FLOOR[targetFloor] || MONSTERS_BY_FLOOR[1];
    const enemyCount = targetFloor === 5 ? 1 : 4; // Floor 5 khusus Boss

    for (let e = 0; e < enemyCount; e++) {
      if (emptyTiles.length > 0) {
        const ePos = emptyTiles.pop();
        const template = monsterTemplates[Math.floor(Math.random() * monsterTemplates.length)];
        newGrid[ePos.y][ePos.x] = {
          type: TILE_TYPES.ENEMY,
          enemyData: { ...template }
        };
      }
    }

    setGrid(newGrid);
    setPlayer((prev) => ({ ...prev, x: startPos.x, y: startPos.y }));

    // Reset Fog of War
    updateFogOfWar(startPos.x, startPos.y);
  }, []);

  // FOG OF WAR & RADIUS PENGLIHATAN
  const updateFogOfWar = (px, py) => {
    setExploredTiles((prev) => {
      const updated = { ...prev };
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const dist = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
          if (dist <= VISION_RADIUS) {
            updated[`${x},${y}`] = true;
          }
        }
      }
      return updated;
    });
  };

  // RESTART GAME ULANG
  const restartGame = () => {
    setFloor(1);
    setIsGameOver(false);
    setIsGameWon(false);
    setBattleState(null);
    setPlayer({
      x: 1,
      y: 1,
      hp: 100,
      maxHp: 100,
      mp: 40,
      maxMp: 40,
      level: 1,
      exp: 0,
      maxExp: 50,
      atk: 12,
      def: 3,
      crit: 10,
      gold: 0,
      keys: 0,
      weapon: EQUIPMENT_DATABASE.weapons[0],
      armor: EQUIPMENT_DATABASE.armors[0],
      inventory: { hpPotions: 2, mpPotions: 1 }
    });
    generateDungeon(1);
    addLog("=== MEMULAI PERMAINAN BARU ===");
  };

  useEffect(() => {
    generateDungeon(1);
  }, [generateDungeon]);

  // MOVING & TILE INTERACTION LOGIC
  const movePlayer = (dx, dy) => {
    if (battleState || isGameOver || isGameWon) return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    // Batas Matriks
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return;

    const targetTile = grid[ny][nx];

    // Menabrak Dinding
    if (targetTile === TILE_TYPES.WALL) {
      playSound('hurt');
      return;
    }

    // Interaksi Pintu Terkunci
    if (targetTile === TILE_TYPES.LOCKED_DOOR) {
      if (player.keys > 0) {
        setPlayer((prev) => ({ ...prev, keys: prev.keys - 1 }));
        const newGrid = [...grid];
        newGrid[ny][nx] = TILE_TYPES.FLOOR;
        setGrid(newGrid);
        playSound('door');
        addLog("Membuka Pintu Terkunci menggunakan 1 Kunci!");
      } else {
        playSound('hurt');
        addLog("Pintu terkunci! Kamu membutuhkan 1 Kunci.");
        return;
      }
    }

    // Interaksi Ambil Kunci
    if (targetTile === TILE_TYPES.KEY) {
      setPlayer((prev) => ({ ...prev, keys: prev.keys + 1 }));
      const newGrid = [...grid];
      newGrid[ny][nx] = TILE_TYPES.FLOOR;
      setGrid(newGrid);
      playSound('pickup');
      addLog("Menemukan Kunci Kamar Kost!");
    }

    // Interaksi Peti Harta
    if (targetTile === TILE_TYPES.CHEST) {
      const goldFound = Math.floor(Math.random() * 30) + 20;
      setPlayer((prev) => ({ 
        ...prev, 
        gold: prev.gold + goldFound,
        inventory: { ...prev.inventory, hpPotions: prev.inventory.hpPotions + 1 }
      }));
      const newGrid = [...grid];
      newGrid[ny][nx] = TILE_TYPES.FLOOR;
      setGrid(newGrid);
      playSound('pickup');
      addLog(`Membuka Peti Harta! Mendapatkan ${goldFound} Gold & 1 HP Potion.`);
    }

    // Interaksi Potion HP
    if (targetTile === TILE_TYPES.HEALTH_POTION) {
      setPlayer((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, hpPotions: prev.inventory.hpPotions + 1 }
      }));
      const newGrid = [...grid];
      newGrid[ny][nx] = TILE_TYPES.FLOOR;
      setGrid(newGrid);
      playSound('pickup');
      addLog("Mengambil Health Potion! Ditambahkan ke Inventory.");
    }

    // Interaksi Potion MP
    if (targetTile === TILE_TYPES.MANA_POTION) {
      setPlayer((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, mpPotions: prev.inventory.mpPotions + 1 }
      }));
      const newGrid = [...grid];
      newGrid[ny][nx] = TILE_TYPES.FLOOR;
      setGrid(newGrid);
      playSound('pickup');
      addLog("Mengambil Mana Potion! Ditambahkan ke Inventory.");
    }

    // Interaksi Tangga Turun / Next Floor
    if (targetTile === TILE_TYPES.STAIRS) {
      if (floor === 5) {
        setIsGameWon(true);
        playSound('victory');
        addLog("SELAMAT! Kamu berhasil menaklukkan seluruh lantai Kost!");
        return;
      }
      const nextFloor = floor + 1;
      setFloor(nextFloor);
      generateDungeon(nextFloor);
      playSound('levelup');
      addLog(`Turun ke Lantai Kost #${nextFloor}! Suasana semakin mencekam...`);
      return;
    }

    // Interaksi Bertemu Musuh / Trigger Turn-Based Battle
    if (typeof targetTile === 'object' && targetTile?.type === TILE_TYPES.ENEMY) {
      const enemy = targetTile.enemyData;
      setBattleState({
        enemy: enemy,
        enemyHp: enemy.hp,
        enemyMaxHp: enemy.hp,
        tilePos: { x: nx, y: ny },
        logs: [`Bertemu dengan ${enemy.name}! Persiapkan dirimu!`]
      });
      playSound('hurt');
      return;
    }

    // Update Posisi Pemain
    setPlayer((prev) => ({ ...prev, x: nx, y: ny }));
    updateFogOfWar(nx, ny);
    playSound('step');
  };

  // KEYBOARD LISTENER SUPPORT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, grid, battleState, isGameOver, isGameWon]);

  // LOGIKA SISTEM PERTARUNGAN TURN-BASED
  const handleBattleAction = (actionType) => {
    if (!battleState) return;

    let pAtk = player.atk + player.weapon.atkBonus;
    let pDef = player.def + player.armor.defBonus;
    let enemy = battleState.enemy;
    let currentEnemyHp = battleState.enemyHp;
    let battleLogs = [...battleState.logs];

    // 1. AKSI PEMAIN
    if (actionType === 'attack') {
      const isCrit = Math.random() * 100 < player.crit;
      const critMult = isCrit ? 1.5 : 1.0;
      const rawDamage = Math.max(1, pAtk - enemy.def);
      const finalDamage = Math.floor(rawDamage * critMult);

      currentEnemyHp -= finalDamage;
      playSound('attack');
      battleLogs.unshift(`Kamu menyerang ${enemy.name} sebesar ${finalDamage} DMG! ${isCrit ? '💥 CRITICAL!' : ''}`);
    } else if (actionType === 'slash') {
      if (player.mp < 10) {
        battleLogs.unshift("MP tidak cukup untuk Special Slash!");
        setBattleState({ ...battleState, logs: battleLogs });
        return;
      }
      setPlayer((prev) => ({ ...prev, mp: prev.mp - 10 }));
      const finalDamage = Math.floor(Math.max(1, pAtk * 1.6 - enemy.def));
      currentEnemyHp -= finalDamage;
      playSound('attack');
      battleLogs.unshift(`Special Slash menebas ${enemy.name} sebesar ${finalDamage} DMG!`);
    } else if (actionType === 'heal') {
      if (player.inventory.hpPotions <= 0) {
        battleLogs.unshift("HP Potion di inventory habis!");
        setBattleState({ ...battleState, logs: battleLogs });
        return;
      }
      const healAmt = 45;
      setPlayer((prev) => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healAmt),
        inventory: { ...prev.inventory, hpPotions: prev.inventory.hpPotions - 1 }
      }));
      playSound('pickup');
      battleLogs.unshift(`Menggunakan HP Potion! Memulihkan +${healAmt} HP.`);
    } else if (actionType === 'run') {
      playSound('step');
      addLog(`Kamu berhasil melarikan diri dari ${enemy.name}!`);
      setBattleState(null);
      return;
    }

    // CEK KEMENANGAN DALAM BATTLE
    if (currentEnemyHp <= 0) {
      playSound('victory');
      addLog(`Mengalahkan ${enemy.name}! +${enemy.exp} EXP, +${enemy.gold} Gold.`);

      // Hapus Musuh dari Grid Matriks
      const newGrid = [...grid];
      newGrid[battleState.tilePos.y][battleState.tilePos.x] = TILE_TYPES.FLOOR;
      setGrid(newGrid);

      // Pindahkan Karakter ke Ubin Musuh
      setPlayer((prev) => {
        let newExp = prev.exp + enemy.exp;
        let newGold = prev.gold + enemy.gold;
        let newLevel = prev.level;
        let newMaxExp = prev.maxExp;
        let newHp = prev.hp;
        let newMaxHp = prev.maxHp;
        let newAtk = prev.atk;

        // Level Up Logic
        if (newExp >= newMaxExp) {
          newLevel += 1;
          newExp -= newMaxExp;
          newMaxExp = Math.floor(newMaxExp * 1.5);
          newMaxHp += 20;
          newHp = newMaxHp;
          newAtk += 4;
          playSound('levelup');
          addLog(`🎉 LEVEL UP! Kamu naik ke Level ${newLevel}!`);
        }

        return {
          ...prev,
          x: battleState.tilePos.x,
          y: battleState.tilePos.y,
          exp: newExp,
          maxExp: newMaxExp,
          level: newLevel,
          gold: newGold,
          hp: newHp,
          maxHp: newMaxHp,
          atk: newAtk
        };
      });

      updateFogOfWar(battleState.tilePos.x, battleState.tilePos.y);
      setBattleState(null);
      return;
    }

    // 2. GILIRAN MUSUH MENYERANG
    const enemyDamage = Math.max(1, enemy.atk - pDef);
    const newPlayerHp = player.hp - enemyDamage;
    playSound('hurt');
    battleLogs.unshift(`${enemy.name} membalas serangan sebesar ${enemyDamage} DMG!`);

    if (newPlayerHp <= 0) {
      setPlayer((prev) => ({ ...prev, hp: 0 }));
      setIsGameOver(true);
      setBattleState(null);
      addLog("Karaktermu gugur di dalam labirin!");
      return;
    }

    setPlayer((prev) => ({ ...prev, hp: newPlayerHp }));
    setBattleState((prev) => ({
      ...prev,
      enemyHp: currentEnemyHp,
      logs: battleLogs
    }));
  };

  // RENDER TILE ICON & STYLING
  const renderTileContent = (x, y) => {
    const key = `${x},${y}`;
    const isExplored = exploredTiles[key];
    const isPlayer = player.x === x && player.y === y;

    // Fog of War / Unexplored
    if (!isExplored) {
      return <div className="w-full h-full bg-[#0D0A09]" />;
    }

    const tile = grid[y]?.[x];
    const dist = Math.sqrt(Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2));
    const isVisible = dist <= VISION_RADIUS;

    return (
      <div className={`relative w-full h-full flex items-center justify-center text-xs md:text-sm transition-all duration-200 ${
        !isVisible ? 'brightness-50 opacity-60' : 'brightness-100'
      }`}>
        {/* PLAYER TILE */}
        {isPlayer ? (
          <div className="w-full h-full bg-[#C5A059] rounded-lg border border-white flex items-center justify-center shadow-[0_0_12px_#C5A059] z-20 animate-pulse">
            <span className="text-base select-none">🧙‍♂️</span>
          </div>
        ) : tile === TILE_TYPES.WALL ? (
          <div className="w-full h-full bg-[#261C19] border border-[#3A2D28] rounded-sm" />
        ) : tile === TILE_TYPES.FLOOR ? (
          <div className="w-full h-full bg-[#1A1311]/80 border border-slate-900/40" />
        ) : tile === TILE_TYPES.LOCKED_DOOR ? (
          <div className="w-full h-full bg-[#261C19] border border-[#C5A059] rounded-md flex items-center justify-center">
            <DoorClosed className="w-4 h-4 text-[#C5A059]" />
          </div>
        ) : tile === TILE_TYPES.KEY ? (
          <div className="w-full h-full bg-[#1A1311] flex items-center justify-center animate-bounce">
            <Key className="w-4 h-4 text-amber-400" />
          </div>
        ) : tile === TILE_TYPES.CHEST ? (
          <div className="w-full h-full bg-[#1A1311] flex items-center justify-center">
            <span className="text-base">🧰</span>
          </div>
        ) : tile === TILE_TYPES.HEALTH_POTION ? (
          <div className="w-full h-full bg-[#1A1311] flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
          </div>
        ) : tile === TILE_TYPES.MANA_POTION ? (
          <div className="w-full h-full bg-[#1A1311] flex items-center justify-center">
            <Zap className="w-4 h-4 text-sky-400 fill-current" />
          </div>
        ) : tile === TILE_TYPES.STAIRS ? (
          <div className="w-full h-full bg-emerald-950/80 border border-emerald-500/50 rounded-md flex items-center justify-center animate-pulse">
            <span className="text-base">🪜</span>
          </div>
        ) : typeof tile === 'object' && tile?.type === TILE_TYPES.ENEMY ? (
          <div className="w-full h-full bg-rose-950/40 border border-rose-500/30 rounded-md flex items-center justify-center">
            <span className="text-base select-none">{tile.enemyData.icon}</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-3 md:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto space-y-4">

        {/* HEADER SECTION */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Mini Game RPG • Kafana Vista</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#261C19]">
            Penjelajah Labirin <span className="text-[#C5A059]">Anak Kost</span>
          </h1>
        </div>

        {/* STATISTIK DASHBOARD KARAKTER */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* HP BAR */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
              <span className="flex items-center gap-1 text-rose-400"><Heart className="w-3 h-3 fill-current" /> HP</span>
              <span>{player.hp}/{player.maxHp}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* MP BAR */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
              <span className="flex items-center gap-1 text-sky-400"><Zap className="w-3 h-3 fill-current" /> MP</span>
              <span>{player.mp}/{player.maxMp}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-sky-400 h-full transition-all duration-300"
                style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
              />
            </div>
          </div>

          {/* LEVEL & EXP */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
              <span className="text-[#C5A059]">Lvl {player.level}</span>
              <span>{player.exp}/{player.maxExp} EXP</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-[#C5A059] h-full transition-all duration-300"
                style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
              />
            </div>
          </div>

          {/* ATK & DEF STATS */}
          <div className="flex items-center justify-around bg-[#1A1311] p-2 rounded-2xl border border-slate-800 font-mono">
            <div className="flex items-center gap-1 text-amber-400">
              <Sword className="w-3.5 h-3.5" />
              <span className="font-bold">{player.atk + player.weapon.atkBonus}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-bold">{player.def + player.armor.defBonus}</span>
            </div>
          </div>

          {/* GOLD, KEYS & LANTAI */}
          <div className="flex items-center justify-around bg-[#1A1311] p-2 rounded-2xl border border-slate-800 font-mono col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              <span className="font-bold">{player.gold}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Key className="w-3.5 h-3.5" />
              <span className="font-bold">{player.keys}</span>
            </div>
            <div className="bg-[#C5A059] text-[#261C19] px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
              Lantai {floor}
            </div>
          </div>
        </div>

        {/* MAIN GAMEPLAY AREA: GRID BOARD & SIDEBAR PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* GRID MATRIKS 16x16 */}
          <div className="lg:col-span-7 bg-[#261C19] p-3 md:p-4 rounded-3xl border-2 border-[#C5A059]/30 shadow-2xl flex flex-col items-center">
            <div className="grid grid-cols-16 gap-0.5 w-full aspect-square max-w-[420px] bg-[#0D0A09] p-1.5 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
              {Array.from({ length: GRID_SIZE }).map((_, y) =>
                Array.from({ length: GRID_SIZE }).map((_, x) => (
                  <div key={`${x}-${y}`} className="w-full h-full aspect-square">
                    {renderTileContent(x, y)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIDEBAR PANEL: INVENTORY & COMBAT LOG */}
          <div className="lg:col-span-5 space-y-3">

            {/* GEAR & INVENTORY */}
            <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold text-[#C5A059] flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-800 pb-2">
                <Package className="w-4 h-4" /> Perlengkapan & Item
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#1A1311] p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Senjata</span>
                  <p className="font-bold text-[#C5A059] truncate">{player.weapon.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">+{player.weapon.atkBonus} ATK</p>
                </div>

                <div className="bg-[#1A1311] p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Zirah</span>
                  <p className="font-bold text-[#C5A059] truncate">{player.armor.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">+{player.armor.defBonus} DEF</p>
                </div>
              </div>

              {/* CONSUMABLE POTIONS */}
              <div className="flex gap-2">
                <button
                  disabled={player.inventory.hpPotions <= 0 || player.hp >= player.maxHp}
                  onClick={() => {
                    setPlayer((prev) => ({
                      ...prev,
                      hp: Math.min(prev.maxHp, prev.hp + 40),
                      inventory: { ...prev.inventory, hpPotions: prev.inventory.hpPotions - 1 }
                    }));
                    playSound('pickup');
                    addLog("Menggunakan HP Potion di luar pertempuran! (+40 HP)");
                  }}
                  className="flex-1 bg-[#1A1311] hover:bg-[#322521] disabled:opacity-40 border border-slate-800 p-2 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span className="font-bold">HP Potion</span>
                  </div>
                  <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                    x{player.inventory.hpPotions}
                  </span>
                </button>

                <button
                  disabled={player.inventory.mpPotions <= 0 || player.mp >= player.maxMp}
                  onClick={() => {
                    setPlayer((prev) => ({
                      ...prev,
                      mp: Math.min(prev.maxMp, prev.mp + 25),
                      inventory: { ...prev.inventory, mpPotions: prev.inventory.mpPotions - 1 }
                    }));
                    playSound('pickup');
                    addLog("Menggunakan Mana Potion di luar pertempuran! (+25 MP)");
                  }}
                  className="flex-1 bg-[#1A1311] hover:bg-[#322521] disabled:opacity-40 border border-slate-800 p-2 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-400 fill-current" />
                    <span className="font-bold">MP Potion</span>
                  </div>
                  <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                    x{player.inventory.mpPotions}
                  </span>
                </button>
              </div>
            </div>

            {/* EVENT LOG LIST */}
            <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl space-y-2">
              <h3 className="text-xs font-extrabold text-[#C5A059] uppercase tracking-wider border-b border-slate-800 pb-2">
                Catatan Perjalanan Labirin
              </h3>
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 text-[11px] font-mono text-slate-300 pr-1">
                {eventLogs.map((log, idx) => (
                  <div key={idx} className="bg-[#1A1311] p-2 rounded-xl border border-slate-800/80 leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* MOBILE D-PAD NAVIGASI */}
            <div className="bg-[#261C19] p-3 rounded-3xl border border-[#C5A059]/30 shadow-xl max-w-[220px] mx-auto space-y-1">
              <div className="flex justify-center">
                <button
                  onClick={() => movePlayer(0, -1)}
                  className="w-10 h-10 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-800 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => movePlayer(-1, 0)}
                  className="w-10 h-10 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-800 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => movePlayer(1, 0)}
                  className="w-10 h-10 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-800 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => movePlayer(0, 1)}
                  className="w-10 h-10 bg-[#1A1311] hover:bg-[#C5A059] text-slate-300 hover:text-[#261C19] border border-slate-800 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL PERTANDINGAN TURN-BASED (BATTLE SCREEN) */}
      {battleState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border-2 border-[#C5A059] text-[#FAF6F0] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            
            {/* BATTLE HEADER */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Pertempuran Taktis</span>
              <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <span>{battleState.enemy.icon}</span> {battleState.enemy.name}
              </h3>
            </div>

            {/* BATTLE HP BARS */}
            <div className="grid grid-cols-2 gap-4 bg-[#1A1311] p-4 rounded-2xl border border-slate-800">
              {/* PLAYER HP */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Karaktermu</span>
                <span className="text-xs font-mono font-bold text-rose-400">{player.hp}/{player.maxHp} HP</span>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
                </div>
              </div>

              {/* ENEMY HP */}
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">{battleState.enemy.name}</span>
                <span className="text-xs font-mono font-bold text-amber-400">{battleState.enemyHp}/{battleState.enemyMaxHp} HP</span>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full ml-auto" style={{ width: `${(battleState.enemyHp / battleState.enemyMaxHp) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* COMBAT ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleBattleAction('attack')}
                className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3 rounded-2xl font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sword className="w-4 h-4" /> Serangan Biasa
              </button>

              <button
                onClick={() => handleBattleAction('slash')}
                className="bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-2xl font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4" /> Special Slash (-10 MP)
              </button>

              <button
                onClick={() => handleBattleAction('heal')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current" /> Potion HP
              </button>

              <button
                onClick={() => handleBattleAction('run')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-2xl font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Footprints className="w-4 h-4" /> Kabur
              </button>
            </div>

            {/* BATTLE LOGS */}
            <div className="bg-[#1A1311] p-3 rounded-2xl border border-slate-800 max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-slate-300">
              {battleState.logs.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  {log}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* MODAL GAME OVER */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border-2 border-rose-500 text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 text-center space-y-5 relative">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Skull className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Gugur Di Labirin</span>
              <h3 className="text-3xl font-black text-white">Game Over</h3>
              <p className="text-xs text-slate-300">
                Perjalananmu terhenti di Lantai {floor}. Coba latih strategi dan kumpulkan equipment lebih kuat!
              </p>
            </div>

            <button
              onClick={restartGame}
              className="w-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3.5 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Coba Lagi Dari Lantai 1
            </button>
          </div>
        </div>
      )}

      {/* MODAL VICTORY / KEMENANGAN MUTLAK */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border-2 border-[#C5A059] text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 text-center space-y-5 relative">
            <div className="w-16 h-16 bg-[#C5A059]/20 border border-[#C5A059] text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Kemenangan Mutlak!</span>
              <h3 className="text-3xl font-black text-white">Raja Labirin Kost</h3>
              <p className="text-xs text-slate-300">
                Selamat! Kamu berhasil mengalahkan Ibu Kost SuperAdmin dan menaklukkan seluruh 5 lantai labirin!
              </p>
            </div>

            <button
              onClick={restartGame}
              className="w-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] py-3.5 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Main Lagi Dari Awal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}