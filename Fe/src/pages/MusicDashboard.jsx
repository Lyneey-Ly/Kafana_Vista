import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  Plus,
  Heart,
  Music,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  MoreVertical,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  ListMusic,
  Trash2,
  Share2,
  Upload,
  Home,
  Library,
  Disc,
  X,
  Sparkles,
  Clock,
  Calendar,
  User,
  Radio,
  Check,
  Compass
} from 'lucide-react';
import Swal from 'sweetalert2';
import API from '../api';
import SidebarUser from '../components/SidebarUser';

import { usePlayer, getFullUrl } from '../context/PlayerContext';

// =====================================================================
// UTILITY & SUB-COMPONENTS (TEMA KAVANA VISTA)
// =====================================================================

// Tooltip Sederhana Kavana
const Tooltip = ({ text, children }) => {
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 text-[10px] font-medium text-[#261C19] bg-white border border-[#D7C4B0] rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all">
        {text}
      </span>
    </div>
  );
};

// Skeleton Loader Kavana
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-[#D7C4B0]/50">
    <td className="px-4 py-3"><div className="h-4 bg-white rounded w-4 m-auto"></div></td>
    <td className="px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-lg shrink-0"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-white rounded w-36"></div>
        <div className="h-3 bg-[#FAF5EF]/50 rounded w-24"></div>
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-4 bg-white rounded w-24"></div></td>
    <td className="px-4 py-3 text-center"><div className="h-4 bg-white rounded w-12 mx-auto"></div></td>
    <td className="px-4 py-3 text-center"><div className="h-6 bg-white rounded w-6 mx-auto"></div></td>
    <td className="px-4 py-3 text-center"><div className="h-8 bg-white rounded-full w-8 mx-auto"></div></td>
    <td className="px-4 py-3 text-center"><div className="h-6 bg-white rounded w-6 mx-auto"></div></td>
  </tr>
);

const SkeletonCard = () => (
  <div className="bg-white border border-[#D7C4B0] p-4 rounded-2xl animate-pulse space-y-3">
    <div className="w-full aspect-square bg-[#FAF5EF] rounded-xl"></div>
    <div className="h-4 bg-[#FAF5EF] rounded w-3/4"></div>
    <div className="h-3 bg-[#FAF5EF] rounded w-1/2"></div>
  </div>
);

// Equalizer Animasi Warm Amber
const EqualizerIcon = () => (
  <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
    <span className="w-0.5 bg-[#B38E5D] h-full animate-[bounce_1s_infinite_100ms]"></span>
    <span className="w-0.5 bg-[#B38E5D] h-2/3 animate-[bounce_1s_infinite_300ms]"></span>
    <span className="w-0.5 bg-[#B38E5D] h-4/5 animate-[bounce_1s_infinite_200ms]"></span>
  </div>
);

