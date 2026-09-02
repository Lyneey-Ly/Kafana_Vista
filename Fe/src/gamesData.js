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
    title: 'Cyber Strike 2088',
    description: 'Game aksi futuristik dengan pertempuran intens dan grafis memukau di kota cyberpunk.',
    category: 'Action',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
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
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
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
    title: 'Kingdom Tactics 4x4',
    description: 'Uji strategi giliranmu dalam papan catur taktikal untuk merebut takhta kerajaan.',
    category: 'Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
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
    title: 'Pixel Retro Racer',
    description: 'Balapan mobil klasik gaya 8-bit melewati rintangan jalanan tanpa batas.',
    category: 'Arcade',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
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
    title: 'Kingdom Tactics 4x4',
    description: 'Uji strategi giliranmu dalam papan catur taktikal untuk merebut takhta kerajaan.',
    category: 'Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
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
    title: 'Kingdom Tactics 4x4',
    description: 'Uji strategi giliranmu dalam papan catur taktikal untuk merebut takhta kerajaan.',
    category: 'Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
    url: '/WordleClone',
    isExternal: true,
    status: 'ONLINE',
    rating: 4.6,
    isFavorite: false,
    isRecentlyPlayed: false,
    lastPlayed: null
  },
];