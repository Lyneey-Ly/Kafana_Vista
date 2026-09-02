import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BookOpen, 
  Feather, 
  Shield, 
  Sword, 
  Heart, 
  Zap, 
  Coins, 
  Package, 
  Save, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trophy, 
  History, 
  HelpCircle,
  ChevronRight,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Skull,
  Crown,
  Key,
  FastForward
} from 'lucide-react';

// ==========================================
// DATASET SCENE GRAPH (ALUR CERITA BERCABANG)
// ==========================================
const SCENE_DATA = {
  start: {
    id: 'start',
    title: 'Gerbang Labirin Kafana',
    location: 'Lantai Dasar - Pintu Masuk',
    text: 'Anda berdiri di depan gerbang batu raksasa berpola pahatan emas khas Kafana Vista. Udara dingin bertiup dari dalam lorong gelap. Di lantai dekat kaki Anda, terdapat sebuah kotak kayu tua yang berdebu dan dua jalan bercabang.',
    choices: [
      {
        text: 'Buka kotak kayu tua di lantai',
        targetScene: 'open_box',
        statChanges: { gold: 15 },
        loot: { hpPotions: 1 },
        logText: 'Anda memeriksa kotak kayu dan menemukan beberapa koin emas serta HP Potion.'
      },
      {
        text: 'Masuk melalui Lorong Utama yang Megah',
        targetScene: 'main_hall',
        logText: 'Anda melangkah mantap memasuki Lorong Utama yang megah.'
      },
      {
        text: 'Menyelinap lewat Lorong Samping yang Gelap',
        targetScene: 'side_corridor',
        logText: 'Anda memilih menyelinap secara hati-hati lewat lorong samping.'
      }
    ]
  },

  open_box: {
    id: 'open_box',
    title: 'Kotak Tua Berdebu',
    location: 'Lantai Dasar - Pintu Masuk',
    text: 'Di dalam kotak kayu, Anda menemukan 15 Koin Emas dan 1 HP Potion! Setelah mengambil barang tersebut, gerbang utama mendadak tertutup rapat di belakang Anda. Tidak ada jalan kembali.',
    choices: [
      {
        text: 'Lanjutkan perjalanan ke Lorong Utama',
        targetScene: 'main_hall',
        logText: 'Anda bergerak menuju Lorong Utama.'
      },
      {
        text: 'Jelajahi Lorong Samping yang Remang',
        targetScene: 'side_corridor',
        logText: 'Anda beralih menelusuri lorong samping.'
      }
    ]
  },

  main_hall: {
    id: 'main_hall',
    title: 'Aula Pilar Emas',
    location: 'Lantai 1 - Aula Utama',
    text: 'Ruangan ini sangat luas dengan pilar-pilar batu berornamen emas yang memantulkan cahaya redup. Di tengah aula, seorang Penjaga Bayangan menghalangi jalan menuju tangga atas. Ia menuntut imbalan atau tantangan bertarung.',
    choices: [
      {
        text: 'Bayar Upeti (Butuh: 30 Gold)',
        targetScene: 'hall_bribe',
        requirement: { gold: 30 },
        statChanges: { gold: -30 },
        logText: 'Anda membayar upeti 30 Gold kepada Penjaga Bayangan.'
      },
      {
        text: 'Lawan Penjaga Bayangan dengan Senjata',
        targetScene: 'fight_guardian',
        logText: 'Anda menarik senjata dan menantang Penjaga Bayangan.'
      },
      {
        text: 'Gunakan Mana untuk Mantra Pengalih (Butuh: 15 MP)',
        targetScene: 'hall_spell',
        requirement: { mp: 15 },
        statChanges: { mp: -15, exp: 25 },
        logText: 'Anda menggunakan 15 MP untuk menciptakan ilusi dan melewatinya.'
      }
    ]
  },

  side_corridor: {
    id: 'side_corridor',
    title: 'Lorong Kuno Berlumut',
    location: 'Lantai 1 - Jalur Samping',
    text: 'Lorong ini penuh dengan ukiran simbol kuno yang memancarkan energi magis. Di ujung lorong terdapat pintu berkunci emas dan sebuah Mata Air Pemulihan yang memancarkan pendar biru.',
    choices: [
      {
        text: 'Minum dari Mata Air Pemulihan',
        targetScene: 'fountain_heal',
        statChanges: { hp: 30, mp: 20 },
        logText: 'Anda meminum air suci, memulihkan HP dan MP.'
      },
      {
        text: 'Buka Pintu Berkunci Emas (Butuh: Kunci Emas)',
        targetScene: 'secret_armory',
        requirement: { item: 'key' },
        logText: 'Anda membuka pintu kunci emas menggunakan Kunci Emas Labirin.'
      },
      {
        text: 'Kembali ke Aula Pilar Utama',
        targetScene: 'main_hall',
        logText: 'Anda memutuskan kembali ke Aula Utama.'
      }
    ]
  },

  hall_bribe: {
    id: 'hall_bribe',
    title: 'Jalan Damai Penjaga',
    location: 'Lantai 1 - Tangga Atas',
    text: 'Penjaga Bayangan menerima koin emas Anda dan membungkuk hormat. Ia memberikan sebuah "Kunci Emas Labirin" dan membukakan pintu rahasia menuju Istana Inti.',
    choices: [
      {
        text: 'Ambil Kunci Emas dan Naik Tangga',
        targetScene: 'boss_preface',
        loot: { key: 1, weapon: 'Pedang Emas Kafana' },
        logText: 'Anda menerima Kunci Emas Labirin dan Pedang Emas Kafana.'
      }
    ]
  },

  fight_guardian: {
    id: 'fight_guardian',
    title: 'Pertarungan Sengit',
    location: 'Lantai 1 - Aula Utama',
    text: 'Pertarungan sengit terjadi! Penjaga Bayangan mengayunkan tombaknya yang tajam. Anda berhasil mengalahkannya, namun terkena tebasan tebal di dada.',
    choices: [
      {
        text: 'Balut Luka dan Ambil Barang Loot (Terkena: -25 HP, +40 EXP)',
        targetScene: 'boss_preface',
        statChanges: { hp: -25, exp: 40, gold: 20 },
        loot: { key: 1 },
        logText: 'Anda mengalahkan penjaga, mendapatkan Kunci Emas (-25 HP, +40 EXP).'
      }
    ]
  },

  hall_spell: {
    id: 'hall_spell',
    title: 'Trik Ilusi Magis',
    location: 'Lantai 1 - Aula Utama',
    text: 'Mantra ilusi Anda membuat Penjaga Bayangan kebingungan menyerang bayangan semu. Anda berhasil menyelinap melewati perbatasan tanpa tergores sedikit pun!',
    choices: [
      {
        text: 'Melangkah ke Gerbang Inti Labirin',
        targetScene: 'boss_preface',
        loot: { key: 1 },
        logText: 'Anda berhasil menyelinap dan mengambil Kunci Emas yang terjatuh.'
      }
    ]
  },

  fountain_heal: {
    id: 'fountain_heal',
    title: 'Mata Air Pemulihan',
    location: 'Lantai 1 - Jalur Samping',
    text: 'Air hangat yang segar menyegarkan seluruh tubuh Anda (+30 HP, +20 MP). Di dasar mata air, Anda melihat pendar berkilau dari Kunci Emas Labirin!',
    choices: [
      {
        text: 'Ambil Kunci Emas dari Dasar Air',
        targetScene: 'side_corridor',
        loot: { key: 1 },
        logText: 'Anda mengambil Kunci Emas Labirin dari dasar mata air.'
      }
    ]
  },

  secret_armory: {
    id: 'secret_armory',
    title: 'Ruang Senjata Rahasia',
    location: 'Ruang Tersembunyi Kuno',
    text: 'Anda memasuki ruangan tersembunyi yang menyimpan artefak legenda Kafana Vista. Di atas altar berdiri Zirah Pelindung Kuno dan pedang yang memancarkan pendar emas mutlak.',
    choices: [
      {
        text: 'Equip Zirah Kuno & Senjata Legenda (+10 ATK, +8 DEF)',
        targetScene: 'boss_preface',
        loot: { weapon: 'Pedang Emas Kafana', armor: 'Zirah Pelindung Kuno' },
        statChanges: { atk: 10, def: 8 },
        logText: 'Anda melengkapi Pedang Emas Kafana & Zirah Pelindung Kuno!'
      }
    ]
  },

  boss_preface: {
    id: 'boss_preface',
    title: 'Gerbang Ruang Singgasana',
    location: 'Lantai Inti - Pintu Abadi',
    text: 'Anda berada di depan Pintu Abadi bertatahkan permata merah. Di balik pintu ini bersemayam "Golem Batu Kafana", entitas kuno yang menjaga rahasia terbesar labirin ini.',
    choices: [
      {
        text: 'Gunakan Kunci Emas untuk Masuk (Butuh: Kunci Emas)',
        targetScene: 'boss_fight',
        requirement: { item: 'key' },
        logText: 'Anda membuka Pintu Abadi menggunakan Kunci Emas Labirin.'
      },
      {
        text: 'Dobrak Pintu dengan Kekuatan Fisik (Butuh: HP >= 50)',
        targetScene: 'boss_fight',
        requirement: { hp: 50 },
        statChanges: { hp: -15 },
        logText: 'Anda mendobrak pintu abadi (-15 HP).'
      }
    ]
  },

  boss_fight: {
    id: 'boss_fight',
    title: 'Pertarungan Akhir: Golem Batu Kafana',
    location: 'Ruang Singgasana Abadi',
    text: 'Golem Batu Kuno bangkit dari tumpukan kristal! Matanya menyala merah membara. Ia mengayunkan tinju raksasanya ke arah Anda!',
    choices: [
      {
        text: 'Serang Inti Kristal dengan Pedang Emas (Butuh: Pedang Emas)',
        targetScene: 'ending_secret',
        requirement: { weapon: 'Pedang Emas Kafana' },
        logText: 'Anda menghancurkan inti kristal dengan Pedang Emas Kafana!'
      },
      {
        text: 'Luncurkan Mantra Serangan Pamungkas (Butuh: 25 MP)',
        targetScene: 'ending_good',
        requirement: { mp: 25 },
        statChanges: { mp: -25 },
        logText: 'Anda melepaskan sihir pamungkas menghancurkan Golem!'
      },
      {
        text: 'Bertahan dan Cari Celah Kelemahan (Terkena: -30 HP)',
        targetScene: 'boss_survival_check',
        statChanges: { hp: -30 },
        logText: 'Anda menahan hantaman keras golem (-30 HP).'
      }
    ]
  },

  boss_survival_check: {
    id: 'boss_survival_check',
    title: 'Kondisi Kritis Pertarungan',
    location: 'Ruang Singgasana Abadi',
    text: 'Hantaman golem membuat fondasi ruangan bergetar hebat. Nafas Anda terengah-engah, namun Golem kini kehilangan keseimbangan!',
    choices: [
      {
        text: 'Lancarkan Serangan Terakhir!',
        targetScene: 'ending_neutral',
        logText: 'Anda berhasil menumbangkan Golem Batu di detik-detik terakhir.'
      }
    ]
  },

  // ==========================================
  // MULTI-ENDING SCENES
  // ==========================================
  ending_secret: {
    id: 'ending_secret',
    title: 'SECRET ENDING: Penguasa Kuno Kafana',
    location: 'Tingkat Tertinggi - Tahta Abadi',
    isEnding: true,
    endingType: 'SECRET ENDING',
    text: 'Pedang Emas Kafana menancap sempurna di inti kristal! Cahaya suci membumbung tinggi, menyerap energi Golem. Seluruh labirin tunduk pada kekuatan Anda. Anda tidak hanya selamat, tetapi diangkat menjadi Penguasa Rahasia Kafana Vista!',
    choices: []
  },

  ending_good: {
    id: 'ending_good',
    title: 'GOOD ENDING: Pahlawan Pembebas Labirin',
    location: 'Gerbang Keluar Luar Labirin',
    isEnding: true,
    endingType: 'GOOD ENDING',
    text: 'Mantra magis Anda menghancurkan Golem Batu menjadi serpihan kristal indah. Reruntuhan labirin terbuka lebar memperlihatkan sinar matahari pagi. Anda berhasil keluar membawa harta dan kehormatan!',
    choices: []
  },

  ending_neutral: {
    id: 'ending_neutral',
    title: 'NEUTRAL ENDING: Selamat Namun Hampa',
    location: 'Luar Labirin - Lembah Kelabu',
    isEnding: true,
    endingType: 'NEUTRAL ENDING',
    text: 'Dengan sisa tenaga terakhir, Anda menumbangkan Golem dan melarikan diri sebelum istana runtuh total. Anda selamat membawa kantong emas, namun rahasia kuno Kafana tenggelam selamanya di dalam tanah.',
    choices: []
  },

  ending_bad: {
    id: 'ending_bad',
    title: 'BAD ENDING: Terjebak Dalam Kegelapan',
    location: 'Kedalaman Jiwa Labirin',
    isEnding: true,
    endingType: 'BAD ENDING',
    text: 'Kekuatan Anda habis terkuras. Bayangan labirin mengurung langkah Anda. Tubuh Anda menjadi bagian dari penjaga rahasia Kafana Vista selamanya...',
    choices: []
  }
};

