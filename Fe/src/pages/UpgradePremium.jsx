import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import SidebarUser from '../components/SidebarUser';

// =====================================================================
// INLINE SVG ICONS (HEROICONS / LUCIDE COMPATIBLE)
// =====================================================================
const IconCrown = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconTimer = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconCopy = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconUpload = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const IconSparkles = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconDownload = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconArrowLeft = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconArrowRight = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconQrcode = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-6s0 0 0 0m0 0v6m0-6h2m-6 0h2m-6 0H4m0 0h2m-2 0v4m0-6V4m0 0h6m-6 0v2m6-2v4m0 0H4m16 0v2m0 0h-2m2 0v4m0 0h-6m6 0v-2m-6 2v-4m0 0h2m-2 0H8m8 0h2" />
  </svg>
);

const IconCreditCard = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconWallet = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

const IconRefresh = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// =====================================================================
// DATA KONSTANTA & DESAIN SISTEM
// =====================================================================
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const STORAGE_URL = 'http://127.0.0.1:8000/storage';

const PACKAGES = {
  monthly: {
    id: 'monthly',
    name: 'Paket Bulanan',
    subtitle: 'Akses fleksibel tanpa komitmen jangka panjang',
    price: 50000,
    period: '/ bulan',
    durationDays: 30,
    badge: null,
    savingsText: null,
    isPopular: false,
    features: [
      'Akses Tanpa Batas Finance Tracker',
      'Randomizer Makan & Resep Hemat Kost',
      'Kalkulator Survival & Budget Planner',
      'Game Launcher Hub Premium Access',
      'Music Dashboard Stream Quality High',
      'Dukungan Prioritas 24/7',
    ],
  },
  yearly: {
    id: 'yearly',
    name: 'Paket Tahunan',
    subtitle: 'Pilihan paling populer bagi pengguna hemat',
    price: 500000,
    period: '/ tahun',
    durationDays: 365,
    badge: 'Hemat 17%',
    savingsText: 'Hemat Rp 100.000 dibanding bulanan',
    isPopular: true,
    features: [
      'Semua Fitur Paket Bulanan',
      'Bonus 2 Bulan Gratis',
      'Ekspor Laporan Keuangan ke PDF/Excel',
      'Kustomisasi Tema Dashboard Premium',
      'Prioritas Pertama Verifikasi Transaksi',
      'Bebas Iklan Sepenuhnya',
    ],
  },
  lifetime: {
    id: 'lifetime',
    name: 'Paket Lifetime',
    subtitle: 'Bayar sekali untuk akses seumur hidup',
    price: 1200000,
    period: 'sekali bayar',
    durationDays: 36500,
    badge: 'Best Value',
    savingsText: 'Akses selamanya tanpa biaya tambahan',
    isPopular: false,
    features: [
      'Semua Fitur Paket Tahunan',
      'Akses Selamanya Tanpa Batas',
      'Akses Dini Fitur Baru (Beta Tester)',
      'Lencana Eksklusif Founder Member',
      'Sesi Konsultasi Finansial Kost 1-on-1',
      'Jaminan Tanpa Kenaikan Harga',
    ],
  },
};

const FEATURES_COMPARISON = [
  { name: 'Finance Tracker Basic', free: true, premium: true },
  { name: 'Randomizer Makan & Resep Kost', free: true, premium: true },
  { name: 'Music Dashboard Player', free: 'Terbatas (Biasa)', premium: 'Kualitas Tinggi (HQ)' },
  { name: 'Game Launcher Hub', free: 'Versi Demo', premium: 'Akses Penuh' },
  { name: 'Ekspor Laporan PDF/Excel', free: false, premium: true },
  { name: 'Kalkulator Survival Lanjutan', free: false, premium: true },
  { name: 'Tanpa Iklan / Bebas Gangguan', free: false, premium: true },
  { name: 'Dukungan Prioritas SuperAdmin', free: false, premium: true },
];

const TESTIMONIALS = [
  {
    name: 'Rian Febrian',
    role: 'Mahasiswa Teknik',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    comment: 'Upgrade ke Paket Tahunan sangat worth it! Fitur Finance Tracker dan Resep Hemat Kost bikin pengeluaran bulanan aku lebih teratur.',
    rating: 5,
  },
  {
    name: 'Anisa Putri',
    role: 'Desainer Grafis Freelance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    comment: 'Music Dashboard-nya jernih banget, pas banget buat nemenin kerja seharian. Proses verifikasi admin juga cuma butuh 10 menit.',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    role: 'Anak Kost Veteran',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    comment: 'Paket Lifetime pilihan terbaik. Sekali bayar, hidup tenang tanpa mikirin langganan habis tiap bulan.',
    rating: 5,
  },
];

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

