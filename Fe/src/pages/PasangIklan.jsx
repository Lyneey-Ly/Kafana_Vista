import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import Swal from 'sweetalert2';
import { ArrowLeft, Image as ImageIcon, X, Loader2, CreditCard } from 'lucide-react';
import SidebarUser from '../components/SidebarUser';

const PLACEMENT_PRICES = {
  home_hero: 150000,
  landing_mid: 100000,
  catalog_top: 80000,
  search_sidebar: 60000,
  catalog_in_feed: 70000,
  footer_banner: 30000,
  custom: 120000,
};

const PLACEMENT_LABELS = {
  home_hero: 'Beranda Atas (Hero Slide)',
  landing_mid: 'Landing Page Tengah (Di antara Section)',
  catalog_top: 'Atas Halaman Katalog / Cari Hunian',
  search_sidebar: 'Sidebar Halaman Pencarian',
  catalog_in_feed: 'Di Antara Grid Daftar Kost',
  footer_banner: 'Banner Di Atas Footer',
  custom: 'Lokasi Kustom Lainnya',
};

const DRAFT_KEY = 'pasang_iklan_draft';

const getInitialFormData = () => {
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft);
      return {
        vendor_name: parsed.vendor_name || '',
        description: parsed.description || '',
        link_url: parsed.link_url || '',
        placement: parsed.placement || 'home_hero',
        custom_placement: parsed.custom_placement || '',
        price: parsed.price || '',
        start_date: parsed.start_date || '',
        end_date: parsed.end_date || '',
        is_active: parsed.is_active !== undefined ? parsed.is_active : true,
      };
    } catch (e) {
      console.error('Failed to parse draft:', e);
    }
  }
  return {
    vendor_name: '',
    description: '',
    link_url: '',
    placement: 'home_hero',
    custom_placement: '',
    price: '',
    start_date: '',
    end_date: '',
    is_active: true,
  };
};