export default function TeksRPGChooseYourOwnAdventure() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [currentSceneId, setCurrentSceneId] = useState('start');
  const [player, setPlayer] = useState({
    hp: 80,
    maxHp: 100,
    mp: 30,
    maxMp: 50,
    gold: 10,
    level: 1,
    exp: 0,
    maxExp: 100,
    atk: 10,
    def: 5,
    weapon: 'Pisau Belati Biasa',
    armor: 'Pakaian Baju Anak Kost',
    inventory: {
      hpPotions: 2,
      mpPotions: 1,
      key: 0
    }
  });

  const [journal, setJournal] = useState([
    'Petualangan dimulai di Pintu Masuk Labirin Kafana Vista.'
  ]);

  // TYPEWRITER ANIMATION STATE
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'inventory' | 'journal' | 'saveLoad' | 'help'
  const [isMuted, setIsMuted] = useState(false);
  const [saveSlots, setSaveSlots] = useState({ slot1: null, slot2: null, slot3: null });

  const audioCtxRef = useRef(null);
  const typingTimerRef = useRef(null);

  const currentScene = SCENE_DATA[currentSceneId] || SCENE_DATA.start;

  // ==========================================
  // WEB AUDIO API SYNTHESIZER
  // ==========================================
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

      if (type === 'type') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'heal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.12);
          noteGain.gain.setValueAtTime(0.15, now + idx * 0.12);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
          noteOsc.start(now + idx * 0.12);
          noteOsc.stop(now + idx * 0.12 + 0.3);
        });
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  }, [getAudioContext, isMuted]);

  // ==========================================
  // TYPEWRITER ANIMATION EFFECT
  // ==========================================
  useEffect(() => {
    let index = 0;
    const fullText = currentScene.text;
    setDisplayedText('');
    setIsTyping(true);

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        if (index % 3 === 0) playSound('type');
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingTimerRef.current);
      }
    }, 25);

    return () => clearInterval(typingTimerRef.current);
  }, [currentSceneId, playSound]);

  const skipTypewriter = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayedText(currentScene.text);
    setIsTyping(false);
  };

  // ==========================================
  // REQUIREMENT VALIDATION CHECKER
  // ==========================================
  const checkRequirement = (req) => {
    if (!req) return { passed: true };

    if (req.gold && player.gold < req.gold) {
      return { passed: false, reason: `Membutuhkan ${req.gold} Gold` };
    }
    if (req.mp && player.mp < req.mp) {
      return { passed: false, reason: `Membutuhkan ${req.mp} MP` };
    }
    if (req.hp && player.hp < req.hp) {
      return { passed: false, reason: `Membutuhkan minimal ${req.hp} HP` };
    }
    if (req.item === 'key' && player.inventory.key <= 0) {
      return { passed: false, reason: 'Membutuhkan Kunci Emas' };
    }
    if (req.weapon && player.weapon !== req.weapon) {
      return { passed: false, reason: `Membutuhkan ${req.weapon}` };
    }

    return { passed: true };
  };

  // ==========================================
  // HANDLE PILIHAN NAVIGASI NARRATIVE
  // ==========================================
  const handleChoiceSelect = (choice) => {
    if (isTyping) {
      skipTypewriter();
      return;
    }

    const reqCheck = checkRequirement(choice.requirement);
    if (!reqCheck.passed) {
      playSound('hurt');
      return;
    }

    playSound('click');

    // 1. Terapkan Perubahan Statistik Player
    if (choice.statChanges) {
      setPlayer((prev) => {
        let newHp = Math.min(prev.maxHp, Math.max(0, prev.hp + (choice.statChanges.hp || 0)));
        let newMp = Math.min(prev.maxMp, Math.max(0, prev.mp + (choice.statChanges.mp || 0)));
        let newGold = Math.max(0, prev.gold + (choice.statChanges.gold || 0));
        let newAtk = prev.atk + (choice.statChanges.atk || 0);
        let newDef = prev.def + (choice.statChanges.def || 0);
        let newExp = prev.exp + (choice.statChanges.exp || 0);

        if (choice.statChanges.hp && choice.statChanges.hp < 0) playSound('hurt');
        if (choice.statChanges.hp && choice.statChanges.hp > 0) playSound('heal');

        return {
          ...prev,
          hp: newHp,
          mp: newMp,
          gold: newGold,
          atk: newAtk,
          def: newDef,
          exp: newExp
        };
      });
    }

    // 2. Terapkan Loot Barang
    if (choice.loot) {
      setPlayer((prev) => ({
        ...prev,
        weapon: choice.loot.weapon || prev.weapon,
        armor: choice.loot.armor || prev.armor,
        inventory: {
          ...prev.inventory,
          hpPotions: prev.inventory.hpPotions + (choice.loot.hpPotions || 0),
          mpPotions: prev.inventory.mpPotions + (choice.loot.mpPotions || 0),
          key: prev.inventory.key + (choice.loot.key || 0)
        }
      }));
    }

    // 3. Catat ke Jurnal Petualangan
    if (choice.logText) {
      setJournal((prev) => [choice.logText, ...prev]);
    }

    // 4. Cek Kematian Player
    if (player.hp <= 0) {
      setCurrentSceneId('ending_bad');
      return;
    }

    // 5. Pindah Adegan
    setCurrentSceneId(choice.targetScene);
  };

  // ==========================================
  // LOCALSTORAGE SAVE & LOAD SYSTEM
  // ==========================================
  useEffect(() => {
    const loadedSaves = localStorage.getItem('kafana_rpg_saves');
    if (loadedSaves) {
      try {
        setSaveSlots(JSON.parse(loadedSaves));
      } catch (e) {
        console.error("Gagal membaca save slots", e);
      }
    }
  }, []);

  const saveGame = (slotKey) => {
    const saveData = {
      sceneId: currentSceneId,
      player,
      journal,
      savedAt: new Date().toLocaleString('id-ID')
    };

    const newSlots = { ...saveSlots, [slotKey]: saveData };
    setSaveSlots(newSlots);
    localStorage.setItem('kafana_rpg_saves', JSON.stringify(newSlots));
    playSound('heal');
  };

  const loadGame = (slotKey) => {
    const saveData = saveSlots[slotKey];
    if (!saveData) return;

    setCurrentSceneId(saveData.sceneId);
    setPlayer(saveData.player);
    setJournal(saveData.journal);
    setActiveModal(null);
    playSound('click');
  };

  // RESET GAME DARI AWAL
  const restartGame = () => {
    setCurrentSceneId('start');
    setPlayer({
      hp: 80,
      maxHp: 100,
      mp: 30,
      maxMp: 50,
      gold: 10,
      level: 1,
      exp: 0,
      maxExp: 100,
      atk: 10,
      def: 5,
      weapon: 'Pisau Belati Biasa',
      armor: 'Pakaian Baju Anak Kost',
      inventory: { hpPotions: 2, mpPotions: 1, key: 0 }
    });
    setJournal(['Petualangan dimulai kembali dari awal.']);
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-3 md:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto space-y-4">

        {/* HEADER & BRANDING */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#261C19]/20 pb-3">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2.5 bg-[#261C19] text-[#C5A059] rounded-2xl border border-[#C5A059]/40 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
                Interactive Text RPG • Kafana Vista
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-[#261C19] tracking-tight">
                Misteri Labirin <span className="text-[#C5A059]">Kafana</span>
              </h1>
            </div>
          </div>

          {/* ACTION BUTTON NAVBAR */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('inventory')}
              className="flex items-center gap-1.5 bg-[#261C19] hover:bg-[#382a26] text-[#FAF6F0] px-3 py-2 rounded-2xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden sm:inline">Inventori</span>
            </button>

            <button
              onClick={() => setActiveModal('journal')}
              className="flex items-center gap-1.5 bg-[#261C19] hover:bg-[#382a26] text-[#FAF6F0] px-3 py-2 rounded-2xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              <History className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden sm:inline">Jurnal</span>
            </button>

            <button
              onClick={() => setActiveModal('saveLoad')}
              className="flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] px-3 py-2 rounded-2xl text-xs font-black transition shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Simpan / Muat</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-[#261C19] text-[#C5A059] rounded-2xl border border-[#C5A059]/30 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* DASHBOARD STATISTIK KARAKTER */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-4 rounded-3xl border border-[#C5A059]/30 shadow-xl grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* HP STAT */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
              <span className="flex items-center gap-1 text-rose-400"><Heart className="w-3 h-3 fill-current" /> HP</span>
              <span>{player.hp}/{player.maxHp}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
            </div>
          </div>

          {/* MP STAT */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
              <span className="flex items-center gap-1 text-sky-400"><Zap className="w-3 h-3 fill-current" /> MP</span>
              <span>{player.mp}/{player.maxMp}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${(player.mp / player.maxMp) * 100}%` }} />
            </div>
          </div>

          {/* ATK & DEF */}
          <div className="flex items-center justify-around bg-[#1A1311] p-2 rounded-2xl border border-slate-800 font-mono">
            <div className="flex items-center gap-1 text-amber-400">
              <Sword className="w-3.5 h-3.5" />
              <span className="font-bold">{player.atk}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-bold">{player.def}</span>
            </div>
          </div>

          {/* GOLD & KEYS */}
          <div className="flex items-center justify-around bg-[#1A1311] p-2 rounded-2xl border border-slate-800 font-mono">
            <div className="flex items-center gap-1 text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              <span className="font-bold">{player.gold}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Key className="w-3.5 h-3.5" />
              <span className="font-bold">{player.inventory.key}</span>
            </div>
          </div>

          {/* LOKASI KARAKTER */}
          <div className="bg-[#1A1311] p-2 rounded-2xl border border-slate-800 flex items-center justify-center text-center col-span-2 md:col-span-1">
            <span className="text-[10px] font-extrabold text-[#C5A059] truncate">
              {currentScene.location}
            </span>
          </div>
        </div>

        {/* MAIN NARRATIVE SCREEN AREA */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-6 md:p-8 rounded-3xl border-2 border-[#C5A059]/40 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* HEADER SCENE TITLE */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-xl md:text-2xl font-black text-white">{currentScene.title}</h2>
            </div>
            {isTyping && (
              <button
                onClick={skipTypewriter}
                className="flex items-center gap-1 bg-[#1A1311] hover:bg-[#322521] text-[#C5A059] px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" /> Lewati Teks
              </button>
            )}
          </div>

          {/* NARRATIVE TEXT BOX WITH TYPEWRITER */}
          <div className="min-h-[140px] text-sm md:text-base text-slate-200 leading-relaxed font-serif tracking-wide bg-[#1A1311]/60 p-5 rounded-2xl border border-slate-800">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-4 bg-[#C5A059] ml-1 animate-pulse" />}
          </div>

          {/* CHOICES / PILIHAN AKSI */}
          {!currentScene.isEnding ? (
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059] block">
                Pilih Langkah Selanjutnya:
              </span>
              {currentScene.choices.map((choice, idx) => {
                const reqCheck = checkRequirement(choice.requirement);

                return (
                  <button
                    key={idx}
                    disabled={!reqCheck.passed}
                    onClick={() => handleChoiceSelect(choice)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      reqCheck.passed
                        ? 'bg-[#1A1311] hover:bg-[#322521] border-slate-800 hover:border-[#C5A059] text-white shadow-md'
                        : 'bg-[#1A1311]/40 border-slate-900 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`w-4 h-4 shrink-0 ${reqCheck.passed ? 'text-[#C5A059]' : 'text-slate-600'}`} />
                      <span className="text-xs md:text-sm font-bold">{choice.text}</span>
                    </div>

                    {!reqCheck.passed && (
                      <span className="text-[10px] bg-rose-950/60 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-800/50 font-mono">
                        {reqCheck.reason}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* ENDING SCREEN BANNER */
            <div className="bg-[#FAF6F0] text-[#261C19] p-6 rounded-2xl border-2 border-[#C5A059] text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 bg-[#261C19] text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto">
                <Crown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-[#C5A059]">
                  {currentScene.endingType}
                </span>
                <h3 className="text-xl md:text-2xl font-black">{currentScene.title}</h3>
              </div>
              <button
                onClick={restartGame}
                className="bg-[#261C19] hover:bg-[#382a26] text-[#C5A059] px-6 py-3 rounded-2xl font-black text-xs transition shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Main Lagi Dari Awal
              </button>
            </div>
          )}

        </div>

      </div>

      {/* MODAL INVENTORI & POTION */}
      {activeModal === 'inventory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border border-[#C5A059]/50 text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-[#C5A059] flex items-center gap-2">
                <Package className="w-4 h-4" /> Inventori & Peralatan
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#1A1311] p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Senjata Saat Ini</span>
                <p className="font-bold text-[#C5A059] text-sm">{player.weapon}</p>
              </div>

              <div className="bg-[#1A1311] p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Zirah Pelindung</span>
                <p className="font-bold text-[#C5A059] text-sm">{player.armor}</p>
              </div>

              {/* POTIONS */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  disabled={player.inventory.hpPotions <= 0 || player.hp >= player.maxHp}
                  onClick={() => {
                    setPlayer((prev) => ({
                      ...prev,
                      hp: Math.min(prev.maxHp, prev.hp + 35),
                      inventory: { ...prev.inventory, hpPotions: prev.inventory.hpPotions - 1 }
                    }));
                    playSound('heal');
                  }}
                  className="bg-[#1A1311] hover:bg-[#322521] disabled:opacity-40 border border-slate-800 p-3 rounded-2xl text-left transition cursor-pointer"
                >
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">HP Potion (+35)</span>
                  <span className="font-bold text-rose-400 text-sm">x{player.inventory.hpPotions} Botol</span>
                </button>

                <button
                  disabled={player.inventory.mpPotions <= 0 || player.mp >= player.maxMp}
                  onClick={() => {
                    setPlayer((prev) => ({
                      ...prev,
                      mp: Math.min(prev.maxMp, prev.mp + 20),
                      inventory: { ...prev.inventory, mpPotions: prev.inventory.mpPotions - 1 }
                    }));
                    playSound('heal');
                  }}
                  className="bg-[#1A1311] hover:bg-[#322521] disabled:opacity-40 border border-slate-800 p-3 rounded-2xl text-left transition cursor-pointer"
                >
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">MP Potion (+20)</span>
                  <span className="font-bold text-sky-400 text-sm">x{player.inventory.mpPotions} Botol</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JURNAL PETUALANGAN */}
      {activeModal === 'journal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border border-[#C5A059]/50 text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-[#C5A059] flex items-center gap-2">
                <History className="w-4 h-4" /> Jurnal & Kronologi
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 text-xs font-serif text-slate-300 pr-1">
              {journal.map((log, idx) => (
                <div key={idx} className="bg-[#1A1311] p-3 rounded-2xl border border-slate-800/80 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SAVE & LOAD SLOTS */}
      {activeModal === 'saveLoad' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#261C19] border border-[#C5A059]/50 text-[#FAF6F0] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-[#C5A059] flex items-center gap-2">
                <Save className="w-4 h-4" /> Slot Penyimpanan
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {['slot1', 'slot2', 'slot3'].map((slotKey, idx) => {
                const slotData = saveSlots[slotKey];

                return (
                  <div key={slotKey} className="bg-[#1A1311] p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#C5A059]">Slot #{idx + 1}</span>
                      {slotData ? (
                        <p className="text-[10px] text-slate-400">{slotData.savedAt}</p>
                      ) : (
                        <p className="text-[10px] text-slate-600">Kosong</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveGame(slotKey)}
                        className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#261C19] px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        disabled={!slotData}
                        onClick={() => loadGame(slotKey)}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        Muat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}