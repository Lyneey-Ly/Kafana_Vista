import { useState, useCallback, useMemo } from 'react';
import API from '../../api'; //
import Swal from 'sweetalert2'; //[cite: 1]
import useSuperAdminFetch from '../../hooks/useSuperAdminFetch'; //[cite: 1]
import { formatRupiah, formatAvatar } from '../../utils/format'; //[cite: 1]
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const CATEGORY_LABELS = {
  slot_fee: 'Slot Properti',
  vendor_ad: 'Iklan Vendor',
  commission: 'Komisi Booking',
  operational_cost: 'Biaya Operasional',
  other: 'Lainnya',
}; //[cite: 1]

const CATEGORY_BADGES = {
  slot_fee: 'bg-amber-100 text-amber-700',
  vendor_ad: 'bg-violet-100 text-violet-700',
  commission: 'bg-blue-100 text-blue-700',
  operational_cost: 'bg-rose-100 text-rose-700',
  other: 'bg-slate-100 text-slate-600',
}; //[cite: 1]

const EMPTY_FORM = {
  type: 'income',
  category: 'other',
  amount: '',
  description: '',
  transaction_date: new Date().toISOString().slice(0, 10),
  proof_file: null,
}; //[cite: 1]

// Custom Tooltip untuk Grafik Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedDate = new Date(label + 'T00:00:00').toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="bg-[#261C19] text-[#FAF5EF] p-3 rounded-xl shadow-xl border border-[#D7C4B0]/30 text-xs space-y-1.5">
        <p className="font-bold border-b border-[#D7C4B0]/20 pb-1 text-[#B38E5D]">{formattedDate}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-black">{formatRupiah(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceTrackerPage() {
  const [year, setYear] = useState(new Date().getFullYear()); //[cite: 1]
  const [month, setMonth] = useState(''); //[cite: 1]
  const [category, setCategory] = useState(''); //[cite: 1]
  const [type, setType] = useState(''); //[cite: 1]
  
  // State Baru: Search Query untuk pencarian instan
  const [searchQuery, setSearchQuery] = useState('');

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (year) params.set('year', year);
    if (month) params.set('month', month);
    if (category) params.set('category', category);
    if (type) params.set('type', type);
    params.set('per_page', '50');
    return `/admin/superadmin/finance-tracker?${params.toString()}`;
  }, [year, month, category, type]); //[cite: 1]

  const { data, loading, error, reload } = useSuperAdminFetch(buildUrl(), { deps: [buildUrl] }); //[cite: 1]

  const [showModal, setShowModal] = useState(false); //[cite: 1]
  const [formData, setFormData] = useState(EMPTY_FORM); //[cite: 1]
  const [saving, setSaving] = useState(false); //[cite: 1]

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM, transaction_date: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  }; //[cite: 1]

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proof_file') {
      setFormData((prev) => ({ ...prev, proof_file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }; //[cite: 1]

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', formData.type);
      fd.append('category', formData.category);
      fd.append('amount', formData.amount);
      fd.append('description', formData.description);
      fd.append('transaction_date', formData.transaction_date);
      if (formData.proof_file) fd.append('proof_file', formData.proof_file);

      const res = await API.post('/admin/superadmin/finance-tracker', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }); //[cite: 1]

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data?.message || 'Catatan keuangan berhasil disimpan.',
        timer: 2000,
        showConfirmButton: false,
      }); //[cite: 1]
      setShowModal(false);
      reload();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || 'Gagal menyimpan catatan keuangan!',
        confirmButtonColor: '#B38E5D',
      }); //[cite: 1]
    } finally {
      setSaving(false);
    }
  }; //[cite: 1]

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: 'Hapus Catatan?',
      text: `Catatan ${CATEGORY_LABELS[record.category] || record.category} sebesar ${formatRupiah(record.amount)} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#B38E5D',
    }); //[cite: 1]
    if (!result.isConfirmed) return; //[cite: 1]

    try {
      await API.delete(`/admin/superadmin/finance-tracker/${record.id}`); //[cite: 1]
      Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Catatan keuangan berhasil dihapus.', timer: 2000, showConfirmButton: false }); //[cite: 1]
      reload(); //[cite: 1]
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus catatan keuangan!', confirmButtonColor: '#B38E5D' }); //[cite: 1]
    }
  }; //[cite: 1]

  // Reset Filter
  const handleResetFilter = () => {
    setYear(new Date().getFullYear());
    setMonth('');
    setCategory('');
    setType('');
    setSearchQuery('');
  };

  const summary = data?.data?.summary || {}; //[cite: 1]
  const records = data?.data?.records || []; //[cite: 1]

  // Filter tambahan berdasarkan kata kunci pencarian (Search Bar)
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase();
    return records.filter((r) => {
      const descMatch = r.description?.toLowerCase().includes(query);
      const amountMatch = String(r.amount).includes(query);
      return descMatch || amountMatch;
    });
  }, [records, searchQuery]);

  // Transformasi Data Rekam Transaksi Menjadi Data Kurva Tren (Diurutkan berdasarkan Tanggal)
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    const dateGroup = {};

    records.forEach((rec) => {
      const dateKey = rec.transaction_date;
      if (!dateGroup[dateKey]) {
        dateGroup[dateKey] = { date: dateKey, Pemasukan: 0, Pengeluaran: 0 };
      }
      if (rec.type === 'income') {
        dateGroup[dateKey].Pemasukan += Number(rec.amount);
      } else if (rec.type === 'expense') {
        dateGroup[dateKey].Pengeluaran += Number(rec.amount);
      }
    });

    return Object.values(dateGroup).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [records]);

  const filterClass =
    'border border-[#D7C4B0] p-2.5 rounded-xl bg-[#FAF5EF] text-xs font-bold text-[#261C19] focus:outline-none focus:ring-2 focus:ring-[#B38E5D] transition'; //[cite: 1]

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-[#B38E5D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#5C4A42] text-sm font-bold uppercase tracking-widest">Memuat Keuangan...</p>
      </div>
    ); //[cite: 1]
  }

  if (error) {
    return (
      <div className="bg-white border border-[#D7C4B0] p-10 text-center rounded-2xl shadow-sm">
        <p className="text-rose-600 font-bold text-sm mb-3">Gagal memuat data keuangan.</p>
        <button onClick={reload} className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-xs font-bold cursor-pointer">
          🔄 Coba Lagi
        </button>
      </div>
    ); //[cite: 1]
  }

  return (
    <div className="space-y-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#D7C4B0] shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pemasukan</p>
          <h3 className="text-2xl font-black text-emerald-600">{formatRupiah(summary.total_income)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#D7C4B0] shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pengeluaran</p>
          <h3 className="text-2xl font-black text-rose-500">{formatRupiah(summary.total_expense)}</h3>
        </div>
        <div className="bg-[#261C19] text-white p-5 rounded-2xl border border-[#3D2D29] shadow-lg">
          <p className="text-xs font-bold text-[#D7C4B0] uppercase tracking-wider mb-1">Saldo (Net)</p>
          <h3 className="text-2xl font-black text-[#FAF5EF]">{formatRupiah(summary.balance)}</h3>
        </div>
      </div>

      {/* GRAFIK KURVA TREN KEUANGAN */}
      <div className="bg-white rounded-2xl border border-[#D7C4B0] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-[#261C19] text-base">Grafik Tren Arus Kas</h3>
            <p className="text-xs text-slate-500 font-medium">Visualisasi perbandingan Pemasukan vs Pengeluaran platform</p>
          </div>
          <span className="text-[10px] font-extrabold px-3 py-1 bg-[#FAF5EF] text-[#B38E5D] border border-[#D7C4B0] rounded-full uppercase tracking-wider">
            Live Analytics
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#D7C4B0]/60 rounded-xl bg-[#FAF5EF]/30">
            <p className="text-xs font-bold text-slate-400">Belum ada data grafik untuk periode ini.</p>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) => {
                    const d = new Date(str + 'T00:00:00');
                    return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
                  }}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                  axisLine={{ stroke: '#D7C4B0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="Pemasukan"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* FILTER + ACTION + TABEL TRANSAKSI */}
      <div className="bg-white rounded-2xl border border-[#D7C4B0] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="font-bold text-[#261C19]">Finance Tracker Superadmin</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Daftar rincian riwayat arus kas platform</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#B38E5D] hover:bg-[#8F6E45] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer"
          >
            ➕ Tambah Catatan
          </button>
        </div>

        {/* COMPACT INTERACTIVE FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6 bg-[#FAF5EF]/50 p-4 rounded-2xl border border-[#D7C4B0]/60">
          {/* SEARCH INPUT */}
          <div className="sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="🔍 Cari deskripsi / nominal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#D7C4B0] p-2.5 rounded-xl bg-white text-xs font-medium text-[#261C19] focus:outline-none focus:ring-2 focus:ring-[#B38E5D] transition"
            />
          </div>

          <select value={year} onChange={(e) => setYear(e.target.value)} className={filterClass}>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select value={month} onChange={(e) => setMonth(e.target.value)} className={filterClass}>
            <option value="">Semua Bulan</option>
            {[
              ['1', 'Januari'], ['2', 'Februari'], ['3', 'Maret'], ['4', 'April'],
              ['5', 'Mei'], ['6', 'Juni'], ['7', 'Juli'], ['8', 'Agustus'],
              ['9', 'September'], ['10', 'Oktober'], ['11', 'November'], ['12', 'Desember'],
            ].map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className={filterClass}>
            <option value="">Semua Kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <select value={type} onChange={(e) => setType(e.target.value)} className={`${filterClass} flex-1`}>
              <option value="">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>

            <button
              onClick={handleResetFilter}
              title="Reset Filter"
              className="px-3 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              🔄
            </button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <p className="text-center py-12 text-xs text-slate-400 font-bold">
            Tidak ada catatan keuangan yang sesuai dengan pencarian atau filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-[#D7C4B0]">
                  <th className="py-3 pr-4">Tanggal</th>
                  <th className="py-3 pr-4">Tipe</th>
                  <th className="py-3 pr-4">Kategori</th>
                  <th className="py-3 pr-4">Deskripsi</th>
                  <th className="py-3 pr-4 text-right">Jumlah</th>
                  <th className="py-3 pr-4">Bukti</th>
                  <th className="py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-[#FAF5EF]/40 transition">
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-600 font-bold">
                      {new Date(record.transaction_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          record.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {record.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${CATEGORY_BADGES[record.category] || CATEGORY_BADGES.other}`}>
                        {CATEGORY_LABELS[record.category] || record.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 max-w-[220px] truncate">{record.description || '-'}</td>
                    <td className={`py-3 pr-4 text-right font-black ${record.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {record.type === 'income' ? '+' : '-'}{formatRupiah(record.amount)}
                    </td>
                    <td className="py-3 pr-4">
                      {record.proof_file ? (
                        <a
                          href={formatAvatar(`/storage/${record.proof_file}`)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#B38E5D] hover:underline"
                        >
                          📎 Lihat
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(record)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH CATATAN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#D7C4B0] overflow-hidden">
            <div className="bg-[#261C19] text-white p-5 flex justify-between items-center border-b border-[#3D2D29]">
              <h3 className="font-bold text-base font-serif tracking-wide">Tambah Catatan Keuangan</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tipe</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm bg-white">
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border p-2.5 rounded-xl text-sm bg-white">
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min={0}
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  name="transaction_date"
                  required
                  value={formData.transaction_date}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Deskripsi</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Cth: Gaji admin, sewa server, dll."
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Bukti (Opsional)</label>
                <input
                  type="file"
                  name="proof_file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full text-xs text-slate-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-xs uppercase text-slate-600 cursor-pointer hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-[#B38E5D] hover:bg-[#8F6E45] text-white font-bold text-xs uppercase shadow-md cursor-pointer disabled:opacity-50 transition"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}