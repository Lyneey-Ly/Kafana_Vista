import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import SidebarUser from '../components/SidebarUser';
import VendorBanner from '../components/VendorBanner';
import Footer from '../components/footer';
import { 
  Sparkles, Calendar, Key, ShieldCheck, 
  Wallet, Building2, Zap, AlertCircle, ArrowRight, Home
} from 'lucide-react';

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

// --- STATIC DATA (Dipindahkan ke luar komponen) ---
const PROMOS = [
  {
    id: 1,
    title: "Diskon Perpanjangan Tahunan",
    desc: "Perpanjang sewa unit Anda selama 1 tahun penuh dan dapatkan cashback serta potongan harga hingga 15%.",
    tag: "Special Offer",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Weekend Coffee & Chill",
    desc: "Bergabunglah di acara komunitas penghuni eksklusif kami di Rooftop Lounge pada akhir pekan ini.",
    tag: "Community Event",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Refer-a-Friend Program",
    desc: "Ajak rekan Anda untuk menetap di Kafana Vista dan nikmati potongan sewa senilai Rp 1 Juta.",
    tag: "Referral",
    img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop"
  }
];

const FEATURES = [
  { icon: Key, title: "Akses & Kontrak Digital", desc: "Penandatanganan dokumen sewa resmi dan praktis via aplikasi." },
  { icon: Wallet, title: "Transparansi Finansial", desc: "Laporan tagihan, invoice, dan riwayat pembayaran tercatat otomatis." },
  { icon: Zap, title: "Layanan Tanggap Komplain", desc: "Pelaporan kendala fasilitas kamar cepat ditangani oleh admin pemilik kost." },
  { icon: ShieldCheck, title: "Properti Terverifikasi", desc: "Hunian nyaman dengan lokasi strategis dan fasilitas terjamin." },
];

