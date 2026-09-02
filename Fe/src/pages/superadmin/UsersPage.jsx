import React, { useState } from 'react';
import API from '../../api';
import Swal from 'sweetalert2';
import useSuperAdminFetch from '../../hooks/useSuperAdminFetch';

export default function UsersPage() {
  const { data, loading, error, reload } = useSuperAdminFetch(
    '/admin/superadmin/users',
    {
      transform: (d) => {
        const raw = d?.data || [];
        return Array.isArray(raw) ? raw : [];
      }
    }
  );

  const users = data || [];

  // State Modal Detail Sewa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rentals, setRentals] = useState([]);

  // Buka Modal & Fetch Data Sewa User
  const handleOpenRentalDetail = async (userId) => {
    setIsModalOpen(true);
    setLoadingModal(true);
    try {
      const response = await API.get(`/admin/superadmin/users/${userId}/rentals`);
      setSelectedUser(response.data?.user || null);
      setRentals(response.data?.data || []);
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal mengambil riwayat sewa.', 'error');
      setIsModalOpen(false);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setRentals([]);
  };

  const handleDeleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: 'Hapus User Platform?',
      text: `Menghapus ${name} akan menghentikan akses akun ini dari aplikasi.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus User!',
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/admin/superadmin/users/${id}`);
        Swal.fire('Terhapus!', 'User berhasil dihapus.', 'success');
        reload();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // Helper Format Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Helper Badge Status Akun Premium / Regular
  const renderPremiumBadge = (user) => {
    const isPremium =
      user?.is_premium === true ||
      user?.is_premium === 1 ||
      user?.status_premium === 'active' ||
      user?.subscription?.status === 'active' ||
      user?.subscription_status === 'active';

    const isPending =
      user?.subscription?.status === 'pending' ||
      user?.subscription_status === 'pending';

    const packageType =
      user?.subscription?.package_type ||
      user?.package_type ||
      '';

    if (isPremium) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#B38E5D]/15 text-[#261C19] border border-[#B38E5D]/40 shadow-xs">
          👑 Premium {packageType ? <span className="uppercase text-[10px] text-[#B38E5D]">({packageType})</span> : ''}
        </span>
      );
    }

    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
          ⏳ Pending Premium
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        Regular / Gratis
      </span>
    );
  };

  // Helper Badge Status Sewa
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'aktif' || s === 'disetujui' || s === 'approved' || s === 'lunas' || s === 'dikonfirmasi') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {status}
        </span>
      );
    }
    if (s === 'pending' || s === 'menunggu' || s === 'tertunda') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          {status}
        </span>
      );
    }
    if (s === 'selesai') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          Selesai
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        {status || 'Dibatalkan'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D7C4B0] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-[#FAF5EF]/50 flex justify-between items-center">
        <h2 className="font-bold text-[#261C19] text-base">Daftar Pengguna Website</h2>
        <span className="text-xs text-slate-500 font-bold uppercase">Total: {users.length}</span>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-[#B38E5D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#5C4A42] text-sm font-bold uppercase tracking-widest">Memuat Data...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <p className="text-rose-600 font-bold text-sm mb-3">Gagal memuat data pengguna platform.</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            🔄 Coba Lagi
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-xs text-slate-400 font-bold">Belum ada pengguna terdaftar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[11px]">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Status Akun</th>
                <th className="px-6 py-3.5">Tanggal Bergabung</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400">#{user.id}</td>
                  <td className="px-6 py-4 font-bold text-[#261C19]">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">{renderPremiumBadge(user)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleOpenRentalDetail(user.id)}
                      className="px-3 py-1.5 bg-[#FAF5EF] hover:bg-[#B38E5D] text-[#261C19] hover:text-white rounded-lg text-xs font-bold border border-[#D7C4B0] cursor-pointer transition"
                    >
                      👁️ Detail Sewa
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer transition"
                    >
                      🗑️ Hapus User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL INSPEKSI RIWAYAT SEWA USER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF5EF] w-full max-w-4xl rounded-2xl shadow-xl border border-[#D7C4B0] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-[#261C19] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#B38E5D]">Riwayat & Inspeksi Sewa User</h3>
                <p className="text-xs text-slate-300">Superadmin Control Panel</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingModal ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-[#B38E5D] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[#261C19] text-xs font-bold uppercase tracking-wider">Memuat Detail Sewa...</p>
                </div>
              ) : (
                <>
                  {/* Summary Profile User */}
                  <div className="bg-white p-4 rounded-xl border border-[#D7C4B0] grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nama User</span>
                      <p className="font-bold text-[#261C19] text-sm">{selectedUser?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                      <p className="font-semibold text-slate-700 text-sm">{selectedUser?.email || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tipe Akun</span>
                      <div className="mt-1">{renderPremiumBadge(selectedUser)}</div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Transaksi Sewa</span>
                      <p className="font-extrabold text-[#B38E5D] text-sm">{rentals.length} Kali</p>
                    </div>
                  </div>

                  {/* Tabel Daftar Sewa */}
                  <div className="bg-white rounded-xl border border-[#D7C4B0] overflow-hidden">
                    <div className="px-4 py-3 bg-[#261C19]/5 border-b border-[#D7C4B0]">
                      <h4 className="font-bold text-[#261C19] text-sm">Daftar Properti & Kamar Disewa</h4>
                    </div>

                    {rentals.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400 font-bold">
                        Pengguna ini belum pernah melakukan transaksi sewa.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                            <tr>
                              <th className="px-4 py-3">Properti</th>
                              <th className="px-4 py-3">Kamar</th>
                              <th className="px-4 py-3">Tanggal / Durasi</th>
                              <th className="px-4 py-3">Nominal Bayar</th>
                              <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rentals.map((item) => {
                              const namaProperti = item.properti?.title || item.properti?.nama || item.properti?.nama_properti || item.nama_properti || 'Properti N/A';
                              const alamatProperti = item.properti?.address || item.properti?.alamat || '-';
                              
                              const tglMulai = item.check_in_date || item.tanggal_sewa || item.booking_date || item.tanggal_mulai;
                              const durasiBulan = item.duration_months || item.durasi_sewa || item.durasi;
                              
                              const nominalBayar = item.total_price || item.nominal || item.total_harga || item.pembayaran?.amount || 0;

                              return (
                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                  <td className="px-4 py-3.5">
                                    <p className="font-bold text-[#261C19]">{namaProperti}</p>
                                    <p className="text-[10px] text-slate-400">{alamatProperti}</p>
                                  </td>
                                  <td className="px-4 py-3.5 font-semibold text-slate-700">
                                    {item.kamar?.nomor_kamar ? `Kamar No. ${item.kamar.nomor_kamar}` : item.kamar?.tipe_kamar || item.kamar?.tipe || 'Tipe Standar'}
                                  </td>
                                  <td className="px-4 py-3.5 text-slate-600">
                                    <div>
                                      {tglMulai ? new Date(tglMulai).toLocaleDateString('id-ID') : '-'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {durasiBulan ? `${durasiBulan} Bulan` : '-'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 font-bold text-[#261C19]">
                                    {formatRupiah(nominalBayar)}
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    {renderStatusBadge(item.status)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3.5 bg-white border-t border-[#D7C4B0] flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-[#261C19] text-white hover:bg-[#B38E5D] transition rounded-lg text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}