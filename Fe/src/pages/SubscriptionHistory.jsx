import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarUser from '../components/SidebarUser';

export default function SubscriptionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = getToken();
    if (!token) {
      setErrorMsg('Sesi login tidak terdeteksi. Silakan login kembali.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/history`, getAuthHeader());
      setHistory(response.data.data || []);
      setErrorMsg('');
    } catch (err) {
      console.error('Gagal mengambil riwayat transaksi:', err);
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat memuat data riwayat.');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <SidebarUser>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-amber-100 text-[#B38E5D] text-xs font-bold rounded-full uppercase tracking-wider">
                📜 Transaksi
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#261C19]">Riwayat Pembayaran Premium</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Pantau status verifikasi pengajuan dan riwayat paket berlangganan kamu.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="self-start sm:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Feedback Error */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-[#B38E5D] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Memuat riwayat transaksi...</p>
            </div>
          ) : history.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 bg-amber-50 text-[#B38E5D] rounded-full flex items-center justify-center mx-auto text-2xl">
                💳
              </div>
              <h3 className="font-bold text-slate-800 text-base">Belum Ada Transaksi</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Kamu belum pernah melakukan pengajuan langganan premium.
              </p>
            </div>
          ) : (
            /* History Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Paket</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Bukti Bayar</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Tanggal */}
                      <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                        {item.created_at}
                      </td>

                      {/* Tipe Paket */}
                      <td className="p-4 font-bold uppercase text-[#B38E5D] whitespace-nowrap">
                        {item.package_type === 'yearly' ? 'Paket Tahunan (365 Hari)' : 'Paket Bulanan (30 Hari)'}
                      </td>

                      {/* Nominal */}
                      <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                        {formatRupiah(item.amount)}
                      </td>

                      {/* Bukti Bayar */}
                      <td className="p-4 whitespace-nowrap">
                        {item.proof_of_payment ? (
                          <button
                            onClick={() => setPreviewImage(item.proof_of_payment)}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            🔍 Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Tidak Ada</span>
                        )}
                      </td>

                      {/* Status & Rejection Reason */}
                      <td className="p-4">
                        <div className="space-y-1.5">
                          {item.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full uppercase">
                              ⏳ Pending
                            </span>
                          )}

                          {item.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full uppercase">
                              ✅ Disetujui
                            </span>
                          )}

                          {item.status === 'rejected' && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full uppercase">
                                ❌ Ditolak
                              </span>
                              {item.rejection_reason && (
                                <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700">
                                  <span className="font-bold">Alasan:</span> "{item.rejection_reason}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal Preview Bukti Transfer */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-2xl max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Bukti Pembayaran</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={previewImage}
              alt="Bukti Transfer"
              className="max-h-[70vh] mx-auto rounded-xl object-contain border border-slate-100"
            />
          </div>
        </div>
      )}
    </SidebarUser>
  );
}