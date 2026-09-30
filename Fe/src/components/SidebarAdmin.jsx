import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
  LayoutDashboard,
  User,
  Building2,
  Users,
  Receipt,
  TrendingUp,
  AlertTriangle,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  CreditCard,
  MessageSquare,
  HelpCircle,
  ClipboardList,
  Megaphone,
  Newspaper,
  ListTodo,
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function SidebarAdmin({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State untuk Mobile Drawer & Desktop Collapse
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State untuk dropdown group expansion
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Profile Admin State
  const [adminProfile, setAdminProfile] = useState(null);

  // Function untuk fetch data profil terbaru dari Backend API
  const fetchLatestProfile = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();

      if (response.ok && result.data) {
        setAdminProfile(result.data);
        sessionStorage.setItem('admin', JSON.stringify(result.data));
      }
    } catch (e) {
      console.error('Gagal mengambil data profil admin terbaru:', e);
    }
  };

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('admin') || sessionStorage.getItem('user');
    if (savedAdmin) {
      try {
        setAdminProfile(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Failed to parse admin session:', e);
      }
    }

    fetchLatestProfile();

    const handleProfileUpdate = () => {
      const updatedAdmin = sessionStorage.getItem('admin') || sessionStorage.getItem('user');
      if (updatedAdmin) {
        try {
          setAdminProfile(JSON.parse(updatedAdmin));
        } catch (e) {}
      }
      fetchLatestProfile();
    };

    window.addEventListener('adminProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin mengakhiri sesi Admin di KafanaVista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B38E5D',
      cancelButtonColor: '#261C19',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: '#261C19',
      color: '#FAF5EF',
      customClass: {
        popup: 'border border-[#B38E5D]/30 rounded-2xl shadow-2xl backdrop-blur-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('admin');
        sessionStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  // DAFTAR MENU NAVIGASI (DENGAN KATEGORI DROPDOWN & MANAJEMEN IKLAN)
  const menuItems = [
    { name: 'Dashboard', path: '/admindashboard', icon: LayoutDashboard },
    { name: 'Profil Admin', path: '/adminprofile', icon: User },
    
    // GRUP MANAJEMEN PROPERTI
    {
      name: 'Manajemen Properti',
      icon: Building2,
      isGroup: true,
      isExpanded: true,
      items: [
        { name: 'Kelola Properti', path: '/admin/properti', icon: Building2 },
        { name: 'Penyewa Aktif', path: '/adminpenyewa', icon: Users },
        { name: 'Dokumen Sewa', path: '/admin/dokumen-sewa', icon: FileText },
      ]
    },

    // GRUP IKLAN & PROMOSI
    {
      name: 'Iklan & Promosi',
      icon: Newspaper,
      isGroup: true,
      isExpanded: false,
      items: [
        { name: 'Riwayat Iklan', path: '/riwayat-iklan', icon: ListTodo },
        { name: 'Pasang Iklan', path: '/Adminpasangiklan', icon: ListTodo },
        { name: 'Pembayaran Iklan', path: '/pembayaran-iklan', icon: Receipt },
      ]
    },

    // GRUP KEUANGAN & TRANSAKSI
    {
      name: 'Keuangan & Transaksi',
      icon: CreditCard,
      isGroup: true,
      isExpanded: false,
      items: [
        { name: 'Payment Setting', path: '/AdminPaymentSettings', icon: CreditCard },
        { name: 'Tagihan & Order', path: '/adminTO', icon: Receipt },
        { name: 'Riwayat Pembayaran', path: '/admin/riwayat-pembayaran', icon: ClipboardList },
        { name: 'Laporan Keuangan', path: '/adminlaporan', icon: TrendingUp },
      ]
    },

    // GRUP LAYANAN & BANTUAN
    {
      name: 'Layanan & Bantuan',
      icon: MessageSquare,
      isGroup: true,
      isExpanded: false,
      items: [
        { name: 'Kelola Komplain', path: '/admin/komplain', icon: AlertTriangle },
        { name: 'Room Chat', path: '/AdminRoomChat', icon: MessageSquare },
        { name: 'Pusat Bantuan', path: '/pusatbantuanadmin', icon: HelpCircle },
      ]
    },
  ];

  const avatarUrl = adminProfile?.foto
    ? (adminProfile.foto.startsWith('http') ? adminProfile.foto : `http://localhost:8000/storage/${adminProfile.foto}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(adminProfile?.name || adminProfile?.nama || 'Admin')}&background=B38E5D&color=fff&bold=true`;

  return (
    <div className="flex h-screen bg-[#FAF5EF] overflow-hidden overflow-x-hidden font-sans">
      {/* SIDEBAR DESKTOP */}
      <aside
        className={`hidden md:flex flex-col bg-[#261C19] text-[#FAF5EF] border-r border-[#B38E5D]/20 h-full flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-30 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#B38E5D]/20 flex justify-between items-center min-h-[72px] relative">
          {!isCollapsed && (
            <div className="truncate transition-opacity duration-300">
              <h1 className="text-xl font-bold font-serif tracking-wider text-white">
                Kafana<span className="text-[#B38E5D] font-light">Vista</span>
              </h1>
              <p className="text-[8px] text-[#B38E5D] uppercase tracking-widest font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#B38E5D]" /> Admin Portal
              </p>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-3 min-h-11 min-w-11 w-11 h-11 flex items-center justify-center rounded-xl text-[#FAF5EF]/70 hover:text-white hover:bg-[#B38E5D]/20 hover:border-[#B38E5D]/40 border border-transparent transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 text-[#B38E5D]" /> : <ChevronLeft className="w-5 h-5 text-[#B38E5D]" />}
          </button>
        </div>

        {/* KARTU PROFIL ADMIN */}
        <div className="p-3 border-b border-[#B38E5D]/20 bg-[#1C1412]/60 backdrop-blur-md">
          <Link
            to="/adminprofile"
            className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#B38E5D]/10 hover:border-[#B38E5D]/30 border border-transparent transition-all group relative ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt="Profile Admin"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#B38E5D] shadow-md group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminProfile?.name || adminProfile?.nama || 'Admin')}&background=B38E5D&color=fff`;
                }}
              />
              <span className="absolute bottom-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#261C19]"></span>
              </span>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-xs font-bold text-white truncate group-hover:text-[#B38E5D] transition-colors">
                  {adminProfile?.name || adminProfile?.nama || 'Administrator'}
                </h2>
                <p className="text-[10px] text-[#D7C4B0]/70 truncate">
                  {adminProfile?.email || 'admin@kafanavista.com'}
                </p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#B38E5D]/15 border border-[#B38E5D]/30 text-[#B38E5D] text-[9px] font-semibold rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{adminProfile?.role || 'Admin'}</span>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-[#1C1412] text-white border border-[#B38E5D]/30 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 pointer-events-none shadow-2xl z-50 flex flex-col">
                <span className="font-bold text-[#B38E5D]">{adminProfile?.name || adminProfile?.nama || 'Profil Admin'}</span>
                <span className="text-[10px] text-gray-300">Pengaturan Sesi Admin</span>
              </div>
            )}
          </Link>
        </div>

        {/* NAVIGASI MENU UTAMA */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
          {menuItems.map((item, index) => {
            if (item.isGroup) {
              const isExpanded = expandedGroups[item.name] ?? item.isExpanded;
              const isGroupActive = item.items.some(sub => location.pathname.toLowerCase() === sub.path.toLowerCase());

              return (
                <div key={index} className="relative group">
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-left cursor-pointer group hover:translate-x-1 ${
                      isCollapsed ? 'justify-center px-0' : ''
                    } ${isGroupActive ? 'bg-gradient-to-r from-[#B38E5D]/20 to-[#8F6E45]/20 text-white border-l-4 border-amber-200' : 'text-[#FAF5EF]/70 hover:bg-[#FAF5EF]/10 hover:text-white'}`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isGroupActive ? 'text-white' : 'text-[#B38E5D]'}`} />
                    {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
                    {!isCollapsed && (
                      <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isGroupActive ? 'text-white' : 'text-[#B38E5D]'} ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {!isCollapsed && isExpanded && (
                    <div className="mt-1 ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isActive = location.pathname.toLowerCase() === subItem.path.toLowerCase();

                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 hover:translate-x-0.5 ${
                              isActive ? 'bg-[#B38E5D]/20 text-white border-l-2 border-white' : 'text-[#FAF5EF]/70 hover:bg-[#B38E5D]/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#B38E5D]'}`} />
                            <span className="truncate">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#1C1412] text-white border border-[#B38E5D]/30 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 pointer-events-none shadow-xl z-50 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B38E5D]" />
                      {item.name}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();

            return (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-white shadow-lg shadow-[#B38E5D]/25 border-l-4 border-amber-200 translate-x-1'
                      : 'text-[#FAF5EF]/70 hover:bg-[#FAF5EF]/10 hover:text-white hover:translate-x-1'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#B38E5D]'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>

                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#1C1412] text-white border border-[#B38E5D]/30 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 pointer-events-none shadow-xl z-50 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B38E5D]" />
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER & LOGOUT BUTTON */}
        <div className="p-3 border-t border-[#B38E5D]/20 space-y-2">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 bg-rose-950/30 hover:bg-rose-600 border border-rose-800/40 hover:border-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${
                isCollapsed ? 'px-0' : ''
              }`}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Keluar</span>}
            </button>

            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-rose-950 text-rose-200 border border-rose-800/50 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 pointer-events-none shadow-xl z-50">
                Keluar Sesi Admin
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE BACKDROP OVERLAY & DRAWER */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[min(18rem,85vw)] max-w-[85vw] max-h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#261C19] text-[#FAF5EF] z-50 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) md:hidden flex flex-col border-r border-[#B38E5D]/30 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#B38E5D]/20 flex justify-between items-center bg-[#1C1412]">
          <div>
            <h1 className="text-xl font-bold font-serif text-white">
              Kafana<span className="text-[#B38E5D]">Vista</span>
            </h1>
            <p className="text-[9px] text-[#B38E5D] uppercase tracking-widest font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin Panel
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 min-h-11 min-w-11 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profil Admin Mobile */}
        <div className="p-4 border-b border-[#B38E5D]/20 bg-[#211715]/90">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="Admin"
              className="w-11 h-11 rounded-full object-cover border-2 border-[#B38E5D] shadow-md"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-white truncate">{adminProfile?.name || adminProfile?.nama || 'Administrator'}</h2>
              <p className="text-[10px] text-[#D7C4B0]/70 truncate">{adminProfile?.email || 'admin@kafanavista.com'}</p>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#B38E5D]/20 border border-[#B38E5D]/30 text-[#B38E5D] text-[9px] font-semibold rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{adminProfile?.role || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigasi Mobile */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden min-w-0">
          {menuItems.map((item, index) => {
            if (item.isGroup) {
              const isExpanded = expandedGroups[item.name] ?? item.isExpanded;
              const isGroupActive = item.items.some(sub => location.pathname.toLowerCase() === sub.path.toLowerCase());

              return (
                <div key={index} className="relative group">
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                      isGroupActive ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-white shadow-md' : 'text-[#FAF5EF]/80 hover:bg-[#B38E5D]/20 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isGroupActive ? 'text-white' : 'text-[#B38E5D]'}`} />
                    <span>{item.name}</span>
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${isGroupActive ? 'text-white' : 'text-[#B38E5D]'} ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200 border-l border-[#B38E5D]/20 pl-2">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isActive = location.pathname.toLowerCase() === subItem.path.toLowerCase();

                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                              isActive ? 'bg-[#B38E5D]/20 text-white border-l-2 border-white' : 'text-[#FAF5EF]/80 hover:bg-[#B38E5D]/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#B38E5D]'}`} />
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#B38E5D] to-[#8F6E45] text-white shadow-md border-l-4 border-amber-200'
                    : 'text-[#FAF5EF]/80 hover:bg-[#B38E5D]/20 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#B38E5D]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-[#B38E5D]/20 bg-[#1C1412] space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi Admin</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-x-hidden min-w-0">
        <header className="bg-[#261C19]/95 backdrop-blur-md text-white px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap gap-2 sm:flex-row justify-between items-center shadow-md border-b border-[#B38E5D]/20 sticky top-0 z-20 overflow-x-hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-3 min-h-11 min-w-11 w-11 h-11 flex items-center justify-center rounded-lg bg-[#B38E5D]/20 text-[#B38E5D] hover:text-white hover:bg-[#B38E5D] transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B38E5D] to-[#8F6E45] flex items-center justify-center text-[#FAF5EF] shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h1 className="font-serif font-bold text-base md:text-lg tracking-wider">
                Kafana<span className="text-[#B38E5D] font-light">Vista</span>
                <span className="hidden sm:inline-block text-[10px] text-[#B38E5D] font-sans ml-2 px-2 py-0.5 bg-[#B38E5D]/10 rounded border border-[#B38E5D]/20 font-semibold">
                  Admin Panel
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1412]/60 border border-[#B38E5D]/20 text-xs text-[#FAF5EF]">
              <NotificationBell endpoint="/notifications" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-[#FAF5EF] min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
} 