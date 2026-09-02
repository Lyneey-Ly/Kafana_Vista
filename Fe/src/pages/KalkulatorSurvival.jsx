import React, { useState, useEffect, useMemo } from 'react';
import SidebarUser from '../components/SidebarUser'; 

import { 
  Wallet, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  Utensils, 
  Receipt, 
  Sparkles,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function KalkulatorSurvival() {
  // STATE MANAGEMENT INPUT
  const [balanceInput, setBalanceInput] = useState('500000'); // Default Rp 500.000
  const [billsInput, setBillsInput] = useState('100000'); // Default Rp 100.000
  const [remainingDays, setRemainingDays] = useState(10); // Default 10 Hari
  const [isAutoDate, setIsAutoDate] = useState(true);

  // 1. HELPER AUTO HITUNG SISA HARI AKHIR BULAN
  const calculateDaysLeftInMonth = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diffTime = lastDayOfMonth.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  useEffect(() => {
    if (isAutoDate) {
      setRemainingDays(calculateDaysLeftInMonth());
    }
  }, [isAutoDate]);

  // HELPER FORMAT & PARSE RUPIAH
  const formatRupiah = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const parseNumber = (formattedStr) => {
    return Number(String(formattedStr).replace(/[^0-9]/g, '')) || 0;
  };

  const handleCurrencyChange = (setter) => (e) => {
    const rawVal = parseNumber(e.target.value);
    setter(rawVal.toString());
  };

  // 2. FORMULASI KALKULASI FINANSIAL
  const rawBalance = parseNumber(balanceInput);
  const rawBills = parseNumber(billsInput);
  const days = Math.max(1, Number(remainingDays) || 1);

  // Rumus: Jatah Harian = (Sisa Saldo - Tagihan Wajib) / Sisa Hari
  const netMoney = Math.max(0, rawBalance - rawBills);
  const dailyBudget = Math.floor(netMoney / days);

  // 3. STATUS MODE SURVIVAL & LOGIKANYA
  const survivalStatus = useMemo(() => {
    if (netMoney <= 0) {
      return {
        mode: 'Kritis Ekstrem',
        color: 'red',
        bgCard: 'bg-rose-950/40 border-rose-600/60 text-rose-200',
        badgeBg: 'bg-rose-600 text-white',
        icon: AlertTriangle,
        message: 'DARURAT! Saldo bersih minus/nol setelah dipotong tagihan. Cari bantuan atau utang darurat!'
      };
    }

    if (dailyBudget > 35000) {
      return {
        mode: 'Aman',
        color: 'green',
        bgCard: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100',
        badgeBg: 'bg-emerald-500 text-slate-950',
        icon: ShieldCheck,
        message: 'Masih aman! Bisa jajan kopi kekinian 1-2 kali minggu ini tanpa takut krisis.'
      };
    } else if (dailyBudget >= 15000) {
      return {
        mode: 'Siaga',
        color: 'amber',
        bgCard: 'bg-amber-950/30 border-amber-500/40 text-amber-100',
        badgeBg: 'bg-amber-500 text-slate-950',
        icon: Info,
        message: 'Fokus Warteg & Masakan Rumah. Kurangi jajan boba dan order ojol berlebihan!'
      };
    } else {
      return {
        mode: 'Kritis / Survival Ekstrem',
        color: 'red',
        bgCard: 'bg-rose-950/40 border-rose-500/60 text-rose-100 animate-pulse',
        badgeBg: 'bg-rose-600 text-white',
        icon: AlertTriangle,
        message: 'DARURAT! Masak beras sendiri, stok telur & Indomie, hindari keluar rumah!'
      };
    }
  }, [dailyBudget, netMoney]);

  // 4. SIMULASI REKOMENDASI MENU HARIAN (DINAMIS SAMA BUDGET)
  const menuSimulasi = useMemo(() => {
    if (dailyBudget >= 40000) {
      return {
        pagi: 'Nasi Uduk Komplit / Lontong Sayur (Rp 10.000)',
        siang: 'Ayam Geprek + Es Teh Manis (Rp 18.000)',
        malam: 'Nasi Goreng / Kwetiau (Rp 15.000)',
        snack: 'Bisa jajan Kopi/Boba sisa kembalian'
      };
    } else if (dailyBudget >= 25000) {
      return {
        pagi: 'Bubur Ayam / Gorengan 3 pcs (Rp 8.000)',
        siang: 'Warteg (Nasi + Sayur + Telur Balado) (Rp 12.000)',
        malam: 'Mie Dogdog / Soto Ayam (Rp 10.000)',
        snack: 'Air putih hangat & sisa camilan'
      };
    } else if (dailyBudget >= 15000) {
      return {
        pagi: 'Roti Sobek / Masak Telur Ceplok (Rp 4.000)',
        siang: 'Warteg Opsi Hemat (Nasi + Orek Tempe + Sayur) (Rp 8.000)',
        malam: 'Indomie Goreng + Telur + Sawi (Rp 6.000)',
        snack: 'Puasa jajan manis'
      };
    } else {
      return {
        pagi: 'Masak Beras Sendiri + Kerupuk/Kecap (Rp 2.000)',
        siang: 'Nasi Magic Com + Telur Dadar Bagi Dua (Rp 5.000)',
        malam: 'Mie Instant Rebus Hemat (Rp 3.500)',
        snack: 'Perbanyak minum air putih hangat!'
      };
    }
  }, [dailyBudget]);

  const StatusIcon = survivalStatus.icon;

  return (
    <SidebarUser> 
    <div className="min-h-screen bg-[#FAF6F0] text-[#261C19] font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Fintech Survival Tool • Kafana Vista</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#261C19]">
            Kalkulator Survival <span className="text-[#C5A059]">Uang Saku</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            Hitung jatah belanja harian secara presisi untuk mencegah krisis tanggal tua anak kost.
          </p>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: FORM INPUT (DARK CHARCOAL CARD) */}
          <div className="lg:col-span-6 bg-[#261C19] text-[#FAF6F0] p-6 md:p-8 rounded-3xl border border-[#C5A059]/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-[#C5A059] flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Parameter Keuangan
              </h2>
              <span className="text-xs bg-[#C5A059]/20 text-[#C5A059] px-2.5 py-1 rounded-lg border border-[#C5A059]/30 font-semibold">
                Input Data
              </span>
            </div>

            <div className="space-y-4">
              {/* INPUT 1: SISA SALDO */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. Sisa Saldo / Uang Saku Saat Ini
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059] font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={formatRupiah(balanceInput)}
                    onChange={handleCurrencyChange(setBalanceInput)}
                    placeholder="0"
                    className="w-full bg-[#1A1311] border border-slate-700 focus:border-[#C5A059] rounded-2xl pl-12 pr-4 py-3 text-white font-extrabold text-lg outline-none transition"
                  />
                </div>
              </div>

              {/* INPUT 2: TAGIHAN WAJIB */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  2. Tagihan Wajib Mendatang (Listrik/Wifi/Kos)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={formatRupiah(billsInput)}
                    onChange={handleCurrencyChange(setBillsInput)}
                    placeholder="0"
                    className="w-full bg-[#1A1311] border border-slate-700 focus:border-rose-400 rounded-2xl pl-12 pr-4 py-3 text-white font-extrabold text-lg outline-none transition"
                  />
                </div>
              </div>

              {/* INPUT 3: SISA HARI & QUICK PICKER */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    3. Sisa Hari Bertahan Hidup
                  </label>
                  <span className="text-xs text-[#C5A059] font-bold">
                    {remainingDays} Hari Lagi
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    disabled={isAutoDate}
                    value={remainingDays}
                    onChange={(e) => setRemainingDays(e.target.value)}
                    className="w-full bg-[#1A1311] border border-slate-700 focus:border-[#C5A059] disabled:opacity-50 rounded-2xl px-4 py-2.5 text-white font-bold outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAutoDate(!isAutoDate)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                      isAutoDate 
                        ? 'bg-[#C5A059] text-[#261C19]' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAutoDate ? 'animate-spin' : ''}`} />
                    {isAutoDate ? 'Auto-Date (Aktif)' : 'Manual'}
                  </button>
                </div>

                {/* QUICK DATE PICKER BUTTONS */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'H-7 Akhir Bln', value: 7 },
                    { label: 'H-14 Akhir Bln', value: 14 },
                    { label: 'Hitung Otomatis', value: 'auto' }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (btn.value === 'auto') {
                          setIsAutoDate(true);
                          setRemainingDays(calculateDaysLeftInMonth());
                        } else {
                          setIsAutoDate(false);
                          setRemainingDays(btn.value);
                        }
                      }}
                      className="py-2 px-2 bg-[#1A1311] hover:bg-[#C5A059]/20 border border-slate-800 hover:border-[#C5A059] text-xs text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RINGKASAN NET SALDO */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
              <span>Bersih Setelah Tagihan:</span>
              <span className="font-bold text-[#C5A059] text-sm">
                Rp {formatRupiah(netMoney)}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULT & SURVIVAL STATUS */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* JATAH HARIAN HERO CARD */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#C5A059]" /> Hasil Jatah Belanja Harian
              </span>

              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl md:text-5xl font-black text-[#261C19]">
                  Rp {formatRupiah(dailyBudget)}
                </h3>
                <span className="text-slate-500 font-bold text-sm">/ Hari</span>
              </div>

              {/* DYNAMIC SURVIVAL STATUS BADGE & CARD */}
              <div className={`p-4 rounded-2xl border ${survivalStatus.bgCard} transition-all duration-300`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${survivalStatus.badgeBg}`}>
                    {survivalStatus.mode}
                  </span>
                  <StatusIcon className="w-5 h-5 shrink-0" />
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  {survivalStatus.message}
                </p>
              </div>
            </div>

            {/* SIMULASI MENU MIKRO RECOMMENDATION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-[#261C19] text-sm flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#C5A059]" /> Simulasi Alokasi Makan Harian
                </h4>
                <span className="text-[10px] bg-[#FAF6F0] text-[#C5A059] border border-[#C5A059]/40 font-bold px-2 py-0.5 rounded-full">
                  Rekomendasi
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-[#FAF6F0] rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500">🌅 Pagi:</span>
                  <span className="font-bold text-[#261C19] text-right">{menuSimulasi.pagi}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-[#FAF6F0] rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500">☀️ Siang:</span>
                  <span className="font-bold text-[#261C19] text-right">{menuSimulasi.siang}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-[#FAF6F0] rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500">🌙 Malam:</span>
                  <span className="font-bold text-[#261C19] text-right">{menuSimulasi.malam}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-[#261C19] text-[#C5A059] rounded-xl">
                  <span className="font-bold text-slate-300">🍿 Extra / Jajan:</span>
                  <span className="font-bold text-right">{menuSimulasi.snack}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
    </SidebarUser>
  );
}