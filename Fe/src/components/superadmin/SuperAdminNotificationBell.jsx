import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, Inbox, ShieldCheck, Volume2 } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import NotificationToast from '../NotificationToast';

export default function SuperAdminNotificationBell() {
  const dropdownRef = useRef(null);

  // 🛠️ PERBAIKAN: Endpoint disesuaikan dengan api.php (/admin/superadmin/notifications)
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    toastNotif,
    handleItemClick,
    handleMarkAllRead,
    closeToast,
    testNotification,
  } = useNotifications('/admin/superadmin/notifications');
  // Fallback jika hook belum expose testNotification (versi lama)
  const handleTest = testNotification || (() => {});

  // Navigasi saat klik notif superadmin
  const onItemClick = async (item) => {
    const target = item.action_url || item.target_url;
    await handleItemClick(item);
    if (target) {
      window.location.href = target;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((o) => !o)}
          className={`relative p-2 rounded-xl text-white transition-all duration-200 cursor-pointer flex items-center justify-center ${
            isOpen
              ? 'bg-[#B38E5D] text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 text-[#D7C4B0]'
          } border border-white/10`}
          aria-label="Notifikasi Superadmin"
        >
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#F5C15D] animate-bounce' : ''}`} />

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#261C19] shadow-md animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[85vw] bg-[#FAF5EF] rounded-2xl border border-[#D7C4B0] shadow-2xl shadow-black/50 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 bg-[#261C19] text-[#FAF5EF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B38E5D]" />
                <span className="text-xs font-bold uppercase tracking-widest">Superadmin Alert</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-bold bg-[#B38E5D] text-white px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 🔊 Tombol Tes Suara & Toast Manual */}
                <button
                  onClick={handleTest}
                  title="Uji Coba Suara & Toast"
                  className="p-1 rounded hover:bg-[#B38E5D]/30 text-[#F5C15D] transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#B38E5D] hover:text-[#F5C15D] transition cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai Dibaca
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-[#D7C4B0]/50 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-[#B38E5D]/50 mx-auto" />
                  <p className="text-xs font-bold text-[#5C4A42]">Belum Ada Notifikasi</p>
                  <p className="text-[10px] text-[#5C4A42]/70">Aktivitas sistem & verifikasi akan tampil di sini.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className={`w-full text-left px-4 py-3 border-b border-[#D7C4B0]/40 hover:bg-[#B38E5D]/10 transition-all duration-150 cursor-pointer flex gap-3 ${
                      !item.is_read ? 'bg-[#B38E5D]/10' : ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      item.is_read ? 'bg-[#D7C4B0]' : 'bg-[#B38E5D] animate-pulse'
                    }`} />
                    <span className="flex-1 min-w-0">
                      <span className={`block text-xs font-bold truncate ${
                        item.is_read ? 'text-[#5C4A42]/70' : 'text-[#2D2321]'
                      }`}>
                        {item.title || 'Sistem Superadmin'}
                      </span>
                      <span className="block text-[11px] text-[#5C4A42]/80 mt-0.5 line-clamp-2">
                        {item.message || ''}
                      </span>
                      <span className="block text-[10px] text-[#B38E5D] mt-1 font-semibold">
                        {item.created_at || ''}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🍞 POPUP TOAST NOTIFIKASI REAL-TIME */}
      {toastNotif && (
        <NotificationToast
          key={toastNotif.id}
          notification={toastNotif}
          onOpen={() => onItemClick(toastNotif)}
          onClose={closeToast}
        />
      )}
    </>
  );
}