import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Swal from 'sweetalert2';
import { ArrowLeft, CreditCard, Calendar, MapPin, Eye, X, CheckCircle, Clock, AlertCircle, AlertTriangle, Shield, Loader2, Download } from 'lucide-react';
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

const PAYMENT_STATUS_LABELS = {
  paid: 'Lunas',
  pending: 'Menunggu Verifikasi',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
};

const AD_STATUS_LABELS = {
  pending: 'Menunggu Review Admin',
  active: 'Aktif Tayang',
  rejected: 'Ditolak',
  completed: 'Selesai',
  paused: 'Dihentikan',
};

const AD_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
  paused: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PAYMENT_STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  verified: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Transfer Bank',
  qris: 'QRIS',
  ewallet: 'E-Wallet',
  virtual_account: 'Virtual Account',
  convenience_store: 'Minimarket',
};

export default function RiwayatIklan() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    try {
      setLoading(true);
      const response = await API.get('/vendor-ads/my-ads');
      setAds(response.data?.data || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('Gagal memuat riwayat iklan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (ad) => {
    setSelectedAd(ad);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedAd(null);
    setShowDetailModal(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <SidebarUser>
        <div className="min-h-screen bg-[#FAF5EF] text-[#2D2321] pb-16">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl border border-[#D7C4B0] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#D7C4B0] bg-[#FAF5EF]">
                <h1 className="text-2xl font-serif font-bold text-[#2D2321]">Riwayat Iklan Saya</h1>
              </div>
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#B38E5D] mx-auto mb-4" />
                <p className="text-slate-500">Memuat riwayat iklan...</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarUser>
    );
  }

  return (
    <SidebarUser>
      <div className="min-h-screen bg-[#FAF5EF] text-[#2D2321] pb-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button 
            onClick={() => navigate('/home')}
            className="mb-6 flex items-center gap-2 text-[#B38E5D] hover:text-[#8F6E45] text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>

          <div className="bg-white rounded-2xl border border-[#D7C4B0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#D7C4B0] bg-[#FAF5EF] flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#2D2321]">Riwayat Iklan Saya</h1>
                <p className="text-xs text-gray-500 mt-1">Pantau status pengajuan dan pembayaran iklan Anda</p>
              </div>
              <button 
                onClick={() => navigate('/pasang-iklan')}
                className="px-4 py-2 bg-[#B38E5D] text-white text-sm font-bold rounded-lg hover:bg-[#8F6E45] transition-colors flex items-center gap-1"
              >
                <CreditCard className="w-4 h-4" />
                Pasang Iklan Baru
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-800">{error}</p>
                <button 
                  onClick={fetchMyAds}
                  className="ml-auto px-3 py-1 text-xs font-bold text-rose-700 bg-rose-100 rounded hover:bg-rose-200 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            <div className="p-6">
              {ads.length === 0 ? (
                <div className="text-center py-16">
                  <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Iklan</h3>
                  <p className="text-slate-500 text-sm mb-6">Anda belum memasang iklan apapun. Mulai sekarang untuk mempromosikan brand Anda.</p>
                  <button 
                    onClick={() => navigate('/pasang-iklan')}
                    className="px-6 py-3 bg-[#B38E5D] text-white font-bold rounded-lg hover:bg-[#8F6E45] transition-colors inline-flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pasang Iklan Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div 
                      key={ad.id}
                      className="border border-[#D7C4B0] rounded-xl p-4 hover:shadow-md hover:border-[#B38E5D]/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-slate-800 truncate">{ad.vendor_name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${AD_STATUS_COLORS[ad.status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                              {AD_STATUS_LABELS[ad.status] || ad.status}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {PLACEMENT_LABELS[ad.placement] || ad.placement}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(ad.start_date)} – {formatDate(ad.end_date)}
                            </span>
                            {ad.end_date && (() => {
                              const days = getDaysRemaining(ad.end_date);
                              if (days !== null && days >= 0 && ad.status === 'active') {
                                return (
                                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Sisa {days} hari
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2 text-right sm:min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLORS[ad.payment_status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                              {PAYMENT_STATUS_LABELS[ad.payment_status] || ad.payment_status}
                            </span>
                          </div>
                          <p className="font-bold text-[#B38E5D] text-sm">{formatCurrency(ad.price)}</p>
                          <p className="text-xs text-slate-500">{PAYMENT_METHOD_LABELS[ad.payment_method] || ad.payment_method}</p>
                          <button 
                            onClick={() => handleOpenDetail(ad)}
                            className="mt-2 px-3 py-1.5 text-xs font-bold text-[#B38E5D] bg-[#B38E5D]/10 rounded-lg hover:bg-[#B38E5D]/20 transition-colors flex items-center gap-1 justify-center"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showDetailModal && selectedAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                <h2 className="text-lg font-bold text-[#2D2321]">Detail Iklan</h2>
                <button 
                  onClick={handleCloseDetail}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl p-4">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h3 className="font-bold text-slate-800">{selectedAd.vendor_name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${AD_STATUS_COLORS[selectedAd.status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                      {AD_STATUS_LABELS[selectedAd.status] || selectedAd.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLORS[selectedAd.payment_status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                      {PAYMENT_STATUS_LABELS[selectedAd.payment_status] || selectedAd.payment_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Lokasi Penempatan</p>
                      <p className="font-medium text-[#2D2321]">{PLACEMENT_LABELS[selectedAd.placement] || selectedAd.placement}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Durasi Tayang</p>
                      <p className="font-medium text-[#2D2321]">{formatDate(selectedAd.start_date)} – {formatDate(selectedAd.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Total Biaya</p>
                      <p className="font-bold text-[#B38E5D]">{formatCurrency(selectedAd.price)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Metode Bayar</p>
                      <p className="font-medium text-[#2D2321]">{PAYMENT_METHOD_LABELS[selectedAd.payment_method] || selectedAd.payment_method}</p>
                    </div>
                  </div>
                </div>

                {selectedAd.description && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Deskripsi Iklan</h4>
                    <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3">{selectedAd.description}</p>
                  </div>
                )}

                {selectedAd.link_url && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Link Tujuan</h4>
                    <a href={selectedAd.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#B38E5D] hover:underline flex items-center gap-1">
                      {selectedAd.link_url}
                    </a>
                  </div>
                )}

                {selectedAd.payment_proof && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#B38E5D]" />
                      Bukti Pembayaran
                    </h4>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                      {selectedAd.payment_proof.startsWith('http') && selectedAd.payment_proof.match(/\.(jpg|jpeg|png|webp)($|\?)/i) ? (
                        <img 
                          src={selectedAd.payment_proof} 
                          alt="Bukti pembayaran" 
                          className="max-h-64 mx-auto rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="w-12 h-12 text-slate-300" />
                          <p className="text-sm text-slate-500">Bukti pembayaran tersedia</p>
                          <a href={selectedAd.payment_proof} target="_blank" rel="noopener noreferrer" className="text-sm text-[#B38E5D] hover:underline flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            Lihat / Unduh
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedAd.banner_images && selectedAd.banner_images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#B38E5D]" />
                      Banner Iklan ({selectedAd.banner_images.length})
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedAd.banner_images.map((img, idx) => (
                        <div key={idx} className="relative w-36 h-36 flex-shrink-0 border border-slate-300 rounded-lg overflow-hidden">
                          {img.startsWith('http') && img.match(/\.(jpg|jpeg|png|webp)($|\?)/i) ? (
                            <img src={img} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <Shield className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">#{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAd.rejection_reason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Alasan Penolakan
                    </h4>
                    <p className="text-sm text-rose-700">{selectedAd.rejection_reason}</p>
                  </div>
                )}

                {selectedAd.admin_notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      Catatan Admin
                    </h4>
                    <p className="text-sm text-blue-700">{selectedAd.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarUser>
  );
}