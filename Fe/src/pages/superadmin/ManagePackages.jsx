import { useState } from 'react';
import API from '../../api';
import Swal from 'sweetalert2';
import useSuperAdminFetch from '../../hooks/useSuperAdminFetch';

const EMPTY_FORM = {
  slug: '',
  name: '',
  subtitle: '',
  price: 50000,
  period: '/ bulan',
  duration_days: 30,
  badge: '',
  savings_text: '',
  is_popular: false,
  features: [''],
  is_active: true,
};

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(number) || 0);
};

export default function ManagePackages() {
  const { data, loading, error, reload } = useSuperAdminFetch('/admin/superadmin/packages', {
    transform: (d) => d?.data || [],
  });

  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const openCreate = () => {
    setEditingPkg(null);
    setFormData({ ...EMPTY_FORM, slug: '', price: 50000, duration_days: 30, features: [''] });
    setShowModal(true);
  };

  const openEdit = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      slug: pkg.slug || pkg.id,
      name: pkg.name,
      subtitle: pkg.subtitle || '',
      price: Number(pkg.price),
      period: pkg.period,
      duration_days: Number(pkg.duration_days ?? pkg.durationDays ?? 30),
      badge: pkg.badge || '',
      savings_text: pkg.savings_text || pkg.savingsText || '',
      is_popular: Boolean(pkg.is_popular ?? pkg.isPopular),
      features: pkg.features && pkg.features.length ? [...pkg.features] : [''],
      is_active: Boolean(pkg.is_active ?? pkg.isActive),
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'duration_days') {
      const num = Number(value);
      if (name === 'price' && num < 0) return;
      if (name === 'duration_days' && num < 1) return;
      setFormData((prev) => ({ ...prev, [name]: value === '' ? '' : num }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureChange = (idx, val) => {
    setFormData((prev) => {
      const arr = [...prev.features];
      arr[idx] = val;
      return { ...prev, features: arr };
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (idx) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi harga tidak boleh minus
    if (Number(formData.price) < 0) {
      Swal.fire({ icon: 'error', title: 'Validasi Gagal', text: 'Harga tidak boleh negatif.', confirmButtonColor: '#B38E5D' });
      return;
    }
    if (Number(formData.duration_days) < 1) {
      Swal.fire({ icon: 'error', title: 'Validasi Gagal', text: 'Durasi minimal 1 hari.', confirmButtonColor: '#B38E5D' });
      return;
    }
    const cleanFeatures = formData.features.map((f) => f.trim()).filter(Boolean);
    if (cleanFeatures.length === 0) {
      Swal.fire({ icon: 'error', title: 'Validasi Gagal', text: 'Minimal satu fitur harus diisi.', confirmButtonColor: '#B38E5D' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: formData.slug.toLowerCase().trim(),
        name: formData.name.trim(),
        subtitle: formData.subtitle.trim() || null,
        price: Number(formData.price),
        period: formData.period.trim(),
        duration_days: Number(formData.duration_days),
        badge: formData.badge.trim() || null,
        savings_text: formData.savings_text.trim() || null,
        is_popular: Boolean(formData.is_popular),
        features: cleanFeatures,
        is_active: Boolean(formData.is_active),
      };

      let res;
      if (editingPkg) {
        res = await API.put(`/admin/superadmin/packages/${editingPkg.id || editingPkg.slug}`, payload);
      } else {
        res = await API.post('/admin/superadmin/packages', payload);
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data?.message || 'Paket premium berhasil disimpan. Perubahan langsung aktif untuk user.',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      reload();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.slug?.[0] || 'Gagal menyimpan paket!';
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: Array.isArray(msg) ? msg.join(', ') : msg,
        confirmButtonColor: '#B38E5D',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (pkg) => {
    const newStatus = !Boolean(pkg.is_active ?? pkg.isActive);
    const action = newStatus ? 'Mengaktifkan' : 'Menonaktifkan';
    const confirm = await Swal.fire({
      title: `${action} Paket?`,
      text: `${pkg.name} akan ${newStatus ? 'ditampilkan' : 'disembunyikan'} dari halaman Upgrade Premium pengguna.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Ya, ${action}`,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#B38E5D',
      cancelButtonColor: '#6b7280',
    });
    if (!confirm.isConfirmed) return;

    setTogglingId(pkg.id || pkg.slug);
    try {
      // Use PUT with is_active toggle
      await API.put(`/admin/superadmin/packages/${pkg.id || pkg.slug}`, {
        is_active: newStatus,
      });
      Swal.fire({
        icon: 'success',
        title: 'Status Diperbarui!',
        text: `Paket ${pkg.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
        timer: 2000,
        showConfirmButton: false,
      });
      reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal mengubah status paket!', confirmButtonColor: '#B38E5D' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeactivate = async (pkg) => {
    const result = await Swal.fire({
      title: 'Nonaktifkan Paket?',
      text: `Paket ${pkg.name} (${formatRupiah(pkg.price)}) akan dinonaktifkan. Tidak dihapus permanen, bisa diaktifkan kembali.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Nonaktifkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#B38E5D',
    });
    if (!result.isConfirmed) return;

    setTogglingId(pkg.id || pkg.slug);
    try {
      await API.delete(`/admin/superadmin/packages/${pkg.id || pkg.slug}`);
      Swal.fire({
        icon: 'success',
        title: 'Dinonaktifkan',
        text: 'Paket berhasil dinonaktifkan.',
        timer: 2000,
        showConfirmButton: false,
      });
      reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal menonaktifkan paket!', confirmButtonColor: '#B38E5D' });
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-[#B38E5D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#5C4A42] text-sm font-bold uppercase tracking-widest">Memuat Paket Premium...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#D7C4B0] p-10 text-center rounded-2xl shadow-sm">
        <p className="text-rose-600 font-bold text-sm mb-3">Gagal memuat paket premium.</p>
        <p className="text-xs text-slate-500 mb-4">{error.response?.data?.message || 'Periksa koneksi atau sesi login Superadmin.'}</p>
        <button onClick={reload} className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-xs font-bold cursor-pointer">
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  const packages = data || [];

  return (
    <div className="space-y-6">
      {/* Header Action */}
      <div className="bg-white rounded-2xl border border-[#D7C4B0] p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="font-bold text-[#261C19] text-lg flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B38E5D] to-[#C5A059] text-white flex items-center justify-center text-sm">◆</span>
            Manajemen Harga Paket Premium
          </h2>
          <p className="text-xs text-slate-500 mt-1">Kelola harga, badge, fitur & status paket. Perubahan langsung tampil di halaman <span className="font-bold text-[#B38E5D]">Upgrade Premium</span> user tanpa build ulang.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-[#261C19] hover:bg-[#B38E5D] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
        >
          + Tambah Paket Baru
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-[#261C19] border border-[#4A3B32] rounded-2xl p-4 flex items-start gap-3 text-[#FAF5EF]">
        <div className="w-8 h-8 rounded-lg bg-[#B38E5D]/20 border border-[#B38E5D]/30 flex items-center justify-center text-[#C5A059] shrink-0 text-xs font-black">i</div>
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-[#C5A059]">Kinerja Realtime</p>
          <p className="text-[#E5D7C5]/80 mt-0.5">Semua paket dengan <span className="font-bold text-emerald-400">Aktif</span> akan tampil di <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">GET /api/packages</span> untuk user. Nonaktifkan paket alih-alih menghapus agar history subscription tetap utuh.</p>
        </div>
      </div>

      {/* Grid Cards */}
      {packages.length === 0 ? (
        <div className="bg-white border border-[#D7C4B0] rounded-2xl p-12 text-center">
          <p className="text-xs text-slate-400 font-bold">Belum ada paket premium. Silakan tambah paket baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const isActive = Boolean(pkg.is_active ?? pkg.isActive);
            const isPopular = Boolean(pkg.is_popular ?? pkg.isPopular);
            const price = Number(pkg.price);
            const duration = pkg.duration_days ?? pkg.durationDays;
            return (
              <div
                key={pkg.id || pkg.slug}
                className={`relative bg-white border-2 rounded-[1.5rem] p-5 flex flex-col justify-between transition shadow-sm hover:shadow-md ${isActive ? 'border-[#D7C4B0] hover:border-[#B38E5D]/50' : 'border-slate-200 bg-slate-50/60 opacity-80'}`}
              >
                {pkg.badge && (
                  <div className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${isPopular ? 'bg-gradient-to-r from-[#B38E5D] to-[#C5A059] text-white' : 'bg-slate-800 text-white'}`}>
                    {pkg.badge}
                  </div>
                )}
                {isPopular && (
                  <span className="absolute -top-2 left-6 px-2.5 py-0.5 bg-[#261C19] text-[#C5A059] text-[9px] font-black rounded-full border border-[#B38E5D]/30 uppercase tracking-widest">POPULAR</span>
                )}

                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#261C19]">{pkg.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{pkg.subtitle}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">/{pkg.slug} • {duration} hari</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-500 border border-slate-300'}`}>
                      {isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="my-4">
                    <span className="text-xl font-black text-[#B38E5D] font-mono">{formatRupiah(price)}</span>
                    <span className="text-xs text-slate-400 ml-1">{pkg.period}</span>
                    {pkg.savings_text || pkg.savingsText ? (
                      <p className="text-[11px] font-semibold text-emerald-600 mt-1">{pkg.savings_text || pkg.savingsText}</p>
                    ) : null}
                  </div>

                  <hr className="border-[#E5D7C5] my-3" />

                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    {(pkg.features || []).slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#B38E5D] mt-0.5">✓</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                    {(pkg.features || []).length > 4 && (
                      <li className="text-[10px] text-slate-400 italic">+{pkg.features.length - 4} fitur lainnya...</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex-1 py-2 rounded-xl bg-[#FAF5EF] hover:bg-[#E5D7C5] text-[#261C19] border border-[#E5D7C5] text-xs font-bold transition cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(pkg)}
                    disabled={togglingId === (pkg.id || pkg.slug)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition cursor-pointer disabled:opacity-50 ${isActive ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
                  >
                    {togglingId === (pkg.id || pkg.slug) ? '...' : isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>

                {isActive && (
                  <button
                    onClick={() => handleDeactivate(pkg)}
                    className="w-full mt-2 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 text-[11px] font-semibold transition cursor-pointer"
                  >
                    🗑️ Nonaktifkan Paket
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FAF5EF] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#D7C4B0] overflow-hidden max-h-[90vh] flex flex-col my-4">
            <div className="bg-[#261C19] text-white p-5 flex justify-between items-center border-b border-[#3D2D29] shrink-0">
              <div>
                <h3 className="font-bold text-base font-serif tracking-wide">
                  {editingPkg ? 'Edit Paket Premium' : 'Tambah Paket Premium Baru'}
                </h3>
                <p className="text-[11px] text-[#E5D7C5]/70 mt-0.5">Harga & fitur akan langsung tampil di sisi pengguna.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Slug / Key ID <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="slug"
                    required
                    disabled={!!editingPkg}
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="monthly, yearly, lifetime, custom"
                    pattern="^[a-z0-9_-]+$"
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition disabled:bg-slate-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Huruf kecil, angka, dash/underscore. Unik.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Nama Paket <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Paket Bulanan"
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Subtitle / Deskripsi Singkat</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Akses fleksibel tanpa komitmen"
                  className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Harga (Rp) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                  />
                  <p className="text-[11px] font-bold text-[#B38E5D] mt-1">{formatRupiah(formData.price)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Periode <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="period"
                    required
                    value={formData.period}
                    onChange={handleInputChange}
                    placeholder="/ bulan"
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Durasi (hari) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    name="duration_days"
                    required
                    min="1"
                    max="36500"
                    value={formData.duration_days}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">30=bulanan, 365=tahunan, 36500=lifetime</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Badge Diskon</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    placeholder="Hemat 17% / Best Value"
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Teks Hemat</label>
                  <input
                    type="text"
                    name="savings_text"
                    value={formData.savings_text}
                    onChange={handleInputChange}
                    placeholder="Hemat Rp 100.000 dibanding bulanan"
                    className="w-full bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#261C19] mb-1">Daftar Fitur <span className="text-rose-500">*</span></label>
                <div className="space-y-2">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Fitur ${idx + 1}`}
                        className="flex-1 bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 text-xs text-[#261C19] focus:outline-none focus:border-[#B38E5D] transition"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        disabled={formData.features.length <= 1}
                        className="px-3 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition disabled:opacity-30 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="w-full py-2.5 bg-white border border-dashed border-[#B38E5D] text-[#B38E5D] hover:bg-[#B38E5D]/10 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    + Tambah Fitur
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_popular"
                    checked={formData.is_popular}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-[#B38E5D]"
                  />
                  <span className="text-xs font-bold text-[#261C19]">Tandai Popular</span>
                </label>
                <label className="flex items-center gap-2 bg-white border border-[#D7C4B0] rounded-xl px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-[#261C19]">Aktif (Tampil)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#FAF5EF] -mx-6 -mb-6 px-6 py-4 border-t border-[#D7C4B0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-slate-300 font-bold text-xs uppercase text-slate-600 hover:bg-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-3 rounded-xl bg-[#B38E5D] hover:bg-[#C5A059] text-white font-black text-xs uppercase shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>{editingPkg ? 'Perbarui Paket' : 'Simpan Paket'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
