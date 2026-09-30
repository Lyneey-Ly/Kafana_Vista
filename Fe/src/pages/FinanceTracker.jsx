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

  // Fetch Status Premium User Real-time
  useEffect(() => {
    const fetchUserSubscriptionStatus = async () => {
      try {
        const localUserStr = localStorage.getItem('user');
        const localUser = localUserStr ? JSON.parse(localUserStr) : {};

        const res = await API.get('/subscriptions/my-subscription');
        const { is_premium, premium_until } = res.data;

        const updatedUser = {
          ...localUser,
          is_premium: is_premium,
          premium_until: premium_until
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Gagal memuat status langganan:', error);
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        }
      }
    };

    fetchUserSubscriptionStatus();
  }, []);

  // 3. FETCH DATA TRANSAKSI DARI BACKEND
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
      if (error.response?.status !== 403) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: 'Gagal memuat data dari server!',
          confirmButtonColor: '#B38E5D'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.is_premium) {
      fetchFinanceData();
    } else {
      setLoading(false);
    }
  }, [user, fetchFinanceData]);

  // 4. HANDLE INPUT, SUBMIT, & DELETE
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
        <PremiumGuard isPremium={user?.is_premium}>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* HEADER SECTION */}
            <header className="bg-white p-6 rounded-xl border border-[#D7C4B0] shadow-sm">
              <span className="font-sans text-xs font-bold text-[#B38E5D] uppercase tracking-widest block mb-1">
                Personal Assistant
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#261C19]">
                Tracker Keuangan Saya
              </h1>
              <p className="text-[#5C4A42] text-sm mt-1">
                Pantau uang masuk dan pengeluaran harianmu di sini biar budget bulanan dan bayar tagihan kost tetap aman terkendali.
              </p>
            </header>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#261C19] p-6 rounded-xl shadow-md border border-[#3D2D29] text-white">
                <p className="text-xs font-bold text-[#D7C4B0] uppercase tracking-wider mb-2">Saldo Saat Ini</p>
                <h3 className="text-2xl lg:text-3xl font-black text-[#FAF5EF]">{formatRupiah(summary.saldo)}</h3>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7C4B0]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Total Pemasukan
                </p>
                <h3 className="text-2xl lg:text-3xl font-black text-[#261C19]">{formatRupiah(summary.pemasukan)}</h3>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7C4B0]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Total Pengeluaran
                </p>
                <h3 className="text-2xl lg:text-3xl font-black text-[#261C19]">{formatRupiah(summary.pengeluaran)}</h3>
              </div>
            </div>

            {/* FORM & TABEL MUTASI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: FORM */}
              <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-[#D7C4B0]">
                <h2 className="text-lg font-bold text-[#261C19] mb-5 border-b border-slate-100 pb-3">Catat Transaksi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* TOGGLE TYPE */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: 'pemasukan' }))}
                      className={`py-3 min-h-11 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        formData.type === 'pemasukan'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: 'pengeluaran' }))}
                      className={`py-3 min-h-11 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        formData.type === 'pengeluaran'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase">Keterangan</label>
                    <input 
                      type="text" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      placeholder="Cth: Makan Siang" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase">Nominal (Rp)</label>
                    <input 
                      type="text" 
                      name="amount" 
                      value={formData.amount} 
                      onChange={handleChange} 
                      placeholder="Cth: 50.000" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]" 
                      required 
                    />
                  </div>

                  {formData.type === 'pengeluaran' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">Kategori Kebutuhan</label>
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]"
                      >
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
                    <input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-[#D7C4B0] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#B38E5D]" 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#B38E5D] hover:bg-[#8F6E45] text-white py-3 mt-2 text-xs font-bold uppercase tracking-widest rounded-lg transition shadow-md shadow-[#B38E5D]/20 cursor-pointer"
                  >
                    Simpan Transaksi
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: TABLE */}
              <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-[#D7C4B0] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-[#FAF5EF]/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-[#261C19]">Riwayat Mutasi</h2>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{transactions.length} Catatan</span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[640px] text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5 w-28">Tanggal</th>
                        <th className="px-4 py-3.5">Keterangan</th>
                        <th className="px-4 py-3.5 w-32">Kategori</th>
                        <th className="px-4 py-3.5 text-right w-36">Nominal</th>
                        <th className="px-4 py-3.5 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
                      ) : transactions.length > 0 ? transactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{trx.date}</td>
                          <td className="px-4 py-3.5 font-bold text-[#261C19]">{trx.description}</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium whitespace-nowrap">
                              {trx.category}
                            </span>
                          </td>
                          <td className={`px-4 py-3.5 font-bold text-right text-sm whitespace-nowrap ${trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.amount)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button 
                              onClick={() => handleDelete(trx.id)} 
                              title="Hapus" 
                              className="p-3 min-h-11 min-w-11 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
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
        </PremiumGuard>
      </div>
    </SidebarUser>
  );
}