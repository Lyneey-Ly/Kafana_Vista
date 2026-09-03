// gamesData.js

export const CATEGORIES = ['All', 'Action', 'Strategy', 'Arcade', 'Puzzle', 'RPG'];

export const STATUS_TYPES = {
  ONLINE: { label: 'Online', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  NEW: { label: 'New', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40' },
};

export const GAMES_DATA = [
  {
    id: 'game-1',
    title: 'Tower Of Hanoi',
    description: 'Game Mengasah Otak Anda.',
    category: 'Action',
    thumbnail: '/images/Tower.png',
    url: '/TowerofHanoi', // BISA DIISI URL ROUTER (/games/xyz) ATAU LINK EXTERNAL (https://...)
    isExternal: false,
    status: 'ONLINE',
    rating: 4.8,
    isFavorite: true,
    isRecentlyPlayed: true,
    lastPlayed: '2 jam yang lalu'
  },
  {
    id: 'game-[#C5A059]',
    title: 'Misteri Labirin Kafana',
    description: 'Petualangan fiksi interaktif berbasis teks dengan statistik pemain, item, dan pilihan bercabang.',
    category: 'RPG',
    thumbnail: '/images/Labirin.png',
    url: '/DungeonCrawlerGrid',
    isExternal: false,
    status: 'NEW',
    rating: 4.9,
    isFavorite: true,
    isRecentlyPlayed: true,
    lastPlayed: 'Kemarin'
  },
  {
    id: 'game-3',
    title: 'Snake Game',
    description: 'Uji strategi pada game ular.',
    category: 'Strategy',
    thumbnail: '/images/Snake.png',
    url: '/SnakeGame',
    isExternal: true,
    status: 'ONLINE',
    rating: 4.6,
    isFavorite: false,
    isRecentlyPlayed: false,
    lastPlayed: null
  },
  {
    id: 'game-4',
    title: 'Neon Block Puzzle LIFO',
    description: 'Tantangan susun blok logika berbasis struktur data stack dengan tema neon.',
    category: 'Puzzle',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    url: '/games/hanoi-stack',
    isExternal: false,
    status: 'MAINTENANCE',
    rating: 4.4,
    isFavorite: false,
    isRecentlyPlayed: true,
    lastPlayed: '3 hari yang lalu'
  },
  {
    id: 'game-5',
    title: 'Simon Says',
    description: 'Game Mengingat warna dan juga mengasah otak anda.',
    category: 'Arcade',
    thumbnail: '/images/Simon.png',
    url: '/SimonSays',
    isExternal: false,
    status: 'ONLINE',
    rating: 4.7,
    isFavorite: false,
    isRecentlyPlayed: false,
    lastPlayed: null
  },


  {
    id: 'game-6',
    title: 'Memory Card Match',
    description: 'Game menghapal kartu.',
    category: 'Strategy',
    thumbnail: '/images/card.png',
    url: '/MemoryCardMatch',
    isExternal: true,
    status: 'ONLINE',
    rating: 4.6,
    isFavorite: false,
    isRecentlyPlayed: false,
    lastPlayed: null
  },

  {
    id: 'game-7',
    title: 'World Clone',
    description: 'Uji menghapal kosa kata.',
    category: 'Strategy',
    thumbnail: '/images/wordle.png',
    url: '/WordleClone',
    isExternal: true,
    status: 'ONLINE',
    rating: 4.6,
    isFavorite: false,
    isRecentlyPlayed: false,
    lastPlayed: null
  },

  {
    id: 'game-8',
    title: 'Shooter Game',
    description: 'Uji strategi pada game menembak.',
    category: 'Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
    url: 'https://peashooter-cpnr7zxeu-lyneey.vercel.app/',
    isExternal: true,
    status: 'ONLINE',
    rating: 4.6,
    isFavorite: false,
    isRecentlyPlayed: false,
    lastPlayed: null
  },
];