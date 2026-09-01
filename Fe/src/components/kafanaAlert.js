import Swal from 'sweetalert2';

// 🎨 INJEKSI CSS: GLASSMORPHISM, SPRING ANIMATION, & MICRO-INTERACTIONS
if (typeof document !== 'undefined') {
  const styleId = 'kafana-luxury-alerts';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = `
      /* 1. Backdrop Frosted Glass Premium (Charcoal Transparan) */
      .swal2-backdrop-show {
        background: rgba(38, 28, 25, 0.7) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
      }

      /* 2. Animasi Masuk: Spring Cubic-Bezier Scale-Up (85% ke 100% + Fade In) */
      @keyframes kafanaSpringUp {
        0% {
          opacity: 0;
          transform: scale(0.85) translateY(25px);
        }
        60% {
          opacity: 1;
          transform: scale(1.02) translateY(-3px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* 3. Animasi Keluar: Fade-Out Down (Lembut ke bawah) */
      @keyframes kafanaFadeDown {
        0% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        100% {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
      }

      .kafana-modal-show {
        animation: kafanaSpringUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
      }

      .kafana-modal-hide {
        animation: kafanaFadeDown 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards !important;
      }

      /* 4. Pulse Visual Animasi Halus pada Ikon */
      @keyframes kafanaIconPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .swal2-icon {
        animation: kafanaIconPulse 2.5s infinite ease-in-out !important;
        border-width: 2px !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// 🏛️ KONFIGURASI DASAR UI (LUXURY THEME KAFANA VISTA)
const luxuryBaseConfig = {
  background: '#FAF6F0',
  buttonsStyling: false, // Mematikan style bawaan agar kelas Tailwind mengambil alih
  showClass: {
    popup: 'kafana-modal-show',
    backdrop: 'swal2-backdrop-show'
  },
  hideClass: {
    popup: 'kafana-modal-hide'
  },
  customClass: {
    // Multi-layered drop shadow dalam & border tipis emas yang menyala
    popup: 'rounded-3xl border border-[#C5A059]/40 shadow-[0_40px_80px_-15px_rgba(38,28,25,0.7),0_0_20px_rgba(197,160,89,0.15)] p-8 max-w-md w-full',
    title: 'font-serif text-[#261C19] font-extrabold text-2xl tracking-wide mt-2 mb-1',
    htmlContainer: 'text-slate-500 text-sm font-sans leading-relaxed mt-1 mb-2',
    actions: 'gap-4 mt-6 w-full flex justify-center',
    // Pill-button modern dengan mikro-interaksi (hover scale, active shrink, glowing shadow)
    confirmButton: 'px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#C5A059] to-[#9C7A3C] hover:from-[#9C7A3C] hover:to-[#7A5E2B] active:scale-95 hover:scale-105 transition-all duration-300 shadow-lg shadow-[#C5A059]/30 cursor-pointer',
    cancelButton: 'px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-[#FAF6F0] bg-[#261C19] hover:bg-black active:scale-95 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/30 cursor-pointer'
  }
};

/**
 * 🌟 ALERT SUKSES KAFANAVISTA[cite: 4]
 */
export const kafanaSuccess = (title, message = '') => {
  return Swal.fire({
    ...luxuryBaseConfig,
    title,
    html: message,
    icon: 'success',
    iconColor: '#C5A059',
    confirmButtonText: '✨ Siap, Mantap!',
    customClass: {
      ...luxuryBaseConfig.customClass,
      popup: `${luxuryBaseConfig.customClass.popup} border-[#C5A059]/50`
    }
  });
};

/**
 * 🚨 ALERT ERROR / GAGAL KAFANAVISTA[cite: 4]
 */
export const kafanaError = (title, message = '') => {
  return Swal.fire({
    ...luxuryBaseConfig,
    title,
    html: message,
    icon: 'error',
    iconColor: '#E11D48',
    confirmButtonText: 'Tutup & Coba Lagi',
    customClass: {
      ...luxuryBaseConfig.customClass,
      popup: `${luxuryBaseConfig.customClass.popup} border-rose-400/50 shadow-[0_40px_80px_-15px_rgba(38,28,25,0.7),0_0_20px_rgba(225,29,72,0.15)]`,
      confirmButton: 'px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-[#261C19] hover:bg-black active:scale-95 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/30 cursor-pointer'
    }
  });
};

/**
 * ⚠️ ALERT PERINGATAN / WARNING KAFANAVISTA[cite: 4]
 */
export const kafanaWarning = (title, message = '') => {
  return Swal.fire({
    ...luxuryBaseConfig,
    title,
    html: message,
    icon: 'warning',
    iconColor: '#D97706',
    confirmButtonText: 'Saya Mengerti',
    customClass: {
      ...luxuryBaseConfig.customClass,
      popup: `${luxuryBaseConfig.customClass.popup} border-amber-400/50 shadow-[0_40px_80px_-15px_rgba(38,28,25,0.7),0_0_20px_rgba(217,119,6,0.15)]`,
      confirmButton: 'px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-[#261C19] hover:bg-black active:scale-95 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/30 cursor-pointer'
    }
  });
};

/**
 * ❓ DIALOG KONFIRMASI KAFANAVISTA (Pilihan Ya / Batal)[cite: 4]
 */
export const kafanaConfirm = async (title, message = '', confirmText = 'Ya, Lanjutkan') => {
  const result = await Swal.fire({
    ...luxuryBaseConfig,
    title,
    html: message,
    icon: 'question',
    iconColor: '#C5A059',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    customClass: {
      ...luxuryBaseConfig.customClass,
      popup: `${luxuryBaseConfig.customClass.popup} border-[#C5A059]/60`
    }
  });

  return result.isConfirmed; // Secara implisit mengembalikan boolean Promise (true/false)[cite: 4]
};