// =====================================================================
// 1. KOMPONEN UTAMA: MUSIC DASHBOARD (KAVANA VISTA)
// =====================================================================
export default function MusicDashboard() {
  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    handleNext,
    handlePrev,
    toggleMute,
    isMuted
  } = usePlayer();

  // State Utama Data
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'liked' | 'playlists' | 'recent'
  const [sortBy, setSortBy] = useState('title'); // 'title' | 'artist' | 'date' | 'duration'
  const [displayMode, setDisplayMode] = useState('table'); // 'table' | 'grid'

  // Modal & Drawer State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isExpandedPlayer, setIsExpandedPlayer] = useState(false);

  // State View Mode (All / Specific Playlist)
  const [viewMode, setViewMode] = useState({ type: 'all', data: null });

  // Context Menu Pop-over State
  const [activeMenuTrackId, setActiveMenuTrackId] = useState(null);

  // Queue List State
  const [queueList, setQueueList] = useState([]);

  // Ref untuk cegah double fetch bersamaan
  const isFetchingRef = useRef(false);

  // Fetch Semua Data (DIPERBAIKI)
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setLoading(true);
      const [resTracks, resPlaylists] = await Promise.all([
        API.get('/tracks'),
        API.get('/playlists'),
      ]);
      setTracks(resTracks.data || []);
      setPlaylists(resPlaylists.data || []);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn('Rate limit hit (429) pada data musik. Menghentikan request sementara.');
      } else {
        console.error('Gagal mengambil data musik:', error);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (viewMode.type === 'all') {
      fetchData();
    }
  }, [fetchData, viewMode.type]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleNext, handlePrev, toggleMute]);

  // Handlers (DIPERBAIKI: Tanpa re-fetch saat error agar tidak looping)
  const handleToggleLike = async (trackId) => {
    // Optimistic UI update
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, is_liked: !t.is_liked } : t))
    );
    try {
      await API.post(`/tracks/${trackId}/like`);
    } catch (error) {
      // Revert status jika gagal tanpa memanggil fetchData() lagi
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, is_liked: !t.is_liked } : t))
      );
      if (error.response?.status !== 429) {
        console.warn('Gagal mengubah status favorit:', error);
      }
    }
  };

  const handleAddToPlaylist = async (playlistId, trackId) => {
    try {
      await API.post(`/playlists/${playlistId}/tracks`, { track_id: trackId });
      Swal.fire({
        icon: 'success',
        title: 'Ditambahkan ke playlist',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        background: '#FAF6F0',
        color: '#261C19',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Lagu sudah ada di playlist ini.',
        background: '#FAF6F0',
        color: '#261C19',
      });
    }
  };

  const handleOpenPlaylist = async (playlist) => {
    try {
      setLoading(true);
      const res = await API.get(`/playlists/${playlist.id}`);
      setTracks(res.data.tracks || res.data || []);
      setViewMode({ type: 'playlist', data: playlist });
    } catch (error) {
      if (error.response?.status !== 429) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Tidak dapat memuat isi playlist.',
          background: '#FAF6F0',
          color: '#261C19',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    const result = await Swal.fire({
      title: 'Hapus Lagu?',
      text: 'Lagu akan dihapus permanen dari koleksi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B38E5D',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      background: '#FAF6F0',
      color: '#261C19',
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/tracks/${trackId}`);
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          background: '#FAF6F0',
          color: '#261C19',
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Hapus',
          text: 'Terjadi kesalahan sistem.',
          background: '#FAF6F0',
          color: '#261C19',
        });
      }
    }
  };

  const handleAddToQueue = (track) => {
    setQueueList((prev) => [...prev, track]);
    Swal.fire({
      icon: 'success',
      title: 'Ditambahkan ke Antrean',
      text: track.title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      background: '#FAF6F0',
      color: '#261C19',
    });
  };

  const handleShareTrack = (track) => {
    const trackUrl = `${window.location.origin}/track/${track.id}`;
    navigator.clipboard.writeText(trackUrl);
    Swal.fire({
      icon: 'success',
      title: 'Tautan Disalin!',
      text: 'Link lagu telah disalin ke clipboard.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      background: '#FAF6F0',
      color: '#261C19',
    });
  };

  // Processing Search, Filter & Sort
  const filteredAndSortedTracks = useMemo(() => {
    let result = [...tracks];

    // Filter Chips
    if (activeFilter === 'liked') {
      result = result.filter((t) => t.is_liked || t.is_favorite);
    } else if (activeFilter === 'recent') {
      result = result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    // Search Bar
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(term) ||
          t.artist?.toLowerCase().includes(term)
      );
    }

    // Sorting Dropdown
    result.sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'date') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'duration') return (a.duration || 0) - (b.duration || 0);
      return 0;
    });

    return result;
  }, [tracks, activeFilter, searchTerm, sortBy]);

  return (
    <SidebarUser> 
      <div className="flex min-h-screen bg-[#FAF5EF] text-[#261C19] font-sans select-none">
        {/* MAIN CONTENT AREA - memakai SidebarUser sebagai nav utama, filter dipindah ke top bar */}
        <div className="flex-1 flex flex-col min-h-screen bg-[#FAF5EF] pb-36 relative">
          
          {/* HERO BANNER KAVANA VISTA */}
          <HeroBanner
            viewMode={viewMode}
            currentTrack={currentTrack}
            onResetView={() => setViewMode({ type: 'all', data: null })}
          />

          <div className="p-6 space-y-6">
            {/* FILTER BAR KAVANA - pengganti Sidebar internal (pakai SidebarUser sebagai nav utama) */}
            <div className="bg-white rounded-2xl border border-[#D7C4B0] p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setViewMode({ type: 'all', data: null }); setActiveFilter('all'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${activeFilter === 'all' ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-white shadow-md shadow-[#B38E5D]/20' : 'bg-[#FAF5EF] border border-[#D7C4B0] text-[#5C4A42] hover:border-[#B38E5D]/40'}`}
                >
                  <Home size={16} /> Beranda
                </button>
                <button
                  onClick={() => { setViewMode({ type: 'all', data: null }); setActiveFilter('liked'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${activeFilter === 'liked' ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-white shadow-md shadow-[#B38E5D]/20' : 'bg-[#FAF5EF] border border-[#D7C4B0] text-[#5C4A42] hover:border-[#B38E5D]/40'}`}
                >
                  <Heart size={16} /> Lagu Favorit
                </button>
                {playlists.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 ml-2 pl-4 border-l border-[#D7C4B0] overflow-x-auto max-w-[40vw]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B38E5D] whitespace-nowrap">Playlist Kamu:</span>
                    {playlists.map((pl) => (
                      <button key={pl.id} onClick={() => handleOpenPlaylist(pl)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAF5EF] border border-[#D7C4B0] text-[#5C4A42] hover:bg-[#B38E5D]/10 hover:text-[#261C19] hover:border-[#B38E5D]/30 truncate max-w-[140px] transition whitespace-nowrap">
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <button onClick={() => setIsCreatePlaylistOpen(true)} className="flex-1 lg:flex-none px-4 py-2 bg-white border border-[#D7C4B0] hover:border-[#B38E5D]/30 text-[#261C19] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                  <Plus size={16} className="text-[#B38E5D]" /> Buat Playlist
                </button>
                <button onClick={() => setIsUploadOpen(true)} className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] hover:from-[#8F6E45] hover:to-[#7A5E2B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B38E5D]/20 flex items-center justify-center gap-2 transition cursor-pointer">
                  <Upload size={16} /> Unggah MP3
                </button>
              </div>
            </div>
            {/* Mobile playlist scroll (visible hanya sm:hidden) */}
            {playlists.length > 0 && (
              <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {playlists.map((pl) => (
                  <button key={pl.id} onClick={() => handleOpenPlaylist(pl)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#D7C4B0] text-[#5C4A42] whitespace-nowrap">
                    {pl.name}
                  </button>
                ))}
              </div>
            )}
            
            {/* CONTROL BAR: SEARCH, FILTER CHIPS & SORTING */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-[#D7C4B0] shadow-sm">
              
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B38E5D]" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari lagu, artis, atau kata kunci..."
                  className="w-full bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl pl-10 pr-4 py-2 text-xs text-[#261C19] placeholder-[#5C4A42]/50 focus:outline-none focus:border-[#B38E5D]/80 focus:ring-1 focus:ring-[#B38E5D]/30 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C4A42]/60 hover:text-[#261C19]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Tags / Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'liked', label: 'Lagu Favorit' },
                  { id: 'recent', label: 'Terbaru' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveFilter(chip.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeFilter === chip.id
                        ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-white font-bold shadow-md shadow-[#B38E5D]/20'
                        : 'bg-[#FAF5EF] border border-[#D7C4B0] text-[#5C4A42] hover:border-[#B38E5D]/30 hover:text-[#261C19]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Sorting & View Mode Toggle */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#D7C4B0]/60 text-xs text-[#5C4A42]">
                  <SlidersHorizontal size={14} className="text-[#B38E5D]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs text-[#261C19] outline-none cursor-pointer"
                  >
                    <option value="title" className="bg-white">Urutkan: Judul (A-Z)</option>
                    <option value="artist" className="bg-white">Urutkan: Penyanyi</option>
                    <option value="date" className="bg-white">Urutkan: Terbaru</option>
                    <option value="duration" className="bg-white">Urutkan: Durasi</option>
                  </select>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-[#FAF5EF] p-1 rounded-xl border border-[#D7C4B0]/60">
                  <button
                    onClick={() => setDisplayMode('table')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${displayMode === 'table' ? 'bg-[#B38E5D] text-white shadow-sm' : 'text-[#5C4A42]/70 hover:text-[#261C19]'}`}
                  >
                    <Tooltip text="Tampilan Tabel"><List size={16} /></Tooltip>
                  </button>
                  <button
                    onClick={() => setDisplayMode('grid')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${displayMode === 'grid' ? 'bg-[#B38E5D] text-white shadow-sm' : 'text-[#5C4A42]/70 hover:text-[#261C19]'}`}
                  >
                    <Tooltip text="Tampilan Grid"><Grid size={16} /></Tooltip>
                  </button>
                </div>
              </div>

            </div>

            {/* GRID PLAYLIST SECTION */}
            {playlists.length > 0 && viewMode.type === 'all' && activeFilter === 'all' && !searchTerm && (
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold text-[#261C19] tracking-wider uppercase flex items-center gap-2">
                  <Library size={18} className="text-[#B38E5D]" /> Playlist Kavana
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleOpenPlaylist(pl)}
                      className="group bg-white hover:bg-white border border-[#D7C4B0] hover:border-[#B38E5D]/30 p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl cursor-pointer relative"
                    >
                      <div className="relative mb-3 overflow-hidden rounded-xl aspect-square bg-[#FAF5EF]">
                        <img
                          src={getFullUrl(pl.cover_url) || 'https://placehold.co/150?text=Kavana+Playlist'}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => { e.target.src = 'https://placehold.co/150?text=Kavana+Playlist'; }}
                        />
                        <button className="absolute right-2 bottom-2 p-3 bg-[#B38E5D] rounded-full text-white shadow-lg shadow-[#B38E5D]/20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <Play size={18} fill="currentColor" />
                        </button>
                      </div>
                      <h3 className="font-bold text-xs truncate text-[#261C19]">{pl.name}</h3>
                      <p className="text-[11px] text-[#5C4A42]/60 mt-0.5">{pl.tracks_count || 0} Lagu</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRACKS LIST / GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#261C19] tracking-wider uppercase flex items-center gap-2">
                  <Music size={18} className="text-[#B38E5D]" />
                  {viewMode.type === 'playlist' ? `Playlist: ${viewMode.data?.name}` : 'Koleksi Musik'}
                  <span className="text-xs font-normal text-[#5C4A42]/60 lowercase">({filteredAndSortedTracks.length} lagu)</span>
                </h2>
              </div>

              {displayMode === 'table' ? (
                <TrackTableView
                  loading={loading}
                  tracks={filteredAndSortedTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  playTrack={playTrack}
                  playlists={playlists}
                  handleToggleLike={handleToggleLike}
                  handleAddToPlaylist={handleAddToPlaylist}
                  handleDeleteTrack={handleDeleteTrack}
                  handleAddToQueue={handleAddToQueue}
                  handleShareTrack={handleShareTrack}
                  activeMenuTrackId={activeMenuTrackId}
                  setActiveMenuTrackId={setActiveMenuTrackId}
                />
              ) : (
                <TrackGridView
                  loading={loading}
                  tracks={filteredAndSortedTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  playTrack={playTrack}
                  handleToggleLike={handleToggleLike}
                  handleDeleteTrack={handleDeleteTrack}
                  handleAddToQueue={handleAddToQueue}
                />
              )}
            </div>

          </div>
        </div>

        {/* QUEUE DRAWER */}
        <QueueDrawer
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          queueList={queueList}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />

        {/* FULL SCREEN EXPANDED NOW PLAYING MODAL */}
        <ExpandedPlayerModal
          isOpen={isExpandedPlayer}
          onClose={() => setIsExpandedPlayer(false)}
        />

        {/* MODALS */}
        <UploadTrackModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSuccess={fetchData} />
        <CreatePlaylistModal isOpen={isCreatePlaylistOpen} onClose={() => setIsCreatePlaylistOpen(false)} onSuccess={fetchData} />

        {/* PLAYER BAR UNDERNEATH */}
        <MusicPlayerBar
          onOpenQueue={() => setIsQueueOpen((prev) => !prev)}
          onExpandPlayer={() => setIsExpandedPlayer(true)}
        />

      </div>
    </SidebarUser>
  );
}

// =====================================================================
// 2. HERO BANNER KAVANA VISTA (Sidebar dipindah ke SidebarUser + Filter Bar)
// =====================================================================
function HeroBanner({ viewMode, currentTrack, onResetView }) {
  const isPlaylist = viewMode.type === 'playlist';
  const bannerTitle = isPlaylist ? viewMode.data?.name : 'Selamat Datang di Kavana Vista';
  const bannerDesc = isPlaylist
    ? viewMode.data?.description || 'Daftar lagu pilihan di dalam playlist ini.'
    : 'Nikmati alunan musik kesukaanmu dalam atmosfer visual yang anggun dan modern.';
  const bannerCover = isPlaylist
    ? getFullUrl(viewMode.data?.cover_url)
    : getFullUrl(currentTrack?.cover_url) || 'https://placehold.co/300x300/0f172a/ffffff?text=Kavana+Vista';

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-[#261C19] via-[#1E1614] to-[#110C0B] p-6 flex items-end border-b border-[#D7C4B0]/60 overflow-hidden">
      {/* Subtle Glow Background Elements */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 right-10 w-60 h-60 bg-[#B38E5D]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-end gap-6 relative z-10 w-full">
        <img
          src={bannerCover}
          alt="Banner Cover"
          className="w-36 h-36 rounded-2xl object-cover shadow-2xl ring-2 ring-[#B38E5D]/20 shrink-0"
          onError={(e) => { e.target.src = 'https://placehold.co/150x150/0f172a/ffffff?text=Kavana+Vista'; }}
        />
        <div className="space-y-2 flex-1 min-w-0">
          {isPlaylist && (
            <button
              onClick={onResetView}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FAF5EF] rounded-full text-xs text-[#5C4A42] mb-1 border border-[#D7C4B0]/60 backdrop-blur-md transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Kembali ke Semua
            </button>
          )}
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B38E5D]">
            {isPlaylist ? 'PLAYLIST KAVANA' : 'KOLEKSI AUDIO'}
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-[#FAF5EF] truncate drop-shadow-sm">{bannerTitle}</h1>
          <p className="text-xs text-[#FAF5EF]/75 max-w-xl line-clamp-2 leading-relaxed">{bannerDesc}</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 4. KOMPONEN TABLE VIEW
// =====================================================================
function TrackTableView({
  loading,
  tracks,
  currentTrack,
  isPlaying,
  playTrack,
  playlists,
  handleToggleLike,
  handleAddToPlaylist,
  handleDeleteTrack,
  handleAddToQueue,
  handleShareTrack,
  activeMenuTrackId,
  setActiveMenuTrackId,
}) {
  return (
    <div className="bg-white border border-[#D7C4B0] rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-[#FAF5EF] text-[#5C4A42]/60 border-b border-[#D7C4B0] text-[11px] uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3.5 w-10 text-center">#</th>
            <th className="px-4 py-3.5">Judul Lagu</th>
            <th className="px-4 py-3.5">Penyanyi</th>
            <th className="px-4 py-3.5 text-center">Sukai</th>
            <th className="px-4 py-3.5 text-center">Playlist</th>
            <th className="px-4 py-3.5 text-center">Putar</th>
            <th className="px-4 py-3.5 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D7C4B0]/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : tracks.length > 0 ? (
            tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              const isLiked = track.is_liked || track.is_favorite;

              return (
                <tr
                  key={track.id}
                  className={`hover:bg-[#FAF5EF] transition group ${
                    isCurrent ? 'bg-[#B38E5D]/10 border-l-4 border-[#B38E5D]' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center text-[#5C4A42]/60 font-mono">
                    {isCurrentPlaying ? <EqualizerIcon /> : idx + 1}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={getFullUrl(track.cover_url) || 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-[#FAF5EF] shrink-0"
                      onError={(e) => { e.target.src = 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'; }}
                    />
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${isCurrent ? 'text-[#B38E5D] font-bold' : 'text-[#261C19]'}`}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#5C4A42]/60 truncate">{track.artist}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#5C4A42]/70 font-medium truncate max-w-[150px]">{track.artist}</td>

                  {/* Like Button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleLike(track.id)}
                      className="p-1.5 hover:scale-110 transition cursor-pointer"
                    >
                      <Heart
                        size={16}
                        className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-[#D7C4B0] hover:text-rose-400'}
                      />
                    </button>
                  </td>

                  {/* Playlist Select Dropdown */}
                  <td className="px-4 py-3 text-center">
                    {playlists.length > 0 ? (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddToPlaylist(e.target.value, track.id);
                            e.target.value = '';
                          }
                        }}
                        className="bg-[#FAF5EF] text-[11px] text-[#261C19] border border-[#D7C4B0] rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-[#B38E5D]"
                      >
                        <option value="">+ Playlist</option>
                        {playlists.map((pl) => (
                          <option key={pl.id} value={pl.id}>{pl.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[#5C4A42]/40">-</span>
                    )}
                  </td>

                  {/* Play Button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => playTrack(tracks, idx)}
                      className="p-2 bg-[#B38E5D]/10 hover:bg-[#B38E5D] text-[#B38E5D] hover:text-white rounded-full transition cursor-pointer"
                    >
                      {isCurrentPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                  </td>

                  {/* Context Menu (Pop-over) */}
                  <td className="px-4 py-3 text-center relative">
                    <button
                      onClick={() => setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id)}
                      className="p-1 text-[#5C4A42]/60 hover:text-[#261C19] rounded-md transition cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuTrackId === track.id && (
                      <ContextMenu
                        track={track}
                        onClose={() => setActiveMenuTrackId(null)}
                        onAddToQueue={() => handleAddToQueue(track)}
                        onShare={() => handleShareTrack(track)}
                        onDelete={() => handleDeleteTrack(track.id)}
                        onLike={() => handleToggleLike(track.id)}
                      />
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-[#5C4A42]/70">
                Lagu tidak ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================================
// 5. KOMPONEN GRID VIEW
// =====================================================================
function TrackGridView({
  loading,
  tracks,
  currentTrack,
  isPlaying,
  playTrack,
  handleToggleLike,
  handleDeleteTrack,
  handleAddToQueue,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (tracks.length === 0) {
    return <div className="text-center py-12 text-[#5C4A42]/70 text-xs">Lagu tidak ditemukan.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tracks.map((track, idx) => {
        const isCurrent = currentTrack?.id === track.id;
        const isCurrentPlaying = isCurrent && isPlaying;

        return (
          <div
            key={track.id}
            className="group bg-white hover:bg-white border border-[#D7C4B0] hover:border-[#B38E5D]/30 p-3.5 rounded-2xl transition duration-300 relative flex flex-col justify-between shadow-md"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAF5EF] mb-3">
              <img
                src={getFullUrl(track.cover_url) || 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'}
                alt={track.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => { e.target.src = 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'; }}
              />
              <button
                onClick={() => playTrack(tracks, idx)}
                className="absolute right-2 bottom-2 p-3 bg-[#B38E5D] rounded-full text-white shadow-lg shadow-[#B38E5D]/20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
              >
                {isCurrentPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
            </div>

            <div>
              <h3 className={`font-bold text-xs truncate ${isCurrent ? 'text-[#B38E5D]' : 'text-[#261C19]'}`}>
                {track.title}
              </h3>
              <p className="text-[11px] text-[#5C4A42]/60 truncate mt-0.5">{track.artist}</p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#D7C4B0]/60">
              <button
                onClick={() => handleToggleLike(track.id)}
                className="text-[#D7C4B0] hover:text-rose-500 transition cursor-pointer"
              >
                <Heart size={14} className={track.is_liked ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
              <button
                onClick={() => handleAddToQueue(track)}
                className="text-[#5C4A42]/60 hover:text-[#B38E5D] transition cursor-pointer"
              >
                <ListMusic size={14} />
              </button>
              <button
                onClick={() => handleDeleteTrack(track.id)}
                className="text-[#5C4A42]/60 hover:text-rose-500 transition cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// 6. POP-OVER CONTEXT MENU
// =====================================================================
function ContextMenu({ track, onClose, onAddToQueue, onShare, onDelete, onLike }) {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-6 top-8 w-44 bg-white border border-[#D7C4B0] rounded-xl shadow-2xl p-1.5 z-50 text-xs text-[#261C19] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={() => { onAddToQueue(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF5EF] rounded-lg transition text-left cursor-pointer"
      >
        <ListMusic size={14} className="text-[#B38E5D]" /> Tambah ke Queue
      </button>
      <button
        onClick={() => { onLike(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF5EF] rounded-lg transition text-left cursor-pointer"
      >
        <Heart size={14} className="text-rose-400" /> Sukai Lagu
      </button>
      <button
        onClick={() => { onShare(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF5EF] rounded-lg transition text-left cursor-pointer"
      >
        <Share2 size={14} className="text-indigo-400" /> Bagikan Tautan
      </button>
      <hr className="my-1 border-[#D7C4B0]" />
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition text-left cursor-pointer"
      >
        <Trash2 size={14} /> Hapus Lagu
      </button>
    </div>
  );
}

// =====================================================================
// 7. QUEUE DRAWER / MODAL (UP NEXT)
// =====================================================================
function QueueDrawer({ isOpen, onClose, queueList, currentTrack, isPlaying }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#261C19]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-80 max-w-full bg-[#FAF5EF] border-l border-[#D7C4B0] h-full p-5 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-[#261C19] flex items-center gap-2">
              <ListMusic size={18} className="text-[#B38E5D]" /> Antrean Lagu
            </h3>
            <button onClick={onClose} className="p-1 text-[#5C4A42]/60 hover:text-[#261C19] cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Currently Playing */}
          {currentTrack && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#B38E5D] mb-2">Sedang Diputar</p>
              <div className="flex items-center gap-3 p-2.5 bg-white border border-[#B38E5D]/30 rounded-xl">
                <img
                  src={getFullUrl(currentTrack?.cover_url) || 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'}
                  alt=""
                  className="w-10 h-10 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[#261C19] truncate">{currentTrack.title}</p>
                  <p className="text-[11px] text-[#5C4A42]/70 truncate">{currentTrack.artist}</p>
                </div>
                {isPlaying && <EqualizerIcon />}
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#B38E5D] mb-2">Berikutnya</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {queueList.length > 0 ? (
                queueList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-[#FAF5EF]/50">
                    <img src={getFullUrl(item.cover_url) || 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'} alt="" className="w-8 h-8 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-[#261C19] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#5C4A42]/60 truncate">{item.artist}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#5C4A42]/60 italic py-4 text-center">Antrean manual kosong.</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-white border border-[#D7C4B0] hover:bg-[#FAF5EF] text-xs font-semibold rounded-xl text-[#261C19] transition cursor-pointer"
        >
          Tutup Antrean
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// 8. EXPANDED FULL SCREEN NOW PLAYING MODAL
// =====================================================================
function ExpandedPlayerModal({ isOpen, onClose }) {
  const { currentTrack, isPlaying, togglePlay, handleNext, handlePrev, currentTime, duration, seek } = usePlayer();
  const [tab, setTab] = useState('visualizer'); // 'visualizer' | 'lyrics'
  const [expProgress, setExpProgress] = useState(0);
  const expSeekingRef = useRef(false);

  useEffect(() => {
    if (!expSeekingRef.current && duration > 0 && isFinite(duration)) {
      setExpProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  const handleExpChange = (e) => {
    expSeekingRef.current = true;
    const v = Number(e.target.value);
    if (!isNaN(v)) setExpProgress(v);
  };
  const handleExpCommit = () => {
    if (!duration || !isFinite(duration) || duration <= 0) { expSeekingRef.current = false; return; }
    const val = Number(expProgress);
    if (isNaN(val)) { expSeekingRef.current = false; return; }
    const targetTime = (val / 100) * duration;
    seek(targetTime);
    setTimeout(() => { expSeekingRef.current = false; }, 500);
  };

  if (!isOpen || !currentTrack) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#261C19]/95 backdrop-blur-2xl flex flex-col justify-between p-8 animate-in slide-in-from-bottom duration-300">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[#FAF5EF] cursor-pointer">
          <Minimize2 size={20} />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-[#D7C4B0]">PLAYING FROM KAVANA AUDIO</span>
        <div className="flex gap-2 bg-white/10 p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setTab('visualizer')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tab === 'visualizer' ? 'bg-[#B38E5D] text-white shadow-md' : 'text-[#FAF5EF]/70 hover:text-white'}`}
          >
            Visual
          </button>
          <button
            onClick={() => setTab('lyrics')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tab === 'lyrics' ? 'bg-[#B38E5D] text-white shadow-md' : 'text-[#FAF5EF]/70 hover:text-white'}`}
          >
            Lirik
          </button>
        </div>
      </div>

      {/* Center Display Area */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 my-auto max-w-4xl mx-auto w-full">
        {/* Cover Artwork */}
        <div className="relative group">
          <img
            src={getFullUrl(currentTrack?.cover_url) || 'https://placehold.co/300x300/0f172a/ffffff?text=Kavana+Vista'}
            alt=""
            className={`w-72 h-72 md:w-80 md:h-80 rounded-3xl object-cover shadow-2xl ring-4 ring-[#B38E5D]/20 transition-all ${
              isPlaying ? 'scale-105' : 'scale-100 opacity-90'
            }`}
          />
        </div>

        {/* Dynamic Display / Visualizer Placeholder */}
        <div className="w-full max-w-md space-y-4 text-center md:text-left">
          {tab === 'visualizer' ? (
            <div className="p-6 bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center justify-center h-48 space-y-3 backdrop-blur-md">
              <Sparkles size={32} className="text-[#B38E5D] animate-pulse" />
              <p className="text-xs text-[#FAF5EF]/70">Visualizer Kavana Aktif</p>
              <div className="flex items-end gap-1.5 h-12">
                {[40, 80, 20, 90, 60, 30, 70, 100, 50, 80].map((h, idx) => (
                  <div
                    key={idx}
                    style={{ height: isPlaying ? `${h}%` : '10%' }}
                    className="w-1.5 bg-[#B38E5D] rounded-full transition-all duration-300"
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-[#D7C4B0] rounded-2xl h-48 overflow-y-auto text-center space-y-2 text-sm text-[#5C4A42] italic">
              <p className="text-[#B38E5D] font-bold">♪ Lirik lagu otomatis ♪</p>
              <p>Lirik belum tersedia untuk track ini.</p>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-black text-[#FAF5EF] truncate">{currentTrack.title}</h2>
            <p className="text-sm text-[#B38E5D] font-semibold mt-1">{currentTrack.artist}</p>
          </div>
        </div>
      </div>

      {/* Bottom Controls — fix seek persen agar tidak reset */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(expProgress) ? 0 : expProgress}
            disabled={!duration || duration<=0}
            onPointerDown={() => { expSeekingRef.current = true; }}
            onPointerUp={handleExpCommit}
            onChange={handleExpChange}
            onInput={handleExpChange}
            style={{ background: `linear-gradient(to right, #B38E5D ${isNaN(expProgress)?0:expProgress}%, #D7C4B0 ${isNaN(expProgress)?0:expProgress}%)` }}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#B38E5D] ${(!duration||duration<=0)?'opacity-50 cursor-not-allowed':''}`}
          />
          <div className="flex justify-between text-xs text-[#FAF5EF]/70 font-mono">
            <span>{formatTime(expSeekingRef.current ? (expProgress/100)*duration : currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button onClick={handlePrev} className="text-[#FAF5EF]/70 hover:text-white transition p-2 cursor-pointer">
            <SkipBack size={28} />
          </button>
          <button
            onClick={togglePlay}
            className="p-5 bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] hover:brightness-110 text-white rounded-full shadow-xl shadow-[#B38E5D]/20 transition hover:scale-105 cursor-pointer"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={handleNext} className="text-[#FAF5EF]/70 hover:text-white transition p-2 cursor-pointer">
            <SkipForward size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 9. MODAL: UPLOAD LAGU
// =====================================================================
function UploadTrackModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('file');
  const [formData, setFormData] = useState({ title: '', artist: '', audio_url: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);

    if (uploadType === 'file' && audioFile) {
      data.append('audio', audioFile);
    } else {
      data.append('audio_url', formData.audio_url);
    }

    if (coverFile) data.append('cover', coverFile);

    try {
      await API.post('/tracks', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Lagu berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false,
        background: '#FAF6F0',
        color: '#261C19',
      });
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.response?.data?.message || 'Terjadi kesalahan.',
        background: '#FAF6F0',
        color: '#261C19',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#261C19]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-[#D7C4B0] rounded-2xl p-6 w-full max-w-md text-[#261C19] shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold flex items-center gap-2 font-serif">
            <Upload size={18} className="text-[#B38E5D]" /> Unggah Lagu Baru
          </h3>
          <button onClick={onClose} className="p-1.5 bg-[#FAF5EF] border border-[#D7C4B0] rounded-lg text-[#5C4A42]/70 hover:text-[#261C19]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5C4A42]/70 mb-1 font-medium">Judul Lagu</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl px-3 py-2 text-[#261C19] outline-none focus:border-[#B38E5D]"
              placeholder="Cth: Sunset Kavana"
            />
          </div>
          <div>
            <label className="block text-[#5C4A42]/70 mb-1 font-medium">Penyanyi / Artist</label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl px-3 py-2 text-[#261C19] outline-none focus:border-[#B38E5D]"
              placeholder="Cth: NIKI"
            />
          </div>

          <div className="flex gap-4 text-[#5C4A42] py-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="type" checked={uploadType === 'file'} onChange={() => setUploadType('file')} className="accent-[#B38E5D]" /> File MP3
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="type" checked={uploadType === 'url'} onChange={() => setUploadType('url')} className="accent-[#B38E5D]" /> URL External
            </label>
          </div>

          {uploadType === 'file' ? (
            <div>
              <label className="block text-[#5C4A42]/70 mb-1 font-medium">File Audio (.mp3)</label>
              <input
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full text-[#5C4A42]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#FAF5EF] file:text-[#261C19] file:border file:border-[#D7C4B0] hover:file:bg-[#E5D7C5] cursor-pointer"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[#5C4A42]/70 mb-1 font-medium">Link Direct Audio URL</label>
              <input
                type="url"
                required
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                className="w-full bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl px-3 py-2 text-[#261C19] outline-none focus:border-[#B38E5D]"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          )}

          <div>
            <label className="block text-[#5C4A42]/70 mb-1 font-medium">Foto Cover Album (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full text-[#5C4A42]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#FAF5EF] file:text-[#261C19] file:border file:border-[#D7C4B0] hover:file:bg-[#E5D7C5] cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-[#D7C4B0] hover:bg-[#FAF5EF] rounded-xl font-semibold text-[#261C19] cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] hover:brightness-110 text-white font-bold rounded-xl transition shadow-md shadow-[#B38E5D]/20 cursor-pointer">
              {loading ? 'Mengunggah...' : 'Simpan Lagu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================================
// 10. MODAL: BUAT PLAYLIST
// =====================================================================
function CreatePlaylistModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('name', name);
    data.append('description', description);
    if (coverFile) data.append('cover', coverFile);

    try {
      await API.post('/playlists', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Playlist berhasil dibuat.',
        timer: 1500,
        showConfirmButton: false,
        background: '#FAF6F0',
        color: '#261C19',
      });
      setName('');
      setDescription('');
      setCoverFile(null);
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan.',
        background: '#FAF6F0',
        color: '#261C19',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#261C19]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-[#D7C4B0] rounded-2xl p-6 w-full max-w-md text-[#261C19] shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold flex items-center gap-2 font-serif">
            <Plus size={18} className="text-[#B38E5D]" /> Buat Playlist Baru
          </h3>
          <button onClick={onClose} className="p-1.5 bg-[#FAF5EF] border border-[#D7C4B0] rounded-lg text-[#5C4A42]/70 hover:text-[#261C19]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5C4A42]/70 mb-1 font-medium">Nama Playlist</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl px-3 py-2 text-[#261C19] outline-none focus:border-[#B38E5D]"
              placeholder="Cth: Suasana Santai"
            />
          </div>
          <div>
            <label className="block text-[#5C4A42]/70 mb-1 font-medium">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl px-3 py-2 text-[#261C19] outline-none focus:border-[#B38E5D]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[#5C4A42]/70 mb-1 font-medium">Foto Sampul</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full text-[#5C4A42]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#FAF5EF] file:text-[#261C19] file:border file:border-[#D7C4B0] hover:file:bg-[#E5D7C5] cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-[#D7C4B0] hover:bg-[#FAF5EF] rounded-xl font-semibold text-[#261C19] cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] hover:brightness-110 text-white font-bold rounded-xl transition shadow-md shadow-[#B38E5D]/20 cursor-pointer">
              {loading ? 'Menyimpan...' : 'Buat Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================================
// 11. ADVANCED MUSIC PLAYER BAR (BOTTOM KAVANA VISTA)
// =====================================================================
function MusicPlayerBar({ onOpenQueue, onExpandPlayer }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    toggleMute,
    handleNext,
    handlePrev,
    seek,
    changeVolume,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const isSeekingRef = useRef(false);

  // Sync progress dengan currentTime — skip saat dragging/seeking
  useEffect(() => {
    if (!isSeekingRef.current && duration > 0 && isFinite(duration)) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  const handleSliderChange = (e) => {
    isSeekingRef.current = true;
    const v = Number(e.target.value);
    if (!isNaN(v)) setProgress(v);
  };

  const handleSliderCommit = () => {
    // Guard durasi: jika belum siap jangan reset ke 0
    if (!duration || !isFinite(duration) || duration <= 0) {
      isSeekingRef.current = false;
      return;
    }
    const val = Number(progress);
    if (isNaN(val)) { isSeekingRef.current = false; return; }
    const targetTime = (val / 100) * duration;
    seek(targetTime);
    // Lepas flag setelah seeked event, fallback timeout 600ms
    let done = false;
    const release = () => { if(done) return; done=true; isSeekingRef.current=false; };
    // Dengar seeked sekali
    try {
      const audio = document.querySelector('audio');
      // Fallback pakai PlayerContext seeked yang sudah update currentTime, jadi cukup timeout
      setTimeout(release, 500);
    } catch { setTimeout(release, 500); }
  };

  // Support pointer events agar drag di mobile/desktop konsisten & tidak mis-trigger
  const handlePointerDown = () => { isSeekingRef.current = true; };
  const handlePointerUp = () => { handleSliderCommit(); };

  const formatTime = (time) => {
    if (!time || isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#261C19]/95 backdrop-blur-xl border-t border-[#B38E5D]/20 px-4 py-2.5 text-[#FAF5EF] flex items-center justify-between z-50 shadow-2xl">
      {/* Left Info Track */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
        <div className="relative group cursor-pointer" onClick={onExpandPlayer}>
          <img
            src={getFullUrl(currentTrack?.cover_url) || 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'}
            alt=""
            className="w-12 h-12 rounded-lg object-cover bg-[#FAF5EF] shadow-md ring-1 ring-[#B38E5D]/20"
            onError={(e) => { e.target.src = 'https://placehold.co/150x150/0f172a/ffffff?text=No+Cover'; }}
          />
          <div className="absolute inset-0 bg-[#FAF5EF]/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>

        <div className="min-w-0">
          <h4
            onClick={onExpandPlayer}
            className="text-xs font-bold truncate hover:text-[#B38E5D] cursor-pointer transition"
          >
            {currentTrack?.title || 'Tidak Ada Lagu'}
          </h4>
          <p className="text-[11px] text-[#D7C4B0] truncate">{currentTrack?.artist || 'Kavana Player'}</p>
        </div>
      </div>

      {/* Center Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-[600px]">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition cursor-pointer ${isShuffle ? 'text-[#B38E5D]' : 'text-[#FAF5EF]/60 hover:text-white'}`}
          >
            <Tooltip text="Acak"><Shuffle size={15} /></Tooltip>
          </button>

          <button onClick={handlePrev} className="text-[#FAF5EF]/60 hover:text-white transition cursor-pointer">
            <Tooltip text="Sebelumnya"><SkipBack size={18} /></Tooltip>
          </button>

          <button
            onClick={togglePlay}
            className="bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] hover:brightness-110 text-white rounded-full p-2.5 shadow-lg shadow-[#B38E5D]/20 hover:scale-105 transition cursor-pointer"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          <button onClick={handleNext} className="text-[#FAF5EF]/60 hover:text-white transition cursor-pointer">
            <Tooltip text="Berikutnya"><SkipForward size={18} /></Tooltip>
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition cursor-pointer ${isRepeat ? 'text-[#B38E5D]' : 'text-[#FAF5EF]/60 hover:text-white'}`}
          >
            <Tooltip text="Ulangi"><Repeat size={15} /></Tooltip>
          </button>
        </div>

        {/* Progress Bar — Kavana fix: pakai progress state, guard duration, pointer events */}
        <div className="w-full flex items-center gap-2 text-[10px] text-[#D7C4B0] font-mono">
          <span className="w-8 text-right">{formatTime(isSeekingRef.current ? (progress / 100) * duration : currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(progress) ? 0 : progress}
            disabled={!duration || duration<=0}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={handleSliderChange}
            onInput={handleSliderChange}
            style={{
              background: `linear-gradient(to right, #B38E5D ${isNaN(progress)?0:progress}%, #D7C4B0 ${isNaN(progress)?0:progress}%)`
            }}
            className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-[#B38E5D] hover:h-1.5 transition-all ${(!duration||duration<=0)?'opacity-50 cursor-not-allowed':''}`}
          />
          <span className="w-8 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Volume & Extra Actions */}
      <div className="w-1/4 flex justify-end items-center gap-3 text-[#FAF5EF]/60">
        <button onClick={onOpenQueue} className="hover:text-white transition cursor-pointer">
          <Tooltip text="Antrean"><ListMusic size={18} /></Tooltip>
        </button>

        <button onClick={toggleMute} className="hover:text-white transition cursor-pointer">
          <Tooltip text={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} />}
          </Tooltip>
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #B38E5D ${(isMuted ? 0 : volume) * 100}%, #D7C4B0 ${(isMuted ? 0 : volume) * 100}%)`
          }}
          className="w-20 h-1 rounded-lg appearance-none cursor-pointer accent-[#B38E5D] hover:h-1.5 transition-all"
        />

        <button onClick={onExpandPlayer} className="hover:text-white transition cursor-pointer hidden sm:block">
          <Tooltip text="Layar Penuh"><Maximize2 size={16} /></Tooltip>
        </button>
      </div>
    </div>
  );
}