import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import Swal from 'sweetalert2';
import { ArrowLeft, Image as ImageIcon, Loader2, CreditCard } from 'lucide-react';
import AdImageUploader from '../components/AdImageUploader';
import { validateAdImages } from '../utils/adValidator';

const PLACEMENT_PRICES = {
  home_hero: 150000,
  landing_mid: 100000,
  catalog_top: 80000,
  search_sidebar: 60000,
  catalog_in_feed: 70000,
  footer_banner: 30000,
  custom: 120000,
};

const FALLBACK_LABELS = {
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

  // Dynamic ad image config
  const [adConfigs, setAdConfigs] = useState([]); // array of AdSlotConfig
  const [configsLoading, setConfigsLoading] = useState(true);
  const [bannerFiles, setBannerFiles] = useState([]);
  const [validationResults, setValidationResults] = useState([]); // per-file validate result

  // Fetch placement configs (public endpoint)
  useEffect(() => {
    let cancelled = false;
    const fetchConfigs = async () => {
      try {
        const res = await API.get('/ad-slot-configs');
        if (!cancelled) {
          const data = res.data?.data || [];
          setAdConfigs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Gagal memuat ad-slot-configs, pakai fallback', err);
      } finally {
        if (!cancelled) setConfigsLoading(false);
      }
    };
    fetchConfigs();
    return () => { cancelled = true; };
  }, []);

  const configMap = useMemo(() => {
    const m = {};
    adConfigs.forEach(c => { m[c.placement] = c; });
    return m;
  }, [adConfigs]);

  const currentConfig = useMemo(() => {
    const key = formData.placement;
    if (configMap[key]) return configMap[key];
    if (key === 'custom' && configMap['custom']) return configMap['custom'];
    // fallback minimal if BE belum siap
    return configMap['home_hero'] || null;
  }, [formData.placement, configMap]);

  // For select options: prefer BE data, else fallback
  const placementOptions = useMemo(() => {
    if (adConfigs.length > 0) {
      return adConfigs
        .filter(c => c.is_active)
        .sort((a,b) => (a.sort_order||0)-(b.sort_order||0))
        .map(c => ({ value: c.placement, label: c.label }));
    }
    return Object.entries(FALLBACK_LABELS).map(([value,label]) => ({ value, label }));
  }, [adConfigs]);

  const hasInvalidImages = useMemo(() => {
    return validationResults.some(r => r && !r.valid);
  }, [validationResults]);

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

  const totalPrice = useMemo(() => dailyPrice * durationDays, [dailyPrice, durationDays]);

  const PLACEMENT_LABELS = useMemo(() => {
    const m = { ...FALLBACK_LABELS };
    adConfigs.forEach(c => { m[c.placement] = c.label; });
    return m;
  }, [adConfigs]);

  const saveDraft = () => {
    const draft = { ...formData };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get('/auth/me');
        if (response.data) setIsLoggedIn(true);
      } catch (err) { setIsLoggedIn(false); }
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
        } catch (e) { console.error('Failed to restore draft:', e); }
      }
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // persist draft (debounced simple)
    const next = { ...formData, [name]: type === 'checkbox' ? checked : value };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  };

  // Called by AdImageUploader whenever files or validation changes
  const handleAdFilesChange = (files, results) => {
    setBannerFiles(files);
    if (results && results.length > 0) setValidationResults(results);
  };

  // Re-validate existing files when placement/config changes (AdImageUploader handles via useEffect, but also ensure results updated)
  useEffect(() => {
    if (bannerFiles.length > 0 && currentConfig) {
      let cancelled = false;
      validateAdImages(bannerFiles, currentConfig).then(({ results }) => {
        if (!cancelled) setValidationResults(results);
      });
      return () => { cancelled = true; };
    }
    if (bannerFiles.length === 0) setValidationResults([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConfig]);

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
        if (result.isConfirmed) navigate('/login?redirect=/pasang-iklan');
      });
      return;
    }

    if (bannerFiles.length === 0) {
      Swal.fire('Peringatan', 'Pilih minimal 1 gambar banner!', 'warning');
      return;
    }

    if (hasInvalidImages) {
      const invalidList = validationResults
        .map((r, i) => !r.valid ? `Gambar #${i+1}: ${r.errors.join('; ')}` : null)
        .filter(Boolean)
        .join('\n');
      Swal.fire({
        title: 'Gambar Belum Valid',
        html: `<p class="text-xs text-slate-600 mb-2">Perbaiki gambar berikut sebelum lanjut:</p><pre class="text-[11px] text-rose-600 text-left whitespace-pre-wrap bg-rose-50 p-3 rounded-lg border border-rose-200">${invalidList}</pre><p class="text-[11px] text-slate-500 mt-2">Gunakan tombol <b>Crop</b> pada gambar yang rasio/dimensinya salah.</p>`,
        icon: 'error',
        confirmButtonColor: '#B38E5D',
        width: 560,
      });
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
                Penempatan Iklan (Posisi di Website) <span className="text-rose-500">*</span>
              </label>
              <select
                name="placement"
                value={formData.placement}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#B38E5D] focus:border-[#B38E5D] outline-none cursor-pointer"
                disabled={configsLoading}
              >
                {placementOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {configsLoading && <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Memuat aturan slot...</p>}
              {currentConfig && (
                <p className="text-[11px] text-[#B38E5D] mt-1.5 bg-[#FAF5EF] border border-[#D7C4B0] rounded-lg px-3 py-2">
                  📐 <b>{currentConfig.label}</b> — {currentConfig.width}×{currentConfig.height}px • Rasio {currentConfig.aspect_ratio} • Max {currentConfig.max_file_size_mb}MB • Format {currentConfig.allowed_extensions.join('/').toUpperCase()}
                </p>
              )}
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

            {/* Dynamic Image Uploader */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Upload Gambar Banner <span className="text-rose-500">*</span>
              </label>
              <AdImageUploader
                placement={formData.placement}
                config={currentConfig}
                files={bannerFiles}
                onChange={handleAdFilesChange}
                maxFiles={5}
              />
            </div>

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
                disabled={isSubmitting || hasInvalidImages}
                title={hasInvalidImages ? 'Perbaiki gambar yang tidak valid terlebih dahulu' : ''}
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
            {hasInvalidImages && <p className="text-[11px] text-rose-600 text-right -mt-2">Ada gambar yang belum valid. Perbaiki/crop sebelum lanjut.</p>}
          </form>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> Informasi Penting
          </h3>
          <ul className="text-[11px] text-amber-700 space-y-1">
            <li>• Iklan akan diverifikasi oleh tim admin Kafana Vista sebelum ditayangkan (maksimal 1x24 jam).</li>
            <li>• Gambar akan divalidasi otomatis sesuai slot yang dipilih (format, dimensi, rasio, ukuran). Gunakan fitur crop jika rasio belum pas.</li>
            <li>• Iklan tidak sesuai kebijakan (berbau SARA, judi, pinjol ilegal, dll) akan ditolak.</li>
            <li>• Anda akan mendapat notifikasi saat iklan disetujui atau ditolak.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