export default function HomeUser() {
  const navigate = useNavigate();

  // --- STATES ---
  const [userProfile, setUserProfile] = useState({ name: 'Penghuni' });
  const [activeLeases, setActiveLeases] = useState([]);
  const [selectedLeaseIndex, setSelectedLeaseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPromo, setCurrentPromo] = useState(0);

  // --- FETCH DATA BACKEND ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await API.get('/profile'); 
        
        if (res.data?.data) {
          setUserProfile(res.data.data);
        }
        
        const sewaAktifData = res.data?.status_sewa || [];
        
        if (sewaAktifData.length > 0) {
          const formattedLeases = sewaAktifData.map(sewa => {
            const checkInDate = sewa.check_in_date ? new Date(sewa.check_in_date) : new Date();
            const durasiBulan = sewa.duration_months || 1;
            
            const dueDateObj = new Date(checkInDate);
            dueDateObj.setMonth(dueDateObj.getMonth() + durasiBulan);
            
            const today = new Date();
            const timeDiff = dueDateObj.getTime() - today.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const totalDays = durasiBulan * 30;
            
            return {
              id: sewa.id,
              unitName: `${sewa.title} ${sewa.kamar?.nama_kamar ? `- ${sewa.kamar.nama_kamar}` : ''}`,
              dueDate: dueDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              daysLeft: daysLeft > 0 ? daysLeft : 0,
              totalDays: totalDays,
              billAmount: sewa.kamar?.harga || 0,
            };
          });
          setActiveLeases(formattedLeases);
        } else {
          setActiveLeases([]);
        }
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  // Auto-slide Promo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % PROMOS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentLease = activeLeases[selectedLeaseIndex];
  const progressPercent = currentLease 
    ? ((currentLease.totalDays - currentLease.daysLeft) / currentLease.totalDays) * 100 
    : 0;

  return (
    <SidebarUser>
      <div className="min-h-screen bg-[#FAF5EF] text-[#1E1614] font-sans pb-20 selection:bg-[#B38E5D] selection:text-white">
        
       

        <motion.main 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* SECTION 1: PERSONALIZED WELCOME & ACTIVE LEASE / EMPTY STATE */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#261C19] capitalize">
                Selamat Datang Kembali, {userProfile.name.split(' ')[0]} <Sparkles className="inline-block text-[#B38E5D] pb-2" size={32} />
              </h1>
            </div>

            {/* VENDOR BANNER (Hero Section) */}
            <VendorBanner placement="home_hero" />

            {loading ? (
              <div className="w-full h-64 bg-slate-200 animate-pulse rounded-[2rem] border border-[#E5D7C5]"></div>
            ) : activeLeases.length > 0 ? (
              /* CARD KONTRAK AKTIF */
              <div className="relative overflow-hidden bg-gradient-to-br from-[#261C19] via-[#1E1614] to-[#110C0B] text-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-[#4A3B32]">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#C5A059]/15 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Kontrak Aktif
                        </span>

                        {activeLeases.length > 1 && (
                          <select 
                            value={selectedLeaseIndex}
                            onChange={(e) => setSelectedLeaseIndex(Number(e.target.value))}
                            className="bg-black/20 text-xs font-bold text-[#E5D7C5] border border-[#4A3B32] rounded-lg px-3 py-3 min-h-11 focus:outline-none focus:border-[#C5A059] cursor-pointer"
                          >
                            {activeLeases.map((lease, idx) => (
                              <option key={lease.id} value={idx} className="bg-[#261C19] text-white">
                                {lease.unitName}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-[#FAF5EF]">{currentLease.unitName}</h2>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-bold text-[#E5D7C5]/70 uppercase tracking-wider">
                        <span>Durasi Sewa</span>
                        <span className="text-[#C5A059]">{currentLease.daysLeft} Hari Lagi</span>
                      </div>
                      <div className="w-full bg-[#3D2D29] rounded-full h-2.5 overflow-hidden border border-[#4A3B32]">
                        <motion.div 
                          className="bg-gradient-to-r from-[#B38E5D] to-[#C5A059] h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {currentLease.daysLeft <= 7 && (
                      <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl backdrop-blur-sm">
                        <AlertCircle className="text-rose-400 shrink-0" size={20} />
                        <p className="text-xs font-medium text-rose-200">
                          Tagihan Anda jatuh tempo pada <strong className="text-white font-bold">{currentLease.dueDate}</strong>. Segera perpanjang untuk menghindari denda keterlambatan.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-4 md:border-l border-[#4A3B32] md:pl-8 lg:pl-12">
                    <div className="mb-2 hidden md:block">
                      <p className="text-[10px] text-[#E5D7C5]/50 uppercase tracking-[0.2em] font-bold">Tagihan Bulan Ini</p>
                      <p className="text-3xl font-black text-white">{formatRupiah(currentLease.billAmount)}</p>
                    </div>
                    

                  </div>
                </div>
              </div>
            ) : (
              /* EMPTY STATE BANNER (Penutup Ternary Diperbaiki) */
              <div className="relative overflow-hidden bg-white text-center rounded-[2rem] p-10 md:p-14 shadow-md border-2 border-dashed border-[#D7C4B0]">
                <div className="max-w-xl mx-auto space-y-5">
                  <div className="w-16 h-16 bg-[#FAF5EF] text-[#B38E5D] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-[#E5D7C5]">
                    <Home size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-[#261C19]">Belum Ada Kontrak Sewa Aktif</h2>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Sepertinya kamu belum menyewa properti apapun saat ini. Mari mulai perjalananmu dan temukan hunian impian dengan fasilitas terbaik di Kafana Vista.
                  </p>
                  <button 
                    onClick={() => navigate('/carihunian')}
                    className="inline-flex mt-2 px-8 py-3.5 bg-[#261C19] hover:bg-[#B38E5D] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md hover:-translate-y-1"
                  >
                    Cari Hunian Sekarang
                  </button>
                </div>
              </div>
            )}
          </motion.section>

          {/* SECTION 2: HIGHLIGHT FITUR UNGGULAN */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B38E5D]">Layanan Platform</span>
              <h3 className="text-2xl font-black text-[#261C19]">Keistimewaan Kafana Vista</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((feature, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-[#E5D7C5]/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-default"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#B38E5D]/5 rounded-full group-hover:bg-[#B38E5D]/10 transition-colors duration-500"></div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] text-[#B38E5D] border border-[#D7C4B0]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <feature.icon size={22} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-extrabold text-[#261C19] text-base mb-2">{feature.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* SECTION 3: BANNER CTA "CARI HUNIAN" */}
          <motion.section variants={itemVariants} className="pt-8">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E5D7C5]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#261C19] to-[#3D2D29]"></div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-8">
                <div className="text-center md:text-left md:max-w-xl space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full border border-[#C5A059]/20 inline-block">
                    Eksplorasi Properti
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FAF5EF] leading-tight">
                    Ingin Mencari Tempat Tinggal Baru?
                  </h3>
                  <p className="text-[#E5D7C5] font-medium leading-relaxed">
                    Jelajahi berbagai pilihan kost eksklusif dan kontrakan nyaman di Kafana Vista. 
                    Filter sesuai kebutuhanmu, cek ketersediaan kamar secara real-time, dan lakukan pemesanan secara instan.
                  </p>
                </div>
                
                <div className="w-full md:w-auto shrink-0 flex justify-center">
                  <button 
                    onClick={() => navigate('/carihunian')}
                    className="w-full md:w-auto px-8 py-4 bg-[#B38E5D] hover:bg-[#C5A059] text-[#261C19] text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_20px_rgba(179,142,93,0.3)] hover:shadow-[0_15px_30px_rgba(197,160,89,0.4)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    <Building2 size={18} />
                    Cari Hunian Sekarang
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

        </motion.main>
      </div>
      <Footer/>
    </SidebarUser>
  );
}