const getToken = () => {
  const directToken =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('token');

  if (directToken) return directToken;

  try {
    const userObj = localStorage.getItem('user');
    if (userObj) {
      const parsed = JSON.parse(userObj);
      return parsed.token || parsed.access_token || parsed.bearer_token || null;
    }
  } catch (e) {
    console.error('Gagal membaca token:', e);
  }
  return null;
};

const getAuthHeader = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    },
  };
};

// =====================================================================
// SUB-KOMPONEN 1: TOAST NOTIFICATION FLOATING
// =====================================================================
const ToastNotification = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
          isError
            ? 'bg-rose-950/90 text-rose-200 border-rose-800/80'
            : 'bg-[#261C19] text-[#FAF5EF] border-[#B38E5D]/50'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl ${
            isError ? 'bg-rose-800/50 text-rose-300' : 'bg-[#B38E5D]/30 text-[#C5A059]'
          }`}
        >
          {isError ? <IconX className="w-5 h-5" /> : <IconCheck className="w-5 h-5" />}
        </div>
        <p className="text-xs font-semibold max-w-xs">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// SUB-KOMPONEN 2: SKELETON LOADING STATE
// =====================================================================
const SkeletonLoader = () => (
  <div className="max-w-5xl mx-auto space-y-8 animate-pulse p-4">
    <div className="h-24 bg-[#E5D7C5]/40 rounded-3xl w-full"></div>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="h-80 bg-[#E5D7C5]/40 rounded-3xl"></div>
      <div className="h-80 bg-[#E5D7C5]/40 rounded-3xl"></div>
      <div className="h-80 bg-[#E5D7C5]/40 rounded-3xl"></div>
    </div>
    <div className="h-64 bg-[#E5D7C5]/40 rounded-3xl w-full"></div>
  </div>
);

// =====================================================================
// SUB-KOMPONEN 3: STATUS ACTIVE MEMBER PAGE
// =====================================================================
const PremiumActiveView = ({ mySubscription, onRenew }) => {
  const endDate = mySubscription?.end_date
    ? new Date(mySubscription.end_date)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const today = new Date();
  const diffTime = Math.max(0, endDate - today);
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#261C19] via-[#1E1614] to-[#110C0B] border border-[#4A3B32] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-[#B38E5D] to-[#C5A059] rounded-2xl text-[#261C19] shadow-lg shadow-[#B38E5D]/20">
              <IconCrown className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#B38E5D]/20 text-[#C5A059] border border-[#B38E5D]/40 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Member Premium Aktif
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#FAF5EF] mt-1">
                Selamat Datang, Sultan Kavana!
              </h1>
              <p className="text-xs text-[#E5D7C5]/70 mt-1">
                Kamu memiliki akses tak terbatas ke seluruh fitur eksklusif aplikasi.
              </p>
            </div>
          </div>

          <button
            onClick={onRenew}
            className="px-6 py-3 bg-[#B38E5D] hover:bg-[#C5A059] text-[#261C19] font-extrabold rounded-2xl shadow-xl shadow-[#B38E5D]/20 transition hover:scale-105 cursor-pointer text-xs flex items-center gap-2 uppercase tracking-wider"
          >
            <IconRefresh className="w-4 h-4" /> Perpanjang Langganan
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#4A3B32]">
          <div className="bg-black/30 p-4 rounded-2xl border border-[#4A3B32]">
            <p className="text-[10px] uppercase font-bold text-[#E5D7C5]/60 tracking-wider">Paket Aktif</p>
            <p className="text-lg font-extrabold text-[#C5A059] capitalize mt-0.5">
              {mySubscription?.package_type || 'Tahunan'}
            </p>
          </div>
          <div className="bg-black/30 p-4 rounded-2xl border border-[#4A3B32]">
            <p className="text-[10px] uppercase font-bold text-[#E5D7C5]/60 tracking-wider">Tanggal Kadaluwarsa</p>
            <p className="text-lg font-extrabold text-[#FAF5EF] mt-0.5">
              {endDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-black/30 p-4 rounded-2xl border border-[#4A3B32]">
            <p className="text-[10px] uppercase font-bold text-[#E5D7C5]/60 tracking-wider">Sisa Hari Aktif</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
              {remainingDays} Hari Lagi
            </p>
          </div>
        </div>
      </div>

      {/* Grid Akses Cepat Premium */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#B38E5D]">
          Fitur Eksklusif yang Bisa Kamu Nikmati
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Finance Tracker Pro', desc: 'Bebas catat transaksi tanpa limit', icon: '💰' },
            { name: 'Randomizer Makan', desc: 'Pilihan makanan hemat harian', icon: '🍲' },
            { name: 'Kalkulator Survival', desc: 'Simulasi budget akhir bulan', icon: '🧮' },
            { name: 'Music Dashboard HQ', desc: 'Audio jernih tanpa iklan', icon: '🎵' },
            { name: 'Game Launcher Hub', desc: 'Akses game santai pengisi waktu', icon: '🎮' },
            { name: 'Resep Hemat Kost', desc: 'Ratusan resep mudah & murah', icon: '🍳' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#E5D7C5] p-5 rounded-2xl hover:border-[#B38E5D] transition shadow-sm">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-bold text-xs text-[#261C19]">{item.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// SUB-KOMPONEN 4: PENDING REVIEW BANNER CARD
// =====================================================================
const PendingReviewCard = ({ latestOrder, onRefreshStatus }) => {
  return (
    <div className="bg-gradient-to-r from-[#261C19] via-[#1E1614] to-[#261C19] border border-[#B38E5D]/40 rounded-[2rem] p-6 text-[#FAF5EF] shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#B38E5D]/20 border border-[#B38E5D]/40 flex items-center justify-center text-[#C5A059] shrink-0">
            <IconTimer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#FAF5EF]">Pembayaran Dalam Proses Tinjauan</h3>
              <span className="px-2.5 py-0.5 bg-[#B38E5D]/20 text-[#C5A059] text-[10px] font-bold rounded-full border border-[#B38E5D]/30 uppercase">
                Status: Pending
              </span>
            </div>
            <p className="text-xs text-[#E5D7C5]/80 mt-1">
              Pengajuan paket <span className="font-bold uppercase text-[#C5A059]">{latestOrder?.package_type}</span> kamu sedang diverifikasi oleh SuperAdmin Kavana.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshStatus}
          className="px-4 py-2.5 bg-[#3D2D29] hover:bg-[#4A3B32] text-white rounded-xl text-xs font-semibold border border-[#4A3B32] flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <IconRefresh className="w-4 h-4" /> Cek Status Terbaru
        </button>
      </div>

      {/* Progress Line */}
      <div className="pt-2">
        <div className="flex justify-between text-[11px] font-semibold text-[#E5D7C5]/60 mb-1.5">
          <span className="text-[#C5A059]">Bukti Terkirim</span>
          <span className="text-[#C5A059]">Verifikasi Admin</span>
          <span>Aktivasi Akun</span>
        </div>
        <div className="w-full h-2 bg-[#3D2D29] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#B38E5D] to-[#C5A059] w-2/3 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// SUB-KOMPONEN 5: WIZARD STEP INDICATOR
// =====================================================================
const StepIndicator = ({ currentStep, setStep }) => {
  const steps = [
    { number: 1, label: 'Pilih Paket' },
    { number: 2, label: 'Metode Pembayaran' },
    { number: 3, label: 'Upload Bukti' },
    { number: 4, label: 'Struk Digital' },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#E5D7C5] rounded-full -z-0"></div>
        {/* Active Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#B38E5D] to-[#C5A059] rounded-full transition-all duration-500 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <button
                disabled={step.number > currentStep}
                onClick={() => setStep(step.number)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#B38E5D] text-white shadow-md shadow-[#B38E5D]/20'
                    : isActive
                    ? 'bg-[#C5A059] text-[#261C19] ring-4 ring-[#B38E5D]/30 scale-110 font-black'
                    : 'bg-white text-slate-400 border border-[#E5D7C5] cursor-not-allowed'
                }`}
              >
                {isCompleted ? <IconCheck className="w-5 h-5" /> : step.number}
              </button>
              <span
                className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                  isActive ? 'text-[#B38E5D] font-black' : isCompleted ? 'text-[#261C19]' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =====================================================================
