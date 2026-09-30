import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  Users,
  User,
  Wallet,
  TrendingUp,
  CreditCard,
  Landmark,
  Receipt,
  Settings,
  ShieldCheck,
  Megaphone,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Sparkles,
  Crown,
  Package,
} from 'lucide-react';
import SuperAdminNotificationBell from './superadmin/SuperAdminNotificationBell';

export default function SidebarSuperAdmin({ children }) {
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

  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin mengakhiri sesi Super Admin?',
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

  // DAFTAR MENU NAVIGASI DENGAN KATEGORI DROPDOWN
  const menuItems = [
    { name: 'Dashboard Utama', path: '/superadmin/overview', icon: LayoutDashboard },

    // GRUP PENGELOLA & PENGGUNA
    {
      name: 'Pengguna & Admin',
      icon: Users,
      isGroup: true,
      isExpanded: true,
      items: [
        { name: 'Kelola Pengelola', path: '/superadmin/administrators', icon: Users },
        { name: 'Monitoring User', path: '/superadmin/users', icon: User },
        { name: 'Verifikasi Profil Admin', path: '/SuperAdminProfileRequests', icon: UserCheck },
      ]
    },

    // GRUP KEUANGAN & TRANSAKSI
    {
      name: 'Keuangan & Analitik',
      icon: Wallet,
      isGroup: true,
      isExpanded: false,
      items: [
        { name: 'Pendapatan Admin', path: '/superadmin/revenue', icon: Wallet },
        { name: 'Analitik Pendapatan', path: '/superadmin/revenue-analytics', icon: TrendingUp },
        { name: 'Finance Tracker', path: '/superadmin/finance-tracker', icon: CreditCard },
        { name: 'Rekening Bank', path: '/superadmin/bank-accounts', icon: Landmark },
        { name: 'Kelola Paket Premium', path: '/superadmin/packages', icon: Package },
        { name: 'Semua Transaksi', path: '/superadmin/transactions', icon: Receipt },
      ]
    },

    // GRUP VERIFIKASI & IKLAN
    {
      name: 'Verifikasi & Iklan',
      icon: Megaphone,
      isGroup: true,
      isExpanded: false,
      items: [
        { name: 'Verifikasi Properti', path: '/VerifikasiPropertiSuperAdmin', icon: ShieldCheck },
        { name: 'Kelola Iklan Banner', path: '/KelolaIklanSuperAdmin', icon: Megaphone },
        { name: 'Verifikasi Iklan', path: '/superadmin/VerifikasiIklanAdmin', icon: Megaphone },
        { name: 'Verifikasi Premium', path: '/superadmin/SuperAdminSubscriptions', icon: Crown },
      ]
    },

    { name: 'Pengaturan Website', path: '/superadmin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FAF5EF] overflow-hidden overflow-x-hidden font-sans max-w-full">
      {/* SIDEBAR DESKTOP */}
      <aside
        className={`hidden md:flex flex-col bg-[#261C19] text-[#FAF5EF] border-r border-[#B38E5D]/20 h-full flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-30 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header Logo */}
        <div className="p-4 border-b border-[#B38E5D]/20 flex flex-wrap gap-2 justify-between items-center min-h-[72px] relative overflow-x-hidden">
          {!isCollapsed && (
            <div className="truncate transition-opacity duration-300">
              <h1 className="text-xl font-bold font-serif tracking-wider text-white">
                Kafana<span className="text-[#B38E5D] font-light">Vista</span>
              </h1>
              <p className="text-[8px] text-[#B38E5D] uppercase tracking-widest font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#B38E5D]" /> Superadmin Panel
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

        {/* PROFIL SUPERADMIN */}
        <div className="p-3 border-b border-[#B38E5D]/20 bg-[#1C1412]/60 backdrop-blur-md">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all relative ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#B38E5D] flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-xs font-bold text-white truncate">
                  Super Administrator
                </h2>
                <p className="text-[10px] text-[#D7C4B0]/70 truncate">
                  Full Access Control
                </p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#B38E5D]/15 border border-[#B38E5D]/30 text-[#B38E5D] text-[9px] font-semibold rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Superadmin</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MENU NAVIGASI */}
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

        {/* FOOTER & TOMBOL KELUAR */}
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
                Keluar Sesi Superadmin
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
        <div className="p-5 border-b border-[#B38E5D]/20 flex flex-wrap gap-2 justify-between items-center bg-[#1C1412] overflow-x-hidden">
          <div>
            <h1 className="text-xl font-bold font-serif text-white">
              Kafana<span className="text-[#B38E5D]">Vista</span>
            </h1>
            <p className="text-[9px] text-[#B38E5D] uppercase tracking-widest font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Superadmin Panel
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 min-h-11 min-w-11 w-11 h-11 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profil Mobile */}
        <div className="p-4 border-b border-[#B38E5D]/20 bg-[#211715]/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#B38E5D] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-white truncate">Super Administrator</h2>
              <p className="text-[10px] text-[#D7C4B0]/70 truncate">Full Access Control</p>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#B38E5D]/20 border border-[#B38E5D]/30 text-[#B38E5D] text-[9px] font-semibold rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Superadmin</span>
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
            <span>Keluar Sesi Superadmin</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-x-hidden min-w-0">
        <header className="bg-[#261C19]/95 backdrop-blur-md text-white px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap gap-2 justify-between items-center shadow-md border-b border-[#B38E5D]/20 sticky top-0 z-20 overflow-x-hidden max-w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-3 min-h-11 min-w-11 w-11 h-11 rounded-lg bg-[#B38E5D]/20 text-[#B38E5D] hover:text-white hover:bg-[#B38E5D] transition cursor-pointer flex items-center justify-center"
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
                  Superadmin Panel
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SuperAdminNotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#FAF5EF] max-w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}