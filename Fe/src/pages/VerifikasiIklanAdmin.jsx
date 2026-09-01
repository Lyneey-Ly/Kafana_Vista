import { useState, useEffect } from 'react';
import API from '../api';
import Swal from 'sweetalert2';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Shield, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const PLACEMENT_LABELS = {
  home_hero: 'Beranda Atas (Hero Slide)',
  landing_mid: 'Landing Page Tengah',
  catalog_top: 'Atas Halaman Katalog',
  search_sidebar: 'Sidebar Pencarian',
  catalog_in_feed: 'Di Antara Grid Kost',
  footer_banner: 'Banner Atas Footer',
  custom: 'Lokasi Kustom',
};

export default function VerifikasiIklanAdmin() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/vendor-ads');
      setAds(response.data?.data || []);
    } catch (err) {
      Swal.fire('Gagal', 'Gagal memuat daftar iklan untuk verifikasi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ad) => {
    const result = await Swal.fire({
      title: 'Setujui Iklan Ini?',
      text: 'Iklan akan diverifikasi, pembayaran disetujui, dan status menjadi aktif tayang.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Setujui & Tayangkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#10B981',
    });

    if (!result.isConfirmed) return;

    try {
      setSubmittingId(ad.id);
      await API.put(`/admin/vendor-ads/${ad.id}/verify`, {
        status: 'active',
        payment_status: 'paid',
        admin_notes: 'Iklan dan pembayaran telah diverifikasi dan disetujui.',
      });
      Swal.fire('Berhasil', 'Iklan telah disetujui dan siap ditayangkan.', 'success');
      setSelectedAd(null);
      fetchAds();
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses verifikasi.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (ad) => {
    const { value: reason } = await Swal.fire({
      title: 'Tolak Iklan Ini',
      input: 'textarea',
      inputLabel: 'Alasan Penolakan',
      inputPlaceholder: 'Tuliskan alasan penolakan (misal: Bukti transfer tidak valid, banner melanggar ketentuan)...',
      showCancelButton: true,
      confirmButtonText: 'Kirim Penolakan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EF4444',
      inputValidator: (value) => {
        if (!value) return 'Alasan penolakan wajib diisi!';
      }
    });

    if (!reason) return;

    try {
      setSubmittingId(ad.id);
      await API.put(`/admin/vendor-ads/${ad.id}/verify`, {
        status: 'rejected',
        payment_status: 'rejected',
        rejection_reason: reason,
      });
      Swal.fire('Iklan Ditolak', 'Notifikasi penolakan telah dicatat.', 'info');
      setSelectedAd(null);
      fetchAds();
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses penolakan.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredAds = ads.filter(ad => {
    if (filterStatus === 'pending') return ad.status === 'pending' || ad.payment_status === 'pending';
    if (filterStatus === 'active') return ad.status === 'active';
    if (filterStatus === 'rejected') return ad.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B38E5D] mx-auto mb-4" />
        <p className="text-slate-500">Memuat data pengajuan iklan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Verifikasi Iklan Vendor</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola persetujuan banner dan verifikasi bukti pembayaran iklan</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl text-xs font-bold gap-1">
          {['all', 'pending', 'active', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'pending' ? 'Perlu Verifikasi' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredAds.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Tidak ada iklan dalam kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{ad.vendor_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    ad.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    ad.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {ad.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    ad.payment_status === 'paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    Bayar: {ad.payment_status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{PLACEMENT_LABELS[ad.placement] || ad.placement}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{ad.start_date} s/d {ad.end_date}</span>
                  <span className="flex items-center gap-1 font-bold text-[#B38E5D]">
                    <CreditCard className="w-3.5 h-3.5" /> Rp {Number(ad.price || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setSelectedAd(ad)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Detail
                </button>
                {ad.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(ad)}
                      disabled={submittingId === ad.id}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Setujui
                    </button>
                    <button
                      onClick={() => handleReject(ad)}
                      disabled={submittingId === ad.id}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Verifikasi */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-slate-800">Detail Pengajuan Iklan</h3>
              <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-400">Vendor / Brand</p>
                <p className="font-bold text-slate-800">{selectedAd.vendor_name}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Tagihan</p>
                <p className="font-bold text-[#B38E5D]">Rp {Number(selectedAd.price || 0).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-slate-400">Posisi Placement</p>
                <p className="font-medium text-slate-700">{PLACEMENT_LABELS[selectedAd.placement] || selectedAd.placement}</p>
              </div>
              <div>
                <p className="text-slate-400">Periode Tayang</p>
                <p className="font-medium text-slate-700">{selectedAd.start_date} s/d {selectedAd.end_date}</p>
              </div>
            </div>

            {/* Bukti Pembayaran */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Bukti Pembayaran</h4>
              {selectedAd.payment_proof ? (
                <div className="border border-slate-200 rounded-lg p-2 max-h-60 overflow-hidden flex justify-center bg-slate-50">
                  <img src={selectedAd.payment_proof} alt="Bukti Transfer" className="object-contain max-h-56 rounded" />
                </div>
              ) : (
                <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-lg flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Belum ada bukti pembayaran diunggah.
                </p>
              )}
            </div>

            {/* Aksi Verifikasi */}
            <div className="pt-4 border-t flex justify-end gap-3">
              <button onClick={() => setSelectedAd(null)} className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600">
                Tutup
              </button>
              {selectedAd.status === 'pending' && (
                <>
                  <button onClick={() => handleReject(selectedAd)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold">
                    Tolak Iklan
                  </button>
                  <button onClick={() => handleApprove(selectedAd)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                    Setujui & Aktifkan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}