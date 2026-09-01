import { useState } from 'react';
import API from '../../api';
import Swal from 'sweetalert2';
import useSuperAdminFetch from '../../hooks/useSuperAdminFetch';
import { formatAvatar } from '../../utils/format';
import { useSuperAdminLayout } from '../../contexts/SuperAdminContext';

export default function AdministratorsPage() {
  const { refreshTick } = useSuperAdminLayout();
  const [adminRoleFilter, setAdminRoleFilter] = useState('');

  // State Inspeksi Properti Modal
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminPropertiesData, setAdminPropertiesData] = useState(null);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const url = adminRoleFilter
    ? `/admin/superadmin/administrators?role=${adminRoleFilter}`
    : '/admin/superadmin/administrators';

  const { data, loading, error, reload } = useSuperAdminFetch(
    url,
    {
      deps: [refreshTick],
      transform: (d) => {
        const raw = d?.data || [];
        return Array.isArray(raw) ? raw : [];
      }
    }
  );

  const administrators = data || [];

  const handleDeleteAdministrator = async (id, name) => {
    const result = await Swal.fire({
      title: 'Hapus Akun Pengelola?',
      text: `Apakah Anda yakin ingin menghapus akun ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/admin/superadmin/administrators/${id}`);
        Swal.fire('Terhapus!', 'Akun berhasil dihapus.', 'success');
        reload();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // Handler Buka Modal Inspeksi Properti
  const handleInspectProperties = async (admin) => {
    setSelectedAdmin(admin);
    setShowPropertyModal(true);
    setLoadingProperties(true);
    setAdminPropertiesData(null);

    try {
      const res = await API.get(`/admin/superadmin/administrators/${admin.id}/properties`);
      setAdminPropertiesData(res.data?.data || null);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat',
        text: err.response?.data?.message || 'Gagal mengambil data properti pemilik kost!',
        confirmButtonColor: '#B38E5D',
      });
      setShowPropertyModal(false);
    } finally {
      setLoadingProperties(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D7C4B0] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-[#FAF5EF]/50 flex justify-between items-center">
        <h2 className="font-bold text-[#261C19] text-base">Akun Administrator & Pemilik Kost</h2>
        <select
          value={adminRoleFilter}
          onChange={(e) => setAdminRoleFilter(e.target.value)}
          className="text-xs border border-[#D7C4B0] p-2 rounded-lg bg-white font-bold text-[#261C19]"
        >
          <option value="">Semua Role</option>
          <option value="admin">Pemilik Kost (Admin)</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-[#B38E5D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#5C4A42] text-sm font-bold uppercase tracking-widest">Memuat Data...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <p className="text-rose-600 font-bold text-sm mb-3">Gagal memuat data administrator.</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            🔄 Coba Lagi
          </button>
        </div>
      ) : administrators.length === 0 ? (
        <p className="text-center py-10 text-xs text-slate-400 font-bold">Tidak ada akun pengelola.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Pengelola</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Terdaftar</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {administrators.map((item) => {
                const avatarUrl = formatAvatar(item.foto || item.avatar || item.foto_profil);
                const isOwner = item.role === 'admin';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative w-9 h-9 flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#D7C4B0] shadow-xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-9 h-9 rounded-full bg-[#B38E5D] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs"
                          style={{ display: avatarUrl ? 'none' : 'flex' }}
                        >
                          {item.name ? item.name[0] : 'U'}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-[#261C19]">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.role === 'superadmin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.role === 'superadmin' ? 'Superadmin' : 'Pemilik Kost'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isOwner && (
                          <button
                            onClick={() => handleInspectProperties(item)}
                            className="px-3 py-1 bg-[#FAF5EF] hover:bg-[#EFE3D3] text-[#261C19] rounded-lg text-xs font-bold border border-[#D7C4B0] cursor-pointer transition shadow-xs"
                          >
                            🏠 Lihat Properti
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAdministrator(item.id, item.name)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer transition"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL INSPEKSI PROPERTI & KAMAR */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#D7C4B0] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-[#261C19] text-white p-5 flex justify-between items-center border-b border-[#3D2D29] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B38E5D] flex items-center justify-center font-extrabold text-sm uppercase text-white shadow-md">
                  {selectedAdmin?.name ? selectedAdmin.name[0] : 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-base font-serif tracking-wide text-[#FAF5EF]">
                    Detail Properti & Kamar
                  </h3>
                  <p className="text-xs text-[#D7C4B0]">{selectedAdmin?.name} ({selectedAdmin?.email})</p>
                </div>
              </div>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer text-white"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingProperties ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-[#B38E5D] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[#5C4A42] text-xs font-bold uppercase tracking-wider">Mengambil data properti...</p>
                </div>
              ) : adminPropertiesData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FAF5EF] p-4 rounded-xl border border-[#D7C4B0]">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8F6E45]">Total Properti</p>
                      <h4 className="text-2xl font-black text-[#261C19]">
                        {adminPropertiesData.total_properties} <span className="text-xs font-bold text-slate-500">Unit</span>
                      </h4>
                    </div>
                    <div className="bg-[#FAF5EF] p-4 rounded-xl border border-[#D7C4B0]">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8F6E45]">Total Kamar</p>
                      <h4 className="text-2xl font-black text-[#B38E5D]">
                        {adminPropertiesData.total_rooms} <span className="text-xs font-bold text-slate-500">Kamar</span>
                      </h4>
                    </div>
                  </div>

                  {/* Daftar Properti */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#261C19] mb-3">
                      Daftar Kost &amp; Properti
                    </h4>
                    {adminPropertiesData.properties.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400 font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Pemilik ini belum memiliki properti yang terdaftar.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {adminPropertiesData.properties.map((prop) => (
                          <div
                            key={prop.id}
                            className="p-4 rounded-xl border border-[#D7C4B0] bg-white hover:bg-[#FAF5EF]/30 transition flex justify-between items-center gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-[#261C19]">{prop.title}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  prop.status === 'Aktif' || prop.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {prop.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{prop.address}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="px-3 py-1.5 rounded-lg bg-[#FAF5EF] text-[#261C19] font-black text-xs border border-[#D7C4B0] inline-block">
                                🚪 {prop.rooms_count} Kamar
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-xs text-rose-500 font-bold">Data tidak ditemukan.</p>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right flex-shrink-0">
              <button
                onClick={() => setShowPropertyModal(false)}
                className="px-5 py-2 bg-[#261C19] text-white rounded-xl text-xs font-bold hover:bg-[#3D2D29] transition cursor-pointer"
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