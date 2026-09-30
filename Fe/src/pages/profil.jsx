import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import API from '../api'; 
import SidebarUser from '../components/SidebarUser';
import { Crown, Sparkles } from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // STATE MANAGEMENT
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'security'

  // Data dari API Backend
  const [user, setUser] = useState(null);
  const [rentStatus, setRentStatus] = useState([]);

  // Fungsi Hitung Sisa Hari Premium
  const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const end = new Date(expiryDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Variabel turunan status premium & sisa hari
  const remainingDays = getRemainingDays(user?.premium_until);
  const isPremium = (user?.is_premium === true || user?.status === 'premium' || remainingDays > 0) && remainingDays > 0;

  // Form State untuk Edit Data Profil
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    password: '',
  });

  // State untuk Upload Foto
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // =========================================================================
  // 🔌 FETCH DATA PROFIL USER & STATUS SEWA (OPTIMASI PARALEL PROMISE.ALL)
  // =========================================================================
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Menggunakan Promise.all agar eksekusi endpoint /profile & /my-subscription berjalan sejajar/paralel
      const [profileRes, subRes] = await Promise.all([
        API.get('/profile'),
        API.get('/my-subscription').catch(() => null) // Catch agar tidak merusak UI jika endpoint langganan gagal
      ]);

      const apiUser = profileRes.data?.data || profileRes.data;
      const subData = subRes?.data;

      // Penggabungan data profil dan informasi premium terbaru
      const mergedUser = {
        ...apiUser,
        is_premium: subData?.is_premium ?? apiUser?.is_premium,
        premium_until: subData?.premium_until ?? apiUser?.premium_until
      };

      // Normalisasi status sewa
      const rawSewa = profileRes.data?.status_sewa || profileRes.data?.sewa || [];
      const sewaList = Array.isArray(rawSewa) 
        ? rawSewa 
        : (rawSewa && typeof rawSewa === 'object' && Object.keys(rawSewa).length > 0 ? [rawSewa] : []);

      setUser(mergedUser);
      setRentStatus(sewaList);

      setFormState({
        name: mergedUser?.name || '',
        email: mergedUser?.email || '',
        phone: mergedUser?.phone || '',
        current_password: '',
        password: '',
      });

      const backendPhotoUrl = mergedUser?.foto
        ? (mergedUser.foto.startsWith('http') 
            ? mergedUser.foto 
            : `${import.meta.env.VITE_STORAGE_BASE_URL || 'http://localhost:8000/storage'}/${mergedUser.foto}`)
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

      setPreviewAvatar(backendPhotoUrl);
    } catch (error) {
      console.error('Gagal mengambil data profil:', error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'Sesi Berakhir',
          text: 'Sesi Anda telah berakhir, silakan login kembali.',
          confirmButtonColor: '#C5A059',
        }).then(() => navigate('/login'));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat',
          text: 'Gagal memuat profil pengguna dari server.',
          confirmButtonColor: '#C5A059',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // =========================================================================
  // 📷 HANDLE UPLOAD FOTO PROFIL (OTOMATIS SAAT PILIH FILE)
  // =========================================================================
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Ukuran Terlalu Besar',
        text: 'Ukuran foto maksimal 2MB!',
        confirmButtonColor: '#f31f1f',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewAvatar(URL.createObjectURL(file));

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('foto', file);

      await API.post('/profile/update', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        icon: 'success',
        title: 'Foto Diperbarui!',
        text: 'Foto profil baru Anda berhasil disimpan.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      fetchUserProfile();
    } catch (error) {
      console.error('Gagal upload foto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunggah',
        text: error.response?.data?.message || 'Gagal mengunggah foto profil baru ke server.',
        confirmButtonColor: '#C5A059',
      });
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // =========================================================================
  // 💾 SIMPAN PERUBAHAN DATA PROFIL
  // =========================================================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const confirmResult = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: 'Apakah Anda yakin ingin memperbarui data profil Anda?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C5A059',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
    });

    if (!confirmResult.isConfirmed) return;

    setSaving(true);

    try {
      const payload = new FormData();
      if (formState.name) payload.append('name', formState.name);
      if (formState.email) payload.append('email', formState.email);
      if (formState.phone) payload.append('phone', formState.phone);
      if (formState.current_password) payload.append('current_password', formState.current_password);
      if (formState.password) payload.append('password', formState.password);
      if (selectedFile) payload.append('foto', selectedFile);

      const res = await API.post('/profile/update', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data?.message || 'Profil Anda berhasil diperbarui!',
        confirmButtonColor: '#C5A059',
      });

      setIsEditing(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchUserProfile();
    } catch (error) {
      console.error('Gagal update profil:', error);
      let errorMsg = error.response?.data?.message || 'Gagal memperbarui profil.';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors).flat().join('\n• ');
      }

      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: errorMsg,
        confirmButtonColor: '#C5A059',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SidebarUser>
      <div className="w-full min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-4 md:p-8 flex flex-col justify-between relative overflow-hidden">
        
        {/* Ambient Glow Decorative Background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#8F6E45]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto w-full space-y-6 relative z-10 flex-grow flex flex-col justify-start">
          
          {/* HEADER BAR USER */}
          <header className="bg-white/90 backdrop-blur-md px-6 py-5 rounded-2xl border border-[#E5D7C5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#261C19] via-[#3D2D29] to-[#1A1311] text-[#FAF5EF] flex items-center justify-center font-black text-base tracking-widest shadow-md border border-[#C5A059]/30">
                KV
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#261C19]">
                    Kafana<span className="text-[#C5A059] font-light">Vista</span>
                  </h1>
                 
                  {isPremium && (
                    <span className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-yellow-300/50 animate-pulse">
                      <Crown className="w-3.5 h-3.5" />
                      Premium ({remainingDays} Hari Lagi)
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                  Pengelolaan kredensial profil dan status hunian sewa Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <Link 
                to="/carihunian" 
                className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-[#C5A059] hover:bg-[#b08e4a] transition px-4 py-2.5 rounded-xl shadow-md"
              >
                <span>🔍</span> Eksplor Hunian
              </Link>
            </div>
          </header>

          {/* LOADING STATE */}
          {loading ? (
            <div className="bg-white/90 p-16 rounded-3xl border border-[#E5D7C5] text-center space-y-4 shadow-sm my-auto">
              <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 text-sm font-bold tracking-widest uppercase">Memuat Profil & Status Hunian...</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">

              {/* DATA PROFIL USER & HEADER CARD */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1614] via-[#2A1F1D] to-[#17100E] text-[#FAF5EF] p-6 md:p-8 rounded-3xl border border-[#4A3B32] shadow-2xl flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#C5A059]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full sm:w-auto">
                  <div className="relative inline-block group shrink-0">
                    <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#C5A059] via-[#E5D7C5] to-[#8F6E45] shadow-xl">
                      <img 
                        src={previewAvatar} 
                        alt={user?.name || "User Avatar"} 
                        className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#1E1614] transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    {isPremium && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-[#1E1614] animate-bounce">
                        <Crown className="w-5 h-5" />
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/75 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-xs font-bold uppercase tracking-wider text-[#E5D7C5] gap-1.5 backdrop-blur-xs cursor-pointer border-2 border-[#C5A059]/50"
                    >
                      <span className="text-xl">📷</span>
                      <span>Ganti Foto</span>
                    </button>

                    <span className="absolute bottom-1.5 right-1.5 bg-gradient-to-r from-[#C5A059] to-[#8F6E45] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-[#1E1614]">
                      {isPremium ? 'Premium' : (user?.role || "Penghuni")}
                    </span>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/jpg" 
                    className="hidden" 
                  />

                  <div className="text-center md:text-left space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{user?.name}</h2>
                      {isPremium && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg border border-yellow-300/50 animate-pulse">
                          <Crown className="w-4 h-4" />
                          <span className="text-xs font-extrabold uppercase tracking-wider">Premium</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#E5D7C5]/70 font-medium">{user?.email}</p>
                    <div className="pt-2 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-700/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Akses Penghuni Aktif
                      </span>
                      {isPremium && (
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-900/90 to-yellow-900/90 text-amber-200 text-xs font-bold px-3 py-1 rounded-full border border-amber-600/60 shadow-md">
                          <Crown className="w-3.5 h-3.5" />
                          Sisa Masa Aktif: {remainingDays} Hari
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto relative z-10">
                  <div className="bg-black/30 px-5 py-3 rounded-2xl border border-white/5 text-center w-full">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unit Sewa Aktif</span>
                    <span className="text-sm md:text-base font-bold text-[#C5A059]">{rentStatus.length} Unit</span>
                  </div>

                  <button 
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setFormState({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        current_password: '',
                        password: '',
                      });
                    }}
                    className={`w-full px-6 py-3 rounded-xl font-extrabold text-xs md:text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      isEditing 
                        ? 'bg-rose-900/80 hover:bg-rose-900 text-rose-100 border border-rose-700' 
                        : 'bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#9C7A3C] hover:opacity-95 text-[#1E1614]'
                    }`}
                  >
                    {isEditing ? '✕ Batal Edit' : '✏️ Edit Identitas Profile'}
                  </button>
                </div>
              </div>

              {/* FORM EDIT PROFIL CARD */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5D7C5] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center gap-1.5 bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#E5D7C5]/60 w-fit">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`text-xs md:text-sm font-bold px-4 py-3 min-h-11 rounded-xl transition-all cursor-pointer ${
                        activeTab === 'overview' 
                          ? 'bg-[#261C19] text-white shadow-md' 
                          : 'text-slate-500 hover:text-[#261C19]'
                      }`}
                    >
                      👤 Informasi Penghuni
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className={`text-xs md:text-sm font-bold px-4 py-3 min-h-11 rounded-xl transition-all cursor-pointer ${
                        activeTab === 'security' 
                          ? 'bg-[#261C19] text-white shadow-md' 
                          : 'text-slate-500 hover:text-[#261C19]'
                      }`}
                    >
                      🔒 Kata Sandi & Keamanan
                    </button>
                  </div>

                  {!isEditing && (
                    <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 self-start sm:self-center">
                      ℹ️ Mode Baca (Read-Only)
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* TAB 1: INFORMASI PENGHUNI */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-[#261C19] uppercase tracking-wider block">
                          Nama Lengkap
                        </label>
                        <input 
                          type="text"
                          disabled={!isEditing}
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#261C19] text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] disabled:opacity-80 disabled:bg-slate-100/70 transition"
                          placeholder="Masukkan nama lengkap Anda"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-[#261C19] uppercase tracking-wider block">
                          Alamat Email Terdaftar
                        </label>
                        <input 
                          type="email"
                          disabled={!isEditing}
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#261C19] text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] disabled:opacity-80 disabled:bg-slate-100/70 transition"
                          placeholder="email@domain.com"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-extrabold text-[#261C19] uppercase tracking-wider block">
                          Nomor WhatsApp / Telepon Aktif
                        </label>
                        <input 
                          type="text"
                          disabled={!isEditing}
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#261C19] text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] disabled:opacity-80 disabled:bg-slate-100/70 transition"
                          placeholder="Cth: 081234567890"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: KEAMANAN & PASSWORD */}
                  {activeTab === 'security' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-900 text-xs md:text-sm font-medium flex items-center gap-3">
                        <span className="text-lg">💡</span>
                        <span>Kosongkan kolom kata sandi jika Anda tidak ingin mengubah password lama Anda.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-[#261C19] uppercase tracking-wider block">
                          Kata Sandi Saat Ini / Lama
                        </label>
                        <input 
                          type="password"
                          disabled={!isEditing}
                          value={formState.current_password}
                          onChange={(e) => setFormState({ ...formState, current_password: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#261C19] text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] disabled:opacity-80 disabled:bg-slate-100/70 transition"
                          placeholder={isEditing ? "Ketikkan kata sandi saat ini..." : "••••••••••••••••"}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-[#261C19] uppercase tracking-wider block">
                          Kata Sandi Baru (New Password)
                        </label>
                        <input 
                          type="password"
                          disabled={!isEditing}
                          value={formState.password}
                          onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#261C19] text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] disabled:opacity-80 disabled:bg-slate-100/70 transition"
                          placeholder={isEditing ? "Ketikkan minimal 6 karakter..." : "••••••••••••••••"}
                        />
                      </div>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  {isEditing && (
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedFile(null);
                        }}
                        className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs md:text-sm font-extrabold rounded-xl transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-[#261C19] to-[#3D2D29] hover:opacity-90 text-[#FAF5EF] px-7 py-2.5 text-xs md:text-sm font-extrabold rounded-xl transition shadow-lg disabled:opacity-50 border border-[#C5A059]/30 flex items-center gap-2 cursor-pointer"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          "💾 Simpan Profil"
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* SEKSI DAFTAR HUNIAN / STATUS SEWA */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5D7C5] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#E5D7C5]">🏢</span>
                    <div>
                      <span className="text-[11px] font-black text-[#C5A059] uppercase tracking-widest block">Residential Pass</span>
                      <h3 className="text-lg md:text-xl font-extrabold text-[#261C19]">Status Hunian & Sewa Aktif Anda</h3>
                    </div>
                  </div>
                  <span className="bg-[#FAF6F0] text-[#261C19] border border-[#E5D7C5] text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-center">
                    Total: {rentStatus.length} Unit
                  </span>
                </div>

                {rentStatus && rentStatus.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {rentStatus.map((item, index) => {
                      const cleanDuration = String(item.duration_months || '').replace(/bulan/gi, '').trim();
                      const nomorKamarNum = item.kamar?.nomor_kamar || item.nomor_kamar || item.properti?.nomor_kamar || null;
                      const imageSrc = item.main_image || item.foto || item.properti?.main_image || item.kamar?.main_image;

                      return (
                        <div key={item.id || index} className="bg-[#FAF6F0]/60 p-4 rounded-2xl border border-[#E5D7C5] flex flex-col justify-between space-y-3 hover:border-[#C5A059] transition">
                          <div className="flex items-start gap-3">
                            <img 
                              src={
                                imageSrc
                                  ? (imageSrc.startsWith('http') ? imageSrc : `${import.meta.env.VITE_STORAGE_BASE_URL || 'http://localhost:8000/storage'}/${imageSrc}`)
                                  : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80"
                              } 
                              alt={item.title || item.nama_properti || "Unit Kost"} 
                              className="w-16 h-16 rounded-xl object-cover border border-[#E5D7C5] shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h4 className="font-extrabold text-[#261C19] text-sm truncate">
                                {item.title || item.properti?.nama_properti || item.nama_properti || "Unit Kost Kafana Vista"}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium truncate">
                                📍 {item.address || item.properti?.alamat || 'Kafana Vista Complex'}
                              </p>
                              <span className="inline-block text-xs font-extrabold text-[#C5A059] mt-1">
                                Kamar No. {nomorKamarNum || '-'}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                            <div className="flex justify-between text-slate-600">
                              <span>Tanggal Masuk:</span>
                              <strong className="text-[#261C19] font-bold">{formatDate(item.check_in_date)}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Durasi Sewa:</span>
                              <strong className="text-[#C5A059] font-bold">{cleanDuration ? `${cleanDuration} Bulan` : '-'}</strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#E5D7C5]/50 pt-2 text-[11px]">
                            <span className="px-2 py-0.5 rounded-md font-bold uppercase bg-emerald-100 text-emerald-800">
                              Sewa Aktif
                            </span>

                            <Link 
                              to="/FinanceTracker" 
                              className="font-bold text-[#261C19] hover:text-[#C5A059] underline transition"
                            >
                              Finance Tracker →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-[#FAF6F0] rounded-2xl border-2 border-dashed border-[#C5A059]/40 text-center space-y-3">
                    <span className="text-3xl block">📭</span>
                    <p className="text-sm font-bold text-[#261C19]">Belum ada unit hunian aktif yang Anda sewa.</p>
                    <p className="text-xs text-slate-500">Temukan tempat tinggal impian Anda dan nikmati fasilitas kelas atas dari Kafana Vista.</p>
                    <Link 
                      to="/carihunian" 
                      className="inline-block text-xs font-extrabold uppercase tracking-wider bg-[#261C19] hover:bg-[#3D2D29] text-white px-5 py-2.5 rounded-xl transition shadow-md mt-2"
                    >
                      ⚡ Jelajahi Katalog Hunian
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* FOOTER */}
          <footer className="pt-6 pb-2 border-t border-[#E5D7C5]/60 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>© {new Date().getFullYear()} Kafana Vista - Resident Portal</div>
            <div>Luxury Residence Suite</div>
          </footer>

        </div>
      </div>
    </SidebarUser>
  );
}