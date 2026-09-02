import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Check, X, Eye, RefreshCw, Calendar, Package, AlertCircle } from 'lucide-react';

const AdminSubscriptionVerification = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // State Modal Preview Gambar
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Ambil Data dari API
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/subscriptions?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSubscriptions(response.data.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengambil data langganan.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  // Handler Disetujui
  const handleApprove = (id, userName, packageType) => {
    const daysText = packageType === 'yearly' ? '365 Hari' : '30 Hari';

    Swal.fire({
      title: 'Konfirmasi Persetujuan',
      html: `Apakah Anda yakin ingin menyetujui langganan untuk <b>${userName}</b>?<br/>Masa aktif premium akan bertambah <b>+${daysText}</b>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Setujui!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          await axios.post(`/api/admin/subscriptions/${id}/approve`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Status langganan disetujui dan masa aktif user telah diperbarui.',
            timer: 2000,
            showConfirmButton: false,
          });

          fetchSubscriptions();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan sistem.',
          });
        }
      }
    });
  };

  // Handler Ditolak
  const handleReject = (id, userName) => {
    Swal.fire({
      title: 'Tolak Pembayaran',
      text: `Berikan alasan penolakan untuk transaksi ${userName}:`,
      input: 'textarea',
      inputPlaceholder: 'Contoh: Bukti transfer tidak valid / nominal tidak sesuai',
      inputAttributes: {
        'aria-label': 'Alasan penolakan'
      },
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Tolak Transaksi',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) {
          return 'Alasan penolakan wajib diisi!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          await axios.post(
            `/api/admin/subscriptions/${id}/reject`,
            { rejection_reason: result.value },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );

          Swal.fire({
            icon: 'success',
            title: 'Ditolak',
            text: 'Transaksi langganan telah ditolak.',
            timer: 2000,
            showConfirmButton: false,
          });

          fetchSubscriptions();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan sistem.',
          });
        }
      }
    });
  };

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Verifikasi Langganan Premium</h1>
            <p className="text-sm text-gray-500">Kelola dan verifikasi bukti pembayaran langganan dari pengguna.</p>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Tab Filter Navigation */}
        <div className="flex border-b border-gray-200 mb-6 space-x-4">
          {[
            { key: 'pending', label: 'Menunggu Verifikasi', color: 'bg-amber-500' },
            { key: 'approved', label: 'Disetujui', color: 'bg-emerald-500' },
            { key: 'rejected', label: 'Ditolak', color: 'bg-rose-500' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`pb-3 text-sm font-medium transition-all relative ${
                statusFilter === tab.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Paket</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Tanggal Pengajuan</th>
                  <th className="px-6 py-4 text-center">Bukti Bayar</th>
                  <th className="px-6 py-4 text-center">Aksi / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Memuat data langganan...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      Tidak ada transaksi dengan status <b>{statusFilter}</b>.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{item.user_name}</div>
                        <div className="text-xs text-gray-500">{item.user_email}</div>
                        <div className="text-xs text-gray-400">{item.user_phone}</div>
                      </td>

                      {/* Package Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.package_type === 'yearly' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Package className="w-3 h-3" />
                          {item.package_type === 'yearly' ? 'Tahunan (Yearly)' : 'Bulanan (Monthly)'}
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {formatRupiah(item.amount)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {item.created_at}
                        </div>
                      </td>

                      {/* Proof of Payment Thumbnail */}
                      <td className="px-6 py-4 text-center">
                        <div className="relative group inline-block">
                          <img
                            src={item.proof_of_payment_url}
                            alt="Bukti Transfer"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                            onClick={() => {
                              setSelectedImage(item.proof_of_payment_url);
                              setIsImageModalOpen(true);
                            }}
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(item.proof_of_payment_url);
                              setIsImageModalOpen(true);
                            }}
                            className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Action / Status Info */}
                      <td className="px-6 py-4 text-center">
                        {item.status === 'pending' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(item.id, item.user_name, item.package_type)}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                              title="Setujui Langganan"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(item.id, item.user_name)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition"
                              title="Tolak Langganan"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {item.status === 'approved' && (
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            Disetujui
                          </span>
                        )}

                        {item.status === 'rejected' && (
                          <div className="text-left">
                            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full mb-1">
                              Ditolak
                            </span>
                            {item.rejection_reason && (
                              <p className="text-xs text-gray-500 italic">"{item.rejection_reason}"</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Preview Bukti Bayar */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-100 flex items-center justify-between border-b">
              <h3 className="font-semibold text-gray-700">Bukti Transfer Pembayaran</h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 text-center max-h-[80vh] overflow-y-auto">
              <img
                src={selectedImage}
                alt="Bukti Transfer Size Besar"
                className="mx-auto rounded-lg max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionVerification;