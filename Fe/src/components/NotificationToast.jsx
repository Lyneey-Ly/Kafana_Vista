import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, ChevronRight } from 'lucide-react';

export default function NotificationToast({ notification, onOpen, onClose, duration = 4000 }) {
  // Fase animasi: 'enter' -> 'shown' -> 'exit'
  const [phase, setPhase] = useState('enter');

  const onCloseRef = useRef(onClose);
  const durationRef = useRef(duration);

  useEffect(() => {
    // Sinkronkan props terbaru setiap kali notifikasi baru tiba
    onCloseRef.current = onClose;
    durationRef.current = duration;

    const shownTimer = setTimeout(() => setPhase('shown'), 50);
    const exitTimer = setTimeout(() => setPhase('exit'), durationRef.current - 300);
    const closeTimer = setTimeout(() => onCloseRef.current?.(), durationRef.current);

    return () => {
      clearTimeout(shownTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [notification?.id]);

  if (!notification) return null;

  // 🚀 Bungkus dengan Portal agar animasi keluar dari jeratan CSS / Layout Superadmin
  return createPortal(
    /* UBAH DI SINI: left-4 menjadi right-4 */
    <div className="fixed top-4 right-4 z-[999999] w-[340px] max-w-[calc(100vw-2rem)] pointer-events-auto">
      <button
        onClick={onOpen}
        className={`group cursor-pointer w-full text-left flex items-start gap-3 bg-[#2D2321] border-2 border-[#B38E5D] text-[#FAF5EF] rounded-2xl shadow-2xl shadow-black/60 p-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02] ${
          phase === 'enter'
            ? 'translate-x-[130%] -translate-y-3 opacity-0 scale-95' /* UBAH DI SINI: translate dari kanan */
            : phase === 'exit'
            ? 'translate-x-[130%] opacity-0' /* UBAH DI SINI: translate keluar ke kanan */
            : 'translate-x-0 translate-y-0 opacity-100 scale-100'
        }`}
      >
        <span className="relative flex-shrink-0 pt-0.5">
          <span className="w-10 h-10 rounded-xl bg-[#B38E5D]/20 border border-[#B38E5D]/40 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#B38E5D] group-hover:animate-bounce" />
          </span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B38E5D] rounded-full border-2 border-[#FAF5EF] animate-pulse" />
        </span>

        <span className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-[#B38E5D] mb-1">
            Notifikasi Baru
          </span>
          <span className="block text-xs font-bold font-serif text-white leading-snug line-clamp-2">
            {notification?.title || 'Pembaruan KafanaVista'}
          </span>
          <span className="block text-[11px] text-[#FAF5EF]/70 mt-1 leading-relaxed line-clamp-2">
            {notification?.message || ''}
          </span>
          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-[#F5C15D]">
            Lihat detail <ChevronRight className="w-3 h-3" />
          </span>
        </span>
      </button>
    </div>,
    document.body
  );
}