// SUB-KOMPONEN 6: BENEFIT SHOWCASE & MATRIX COMPARISON
// =====================================================================
const BenefitShowcase = () => {
  return (
    <div className="space-y-10 my-8">
      {/* Grid Benefit Cards */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B38E5D]">
            Eksklusif Member Premium
          </span>
          <h2 className="text-xl md:text-2xl font-black text-[#261C19] mt-1">
            Mengapa Kamu Harus Upgrade?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nikmati kemudahan hidup anak kost dengan akses penuh ke seluruh ekosistem aplikasi.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Finance Tracker',
              desc: 'Catat pengeluaran harian tanpa batasan transaksi & analisis grafik.',
              icon: '📊',
            },
            {
              title: 'Randomizer Makan',
              desc: 'Bingung mau makan apa? Acak menu makanan hemat sesuai kantong.',
              icon: '🎲',
            },
            {
              title: 'Kalkulator Survival',
              desc: 'Hitung ketahanan uang saku sampai tanggal tua secara akurat.',
              icon: '💡',
            },
            {
              title: 'Resep Hemat Kost',
              desc: 'Kumpulan resep masakan simpel, cepat, dan murah meriah.',
              icon: '🍳',
            },
            {
              title: 'Game Hub Central',
              desc: 'Mainkan berbagai mini games seru untuk melepas penat.',
              icon: '🎮',
            },
            {
              title: 'Music Streaming HQ',
              desc: 'Dengar playlist favorit berkecepatan tinggi tanpa gangguan.',
              icon: '🎵',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white/80 border border-[#E5D7C5] hover:border-[#B38E5D] p-5 rounded-3xl transition duration-300 group hover:-translate-y-1 shadow-sm"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">{card.icon}</div>
              <h3 className="font-extrabold text-sm text-[#261C19]">{card.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white border border-[#E5D7C5] rounded-[2rem] p-6 shadow-md space-y-4">
        <h3 className="text-base font-black text-[#261C19] text-center">
          Matriks Perbandingan Fitur
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5D7C5] text-slate-500">
                <th className="py-3 px-4 font-bold">Fitur / Akses</th>
                <th className="py-3 px-4 font-bold text-center w-32">User Gratis</th>
                <th className="py-3 px-4 font-bold text-center w-36 text-[#B38E5D] bg-[#B38E5D]/10 rounded-t-xl">
                  Member Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D7C5]/50">
              {FEATURES_COMPARISON.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF5EF] transition">
                  <td className="py-3 px-4 text-[#261C19] font-medium">{row.name}</td>
                  <td className="py-3 px-4 text-center text-slate-500">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <IconCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <IconX className="w-4 h-4 text-slate-300 mx-auto" />
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#B38E5D] bg-[#B38E5D]/5">
                    {typeof row.premium === 'boolean' ? (
                      row.premium ? (
                        <IconCheck className="w-4 h-4 text-[#B38E5D] mx-auto" />
                      ) : (
                        <IconX className="w-4 h-4 text-slate-300 mx-auto" />
                      )
                    ) : (
                      row.premium
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Proof & Statistics */}
      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white border border-[#E5D7C5] p-4 rounded-2xl shadow-sm">
          <p className="text-2xl font-black text-[#B38E5D]">1,500+</p>
          <p className="text-xs text-slate-500">Anak Kost Aktif Premium</p>
        </div>
        <div className="bg-white border border-[#E5D7C5] p-4 rounded-2xl shadow-sm">
          <p className="text-2xl font-black text-emerald-600">99.8%</p>
          <p className="text-xs text-slate-500">Kepuasan Pengguna</p>
        </div>
        <div className="bg-white border border-[#E5D7C5] p-4 rounded-2xl shadow-sm">
          <p className="text-2xl font-black text-[#B38E5D] font-mono">&lt; 15 Menit</p>
          <p className="text-xs text-slate-500">Rata-rata Verifikasi Pembayaran</p>
        </div>
      </div>

      {/* Testimonial Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#B38E5D] text-center">
          Apa Kata Mereka yang Sudah Upgrade?
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E5D7C5] p-4 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-[#B38E5D]/30" />
                <div>
                  <h5 className="font-bold text-xs text-[#261C19]">{item.name}</h5>
                  <p className="text-[10px] text-slate-400">{item.role}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">"{item.comment}"</p>
              <div className="flex text-[#B38E5D] text-xs">
                {'★'.repeat(item.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// STEP 1: PLAN SELECTION
// =====================================================================
const Step1PlanSelection = ({ selectedPackage, setSelectedPackage, onNext }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#261C19]">Langkah 1: Pilih Paket Langganan</h2>
        <p className="text-xs text-slate-500">Pilih skema paket langganan yang paling pas untuk kebutuhan harian kamu.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(PACKAGES).map((pkg) => {
          const isSelected = selectedPackage === pkg.id;

          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative bg-white border-2 rounded-[2rem] p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm ${
                isSelected
                  ? 'border-[#B38E5D] bg-[#B38E5D]/5 ring-2 ring-[#B38E5D]/20 shadow-md'
                  : 'border-[#E5D7C5] hover:border-[#B38E5D]/50'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#B38E5D] to-[#C5A059] text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {pkg.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-[#261C19]">{pkg.name}</h3>
                  <input
                    type="radio"
                    name="package"
                    checked={isSelected}
                    onChange={() => setSelectedPackage(pkg.id)}
                    className="w-5 h-5 accent-[#B38E5D] cursor-pointer"
                  />
                </div>

                <p className="text-xs text-slate-500 min-h-[32px]">{pkg.subtitle}</p>

                <div className="my-6">
                  <span className="text-2xl md:text-3xl font-black text-[#B38E5D] font-mono">
                    {formatRupiah(pkg.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-normal ml-1">{pkg.period}</span>
                  {pkg.savingsText && (
                    <p className="text-[11px] font-semibold text-emerald-600 mt-1">{pkg.savingsText}</p>
                  )}
                </div>

                <hr className="border-[#E5D7C5] my-4" />

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <IconCheck className="w-4 h-4 text-[#B38E5D] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`w-full mt-6 py-3 rounded-2xl font-extrabold text-xs transition cursor-pointer uppercase tracking-wider ${
                  isSelected
                    ? 'bg-[#B38E5D] text-white shadow-md shadow-[#B38E5D]/20'
                    : 'bg-[#FAF5EF] hover:bg-[#E5D7C5] text-[#261C19] border border-[#E5D7C5]'
                }`}
              >
                {isSelected ? 'Paket Terpilih' : 'Pilih Paket Ini'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="px-8 py-3.5 bg-[#261C19] hover:bg-[#B38E5D] text-white font-black rounded-2xl shadow-xl transition hover:scale-105 cursor-pointer text-xs flex items-center gap-2 uppercase tracking-widest"
        >
          Lanjut ke Pembayaran <IconArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// STEP 2: PAYMENT METHOD & REKENING (INCL. UNIQUE CODE & TIMER)
// =====================================================================
const Step2PaymentMethod = ({
  selectedPackage,
  bankAccounts,
  uniqueCode,
  paymentMethod,
  setPaymentMethod,
  selectedBank,
  setSelectedBank,
  onCopy,
  onNext,
  onPrev,
}) => {
  const pkg = PACKAGES[selectedPackage];
  const totalPrice = pkg.price + uniqueCode;

  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#261C19]">Langkah 2: Metode Pembayaran</h2>
        <p className="text-xs text-slate-500">Transfer tepat sesuai nominal untuk mempermudah verifikasi otomatis oleh sistem.</p>
      </div>

      {/* Countdown Timer Warning Banner */}
      <div className="bg-[#B38E5D]/10 border border-[#B38E5D]/30 p-4 rounded-2xl flex items-center justify-between text-xs text-[#261C19]">
        <div className="flex items-center gap-3">
          <IconTimer className="w-5 h-5 text-[#B38E5D] animate-pulse" />
          <span className="font-semibold">Selesaikan pembayaran dalam waktu:</span>
        </div>
        <span className="font-mono text-base font-black text-[#B38E5D] bg-white px-3 py-1 rounded-xl border border-[#E5D7C5]">
          {formatTimer(timeLeft)}
        </span>
      </div>

      {/* Rincian Tagihan dengan Kode Unik */}
      <div className="bg-white border border-[#E5D7C5] rounded-[2rem] p-6 space-y-4 shadow-md">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#B38E5D]">Ringkasan Tagihan</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Harga Paket ({pkg.name})</span>
            <span className="font-mono">{formatRupiah(pkg.price)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              Kode Unik Verifikasi <span className="text-[10px] text-[#B38E5D] bg-[#B38E5D]/10 px-1.5 py-0.5 rounded font-bold">*otomatis</span>
            </span>
            <span className="font-mono text-[#B38E5D] font-bold">+ Rp {uniqueCode}</span>
          </div>
          <hr className="border-[#E5D7C5] my-2" />
          <div className="flex justify-between text-sm font-extrabold text-[#261C19]">
            <span>Total yang Harus Ditransfer</span>
            <div className="text-right">
              <span className="text-[#B38E5D] font-mono text-lg block">{formatRupiah(totalPrice)}</span>
              <button
                onClick={() => onCopy(totalPrice.toString(), 'Nominal Total Transfer')}
                className="text-[10px] text-slate-500 hover:text-[#B38E5D] flex items-center gap-1 ml-auto mt-0.5 transition cursor-pointer font-bold"
              >
                <IconCopy className="w-3 h-3" /> Salin Nominal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Pilihan Metode Pembayaran */}
      <div className="space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-[#B38E5D]">Pilih Metode Bayar</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'bank', label: 'Bank Transfer', icon: IconCreditCard },
            { id: 'qris', label: 'QRIS Instant', icon: IconQrcode },
            { id: 'ewallet', label: 'E-Wallet', icon: IconWallet },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = paymentMethod === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#B38E5D]/10 border-[#B38E5D] text-[#B38E5D] shadow-sm'
                    : 'bg-white border-[#E5D7C5] text-slate-500 hover:border-[#B38E5D]/50'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Rekening / QRIS Konten */}
      <div className="bg-white border border-[#E5D7C5] rounded-[2rem] p-6 space-y-4 shadow-sm">
        {paymentMethod === 'bank' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Silakan transfer ke salah satu rekening resmi SuperAdmin berikut:</p>

            {bankAccounts.length === 0 ? (
              <div className="p-4 bg-[#FAF5EF] rounded-2xl border border-[#E5D7C5] text-center text-xs text-slate-400">
                Memuat daftar rekening resmi...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {bankAccounts.map((acc) => {
                  const isSelectedBank = selectedBank?.account_number === acc.account_number;

                  return (
                    <div
                      key={acc.id || acc.account_number}
                      onClick={() => setSelectedBank(acc)}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 relative ${
                        isSelectedBank
                          ? 'border-[#B38E5D] bg-[#B38E5D]/5'
                          : 'border-[#E5D7C5] bg-[#FAF5EF] hover:border-[#B38E5D]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#B38E5D] uppercase">{acc.bank_name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(acc.account_number, `Nomor Rekening ${acc.bank_name}`);
                          }}
                          className="px-2.5 py-1 bg-[#261C19] hover:bg-[#3D2D29] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                        >
                          <IconCopy className="w-3 h-3" /> Salin No.
                        </button>
                      </div>

                      <div>
                        <p className="font-mono text-lg font-bold text-[#261C19] tracking-wider">{acc.account_number}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">a.n. {acc.account_holder}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'qris' && (
          <div className="text-center space-y-4 py-2">
            <p className="text-xs text-slate-600">Scan QRIS menggunakan GoPay, OVO, Dana, ShopeePay, atau Mobile Banking:</p>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-[#E5D7C5]">
              <img
                src={
                  selectedBank?.qris_image_url
                    ? selectedBank.qris_image_url
                    : selectedBank?.qris_image
                    ? `${STORAGE_URL}/${selectedBank.qris_image}`
                    : 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KAVANA_PREMIUM_QRIS_PAYMENT'
                }
                alt="QRIS Pembayaran"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500">NMI: ID1029384756102 • QRIS Resmi Kavana Vista</p>
          </div>
        )}

        {paymentMethod === 'ewallet' && (
          <div className="space-y-3 text-xs text-slate-600">
            <p>Transfer via Dompet Digital / E-Wallet Resmi SuperAdmin:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: 'DANA / OVO / GoPay', num: '0812-3456-7890', owner: 'SuperAdmin Kavana' },
                { name: 'ShopeePay', num: '0812-3456-7890', owner: 'SuperAdmin Kavana' },
              ].map((ew, idx) => (
                <div key={idx} className="p-4 bg-[#FAF5EF] rounded-2xl border border-[#E5D7C5] space-y-2">
                  <span className="font-bold text-[#B38E5D]">{ew.name}</span>
                  <p className="font-mono text-base font-bold text-[#261C19]">{ew.num}</p>
                  <p className="text-[10px] text-slate-500">a.n. {ew.owner}</p>
                  <button
                    onClick={() => onCopy(ew.num, `Nomor ${ew.name}`)}
                    className="w-full py-1.5 bg-[#261C19] hover:bg-[#3D2D29] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <IconCopy className="w-3 h-3" /> Salin Nomor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-white hover:bg-[#FAF5EF] text-[#261C19] font-bold rounded-2xl text-xs border border-[#E5D7C5] transition cursor-pointer flex items-center gap-2"
        >
          <IconArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3.5 bg-[#261C19] hover:bg-[#B38E5D] text-white font-black rounded-2xl shadow-xl transition hover:scale-105 cursor-pointer text-xs flex items-center gap-2 uppercase tracking-widest"
        >
          Sudah Bayar, Upload Bukti <IconArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// STEP 3: UPLOAD PROOF & CONFIRMATION FORM
// =====================================================================
const Step3UploadProof = ({
  file,
  previewUrl,
  senderName,
  setSenderName,
  refNumber,
  setRefNumber,
  onFileSelect,
  onResetFile,
  onSubmit,
  submitting,
  onPrev,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#261C19]">Langkah 3: Unggah Bukti Pembayaran</h2>
        <p className="text-xs text-slate-500">Upload foto atau screenshot struk transfer kamu untuk diproses SuperAdmin.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Drag & Drop Upload Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 relative cursor-pointer ${
            isDragging
              ? 'border-[#B38E5D] bg-[#B38E5D]/10 scale-102'
              : previewUrl
              ? 'border-[#B38E5D] bg-white'
              : 'border-[#E5D7C5] bg-white hover:border-[#B38E5D] hover:bg-[#FAF5EF]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview Bukti Transfer"
                  className="max-h-56 mx-auto rounded-2xl object-contain shadow-lg border border-[#E5D7C5]"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetFile();
                  }}
                  className="absolute -top-3 -right-3 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition cursor-pointer"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-[#B38E5D]">{file?.name}</p>
                <p className="text-[10px] text-slate-400">
                  Ukuran: {(file?.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti file
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="w-14 h-14 bg-[#B38E5D]/10 text-[#B38E5D] border border-[#B38E5D]/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <IconUpload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#261C19]">
                  Tarik & lepas file gambar ke sini, atau <span className="text-[#B38E5D] underline">Cari File</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Format: JPG, PNG, WEBP (Maksimal 4MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Form Opsional */}
        <div className="bg-white border border-[#E5D7C5] rounded-[2rem] p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#B38E5D]">Detail Pengirim (Opsional)</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Pemilik Rekening / Pengirim</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Cth: Rian Febrian"
                className="w-full bg-[#FAF5EF] border border-[#E5D7C5] rounded-xl px-4 py-2.5 text-xs text-[#261C19] placeholder-slate-400 focus:outline-none focus:border-[#B38E5D] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor Referensi Transfer / Trx ID</label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="Cth: TRX-98210398"
                className="w-full bg-[#FAF5EF] border border-[#E5D7C5] rounded-xl px-4 py-2.5 text-xs text-[#261C19] placeholder-slate-400 focus:outline-none focus:border-[#B38E5D] transition"
              />
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={submitting}
            className="px-6 py-3 bg-white hover:bg-[#FAF5EF] text-[#261C19] font-bold rounded-2xl text-xs border border-[#E5D7C5] transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <IconArrowLeft className="w-4 h-4" /> Kembali
          </button>

          <button
            type="submit"
            disabled={!file || submitting}
            className="px-8 py-3.5 bg-[#B38E5D] hover:bg-[#C5A059] text-white font-black rounded-2xl shadow-xl transition hover:scale-105 cursor-pointer text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim Pembayaran...</span>
              </>
            ) : (
              <>
                <IconSparkles className="w-4 h-4" /> Kirim & Verifikasi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================================
// STEP 4: DIGITAL RECEIPT & CONFIRMATION
// =====================================================================
const Step4DigitalReceipt = ({ selectedPackage, uniqueCode, senderName, refNumber, onFinish }) => {
  const pkg = PACKAGES[selectedPackage];
  const totalPaid = pkg.price + uniqueCode;
  const transactionId = `KVN-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
          <IconCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-[#261C19]">Bukti Pembayaran Terkirim!</h2>
        <p className="text-xs text-slate-500">
          SuperAdmin sedang meninjau pengajuan kamu. Tanda terima digital berikut adalah bukti sah pembayaran.
        </p>
      </div>

      {/* Struk Digital Card (Printable Area) */}
      <div id="digital-receipt" className="bg-[#261C19] border border-[#4A3B32] rounded-[2rem] p-6 space-y-6 shadow-2xl relative overflow-hidden text-[#FAF5EF]">
        {/* Watermark Logo Accent */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none p-6">
          <IconCrown className="w-48 h-48 text-[#B38E5D]" />
        </div>

        <div className="flex items-center justify-between border-b border-[#4A3B32] pb-4">
          <div>
            <span className="font-black text-lg text-white tracking-wider">KAVANA VISTA</span>
            <span className="font-light text-xs text-[#C5A059] block -mt-1 uppercase tracking-widest">Premium Receipt</span>
          </div>
          <span className="px-3 py-1 bg-[#B38E5D]/20 text-[#C5A059] border border-[#B38E5D]/30 text-[10px] font-bold rounded-full">
            PENDING VERIFICATION
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400">ID Transaksi</p>
            <p className="font-mono font-bold text-white mt-0.5">{transactionId}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Tanggal Transaksi</p>
            <p className="font-semibold text-[#E5D7C5] mt-0.5">{currentDate}</p>
          </div>
          <div>
            <p className="text-slate-400">Paket Terpilih</p>
            <p className="font-bold text-[#C5A059] mt-0.5">{pkg.name}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Pengirim (Opsional)</p>
            <p className="font-semibold text-[#E5D7C5] mt-0.5">{senderName || '-'}</p>
          </div>
        </div>

        <hr className="border-[#4A3B32]" />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Harga Paket</span>
            <span>{formatRupiah(pkg.price)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Kode Unik Sistem</span>
            <span>Rp {uniqueCode}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#4A3B32]">
            <span>Total Dibayar</span>
            <span className="text-[#C5A059] font-mono">{formatRupiah(totalPaid)}</span>
          </div>
        </div>

        <div className="bg-black/40 p-3 rounded-2xl border border-[#4A3B32] text-[10px] text-slate-400 text-center leading-relaxed">
          Estimasi waktu verifikasi oleh admin: <strong className="text-white">5 - 15 Menit</strong>. Status keanggotaan kamu akan aktif secara otomatis setelah diverifikasi.
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 bg-white hover:bg-[#FAF5EF] text-[#261C19] font-bold rounded-2xl text-xs border border-[#E5D7C5] transition cursor-pointer flex items-center justify-center gap-2"
        >
          <IconDownload className="w-4 h-4" /> Cetak / Unduh Struk
        </button>

        <button
          onClick={onFinish}
          className="flex-1 py-3 bg-[#B38E5D] hover:bg-[#C5A059] text-[#261C19] font-black rounded-2xl shadow-xl transition cursor-pointer text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          Kembali ke Dashboard Status
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// UTAMA: KOMPONEN UPGRADE PREMIUM REFACTORED (PRODUCTION-GRADE)
// =====================================================================
export default function UpgradePremium() {
  const [step, setStep] = useState(1);

  const [selectedPackage, setSelectedPackage] = useState('yearly');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [selectedBank, setSelectedBank] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [refNumber, setRefNumber] = useState('');

  const uniqueCode = useMemo(() => Math.floor(100 + Math.random() * 900), []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mySubscription, setMySubscription] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  const fetchMySubscription = useCallback(async () => {
    const token = getToken();
    if (!token) {
      triggerToast('Sesi kamu tidak ditemukan. Silakan login kembali.', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/my-subscription`,
        getAuthHeader()
      );
      setMySubscription(response.data);
    } catch (err) {
      console.error('Gagal mengambil status subscription:', err);
      if (err.response?.status === 401) {
        triggerToast('Sesi login berakhir. Silakan re-login.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const fetchBankAccounts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bank-accounts`, getAuthHeader());
      const list = res.data?.data || res.data || [];
      const activeBanks = list.filter((b) => b.is_active == 1 || b.is_active === true);
      setBankAccounts(activeBanks);
      if (activeBanks.length > 0) {
        setSelectedBank(activeBanks[0]);
      }
    } catch (err) {
      console.error('Gagal memuat data rekening:', err);
    }
  }, []);

  useEffect(() => {
    fetchMySubscription();
    fetchBankAccounts();
  }, [fetchMySubscription, fetchBankAccounts]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      triggerToast('File harus berupa gambar (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      triggerToast('Ukuran file maksimal 4MB.', 'error');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleResetFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerToast(`${label} berhasil disalin ke clipboard!`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      triggerToast('Sesi login tidak terdeteksi. Silakan re-login.', 'error');
      return;
    }

    if (!file) {
      triggerToast('Silakan upload bukti pembayaran terlebih dahulu.', 'error');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('package_type', selectedPackage);
    formData.append('proof_of_payment', file);
    if (senderName) formData.append('sender_name', senderName);
    if (refNumber) formData.append('reference_number', refNumber);
    formData.append('unique_code', uniqueCode);

    try {
      await axios.post(`${API_BASE_URL}/subscriptions/subscribe`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      triggerToast('Bukti pembayaran berhasil dikirim!', 'success');
      setStep(4);
      fetchMySubscription();
    } catch (err) {
      console.error('Gagal upload bukti bayar:', err);
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Sesi berakhir. Silakan login ulang.'
          : 'Gagal mengunggah bukti pembayaran.');
      triggerToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarUser>
        <div className="min-h-screen bg-[#FAF5EF] text-[#1E1614] p-6 flex justify-center items-center">
          <SkeletonLoader />
        </div>
      </SidebarUser>
    );
  }

  const isCurrentlyActive = mySubscription?.status === 'active' || mySubscription?.is_premium;
  if (isCurrentlyActive && step === 1) {
    return (
      <SidebarUser>
        <div className="min-h-screen bg-[#FAF5EF] text-[#1E1614] p-4 md:p-8">
          <PremiumActiveView
            mySubscription={mySubscription}
            onRenew={() => setStep(1)}
          />
        </div>
      </SidebarUser>
    );
  }

  const latestOrder = mySubscription?.latest_order;
  const isPending = latestOrder?.status === 'pending';

  return (
    <SidebarUser>
      <div className="min-h-screen bg-[#FAF5EF] text-[#1E1614] p-4 md:p-8 space-y-8 select-none font-sans">
        <ToastNotification toast={toast} onClose={() => setToast((p) => ({ ...p, show: false }))} />

        {/* Header Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B38E5D]/10 border border-[#B38E5D]/30 text-[#B38E5D] text-xs font-black rounded-full uppercase tracking-widest shadow-sm">
            <IconCrown className="w-4 h-4" /> Member Premium Kavana
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-[#261C19] tracking-tight">
            Tingkatkan Pengalaman Kamu
          </h1>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            Bebaskan semua batasan fitur dengan berlangganan paket premium eksklusif Kavana.
          </p>
        </div>

        {/* Pending Order Banner */}
        {isPending && (
          <div className="max-w-4xl mx-auto">
            <PendingReviewCard
              latestOrder={latestOrder}
              onRefreshStatus={fetchMySubscription}
            />
          </div>
        )}

        {/* Wizard Multi-Step Progress Control */}
        <div className="max-w-4xl mx-auto bg-white/80 border border-[#E5D7C5] rounded-[2rem] p-4 shadow-sm backdrop-blur-xl">
          <StepIndicator currentStep={step} setStep={setStep} />
        </div>

        {/* Dynamic Wizard Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <>
              <Step1PlanSelection
                selectedPackage={selectedPackage}
                setSelectedPackage={setSelectedPackage}
                onNext={() => setStep(2)}
              />
              <BenefitShowcase />
            </>
          )}

          {step === 2 && (
            <Step2PaymentMethod
              selectedPackage={selectedPackage}
              bankAccounts={bankAccounts}
              uniqueCode={uniqueCode}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              onCopy={handleCopyText}
              onNext={() => setStep(3)}
              onPrev={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3UploadProof
              file={file}
              previewUrl={previewUrl}
              senderName={senderName}
              setSenderName={setSenderName}
              refNumber={refNumber}
              setRefNumber={setRefNumber}
              onFileSelect={handleFileSelect}
              onResetFile={handleResetFile}
              onSubmit={handleSubmit}
              submitting={submitting}
              onPrev={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <Step4DigitalReceipt
              selectedPackage={selectedPackage}
              uniqueCode={uniqueCode}
              senderName={senderName}
              refNumber={refNumber}
              onFinish={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </SidebarUser>
  );
}