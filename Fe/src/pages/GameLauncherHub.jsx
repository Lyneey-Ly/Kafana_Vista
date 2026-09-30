import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Gamepad2, 
  Flame, 
  Star, 
  Clock, 
  Play, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { GAMES_DATA, CATEGORIES, STATUS_TYPES } from '../gamesData';
export default function GameLauncherHub() {
  const navigate = useNavigate();
  const [games, setGames] = useState(GAMES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Tombol Kembali
  const handleBack = () => {
    navigate(-1);
  };

  // Toggle Favorit secara dinamis
  const toggleFavorite = (id) => {
    setGames(prev => prev.map(game => 
      game.id === id ? { ...game, isFavorite: !game.isFavorite } : game
    ));
  };

  // Filter daftar game berdasarkan Pencarian dan Kategori
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  const favoriteGames = useMemo(() => games.filter(g => g.isFavorite), [games]);
  const recentGames = useMemo(() => games.filter(g => g.isRecentlyPlayed), [games]);

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#261C19] font-sans pb-12 selection:bg-[#B38E5D] selection:text-[#261C19]">
      
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-30 bg-[#FAF5EF] backdrop-blur-md border-b border-[#B38E5D]/30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-xl bg-[#1C1412] border border-[#B38E5D]/30 hover:bg-[#B38E5D]/20 hover:text-[#B38E5D] transition-colors flex items-center gap-2 cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-[#B38E5D]" />
              <span className="text-xs font-medium text-[#B38E5D]">Kembali</span>
            </button>
            <div className="p-2.5 bg-[#1C1412] text-[#B38E5D] rounded-2xl border border-[#B38E5D]/40 shadow-inner">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#261C19] flex items-center gap-2">
                Kafana <span className="text-[#B38E5D]">Vista</span>
              </h1>
              <p className="text-[11px] text-[#B38E5D]/70 font-medium">Game Launcher & Mini Portal Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1C1412] border border-white/10 rounded-xl text-xs text-[#B38E5D]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Server Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden border border-[#B38E5D]/30 bg-gradient-to-r from-[#261C19] via-[#1C1412] to-[#171513] p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#B38E5D]/20 text-[#B38E5D] border border-[#B38E5D]/40">
              <Sparkles className="w-3.5 h-3.5" /> Portal Utama Mini Game
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#FAF5EF] leading-tight">
              Temukan & Mainkan <br />
              <span className="text-[#B38E5D]">Koleksi Game</span> Terbaik Anda
            </h2>
            <p className="text-sm text-[#D7C4B0] leading-relaxed">
              Akses cepat ke berbagai mini game interaktif, puzzle strategi, hingga RPG fiksi. Pilih game favoritmu dan langsung mainkan dari satu dashboard.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Gamepad2 className="w-96 h-96 text-[#B38E5D]" />
          </div>
        </section>

        {/* CONTROLS BAR: SEARCH & CATEGORIES */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#B38E5D]/70" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#171513] border border-[#B38E5D]/30 rounded-2xl text-xs text-[#FAF5EF] placeholder-slate-500 focus:outline-none focus:border-[#B38E5D] transition shadow-inner"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <SlidersHorizontal className="w-4 h-4 text-[#B38E5D]/70 shrink-0 mr-1 hidden sm:block" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-[#261C19] shadow-lg shadow-[#B38E5D]/20'
                      : 'bg-[#171513] text-[#B38E5D]/70 hover:bg-[#FAF5EF]/5 border border-[#B38E5D]/30 hover:text-[#B38E5D]'}
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* MAIN LAYOUT: GAME GRID + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* KATALOG GAME GRID (3 Kolom Desktop) */}
          <main className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#261C19] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#B38E5D]" /> Daftar Game <span className="text-xs text-[#B38E5D]/50 font-normal">({filteredGames.length})</span>
              </h3>
            </div>

            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onToggleFavorite={toggleFavorite} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#1C1412] border border-[#B38E5D]/30 rounded-3xl space-y-3">
                <Gamepad2 className="w-12 h-12 text-[#B38E5D]" /> <p className="text-sm font-bold text-[#B38E5D]">Game tidak ditemukan.</p> <p className="text-xs text-[#B38E5D]/70">Coba ubah kata kunci pencarian atau filter kategori.</p>
              </div>
            )}
          </main>

          {/* SIDEBAR / QUICK NAVIGATION (1 Kolom Desktop) */}
          <aside className="space-y-6">
            
            {/* FAVORITES SECTION */}
            <div className="bg-[#1C1412] border border-[#B38E5D]/30 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#B38E5D] flex items-center gap-2">
                <Bookmark className="w-4 h-4 fill-current" /> Favorit Saya
              </h4>
              
              {favoriteGames.length > 0 ? (
                <div className="space-y-3">
                  {favoriteGames.map((game) => (
                    <div key={game.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition group">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title} 
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-[#261C19] truncate group-hover:text-[#B38E5D] transition">
                          {game.title}
                        </h5>
                        <p className="text-[10px] text-[#B38E5D]/60">{game.category}</p>
                      </div>
                      <a
                        href={game.url}
                        target={game.isExternal ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="p-2 bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-[#261C19] rounded-xl hover:bg-[#8F6E45] transition shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Belum ada game favorit.</p>
              )}
            </div>

            {/* RECENTLY PLAYED SECTION */}
            <div className="bg-[#1C1412] border border-[#B38E5D]/30 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#B38E5D] flex items-center gap-2">
                <Clock className="w-4 h-4" /> Baru Saja Dimainkan
              </h4>

              <div className="space-y-3">
                {recentGames.map((game) => (
                  <a
                    key={game.id}
                    href={game.url}
                    target={game.isExternal ? "_blank" : "_self"}
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#B38E5D]" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#FAF5EF] truncate group-hover:text-[#B38E5D] transition">
                          {game.title}
                        </h5>
                        <p className="text-[10px] text-[#B38E5D]/60">{game.lastPlayed}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B38E5D]/70 group-hover:text-white transition shrink-0" />
                  </a>
                ))}
              </div>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}

// KOMPONEN KARTU GAME INDIVIDUAL
function GameCard({ game, onToggleFavorite }) {
  const statusInfo = STATUS_TYPES[game.status] || STATUS_TYPES.ONLINE;

  return (
    <div className="group rounded-3xl bg-[#1C1412] border border-[#B38E5D]/30 hover:border-[#B38E5D]/60 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:-translate-y-1">
      
      {/* THUMBNAIL CONTAINER */}
      <div className="relative aspect-video overflow-hidden bg-slate-800">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        
        {/* STATUS BADGE */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border backdrop-blur-md ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* FAVORITE BUTTON */}
        <button
          onClick={() => onToggleFavorite(game.id)}
          className={`absolute top-3 right-3 p-2 rounded-2xl backdrop-blur-md border transition cursor-pointer ${
            game.isFavorite 
              ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-[#261C19] border border-[#B38E5D]' 
              : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
           }`}
          title="Tambah ke Favorit"
        >
          <Bookmark className={`w-3.5 h-3.5 ${game.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* RATING BADGE */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 text-[10px] font-bold text-amber-400">
          <Star className="w-3 h-3 fill-current" />
          <span>{game.rating}</span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#B38E5D] tracking-wider">
              {game.category}
            </span>
          </div>
          <h4 className="text-base font-black text-[#FAF5EF] group-hover:text-[#B38E5D] transition line-clamp-1">
            {game.title}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {game.description}
          </p>
        </div>

        {/* PLAY BUTTON */}
        <a
          href={game.status === 'MAINTENANCE' ? '#' : game.url}
          target={game.isExternal ? "_blank" : "_self"}
          rel="noreferrer"
          onClick={(e) => game.status === 'MAINTENANCE' && e.preventDefault()}
          className={`w-full py-3 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            game.status === 'MAINTENANCE'
              ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-[#261C19]'
          }`}
        >
          {game.status === 'MAINTENANCE' ? (
            <>
              <AlertCircle className="w-4 h-4" /> Pemeliharaan
            </>
          ) : (
            <>
              <span>Mainkan Sekarang</span>
              {game.isExternal ? <ExternalLink className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </>
          )}
        </a>
      </div>

    </div>
  );
}