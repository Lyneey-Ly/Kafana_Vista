import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectData, setRejectData] = useState(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const STORAGE_URL = 'http://127.0.0.1:8000/storage';

  // Helper pencari token yang fleksibel
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
      console.error('Gagal membaca token dari user object:', e);
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

  useEffect(() => {
    fetchSubscriptions();
  }, [filterStatus]);

  const fetchSubscriptions = async () => {
    const token = getToken();
    if (!token) {
      setFeedback({
        type: 'error',
        text: 'Sesi SuperAdmin tidak ditemukan. Silakan login kembali.',
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = filterStatus 
        ? `${API_BASE_URL}/admin/superadmin/subscriptions?status=${filterStatus}`
        : `${API_BASE_URL}/admin/superadmin/subscriptions`;
        
      const response = await axios.get(url, getAuthHeader());
      setSubscriptions(response.data.data || []);
      setFeedback({ type: '', text: '' });
    } catch (err) {
      console.error('Gagal mengambil data subscriptions:', err);
      if (err.response?.status === 401) {
        setFeedback({
          type: 'error',
          text: 'Sesi login SuperAdmin kadaluwarsa atau tidak valid (401). Silakan login ulang.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler Setujui Pembayaran Premium
  const handleApprove = async (id) => {
    if (!window.confirm('Konfirmasi menyetujui pengajuan akun premium ini?')) return;

    setActionLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/superadmin/subscriptions/${id}/approve`,
        {},
        getAuthHeader()
      );
      setFeedback({
        type: 'success',
        text: response.data.message || 'Pengajuan premium berhasil dikonfirmasi!',
      });
      fetchSubscriptions();
    } catch (err) {
      console.error('Gagal mengkonfirmasi pembayaran:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Gagal menyetujui pengajuan.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Tolak Pembayaran Premium
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectData || !rejectData.reason) return;

    setActionLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/superadmin/subscriptions/${rejectData.id}/reject`,
        { rejection_reason: rejectData.reason },
        getAuthHeader()
      );
      setFeedback({
        type: 'success',
        text: response.data.message || 'Pengajuan premium berhasil ditolak.',
      });
      setRejectData(null);
      fetchSubscriptions();
    } catch (err) {
      console.error('Gagal menolak pembayaran:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Gagal menolak pengajuan.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#261C19]">Verifikasi Akun Premium</h1>
          <p className="text-sm text-slate-500">Kelola dan konfirmasi pengajuan paket premium dari pengguna.</p>
        </div>

        {/* Tab Filter Status */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          {['pending', 'approved', 'rejected', ''].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-white text-[#B38E5D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === '' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {feedback.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          feedback.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          {feedback.text}
        </div>
      )}

      {/* Tabel Data Pengajuan */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat data pengajuan...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Tidak ada pengajuan pembayaran ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Paket</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Bukti Bayar</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-semibold text-slate-800">
                      <div>{sub.user?.name || 'User Hilang'}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{sub.user?.email}</div>
                    </td>
                    <td className="p-4 font-bold uppercase text-[#B38E5D]">
                      {sub.package_type}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      Rp {Number(sub.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      {sub.proof_of_payment ? (
                        <button
                          onClick={() => setPreviewImage(`${STORAGE_URL}/${sub.proof_of_payment}`)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                        >
                          🔍 Lihat Bukti
                        </button>
                      ) : (
                        <span className="text-slate-400">Tidak Ada</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {sub.status === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApprove(sub.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            ACC / Approve
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => setRejectData({ id: sub.id, reason: '' })}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Selesai Diproses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview Bukti Transfer */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-2xl max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Bukti Pembayaran</h3>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <img src={previewImage} alt="Bukti Transfer" className="max-h-[70vh] mx-auto rounded-xl object-contain" />
          </div>
        </div>
      )}

      {/* Modal Input Alasan Penolakan */}
      {rejectData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-800">Tolak Pengajuan Premium</h3>
            <p className="text-xs text-slate-500">Berikan alasan kenapa pembayaran ini ditolak:</p>
            <textarea
              required
              rows={3}
              placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai"
              value={rejectData.reason}
              onChange={(e) => setRejectData({ ...rejectData, reason: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-[#B38E5D]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectData(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                Kirim Penolakan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}