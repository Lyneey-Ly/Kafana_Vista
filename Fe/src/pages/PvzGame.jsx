import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// PVZ SYNTHESIZER (WEB AUDIO API SOUND SYS)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    try {
      switch (type) {
        case 'sun': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'shoot': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
        case 'freeze_shoot': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        case 'splat': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'explosion': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(20, now + 0.5);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
        case 'plant': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }
        case 'mower': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.linearRampToValueAtTime(220, now + 0.4);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }
        case 'chomp': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
        case 'victory': {
          [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.2, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.3);
          });
          break;
        }
        case 'gameover': {
          [300, 260, 220, 150].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.2);
            gain.gain.setValueAtTime(0.2, now + idx * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.2 + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.2);
            osc.stop(now + idx * 0.2 + 0.4);
          });
          break;
        }
        default:
          break;
      }
    } catch {
      // Audio context fallbacks
    }
  }
}

const soundEngine = new SoundEngine();

// ==========================================
// GAME CONSTANTS & CONFIGURATIONS
// ==========================================
const GRID_ROWS = 5;
const GRID_COLS = 9;

const PLANT_TYPES = {
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    cost: 50,
    hp: 300,
    cooldown: 7.5,
    icon: '🌻',
    desc: 'Produces extra Sun periodically.',
    sunInterval: 10, // seconds
    color: 'bg-amber-400 border-amber-600',
  },
  peashooter: {
    id: 'peashooter',
    name: 'Peashooter',
    cost: 100,
    hp: 300,
    cooldown: 7.5,
    icon: '🌱',
    desc: 'Shoots normal peas at approaching zombies.',
    fireRate: 1.5,
    damage: 20,
    color: 'bg-emerald-500 border-emerald-700',
  },
  wallnut: {
    id: 'wallnut',
    name: 'Wall-nut',
    cost: 50,
    hp: 3000,
    cooldown: 20,
    icon: '🥔',
    desc: 'Has heavy armor to stall incoming zombies.',
    color: 'bg-amber-700 border-amber-900',
  },
  cherrybomb: {
    id: 'cherrybomb',
    name: 'Cherry Bomb',
    cost: 150,
    hp: 300,
    cooldown: 35,
    icon: '🍒',
    desc: 'Explodes immediately, damaging zombies in 3x3 radius.',
    damage: 1800,
    color: 'bg-red-600 border-red-800',
  },
  snowpea: {
    id: 'snowpea',
    name: 'Snow Pea',
    cost: 175,
    hp: 300,
    cooldown: 10,
    icon: '❄️',
    desc: 'Shoots frozen peas that damage and slow down zombies.',
    fireRate: 1.5,
    damage: 20,
    slowFactor: 0.5,
    slowDuration: 3,
    color: 'bg-cyan-400 border-cyan-600',
  },
};

const ZOMBIE_TYPES = {
  regular: {
    id: 'regular',
    name: 'Zombie',
    hp: 200,
    speed: 0.08, // Grid units per second
    attackDamage: 100, // DPS against plants
    icon: '🧟',
    color: 'bg-zinc-600 border-zinc-800',
  },
  conehead: {
    id: 'conehead',
    name: 'Conehead',
    hp: 560,
    speed: 0.08,
    attackDamage: 100,
    icon: '🧟‍♂️',
    headgear: '⚠️',
    color: 'bg-orange-600 border-orange-800',
  },
  buckethead: {
    id: 'buckethead',
    name: 'Buckethead',
    hp: 1300,
    speed: 0.08,
    attackDamage: 100,
    icon: '🧟‍♀️',
    headgear: '🪣',
    color: 'bg-slate-700 border-slate-900',
  },
  polevaulter: {
    id: 'polevaulter',
    name: 'Pole Vaulter',
    hp: 340,
    speed: 0.18, // Fast sprint initially
    attackDamage: 100,
    icon: '🏃‍♂️',
    headgear: '🦯',
    hasVaulted: false,
    color: 'bg-amber-600 border-amber-800',
  },
};

