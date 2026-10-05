import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import Swal from 'sweetalert2';
import { ArrowLeft, CreditCard, QrCode, Copy, Check, Loader2, Info, Shield, AlertCircle, X } from 'lucide-react';
import SidebarUser from '../components/SidebarUser';

const PLACEMENT_LABELS = {
  home_hero: 'Beranda Atas (Hero Slide)',
  landing_mid: 'Landing Page Tengah (Di antara Section)',
  catalog_top: 'Atas Halaman Katalog / Cari Hunian',
  search_sidebar: 'Sidebar Halaman Pencarian',
  catalog_in_feed: 'Di Antara Grid Daftar Kost',
  footer_banner: 'Banner Di Atas Footer',
  custom: 'Lokasi Kustom Lainnya',
};

const PLACEMENT_PRICES = {
  home_hero: 150000,
  landing_mid: 100000,
  catalog_top: 80000,
  search_sidebar: 60000,
  catalog_in_feed: 70000,
  footer_banner: 30000,
  custom: 120000,
};

const BANK_ACCOUNTS = [
  { id: 'bca', name: 'Bank BCA', number: '1234567890', holder: 'PT KAFANA VISTA', type: 'BCA' },
  { id: 'mandiri', name: 'Bank Mandiri', number: '0987654321', holder: 'PT KAFANA VISTA', type: 'Mandiri' },
  { id: 'bri', name: 'Bank BRI', number: '5678901234', holder: 'PT KAFANA VISTA', type: 'BRI' },
];

const QRIS_DUMMY = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KafanaVista-Payment-' + Date.now();

