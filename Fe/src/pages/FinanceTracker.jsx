import { useState, useEffect, useCallback } from 'react';
import API from '../api'; 
import SidebarUser from '../components/SidebarUser'; 
import Swal from 'sweetalert2'; 
import PremiumGuard from '../components/PremiumGuard';

export default function FinanceTracker() {
  // State User
  const [user, setUser] = useState(null);
  
  // 1. STATE UNTUK DATA TRANSAKSI & SUMMARY
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0
  });
  const [loading, setLoading] = useState(true);

  // 2. STATE UNTUK FORM INPUT
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'pengeluaran',
    category: 'Makanan',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch Data Profile User yang Login
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Cek localStorage dulu jika tersimpan, atau panggil API me/user
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          const res = await API.get('/user'); // Adjust route user kamu
          setUser(res.data);
        }
      } catch (error) {
        console.error('Gagal memuat profil user:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // 🔌 3. FETCH DATA DARI BACKEND
  const fetchFinanceData = useCallback(async () => {
    try {
      const res = await API.get('/finance-tracker');
      const apiData = res.data.data;

      const mappedTransactions = apiData.mutasi.map((item) => ({
        id: item.id,
        date: item.date,
        description: item.description,
        category: item.category,
        type: item.type,
        amount: parseFloat(item.amount)
      }));

      setTransactions(mappedTransactions);
      setSummary({
        saldo: apiData.saldo_saat_ini,
        pemasukan: apiData.total_pemasukan,
        pengeluaran: apiData.total_pengeluaran
      });
    } catch (error) {
      console.error('Gagal mengambil data keuangan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: 'Gagal memuat data dari server!',
        confirmButtonColor: '#B38E5D'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // 🔌 4. HANDLE INPUT, SUBMIT, & DELETE
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      const rawValue = value.replace(/\D/g, '');
      const formattedValue = rawValue 
        ? new Intl.NumberFormat('id-ID').format(rawValue) 
        : '';

      setFormData((prev) => ({ ...prev, amount: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      return Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Lengkapi deskripsi dan nominal transaksi!',
        confirmButtonColor: '#B38E5D'
      });
    }

    try {
      const cleanAmount = Number(String(formData.amount).replace(/\./g, ''));

      const payload = {
        type: formData.type,
        description: formData.description,
        amount: cleanAmount,
        category: formData.type === 'pemasukan' ? 'Pemasukan' : formData.category,
        date: formData.date
      };

      const res = await API.post('/finance-tracker', payload);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data?.message || 'Transaksi berhasil dicatat!',
        timer: 2000,
        showConfirmButton: false
      });

      setFormData({
        description: '',
        amount: '',
        type: 'pengeluaran',
        category: 'Makanan',
        date: new Date().toISOString().split('T')[0]
      });

      fetchFinanceData();

    } catch (error) {
      console.error('Gagal menambah transaksi:', error);
      const errMsg = error.response?.data?.message || 'Gagal menyimpan transaksi!';
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: errMsg,
        confirmButtonColor: '#B38E5D'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Transaksi yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/finance-tracker/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          timer: 1500,
          showConfirmButton: false
        });
        fetchFinanceData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Gagal menghapus transaksi!',
          confirmButtonColor: '#B38E5D'
        });
      }
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <SidebarUser> 
      <div className="p-6 lg:p-8 w-full text-[#261C19] pb-12 font-sans min-h-screen">
        {/* Menggunakan state user.is_premium */}
        <PremiumGuard isPremium={user?.is_premium}>
          <div>
            {/* HEADER SECTION */}
            <header className="mb-8 bg-white p-6 rounded-xl border border-[#D7C4B0] shadow-sm">
              <span className="font-sans text-xs font-bold text-[#B38E5D] uppercase tracking-widest block mb-1">
                Personal Assistant
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-[#261C19]">
                Tracker Keuangan Saya
              </h1>
              <p className="text-[#5C4A42] text-sm mt-1">
                Pantau uang masuk dan pengeluaran harianmu di sini biar budget bulanan dan bayar tagihan kost tetap aman terkendali.
              </p>
            </header>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
              <div className="bg-[#261C19] p-6 rounded-xl shadow-lg border border-[#3D2D29] text-white relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-[#D7C4B0] uppercase tracking-wider mb-2">Saldo Saat Ini</p>
                  <h3 className="text-3xl lg:text-4xl font-black text-[#FAF5EF]">{formatRupiah(summary.saldo)}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7C4B0] flex flex-col justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Total Pemasukan
                </p>
                <h3 className="text-3xl lg:text-4xl font-black text-[#261C19]">{formatRupiah(summary.pemasukan)}</h3>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7C4B0] flex flex-col justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Total Pengeluaran
                </p>
                <h3 className="text-3xl lg:text-4xl font-black text-[#261C19]">{formatRupiah(summary.pengeluaran)}</h3>
              </div>
            </div>

            {/* FORM & TABEL MUTASI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-4 flex flex-col">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7C4B0] h-full flex flex-col justify-between">
                  <h2 className="text-lg font-bold text-[#261C19] mb-4 border-b border-slate-100 pb-3">Catat Transaksi</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                      <label className={`flex-1 text-center py-2.5 rounded border cursor-pointer font-bold text-xs uppercase tracking-widest transition-all ${formData.type === 'pemasukan' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        <input type="radio" name="type" value="pemasukan" checked={formData.type === 'pemasukan'} onChange={handleChange} className="hidden" />
                        Pemasukan
                      </label>
                      <label className={`flex-1 text-center py-2.5 rounded border cursor-pointer font-bold text-xs uppercase tracking-widest transition-all ${formData.type === 'pengeluaran' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        <input type="radio" name="type" value="pengeluaran" checked={formData.type === 'pengeluaran'} onChange={handleChange} className="hidden" />
                        Pengeluaran
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">Keterangan</label>
                      <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Cth: Makan Siang" className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]" required />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">Nominal (Rp)</label>
                      <input type="text" name="amount" value={formData.amount} onChange={handleChange} placeholder="Cth: 50.000" className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]" required />
                    </div>

                    {formData.type === 'pengeluaran' && (
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">Kategori Kebutuhan</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]">
                          <option value="Makanan">Makanan & Minuman</option>
                          <option value="Transportasi">Transportasi</option>
                          <option value="Tagihan Kost">Tagihan Kost / Kontrakan</option>
                          <option value="Kebutuhan">Kebutuhan Harian</option>
                          <option value="Hiburan">Hiburan & Jajan</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">Tanggal</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]" required />
                    </div>

                    <button type="submit" className="w-full bg-[#B38E5D] hover:bg-[#8F6E45] text-white py-3 mt-4 text-xs font-bold uppercase tracking-widest rounded transition shadow-md shadow-[#B38E5D]/20">
                      Simpan Transaksi
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border border-[#D7C4B0] overflow-hidden flex flex-col h-full min-h-[450px]">
                  <div className="px-6 py-4 border-b border-slate-100 bg-[#FAF5EF]/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#261C19]">Riwayat Mutasi</h2>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{transactions.length} Catatan</span>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5">Tanggal</th>
                          <th className="px-6 py-3.5">Keterangan</th>
                          <th className="px-6 py-3.5">Kategori</th>
                          <th className="px-6 py-3.5 text-right">Nominal</th>
                          <th className="px-6 py-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loading ? (
                          <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
                        ) : transactions.length > 0 ? transactions.map((trx) => (
                          <tr key={trx.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 text-slate-500">{trx.date}</td>
                            <td className="px-6 py-4 font-bold text-[#261C19]">{trx.description}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                {trx.category}
                              </span>
                            </td>
                            <td className={`px-6 py-4 font-bold text-right ${trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {trx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleDelete(trx.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition">
                                🗑️
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Belum ada transaksi.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PremiumGuard>
      </div>
    </SidebarUser>
  );
}