const WAVE_CONFIG = {
  1: {
    totalZombies: 10,
    spawnInterval: 6,
    allowedTypes: ['regular'],
    label: 'Wave 1: Zombie Outbreak',
  },
  2: {
    totalZombies: 18,
    spawnInterval: 4.5,
    allowedTypes: ['regular', 'conehead', 'polevaulter'],
    label: 'Wave 2: Heavy Invasion',
  },
  3: {
    totalZombies: 30,
    spawnInterval: 3,
    allowedTypes: ['regular', 'conehead', 'buckethead', 'polevaulter'],
    label: 'FINAL WAVE: Total Armageddon',
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function PvZGame() {
  // Game state
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, PAUSED, GAMEOVER, VICTORY
  const [gameSpeed, setGameSpeed] = useState(1);
  const [soundOn, setSoundOn] = useState(true);

  // Stats & Economy
  const [sun, setSun] = useState(150);
  const [score, setScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [zombiesSpawnedInWave, setZombiesSpawnedInWave] = useState(0);
  const [zombiesKilledInWave, setZombiesKilledInWave] = useState(0);

  // Selection & Tools
  const [selectedTool, setSelectedTool] = useState(null); // plant ID or 'shovel'
  const [cooldowns, setCooldowns] = useState({
    sunflower: 0,
    peashooter: 0,
    wallnut: 0,
    cherrybomb: 0,
    snowpea: 0,
  });

  // Entities state
  const [grid, setGrid] = useState(() => Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null)));
  const [projectiles, setProjectiles] = useState([]);
  const [zombies, setZombies] = useState([]);
  const [suns, setSuns] = useState([]);
  const [mowers, setMowers] = useState(() => Array(GRID_ROWS).fill(null).map((_, idx) => ({ row: idx, active: true, x: 0 })));
  const [effects, setEffects] = useState([]); // Visual explosion/cherry bomb effects

  // Timers & Loop references
  const lastTickTimeRef = useRef(Date.now());
  const nextNaturalSunTimeRef = useRef(0);
  const nextZombieSpawnTimeRef = useRef(0);
  const animFrameIdRef = useRef(null);

  // Toggle sound
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.enabled = next;
  };

  // Start or Reset Game
  const startNewGame = (startingWave = 1) => {
    setGameState('PLAYING');
    setSun(150);
    setScore(0);
    setCurrentWave(startingWave);
    setZombiesSpawnedInWave(0);
    setZombiesKilledInWave(0);
    setSelectedTool(null);
    setGrid(Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null)));
    setProjectiles([]);
    setZombies([]);
    setSuns([]);
    setMowers(Array(GRID_ROWS).fill(null).map((_, idx) => ({ row: idx, active: true, x: 0 })));
    setEffects([]);
    setCooldowns({ sunflower: 0, peashooter: 0, wallnut: 0, cherrybomb: 0, snowpea: 0 });

    const now = Date.now();
    lastTickTimeRef.current = now;
    nextNaturalSunTimeRef.current = now + 4000;
    nextZombieSpawnTimeRef.current = now + 8000;
  };

  // Spawn Natural Sun from Sky
  const spawnNaturalSun = useCallback(() => {
    const targetX = Math.floor(Math.random() * (GRID_COLS - 1)) + 0.5;
    const targetY = Math.floor(Math.random() * GRID_ROWS) + 0.5;

    const newSun = {
      id: 'sun_' + Math.random().toString(36).substring(2, 9),
      x: targetX,
      y: -1, // start above screen
      targetY: targetY,
      value: 25,
      createdAt: Date.now(),
      lifetime: 12, // disappears after 12s
      isFalling: true,
    };
    setSuns((prev) => [...prev, newSun]);
  }, []);

  // Collect Sun Action
  const collectSun = (id, e) => {
    if (e) e.stopPropagation();
    soundEngine.play('sun');
    setSun((prev) => prev + 25);
    setSuns((prev) => prev.filter((s) => s.id !== id));
  };

  // Spawn Zombie Action
  const spawnZombie = useCallback(() => {
    const waveInfo = WAVE_CONFIG[currentWave];
    if (!waveInfo) return;

    const allowed = waveInfo.allowedTypes;
    const typeKey = allowed[Math.floor(Math.random() * allowed.length)];
    const typeData = ZOMBIE_TYPES[typeKey];
    const row = Math.floor(Math.random() * GRID_ROWS);

    const newZombie = {
      id: 'zombie_' + Math.random().toString(36).substring(2, 9),
      type: typeKey,
      row: row,
      x: GRID_COLS, // Start at far right boundary
      hp: typeData.hp,
      maxHp: typeData.hp,
      speed: typeData.speed,
      currentSpeed: typeData.speed,
      attackDamage: typeData.attackDamage,
      icon: typeData.icon,
      headgear: typeData.headgear || null,
      hasVaulted: typeData.hasVaulted !== undefined ? false : true,
      slowTimer: 0,
      flashRedTimer: 0,
    };

    setZombies((prev) => [...prev, newZombie]);
    setZombiesSpawnedInWave((prev) => prev + 1);
  }, [currentWave]);

  // Main Game Loop Handler
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const updateLoop = () => {
      const now = Date.now();
      const deltaRaw = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      // Apply speed multiplier
      const delta = Math.min(deltaRaw * gameSpeed, 0.1);

      // 1. Natural Sun Spawning
      if (now >= nextNaturalSunTimeRef.current) {
        spawnNaturalSun();
        nextNaturalSunTimeRef.current = now + (8000 + Math.random() * 5000) / gameSpeed;
      }

      // 2. Zombie Spawning Logic
      const waveInfo = WAVE_CONFIG[currentWave];
      if (waveInfo && zombiesSpawnedInWave < waveInfo.totalZombies) {
        if (now >= nextZombieSpawnTimeRef.current) {
          spawnZombie();
          nextZombieSpawnTimeRef.current = now + (waveInfo.spawnInterval * 1000) / gameSpeed;
        }
      } else if (waveInfo && zombiesKilledInWave >= waveInfo.totalZombies && zombies.length === 0) {
        // Wave Completed
        if (currentWave < 3) {
          soundEngine.play('victory');
          setCurrentWave((prev) => prev + 1);
          setZombiesSpawnedInWave(0);
          setZombiesKilledInWave(0);
          nextZombieSpawnTimeRef.current = now + 6000;
        } else {
          // Entire Game Cleared!
          soundEngine.play('victory');
          setGameState('VICTORY');
          return;
        }
      }

      // 3. Update Cooldowns
      setCooldowns((prev) => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - delta);
            changed = true;
          }
        });
        return changed ? updated : prev;
      });

      // 4. Update Falling Suns
      setSuns((prev) =>
        prev
          .map((s) => {
            if (s.isFalling && s.y < s.targetY) {
              return { ...s, y: Math.min(s.targetY, s.y + delta * 2) };
            }
            return s;
          })
          .filter((s) => (now - s.createdAt) / 1000 < s.lifetime)
      );

      // 5. Update Visual Effects/Explosions
      setEffects((prev) =>
        prev
          .map((eff) => ({ ...eff, duration: eff.duration - delta }))
          .filter((eff) => eff.duration > 0)
      );

      // 6. Update Lawn Mowers Logic
      setMowers((prevMowers) => {
        return prevMowers.map((mower) => {
          if (!mower.active && mower.x > 0 && mower.x < GRID_COLS + 1) {
            return { ...mower, x: mower.x + delta * 8 }; // Lawn mower zooms right
          }
          return mower;
        });
      });

      // 7. Grid & Plants Tick (Shooting, Sun Generation, Cherry Bomb)
      setGrid((prevGrid) => {
        const nextGrid = prevGrid.map((row) => [...row]);
        let projectilesToAdd = [];
        let sunsToAdd = [];
        let newEffects = [];

        for (let r = 0; r < GRID_ROWS; r++) {
          // Check if zombies present in this row
          const zombiesInRow = zombies.some((z) => z.row === r && z.x > 0 && z.x < GRID_COLS);

          for (let c = 0; c < GRID_COLS; c++) {
            const plant = nextGrid[r][c];
            if (!plant) continue;

            const timeAlive = (now - plant.createdAt) / 1000;

            // Flash red recovery
            if (plant.flashRedTimer > 0) {
              plant.flashRedTimer -= delta;
            }

            // Sunflower Logic
            if (plant.type === 'sunflower') {
              if (now - plant.lastActionTime >= PLANT_TYPES.sunflower.sunInterval * 1000) {
                plant.lastActionTime = now;
                sunsToAdd.push({
                  id: 'sun_' + Math.random().toString(36).substring(2, 9),
                  x: c + 0.3 + (Math.random() * 0.4 - 0.2),
                  y: r + 0.3,
                  targetY: r + 0.3,
                  value: 25,
                  createdAt: now,
                  lifetime: 10,
                  isFalling: false,
                });
              }
            }

            // Peashooter & Snowpea Logic
            if ((plant.type === 'peashooter' || plant.type === 'snowpea') && zombiesInRow) {
              const fireRate = PLANT_TYPES[plant.type].fireRate;
              if (now - plant.lastActionTime >= fireRate * 1000) {
                plant.lastActionTime = now;
                soundEngine.play(plant.type === 'snowpea' ? 'freeze_shoot' : 'shoot');
                projectilesToAdd.push({
                  id: 'proj_' + Math.random().toString(36).substring(2, 9),
                  type: plant.type === 'snowpea' ? 'snowpea' : 'pea',
                  row: r,
                  x: c + 0.5,
                  damage: PLANT_TYPES[plant.type].damage,
                  slow: plant.type === 'snowpea',
                });
              }
            }

            // Cherry Bomb Logic
            if (plant.type === 'cherrybomb') {
              if (timeAlive >= 1.0) {
                // EXPLODE!
                soundEngine.play('explosion');
                newEffects.push({
                  id: 'eff_' + Math.random().toString(36).substring(2, 9),
                  type: 'cherry_explosion',
                  r: r,
                  c: c,
                  duration: 0.8,
                });

                // Damage all zombies in 3x3 radius
                setZombies((prevZombies) =>
                  prevZombies.map((z) => {
                    if (Math.abs(z.row - r) <= 1 && Math.abs(z.x - c) <= 1.5) {
                      return {
                        ...z,
                        hp: z.hp - PLANT_TYPES.cherrybomb.damage,
                        flashRedTimer: 0.3,
                      };
                    }
                    return z;
                  })
                );

                nextGrid[r][c] = null; // Cherry bomb consumed
              }
            }
          }
        }

        if (projectilesToAdd.length > 0) {
          setProjectiles((prev) => [...prev, ...projectilesToAdd]);
        }
        if (sunsToAdd.length > 0) {
          setSuns((prev) => [...prev, ...sunsToAdd]);
        }
        if (newEffects.length > 0) {
          setEffects((prev) => [...prev, ...newEffects]);
        }

        return nextGrid;
      });

      // 8. Update Projectiles Movement & Hit Collisions
      setProjectiles((prevProj) => {
        const remainingProj = [];

        prevProj.forEach((p) => {
          let newX = p.x + delta * 6; // Pea speed
          let hit = false;

          // Check hit against zombies in same row
          setZombies((prevZombies) => {
            return prevZombies.map((z) => {
              if (!hit && z.row === p.row && newX >= z.x - 0.2 && newX <= z.x + 0.5) {
                hit = true;
                soundEngine.play('splat');
                const newHp = z.hp - p.damage;
                return {
                  ...z,
                  hp: newHp,
                  flashRedTimer: 0.2,
                  slowTimer: p.slow ? 3.0 : z.slowTimer, // 3s freeze slow
                };
              }
              return z;
            });
          });

          if (!hit && newX < GRID_COLS) {
            remainingProj.push({ ...p, x: newX });
          }
        });

        return remainingProj;
      });

      // 9. Update Zombies Movement, Pole Vaulting, Plant Eating, Lawn Mower Collisions & Defeat
      setZombies((prevZombies) => {
        let zombiesKilledCount = 0;
        const updatedZombies = [];

        for (let z of prevZombies) {
          // Dead zombie check
          if (z.hp <= 0) {
            zombiesKilledCount++;
            setScore((s) => s + 50);
            continue; // despawn
          }

          // Slow duration tick
          let currentSlowTimer = Math.max(0, z.slowTimer - delta);
          let currentSpeed = currentSlowTimer > 0 ? z.speed * 0.5 : z.speed;

          // Red flash timer tick
          let currentFlashTimer = Math.max(0, z.flashRedTimer - delta);

          // Grid cell currently occupied
          const currentCol = Math.floor(z.x);
          let isEating = false;
          let vaultTriggered = false;

          // Check interaction with Plant at current tile
          if (currentCol >= 0 && currentCol < GRID_COLS) {
            const plantInTile = grid[z.row][currentCol];

            if (plantInTile) {
              // Pole Vaulter jump mechanics
              if (z.type === 'polevaulter' && !z.hasVaulted) {
                vaultTriggered = true;
              } else {
                // Regular Eating Logic
                isEating = true;

                // Deal damage to plant
                setGrid((prevGrid) => {
                  const nextGrid = prevGrid.map((r) => [...r]);
                  const p = nextGrid[z.row][currentCol];
                  if (p) {
                    p.hp -= z.attackDamage * delta;
                    p.flashRedTimer = 0.1;

                    if (Math.random() < 0.1) soundEngine.play('chomp');

                    if (p.hp <= 0) {
                      nextGrid[z.row][currentCol] = null; // Plant destroyed!
                    }
                  }
                  return nextGrid;
                });
              }
            }
          }

          // Movement Update
          let nextX = z.x;
          let hasVaultedNow = z.hasVaulted;

          if (vaultTriggered) {
            nextX = z.x - 1.2; // Jump over plant tile
            hasVaultedNow = true;
            currentSpeed = ZOMBIE_TYPES.regular.speed; // Slow down to normal speed after vaulting
          } else if (!isEating) {
            nextX = z.x - currentSpeed * delta;
          }

          // Check Lawn Mower Trigger
          if (nextX <= 0) {
            const mower = mowers[z.row];
            if (mower && mower.active) {
              // Trigger Mower
              soundEngine.play('mower');
              setMowers((prev) =>
                prev.map((m) => (m.row === z.row ? { ...m, active: false, x: 0.1 } : m))
              );
            } else if (mower && !mower.active && mower.x > 0) {
              // Lawn Mower is active and crushing zombies in this row
              if (z.x <= mower.x + 0.5) {
                zombiesKilledCount++;
                setScore((s) => s + 50);
                continue; // Crushed by mower!
              }
            } else if (nextX <= -0.8) {
              // ZOMBIE REACHED HOUSE - GAME OVER!
              soundEngine.play('gameover');
              setGameState('GAMEOVER');
              return prevZombies;
            }
          }

          updatedZombies.push({
            ...z,
            x: nextX,
            speed: currentSpeed,
            slowTimer: currentSlowTimer,
            flashRedTimer: currentFlashTimer,
            hasVaulted: hasVaultedNow,
          });
        }

        if (zombiesKilledCount > 0) {
          setZombiesKilledInWave((k) => k + zombiesKilledCount);
        }

        return updatedZombies;
      });

      animFrameIdRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, gameSpeed, currentWave, zombiesSpawnedInWave, zombiesKilledInWave, zombies, grid, mowers, spawnNaturalSun, spawnZombie]);

  // Handle Planting or Shoveling on Grid Cell Click
  const handleCellClick = (r, c) => {
    if (gameState !== 'PLAYING') return;

    // SHOVEL REMOVAL
    if (selectedTool === 'shovel') {
      if (grid[r][c]) {
        soundEngine.play('plant');
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = null;
          return next;
        });
        setSelectedTool(null);
      }
      return;
    }

    // PLANT PLACEMENT
    if (!selectedTool || !PLANT_TYPES[selectedTool]) return;

    const plantDef = PLANT_TYPES[selectedTool];

    // Checks
    if (grid[r][c] !== null) return; // Tile occupied
    if (sun < plantDef.cost) return; // Not enough sun
    if (cooldowns[selectedTool] > 0) return; // In cooldown

    // Deduct Sun & set Cooldown
    soundEngine.play('plant');
    setSun((prev) => prev - plantDef.cost);
    setCooldowns((prev) => ({ ...prev, [selectedTool]: plantDef.cooldown }));

    // Place Plant
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = {
        type: selectedTool,
        hp: plantDef.hp,
        maxHp: plantDef.hp,
        createdAt: Date.now(),
        lastActionTime: Date.now(),
        flashRedTimer: 0,
      };
      return next;
    });

    setSelectedTool(null);
  };

  const waveData = WAVE_CONFIG[currentWave] || WAVE_CONFIG[1];
  const waveProgressPercent = Math.min(
    100,
    Math.floor(((zombiesSpawnedInWave + zombiesKilledInWave) / (waveData.totalZombies * 2)) * 100)
  );

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* APP HEADER / CONTAINER */}
      <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-2xl border-4 border-emerald-600/50 overflow-hidden flex flex-col">
        {/* TOP HUD BAR */}
        <div className="bg-slate-950 p-3 sm:p-4 border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-3">
          {/* SUN COUNTER */}
          <div className="flex items-center bg-amber-950/80 border-2 border-amber-500/60 rounded-xl px-4 py-1.5 shadow-inner">
            <span className="text-3xl animate-bounce mr-2">☀️</span>
            <div>
              <div className="text-xs text-amber-300 font-bold tracking-wider uppercase">Sun</div>
              <div className="text-2xl font-black text-amber-400 leading-none">{sun}</div>
            </div>
          </div>

          {/* PLANT SELECTION BAR */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-2 bg-slate-900/90 rounded-xl border border-slate-700">
            {Object.keys(PLANT_TYPES).map((key) => {
              const plant = PLANT_TYPES[key];
              const isCoolingDown = cooldowns[key] > 0;
              const canAfford = sun >= plant.cost;
              const isSelected = selectedTool === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedTool(isSelected ? null : key)}
                  disabled={!canAfford || isCoolingDown || gameState !== 'PLAYING'}
                  className={`relative flex flex-col items-center justify-between w-14 h-16 sm:w-16 sm:h-20 rounded-lg p-1 transition-all duration-150 border-2 ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-500/20 scale-105 shadow-lg shadow-yellow-500/30'
                      : canAfford && !isCoolingDown
                      ? 'border-slate-600 bg-slate-800 hover:border-emerald-400 hover:bg-slate-700'
                      : 'border-slate-800 bg-slate-900 opacity-60 cursor-not-allowed'
                  }`}
                  title={`${plant.name} - ${plant.desc}`}
                >
                  <span className="text-2xl sm:text-3xl mt-0.5">{plant.icon}</span>
                  <div className="text-[10px] sm:text-xs font-black text-amber-300 bg-black/60 w-full rounded text-center py-0.5">
                    ☀️ {plant.cost}
                  </div>

                  {/* COOLDOWN OVERLAY */}
                  {isCoolingDown && (
                    <div className="absolute inset-0 bg-slate-950/80 rounded-lg flex items-center justify-center font-bold text-xs text-cyan-400 backdrop-blur-[1px]">
                      {Math.ceil(cooldowns[key])}s
                    </div>
                  )}
                </button>
              );
            })}

            {/* SHOVEL TOOL */}
            <button
              onClick={() => setSelectedTool(selectedTool === 'shovel' ? null : 'shovel')}
              disabled={gameState !== 'PLAYING'}
              className={`relative flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-20 rounded-lg p-1 transition-all duration-150 border-2 ${
                selectedTool === 'shovel'
                  ? 'border-red-500 bg-red-500/20 scale-105 shadow-lg shadow-red-500/30'
                  : 'border-slate-600 bg-slate-800 hover:border-red-400 hover:bg-slate-700'
              }`}
              title="Shovel: Remove a plant from the grid"
            >
              <span className="text-2xl sm:text-3xl">🧹</span>
              <span className="text-[10px] sm:text-xs font-bold text-red-300 mt-1">Remove</span>
            </button>
          </div>

          {/* CONTROLS & HUD METRICS */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : 1)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-bold text-xs text-amber-400 transition"
            >
              ⚡ {gameSpeed}x Speed
            </button>
            <button
              onClick={toggleSound}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm"
              title="Toggle Audio Synthesizer"
            >
              {soundOn ? '🔊' : '🔇'}
            </button>
            {gameState === 'PLAYING' && (
              <button
                onClick={() => setGameState('PAUSED')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow transition"
              >
                ⏸ Pause
              </button>
            )}
          </div>
        </div>

        {/* WAVE PROGRESS BANNER */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">{waveData.label}</span>
            <span className="text-slate-500">|</span>
            <span>Score: <strong className="text-white">{score}</strong></span>
          </div>

          <div className="flex items-center gap-3 w-48 sm:w-64">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Progress</span>
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${waveProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* MAIN GAME LAWN viewport */}
        <div className="relative w-full aspect-[16/9] max-h-[600px] bg-emerald-800 overflow-hidden select-none">
          {/* START / MAIN MENU OVERLAY */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="text-5xl sm:text-7xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-red-500 mb-2">
                PLANTS vs ZOMBIES
              </div>
              <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8">
                Defend your garden from invading zombie hordes using an arsenal of lawn-defense plants!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                <button
                  onClick={() => startNewGame(1)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-lg shadow-emerald-600/40 hover:scale-105 transition"
                >
                  🌻 PLAY GAME
                </button>
              </div>

              {/* HOW TO PLAY INSTRUCTIONS */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl text-left text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-amber-400 mb-1">1. Collect Sun</div>
                  <p className="text-slate-400">Click falling suns ☀️ or plant Sunflowers to generate currency.</p>
                </div>
                <div>
                  <div className="font-bold text-emerald-400 mb-1">2. Plant Defenses</div>
                  <p className="text-slate-400">Select plant cards and place them on the grass tiles.</p>
                </div>
                <div>
                  <div className="font-bold text-cyan-400 mb-1">3. Stop Zombies</div>
                  <p className="text-slate-400">Peashooters & Snow Peas attack zombies along their lane.</p>
                </div>
                <div>
                  <div className="font-bold text-red-400 mb-1">4. Emergency Mowers</div>
                  <p className="text-slate-400">Lawn mowers at the far left act as your last line of defense.</p>
                </div>
              </div>
            </div>
          )}

          {/* PAUSE OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <h2 className="text-4xl font-black text-amber-400 mb-6">GAME PAUSED</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
                >
                  ▶ Resume
                </button>
                <button
                  onClick={() => setGameState('MENU')}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow transition"
                >
                  🏠 Main Menu
                </button>
              </div>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <span className="text-6xl mb-2">🧟‍♂️🧠</span>
              <h2 className="text-5xl font-black text-red-500 mb-2">THE ZOMBIES ATE YOUR BRAINS!</h2>
              <p className="text-slate-300 mb-6">Your front lawn defenses were completely overrun.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => startNewGame(currentWave)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl shadow-lg shadow-red-600/40 transition hover:scale-105"
                >
                  🔄 Retry Wave {currentWave}
                </button>
                <button
                  onClick={() => setGameState('MENU')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                >
                  Main Menu
                </button>
              </div>
            </div>
          )}

          {/* VICTORY OVERLAY */}
          {gameState === 'VICTORY' && (
            <div className="absolute inset-0 z-50 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <span className="text-6xl mb-2">🏆🌻</span>
              <h2 className="text-5xl font-black text-amber-300 mb-2">VICTORY! YOU DEFENDED THE LAWN!</h2>
              <p className="text-emerald-200 mb-6">All zombie waves have been defeated successfully!</p>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/40 mb-6 w-64 text-left">
                <div className="flex justify-between text-sm py-1 border-b border-slate-800">
                  <span className="text-slate-400">Final Score:</span>
                  <span className="font-bold text-amber-400">{score}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-400">Sun Remaining:</span>
                  <span className="font-bold text-amber-400">{sun}</span>
                </div>
              </div>
              <button
                onClick={() => startNewGame(1)}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl rounded-xl shadow-lg transition hover:scale-105"
              >
                🎮 Play Again
              </button>
            </div>
          )}

          {/* LAWN GRID CONTAINER */}
          <div className="absolute inset-0 grid grid-rows-5 h-full w-full">
            {grid.map((row, r) => (
              <div key={r} className="flex h-full w-full border-b border-emerald-900/40 last:border-b-0 relative">
                {/* LAWN MOWER AT FAR LEFT */}
                <div
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 transition-all duration-75"
                  style={{
                    transform: `translate(${mowers[r].x * 100}%, -50%)`,
                  }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg border-2 border-red-800 shadow-md flex items-center justify-center text-xl sm:text-2xl">
                    🚜
                  </div>
                </div>

                {/* TILE COLUMNS */}
                {row.map((plant, c) => {
                  const isCheckerboard = (r + c) % 2 === 0;
                  return (
                    <div
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      className={`flex-1 h-full relative cursor-pointer border-r border-emerald-900/20 transition-colors ${
                        isCheckerboard ? 'bg-emerald-600/90' : 'bg-emerald-700/90'
                      } hover:bg-emerald-500/80`}
                    >
                      {/* CELL HIGHLIGHT WHEN TOOL SELECTED */}
                      {selectedTool && (
                        <div className="absolute inset-0 bg-yellow-400/10 border-2 border-dashed border-yellow-400/40 pointer-events-none" />
                      )}

                      {/* PLANTED ENTITY */}
                      {plant && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          {/* HEALTH BAR */}
                          {plant.hp < plant.maxHp && (
                            <div className="absolute top-1 w-3/4 h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700">
                              <div
                                className="h-full bg-emerald-400 transition-all"
                                style={{ width: `${Math.max(0, (plant.hp / plant.maxHp) * 100)}%` }}
                              />
                            </div>
                          )}

                          {/* PLANT EMOJI / VISUAL */}
                          <div
                            className={`text-3xl sm:text-4xl transition-transform ${
                              plant.flashRedTimer > 0 ? 'brightness-150 saturate-200 scale-110 text-red-500' : ''
                            }`}
                          >
                            {PLANT_TYPES[plant.type].icon}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* PROJECTILES OVERLAY */}
          {projectiles.map((p) => (
            <div
              key={p.id}
              className="absolute z-20 pointer-events-none transition-all duration-75"
              style={{
                top: `${p.row * 20 + 7}%`,
                left: `${(p.x / GRID_COLS) * 100}%`,
              }}
            >
              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md ${
                  p.type === 'snowpea'
                    ? 'bg-cyan-300 border-2 border-cyan-500 shadow-cyan-400/50'
                    : 'bg-lime-400 border-2 border-lime-600 shadow-lime-500/50'
                }`}
              />
            </div>
          ))}

          {/* ZOMBIES OVERLAY */}
          {zombies.map((z) => {
            const isSlowed = z.slowTimer > 0;
            const isFlashing = z.flashRedTimer > 0;

            return (
              <div
                key={z.id}
                className="absolute z-30 pointer-events-none transition-all duration-75 flex flex-col items-center"
                style={{
                  top: `${z.row * 20 + 2}%`,
                  left: `${(z.x / GRID_COLS) * 100}%`,
                  width: `${100 / GRID_COLS}%`,
                }}
              >
                {/* ZOMBIE HEALTH BAR */}
                {z.hp < z.maxHp && (
                  <div className="w-10 h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700 mb-0.5">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${Math.max(0, (z.hp / z.maxHp) * 100)}%` }}
                    />
                  </div>
                )}

                {/* ZOMBIE SPRITE CONTAINER */}
                <div className="relative">
                  {/* HEADGEAR / ACCESSORY */}
                  {z.headgear && z.hp > ZOMBIE_TYPES.regular.hp && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg z-10 animate-bounce">
                      {z.headgear}
                    </div>
                  )}

                  {/* ZOMBIE ICON */}
                  <div
                    className={`text-3xl sm:text-4xl filter transition-all ${
                      isSlowed ? 'hue-rotate-180 brightness-90' : ''
                    } ${isFlashing ? 'brightness-200 saturate-200' : ''}`}
                  >
                    {z.icon}
                  </div>
                </div>
              </div>
            );
          })}

          {/* SUNS OVERLAY (COLLECTIBLES) */}
          {suns.map((s) => (
            <button
              key={s.id}
              onClick={(e) => collectSun(s.id, e)}
              className="absolute z-40 cursor-pointer animate-pulse hover:scale-125 transition-transform"
              style={{
                top: `${s.y * 20 + 3}%`,
                left: `${(s.x / GRID_COLS) * 100}%`,
              }}
            >
              <div className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                ☀️
              </div>
            </button>
          ))}

          {/* CHERRY BOMB EXPLOSION EFFECTS */}
          {effects.map((eff) => (
            <div
              key={eff.id}
              className="absolute z-40 pointer-events-none flex items-center justify-center animate-ping"
              style={{
                top: `${(eff.r - 1) * 20}%`,
                left: `${((eff.c - 1) / GRID_COLS) * 100}%`,
                width: `${(3 / GRID_COLS) * 100}%`,
                height: '60%',
              }}
            >
              <div className="w-full h-full bg-red-500/40 rounded-full border-4 border-yellow-400 flex items-center justify-center text-4xl sm:text-6xl font-black text-yellow-300">
                💥 BOOM!
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER BAR */}
        <div className="bg-slate-950 p-2 text-center text-xs text-slate-500 border-t border-slate-800">
          Plants vs. Zombies Clone — Built with React & Tailwind CSS
        </div>
      </div>
    </div>
  );
}