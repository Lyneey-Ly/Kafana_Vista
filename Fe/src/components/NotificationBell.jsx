import React from 'react';
import { Bell } from 'lucide-react';
import useNotifications from '../hooks/useNotifications'; // Pastikan path hook benar
import NotificationToast from './NotificationToast';

export default function NotificationBell({ endpoint = 'http://localhost:8000/api/admin/notifications' }) {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    toastNotif, // SUDAH DIPERBAIKI (sebelumnya: activeToast)
    closeToast,
    handleItemClick,
    handleMarkAllRead
  } = useNotifications(endpoint);

  return (
    <>
      {/* 1. POPUP TOAST NOTIFIKASI (Tampil otomatis saat ada notif baru + suara) */}
      {toastNotif && (
        <NotificationToast
          notification={toastNotif}
          onOpen={() => handleItemClick(toastNotif)}
          onClose={closeToast}
          duration={5000}
        />
      )}

      {/* 2. ICON LONCENG & DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl hover:bg-[#B38E5D]/20 text-[#FAF5EF] transition cursor-pointer"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5 text-[#B38E5D]" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-md">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-[#261C19] border border-[#B38E5D]/30 rounded-2xl shadow-2xl z-50 overflow-hidden text-[#FAF5EF]">
            <div className="p-3 border-b border-[#B38E5D]/20 flex justify-between items-center bg-[#1C1412]">
              <h3 className="text-xs font-bold text-white">Notifikasi Admin</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-[#B38E5D] hover:underline cursor-pointer"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
              {notifications && notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 text-xs cursor-pointer hover:bg-[#B38E5D]/10 transition ${
                      !item.is_read ? 'bg-[#B38E5D]/10 border-l-2 border-[#B38E5D]' : ''
                    }`}
                  >
                    <p className="font-semibold text-white">{item.title || item.data?.title || 'Notifikasi Baru'}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-2">{item.message || item.data?.message}</p>
                    <span className="text-[8px] text-[#B38E5D] mt-1 block">
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">
                  Tidak ada notifikasi.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}