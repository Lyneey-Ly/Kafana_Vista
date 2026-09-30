import { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api';

export default function useNotifications(endpoint = '/notifications') {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toastNotif, setToastNotif] = useState(null);
  
  const knownIdsRef = useRef(new Set());
  const audioUnlockedRef = useRef(false);
  const token = sessionStorage.getItem('token');

  // Unlock Audio Browser pada Interaksi Pertama User
  useEffect(() => {
    const unlockAudio = () => {
      audioUnlockedRef.current = true;
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Pemutar Suara Synthesizer Fallback
  const playChimeSound = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const tones = [
        { freq: 880, start: 0, dur: 0.2, vol: 0.3 },
        { freq: 1174.66, start: 0.1, dur: 0.35, vol: 0.25 },
      ];
      tones.forEach(({ freq, start, dur, vol }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(vol, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      });
    } catch (e) {
      console.warn('Gagal memutar audio context:', e);
    }
  }, []);

  // Fungsi Panggil Suara
  const triggerSound = useCallback(() => {
    if (!audioUnlockedRef.current) return;
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {
      playChimeSound();
    });
  }, [playChimeSound]);

  // Untuk testing manual (dipakai SuperAdmin bell Volume2)
  const testNotification = useCallback(() => {
    audioUnlockedRef.current = true;
    const dummy = {
      id: Date.now(),
      title: 'Tes Notifikasi',
      message: 'Suara dan toast berfungsi dengan baik!',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setToastNotif(dummy);
    triggerSound();
  }, [triggerSound]);

  // Polling Notifikasi API — visibility-aware (pause saat tab hidden)
  useEffect(() => {
    if (!token) return;

    let isFirstLoad = true;
    let cancelled = false;
    let interval = null;

    const fetchNotifications = async () => {
      if (document.hidden) return;
      try {
        const res = await API.get(endpoint);
        const raw = res.data?.data ?? res.data ?? [];
        const itemsArray = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
        // Normalisasi is_read ke boolean
        const normalized = itemsArray.map((n) => ({ ...n, is_read: !!n.is_read }));
        const unread = normalized.filter((n) => !n.is_read).length;
        const newItems = normalized.filter((n) => !knownIdsRef.current.has(n.id));

        if (!cancelled) {
          setNotifications(normalized);
          setUnreadCount(unread);
        }

        if (isFirstLoad) {
          isFirstLoad = false;
          normalized.forEach((n) => knownIdsRef.current.add(n.id));
          return;
        }

        if (newItems.length > 0) {
          const newest = newItems[0];
          newItems.forEach((n) => knownIdsRef.current.add(n.id));
          if (!cancelled) {
            setToastNotif(newest);
            triggerSound();
          }
        }
      } catch (err) {
        if (err.response?.status === 401) return;
        console.error(`Error polling ${endpoint}:`, err);
      }
    };

    fetchNotifications();
    interval = setInterval(fetchNotifications, 10000);

    const handleVisibility = () => {
      if (!document.hidden) fetchNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [token, endpoint, triggerSound]);

  const handleItemClick = async (notif) => {
    setIsOpen(false);
    setToastNotif(null);
    if (!notif) return;
    try {
      if (!notif.is_read) {
        await API.patch(`${endpoint}/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.warn('Gagal menandai notifikasi dibaca:', err);
    }
    // Navigasi jika ada target_url / action_url
    const target = notif.target_url || notif.action_url;
    if (target) {
      // Biarkan caller juga handle navigate; fallback pakai window jika di luar router
      // Hook tidak import navigate agar tetap reusable — caller bisa override
      // Tapi kita coba soft navigate via window.location jika target adalah path internal
      // Caller (SidebarUser) sudah handle navigate secara eksplisit
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch(`${endpoint}/mark-all-read`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Gagal menandai semua dibaca:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    toastNotif,
    handleItemClick,
    handleMarkAllRead,
    closeToast: () => setToastNotif(null),
    testNotification,
    triggerSound,
  };
}