export default function PasangIklan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [formData, setFormData] = useState(getInitialFormData);

  const [bannerFiles, setBannerFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const durationDays = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [formData.start_date, formData.end_date]);

  const dailyPrice = useMemo(() => {
    const placement = formData.placement === 'custom' ? 'custom' : formData.placement;
    return PLACEMENT_PRICES[placement] || 0;
  }, [formData.placement]);

  const totalPrice = useMemo(() => {
    return dailyPrice * durationDays;
  }, [dailyPrice, durationDays]);

  const saveDraft = () => {
    const draft = { ...formData };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  const resetForm = () => {
    setFormData({
      vendor_name: '',
      description: '',
      link_url: '',
      placement: 'home_hero',
      custom_placement: '',
      price: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setBannerFiles([]);
    setPreviewImages([]);
    clearDraft();
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get('/auth/me');
        if (response.data) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const restored = searchParams.get('restored');
    if (restored === 'true') {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(prev => ({
            ...prev,
            vendor_name: parsed.vendor_name || prev.vendor_name,
            description: parsed.description || prev.description,
            link_url: parsed.link_url || prev.link_url,
            placement: parsed.placement || prev.placement,
            custom_placement: parsed.custom_placement || prev.custom_placement,
            price: parsed.price || prev.price,
            start_date: parsed.start_date || prev.start_date,
            end_date: parsed.end_date || prev.end_date,
            is_active: parsed.is_active !== undefined ? parsed.is_active : prev.is_active,
          }));
          Swal.fire('Draf Ditemukan', 'Data formulir Anda telah dipulihkan dari draf tersimpan.', 'info');
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      return newData;
    });
    saveDraft();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const invalidFile = files.find(f => f.size > 2 * 1024 * 1024);
    if (invalidFile) {
      Swal.fire('File Terlalu Besar', `Gambar ${invalidFile.name} melebihi batas 2MB`, 'warning');
      return;
    }

    setBannerFiles(files);
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(objectUrls);
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...bannerFiles];
    const newPreviews = [...previewImages];
    newFiles.splice(index, 1);
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setBannerFiles(newFiles);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    saveDraft();

    if (!isLoggedIn) {
      Swal.fire({
        title: 'Login Diperlukan',
        text: 'Silakan login atau buat akun terlebih dahulu untuk melanjutkan pembayaran.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Login / Daftar',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#B38E5D',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login?redirect=/pasang-iklan');
        }
      });
      return;
    }

    if (bannerFiles.length === 0) {
      Swal.fire('Peringatan', 'Pilih minimal 1 gambar banner!', 'warning');
      return;
    }

    const finalPlacement = formData.placement === 'custom' 
      ? formData.custom_placement.trim().toLowerCase().replace(/\s+/g, '_')
      : formData.placement;

    if (!finalPlacement) {
      Swal.fire('Peringatan', 'Penempatan lokasi iklan wajib diisi!', 'warning');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      Swal.fire('Peringatan', 'Tanggal mulai dan selesai wajib diisi!', 'warning');
      return;
    }

    if (durationDays < 1) {
      Swal.fire('Peringatan', 'Tanggal selesai harus minimal 1 hari setelah tanggal mulai!', 'warning');
      return;
    }

    navigate('/pembayaran-iklan', { 
      state: { 
        adData: { ...formData, placement: finalPlacement },
        bannerFiles 
      } 
    });
  };

  return (
      <div className="min-h-screen bg-[#FAF5EF] text-[#2D2321] pb-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button 
            onClick={() => navigate('/home')}
            className="mb-6 flex items-center gap-2 text-[#B38E5D] hover:text-[#8F6E45] text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>

          <div className="bg-white rounded-2xl border border-[#D7C4B0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#D7C4B0] bg-[#FAF5EF]">
              <h1 className="text-2xl font-serif font-bold text-[#2D2321]">Pasang Iklan Anda</h1>
              <p className="text-xs text-gray-500 mt-1">Isi formulir berikut untuk memasang iklan di platform Kafana Vista. Iklan akan ditinjau oleh admin sebelum ditayangkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" id="adForm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Nama Vendor / Brand <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="vendor_name" 
                  value={formData.vendor_name} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none" 
                  placeholder="Contoh: Honda, Telkomsel, Rumah Makan Padang"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Deskripsi Iklan / Detail Promo</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="4" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none resize-none" 
                  placeholder="Tuliskan detail promo, deskripsi singkat, atau informasi diskon di sini..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Upload Gambar Banner <span className="text-rose-500">*</span>
                  <span className="text-slate-400 font-normal ml-2">(Bisa pilih beberapa foto sekaligus, max 2MB per foto)</span>
                </label>
                
                {previewImages.length > 0 && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                    {previewImages.map((src, index) => (
                      <div key={index} className="relative w-28 h-28 flex-shrink-0 border border-slate-300 rounded-lg overflow-hidden">
                        <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  required={previewImages.length === 0}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#FAF5EF] file:text-[#B38E5D] hover:file:bg-[#F0E6DA] cursor-pointer" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Tahan tombol Ctrl / Shift untuk memilih beberapa foto sekaligus. Format: JPG, PNG, WebP. Max 2MB per gambar.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Penempatan Iklan (Posisi di Website) <span className="text-rose-500">*</span></label>
                <select 
                  name="placement" 
                  value={formData.placement} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none cursor-pointer"
                >
                  <option value="home_hero">Beranda Atas (Hero Slide)</option>
                  <option value="landing_mid">Landing Page Tengah (Di antara Section)</option>
                  <option value="catalog_top">Atas Halaman Katalog / Cari Hunian</option>
                  <option value="search_sidebar">Sidebar Halaman Pencarian</option>
                  <option value="catalog_in_feed">Di Antara Grid Daftar Kost</option>
                  <option value="footer_banner">Banner Di Atas Footer</option>
                  <option value="custom">-- Lokasi Kustom Lainnya --</option>
                </select>
              </div>

              {formData.placement === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Nama ID Lokasi Kustom <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="custom_placement" 
                    value={formData.custom_placement} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none" 
                    placeholder="Contoh: detail_produk_samping" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Gunakan format snake_case (huruf kecil, tanpa spasi, pakai underscore)</p>
                </div>
              )}

              <div className="bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B38E5D]" />
                  Estimasi Biaya Iklan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Lokasi: {PLACEMENT_LABELS[formData.placement === 'custom' ? 'custom' : formData.placement]}</span>
                    <span className="font-medium">Rp {dailyPrice.toLocaleString('id-ID')} / hari</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Durasi: {durationDays} hari ({formData.start_date} s/d {formData.end_date})</span>
                    <span className="font-medium">{durationDays} hari</span>
                  </div>
                  <div className="border-t border-[#D7C4B0] pt-2 flex justify-between text-lg font-bold text-[#2D2321]">
                    <span>Total Biaya</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">* Harga otomatis dihitung berdasarkan lokasi dan durasi. Tidak dapat diubah manual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Link Tujuan (Opsional)</label>
                  <input 
                    type="url" 
                    name="link_url" 
                    value={formData.link_url} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none" 
                    placeholder="https://website-anda.com/promo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Tanggal Mulai Tayang <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    name="start_date" 
                    value={formData.start_date} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none" 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Tanggal Selesai Tayang <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    name="end_date" 
                    value={formData.end_date} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none" 
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={formData.is_active} 
                      onChange={handleChange} 
                      className="sr-only" 
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-slate-700">Aktifkan segera setelah disetujui</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => navigate('/home')}
                  className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#B38E5D] text-white rounded-lg text-sm font-bold hover:bg-[#8F6E45] transition-colors shadow-md shadow-[#B38E5D]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : 'Lanjut ke Pembayaran'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> Informasi Penting
            </h3>
            <ul className="text-[11px] text-amber-700 space-y-1">
              <li>• Iklan akan diverifikasi oleh tim admin Kafana Vista sebelum ditayangkan (maksimal 1x24 jam).</li>
              <li>• Pastikan gambar banner berkualitas baik, rasio 16:9 atau 4:3 direkomendasikan.</li>
              <li>• Iklan tidak sesuai kebijakan (berbau SARA, judi, pinjol ilegal, dll) akan ditolak.</li>
              <li>• Anda akan mendapat notifikasi saat iklan disetujui atau ditolak.</li>
            </ul>
          </div>
        </div>
      </div>
  );
}