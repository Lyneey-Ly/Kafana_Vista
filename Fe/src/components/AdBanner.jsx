import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const SLIDE_INTERVAL = 5000;

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80';

// Helper: ubah path gambar storage menjadi URL absolut
const buildImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/storage/')) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/storage/${path.replace(/^\/+/, '')}`;
};

// Helper: baca banner_image — bisa berupa string JSON array atau path tunggal
const parseBannerImages = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((p) => buildImageUrl(p)).filter(Boolean);
    }
    if (typeof parsed === 'string' && parsed.trim()) {
      return [buildImageUrl(parsed)];
    }
  } catch {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      const matches = raw.match(/"([^"]+)"/g) || [];
      if (matches.length > 0) {
        return matches.map((m) => buildImageUrl(m.replace(/"/g, ''))).filter(Boolean);
      }
    }
    if (trimmed) {
      return [buildImageUrl(trimmed)];
    }
  }
  return [];
};

// Helper: filter iklan aktif berdasarkan is_active & rentang tanggal
const isActiveNow = (ad) => {
  if (!ad) return false;
  const active = ad.is_active === true || ad.is_active === 1 || ad.is_active === '1';
  if (!active) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (ad.start_date) {
    const start = new Date(ad.start_date);
    if (!isNaN(start)) {
      start.setHours(0, 0, 0, 0);
      if (today < start) return false;
    }
  }

  if (ad.end_date) {
    const end = new Date(ad.end_date);
    if (!isNaN(end)) {
      end.setHours(23, 59, 59, 999);
      if (today > end) return false;
    }
  }

  return true;
};

const VARIANT_STYLES = {
  horizontal: 'h-52 md:h-64 rounded-2xl',
  banner: 'h-44 md:h-60 rounded-2xl',
  sidebar: 'h-56 md:h-64 rounded-xl',
  'in-feed': 'h-44 md:h-56 rounded-2xl',
  card: 'h-44 rounded-2xl',
};

export default function AdBanner({ placement, className = '', variant = 'horizontal' }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slidesRef = useRef([]);

  useEffect(() => {
    let active = true;

    const fetchAds = async () => {
      setLoading(true);
      try {
        const res = await API.get('/vendor-ads/active', { params: placement ? { placement } : {} });
        if (!active) return;

        const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        const items = Array.isArray(data) ? data : [];

        // Filter ganda: endpoint sudah memfilter, tapi tetap cek klien untuk keamanan
        const activeAds = items.filter(isActiveNow);

        // Setiap gambar dari setiap iklan menjadi slide carousel
        const slideList = [];
        activeAds.forEach((ad) => {
          const images = parseBannerImages(ad.banner_image);
          if (images.length === 0) return;
          images.forEach((image) => {
            slideList.push({ ad, image });
          });
        });

        if (active) {
          slidesRef.current = slideList;
          setSlides(slideList);
          setCurrentIndex(0);
        }
      } catch (err) {
        if (!active) return;
        console.warn(`Gagal memuat iklan untuk placement "${placement}":`, err);

        // Fallback: coba endpoint daftar umum, lalu filter di klien
        try {
          const res = await API.get('/vendor-ads');
          if (!active) return;
          const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
          const items = Array.isArray(data) ? data : [];
          const activeAds = items.filter(
            (ad) => (!placement || ad.placement === placement) && isActiveNow(ad)
          );

          const slideList = [];
          activeAds.forEach((ad) => {
            const images = parseBannerImages(ad.banner_image);
            if (images.length === 0) return;
            images.forEach((image) => {
              slideList.push({ ad, image });
            });
          });

          if (active) {
            slidesRef.current = slideList;
            setSlides(slideList);
            setCurrentIndex(0);
          }
        } catch {
          if (active) {
            slidesRef.current = [];
            setSlides([]);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAds();
    return () => {
      active = false;
    };
  }, [placement]);

  // Auto-slide setiap 5 detik (paused saat hover)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentIndex]);

  const goToSlide = useCallback((index) => {
    if (!slidesRef.current.length) return;
    const normalized = (index + slidesRef.current.length) % slidesRef.current.length;
    setCurrentIndex(normalized);
  }, []);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE;
  };

  // Sembunyikan komponen bila tidak ada iklan aktif (tanpa merusak layout)
  if (loading || slides.length === 0) return null;

  const variantClasses = VARIANT_STYLES[variant] || VARIANT_STYLES.horizontal;
  const showControls = slides.length > 1;

  return (
    <div
      className={`group relative w-full overflow-hidden bg-white border border-[#D7C4B0] shadow-sm ${variantClasses} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SLIDES WRAPPER */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map(({ ad, image }, index) => (
          <div key={`${ad.id}-${index}`} className="relative w-full h-full flex-shrink-0">
            <img
              src={image}
              alt={ad.vendor_name || 'Iklan sponsor'}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />

            {/* Overlay gradasi agar teks promo tetap terbaca */}
            {(ad.description || ad.vendor_name) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#261C19]/85 via-[#261C19]/40 to-transparent px-4 pb-3 pt-10">
                {ad.vendor_name && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#B38E5D] mb-0.5">
                    {ad.vendor_name}
                  </p>
                )}
                {ad.description && (
                  <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                    {ad.description}
                  </p>
                )}
              </div>
            )}

            {/* Bungkus link jika link_url tersedia */}
            {ad.link_url && (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buka iklan ${ad.vendor_name || 'sponsor'}`}
                className="absolute inset-0 z-10"
              />
            )}
          </div>
        ))}
      </div>

      {/* BADGE SPONSOR */}
      <span className="absolute top-3 left-3 z-20 bg-[#B38E5D] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md shadow-black/20">
        Sponsor
      </span>

      {/* TOMBOL PREV / NEXT (muncul saat hover) */}
      {showControls && (
        <>
          <button
            onClick={() => goToSlide(currentIndex - 1)}
            aria-label="Iklan sebelumnya"
            className="absolute top-1/2 left-3 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#261C19]/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#B38E5D] transition-all duration-300 cursor-pointer"
          >
            <span className="text-sm leading-none -mt-0.5">❮</span>
          </button>
          <button
            onClick={() => goToSlide(currentIndex + 1)}
            aria-label="Iklan berikutnya"
            className="absolute top-1/2 right-3 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#261C19]/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#B38E5D] transition-all duration-300 cursor-pointer"
          >
            <span className="text-sm leading-none -mt-0.5">❯</span>
          </button>
        </>
      )}

      {/* INDIKATOR DOTS */}
      {showControls && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Slide iklan ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === index ? 'w-6 bg-[#B38E5D]' : 'w-2 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}