export default function PembayaranIklan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0].id);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState(null);

  const adData = location.state?.adData;
  const bannerFiles = location.state?.bannerFiles;

  useEffect(() => {
    if (!adData || !bannerFiles) {
      Swal.fire('Data Tidak Ditemukan', 'Silakan kembali ke halaman Pasang Iklan dan isi formulir terlebih dahulu.', 'warning').then(() => {
        navigate('/pasang-iklan');
      });
    }
  }, [adData, bannerFiles, navigate]);

  const durationDays = useMemo(() => {
    if (!adData?.start_date || !adData?.end_date) return 0;
    const start = new Date(adData.start_date);
    const end = new Date(adData.end_date);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [adData?.start_date, adData?.end_date]);

  const dailyPrice = useMemo(() => {
    if (!adData?.placement) return 0;
    const placement = adData.placement === 'custom' ? 'custom' : adData.placement;
    return PLACEMENT_PRICES[placement] || 0;
  }, [adData?.placement]);

  const totalPrice = useMemo(() => dailyPrice * durationDays, [dailyPrice, durationDays]);

  const placementLabel = adData ? (PLACEMENT_LABELS[adData.placement === 'custom' ? 'custom' : adData.placement] || adData.placement) : '';

  if (!adData || !bannerFiles) {
    return null;
  }

  const handlePaymentProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('File Terlalu Besar', 'Bukti pembayaran melebihi batas 2MB', 'warning');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Format Tidak Didukung', 'Hanya file JPG, PNG, atau PDF yang diperbolehkan.', 'warning');
        return;
      }
      setPaymentProof(file);
      setPaymentProofPreview(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = (text, bankId) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(bankId);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleSubmit = async () => {
    if (!paymentProof) {
      Swal.fire('Peringatan', 'Silakan upload bukti pembayaran terlebih dahulu', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('vendor_name', adData.vendor_name);
      submitData.append('description', adData.description || '');
      submitData.append('placement', adData.placement === 'custom' 
        ? adData.custom_placement.trim().toLowerCase().replace(/\s+/g, '_')
        : adData.placement);
      submitData.append('start_date', adData.start_date);
      submitData.append('end_date', adData.end_date);
      submitData.append('is_active', adData.is_active ? 1 : 0);
      submitData.append('price', totalPrice);
      submitData.append('payment_method', selectedMethod);
      submitData.append('payment_proof', paymentProof);

      if (adData.link_url) submitData.append('link_url', adData.link_url);

      bannerFiles.forEach((file) => {
        submitData.append('banner_images[]', file);
      });

      await API.post('/vendor-ads', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.removeItem('pasang_iklan_draft');

      await Swal.fire({
        icon: 'success',
        title: 'Pembayaran Berhasil Dibuat!',
        text: 'Silakan pantau status persetujuan iklan Anda.',
        confirmButtonColor: '#B38E5D',
        customClass: { popup: 'rounded-2xl' }
      });
      navigate('/riwayat-iklan');
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      let msg = data?.message || 'Terjadi kesalahan sistem';
      if (data?.errors) {
        const details = Object.entries(data.errors).map(([k, v]) => `<li><b>${k}:</b> ${Array.isArray(v) ? v.join('; ') : v}</li>`).join('');
        msg = `<p class="text-xs mb-2">${msg}</p><ul class="text-[11px] text-rose-600 text-left bg-rose-50 p-3 rounded-lg border border-rose-200 list-disc list-inside">${details}</ul>`;
        Swal.fire({ title: 'Validasi Gagal', html: msg, icon: 'error', confirmButtonColor: '#B38E5D', width: 560 });
      } else if (data?.details) {
        const details = (Array.isArray(data.details) ? data.details : Object.values(data.details))
          .filter(d => d && d.errors)
          .flatMap(d => d.errors)
          .join('; ');
        Swal.fire('Gagal Mengirim', `${msg}${details ? ': ' + details : ''}`, 'error');
      } else {
        Swal.fire('Gagal Mengirim', msg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarUser>
      <div className="min-h-screen bg-[#FAF5EF] text-[#2D2321] pb-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button 
            onClick={() => navigate('/pasang-iklan')}
            className="mb-6 flex items-center gap-2 text-[#B38E5D] hover:text-[#8F6E45] text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Formulir
          </button>

          <div className="bg-white rounded-2xl border border-[#D7C4B0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#D7C4B0] bg-[#FAF5EF]">
              <h1 className="text-2xl font-serif font-bold text-[#2D2321]">Pembayaran Iklan</h1>
              <p className="text-xs text-gray-500 mt-1">Lengkapi pembayaran untuk memproses pengajuan iklan Anda.</p>
            </div>

            <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B38E5D]" />
                  Ringkasan Iklan
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Nama Vendor</p>
                    <p className="font-medium text-[#2D2321]">{adData.vendor_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Lokasi Penempatan</p>
                    <p className="font-medium text-[#2D2321]">{placementLabel}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Tanggal Tayang</p>
                    <p className="font-medium text-[#2D2321]">{adData.start_date} s/d {adData.end_date}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Total Durasi</p>
                    <p className="font-medium text-[#2D2321]">{durationDays} hari</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B38E5D]" />
                  Rincian Biaya
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Tarif {placementLabel}</span>
                    <span className="font-medium">Rp {dailyPrice.toLocaleString('id-ID')} / hari</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Durasi</span>
                    <span className="font-medium">{durationDays} hari</span>
                  </div>
                  <div className="border-t border-[#D7C4B0] pt-2 flex justify-between text-lg font-bold text-[#B38E5D]">
                    <span>Total Pembayaran</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B38E5D]" />
                  Pilih Metode Pembayaran
                </h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${
                    selectedMethod === 'bank_transfer' ? 'border-[#B38E5D] bg-[#B38E5D]/5' : 'border-slate-200 hover:border-[#B38E5D]/50'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={selectedMethod === 'bank_transfer'}
                      onChange={() => setSelectedMethod('bank_transfer')}
                      className="w-4 h-4 text-[#B38E5D] focus:ring-[#B38E5D] border-slate-300"
                    />
                    <span className="font-medium text-slate-700">Transfer Bank</span>
                    <span className="ml-auto text-xs text-slate-400">BCA / Mandiri / BRI</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${
                    selectedMethod === 'qris' ? 'border-[#B38E5D] bg-[#B38E5D]/5' : 'border-slate-200 hover:border-[#B38E5D]/50'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="qris"
                      checked={selectedMethod === 'qris'}
                      onChange={() => setSelectedMethod('qris')}
                      className="w-4 h-4 text-[#B38E5D] focus:ring-[#B38E5D] border-slate-300"
                    />
                    <span className="font-medium text-slate-700">QRIS</span>
                    <span className="ml-auto text-xs text-slate-400">Scan & Bayar</span>
                  </label>
                </div>
              </div>

              {selectedMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-[11px] text-blue-800">
                        <p className="font-medium">Instruksi Transfer Bank:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Pilih bank tujuan di bawah</li>
                          <li>Salin nomor rekening (klik ikon salin)</li>
                          <li>Transfer sesuai total: <strong>Rp {totalPrice.toLocaleString('id-ID')}</strong></li>
                          <li>Catat berita transfer: <strong>IKLAN-{adData.vendor_name.substring(0, 10).toUpperCase()}</strong></li>
                          <li>Upload bukti transfer di bawah</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {BANK_ACCOUNTS.map((bank) => (
                      <div 
                        key={bank.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                          selectedBank === bank.id ? 'border-[#B38E5D] bg-[#B38E5D]/5' : 'border-slate-200 hover:border-[#B38E5D]/50'
                        }`}
                        onClick={() => setSelectedBank(bank.id)}
                      >
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{bank.type}</p>
                        <p className="font-bold text-slate-700 mt-1">{bank.name}</p>
                        <p className="font-mono text-sm text-[#2D2321] mt-1 tracking-wider">{bank.number}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{bank.holder}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(bank.number, bank.id); }}
                          className={`mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                            copiedBankId === bank.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {copiedBankId === bank.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'qris' && (
                <div className="space-y-4 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-[11px] text-blue-800 text-left">
                        <p className="font-medium">Instruksi QRIS:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Buka aplikasi e-wallet/banking Anda</li>
                          <li>Pilih fitur "Scan QRIS" atau "Bayar QR"</li>
                          <li>Arahkan kamera ke kode QR di bawah</li>
                          <li>Pastikan nominal: <strong>Rp {totalPrice.toLocaleString('id-ID')}</strong></li>
                          <li>Selesaikan pembayaran & upload bukti</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6">
                    <img 
                      src={QRIS_DUMMY} 
                      alt="QRIS Payment" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                    <p className="text-xs text-slate-400 mt-2">QRIS Dummy - Scan untuk demo</p>
                    <p className="text-sm font-medium text-slate-700 mt-1">Total: Rp {totalPrice.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#B38E5D] transition-colors">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handlePaymentProofChange}
                  className="sr-only"
                  id="paymentProof"
                  disabled={isSubmitting}
                />
                <label htmlFor="paymentProof" className="cursor-pointer">
                  {paymentProofPreview ? (
                    <div className="relative">
                      {paymentProofPreview.startsWith('blob:') && paymentProof?.type?.startsWith('image/') ? (
                        <img 
                          src={paymentProofPreview} 
                          alt="Bukti pembayaran" 
                          className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="w-12 h-12 text-slate-300" />
                          <p className="text-sm text-slate-500">Bukti pembayaran terpilih</p>
                          <p className="text-[11px] text-slate-400">{paymentProof?.name}</p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPaymentProof(null);
                          setPaymentProofPreview(null);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-500 text-sm">Klik atau tarik file bukti pembayaran</p>
                      <p className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG, PDF. Max 2MB</p>
                    </>
                  )}
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-[11px] text-amber-800">
                    <p className="font-medium">Perhatian:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Pastikan bukti pembayaran jelas dan terbaca (nominal, tanggal, nama pengirim)</li>
                      <li>Iklan akan diproses setelah verifikasi admin (maksimal 1x24 jam)</li>
                      <li>Data iklan tidak dapat diubah setelah submit pembayaran</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => navigate('/pasang-iklan')}
                  className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Kembali Edit
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!paymentProof || isSubmitting}
                  className="px-6 py-3 bg-[#B38E5D] text-white rounded-lg text-sm font-bold hover:bg-[#8F6E45] transition-colors shadow-md shadow-[#B38E5D]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : 'Bayar Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarUser>
  );
}