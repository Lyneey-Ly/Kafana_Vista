import React, { useState, useMemo } from 'react';
import useSuperAdminFetch from '../../hooks/useSuperAdminFetch';
import { formatRupiah } from '../../utils/format';

export default function RevenueAnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'table'
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const { data, loading, error, reload } = useSuperAdminFetch(
    `/admin/superadmin/revenue-analytics?year=${year}`,
    { deps: [year] }
  );

  const d = data?.data || data || {};
  const breakdown = d.income_breakdown || d.breakdown || d.income || {};

  // Extraction nilai dengan fallback lengkap agar tidak tertulis 0 jika nama key backend beda
  const premiumRevenue = Number(
    breakdown.total_premium_revenue ??
    breakdown.total_premium ??
    breakdown.premium_revenue ??
    breakdown.premium ??
    d.total_premium_revenue ??
    d.premium_revenue ??
    0
  );

  const listingRevenue = Number(
    breakdown.total_listing_revenue ??
    breakdown.total_listing_fee ??
    breakdown.listing_fee_revenue ??
    breakdown.total_slot_revenue ??
    breakdown.slot_revenue ??
    breakdown.total_listing ??
    breakdown.listing ??
    0
  );

  const vendorAdRevenue = Number(
    breakdown.total_vendor_ad_revenue ??
    breakdown.total_vendor_ad ??
    breakdown.vendor_ad_revenue ??
    breakdown.total_ads ??
    breakdown.ads ??
    0
  );

  const manualRevenue = Number(
    breakdown.total_manual_income ??
    breakdown.total_manual ??
    breakdown.manual_income ??
    breakdown.manual ??
    0
  );

  const activePremiumUsers =
    d.premium_info?.active_premium_users ??
    d.premium_info?.active_users ??
    d.premium_info?.total_users ??
    d.active_premium_users ??
    d.premium_users_count ??
    0;

  const totalSubscriptions =
    d.premium_info?.total_subscriptions ??
    d.premium_info?.total ??
    d.total_subscriptions ??
    0;

  const totalListings =
    d.listing_info?.total_listings ??
    d.listing_info?.total_slots ??
    d.listing_info?.active_listings ??
    d.total_listings ??
    d.listing_count ??
    0;

  // Sumber Pendapatan Aktif Platform Kavana
  const incomeSources = useMemo(() => {
    return [
      {
        id: 'premium',
        label: 'Akun Premium (Langganan)',
        value: premiumRevenue,
        icon: '👑',
        color: '#B38E5D',
        badgeBg: 'bg-[#B38E5D]/10 text-[#B38E5D] border-[#B38E5D]/30',
        note: `${activePremiumUsers} user premium aktif · ${totalSubscriptions} langganan`,
      },
      {
        id: 'listing_fee',
        label: 'Listing Fee / Slot Properti',
        value: listingRevenue,
        icon: '🏠',
        color: '#10B981',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        note: `${totalListings} slot / listing properti terbayar`,
      },
      {
        id: 'vendor_ad',
        label: 'Iklan Vendor (Banner)',
        value: vendorAdRevenue,
        icon: '📢',
        color: '#3B82F6',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        note: `${d.ad_info?.active_ads ?? d.active_ads ?? 0} iklan aktif jalan`,
      },
      {
        id: 'manual',
        label: 'Pemasukan Manual (Tracker)',
        value: manualRevenue,
        icon: '📥',
        color: '#8B5CF6',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        note: 'Pemasukan internal Finance Tracker',
      },
    ];
  }, [
    premiumRevenue,
    listingRevenue,
    vendorAdRevenue,
    manualRevenue,
    activePremiumUsers,
    totalSubscriptions,
    totalListings,
    d,
  ]);

  // Total Gross Income & Persentase Sumber Pendapatan
  const grossIncome = d.total_gross_income ?? (premiumRevenue + listingRevenue + vendorAdRevenue + manualRevenue);
  const totalExpenses = d.total_expenses || 0;
  const netProfit = d.net_profit ?? (grossIncome - totalExpenses);

  // Margin Laba
  const profitMargin = useMemo(() => {
    if (!grossIncome || grossIncome <= 0) return 0;
    return ((netProfit / grossIncome) * 100).toFixed(1);
  }, [grossIncome, netProfit]);

  // Transformasi Data Bulanan untuk Grafik Kurva Tren
  const monthlyTrends = useMemo(() => {
    const raw = d.monthly_trends || d.monthly_data || d.monthly || [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return monthNames.map((mName, idx) => {
      const monthNum = idx + 1;
      const found = raw.find(
        (item) =>
          item.month === monthNum ||
          item.month_num === monthNum ||
          item.month_name === mName ||
          item.month === mName
      );

      return {
        month: mName,
        gross: Number(found?.gross || found?.gross_income || found?.pendapatan || 0),
        expense: Number(found?.expense || found?.expenses || found?.pengeluaran || 0),
        net: Number(found?.net || found?.net_profit || found?.laba || 0),
      };
    });
  }, [d]);

  // Kalkulasi Titik Koordinat Grafik Kurva SVG
  const maxTrendVal = useMemo(() => {
    const maxVal = Math.max(
      ...monthlyTrends.map((m) => Math.max(m.gross, m.expense, m.net)),
      1000000
    );
    return maxVal * 1.15;
  }, [monthlyTrends]);

  const svgChartPath = useMemo(() => {
    const width = 800;
    const height = 240;
    const padding = 20;

    const getX = (index) => padding + (index * (width - padding * 2)) / (monthlyTrends.length - 1);
    const getY = (val) => height - padding - (val / maxTrendVal) * (height - padding * 2);

    const grossPoints = monthlyTrends.map((m, i) => `${getX(i)},${getY(m.gross)}`).join(' L ');
    const expensePoints = monthlyTrends.map((m, i) => `${getX(i)},${getY(m.expense)}`).join(' L ');
    const netPoints = monthlyTrends.map((m, i) => `${getX(i)},${getY(m.net)}`).join(' L ');

    const grossArea = `M ${getX(0)},${height - padding} L ${grossPoints} L ${getX(
      monthlyTrends.length - 1
    )},${height - padding} Z`;

    return {
      width,
      height,
      padding,
      getX,
      getY,
      grossPath: `M ${grossPoints}`,
      expensePath: `M ${expensePoints}`,
      netPath: `M ${netPoints}`,
      grossArea,
    };
  }, [monthlyTrends, maxTrendVal]);

  // --- LOADING SKELETON ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-3xl border border-[#D7C4B0] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-6 w-64 bg-[#FAF5EF] rounded-md"></div>
            <div className="h-3 w-96 bg-[#FAF5EF] rounded-md"></div>
          </div>
          <div className="h-10 w-32 bg-[#FAF5EF] rounded-xl border border-[#D7C4B0]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-3xl border border-[#D7C4B0] p-5 flex flex-col justify-between">
              <div className="h-4 w-24 bg-[#FAF5EF] rounded-md"></div>
              <div className="h-8 w-40 bg-[#FAF5EF] rounded-md"></div>
              <div className="h-3 w-28 bg-[#FAF5EF] rounded-md"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-3xl border border-[#D7C4B0] p-6"></div>
          <div className="h-96 bg-white rounded-3xl border border-[#D7C4B0] p-6"></div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="bg-white border border-[#D7C4B0] p-12 text-center rounded-3xl shadow-xs max-w-xl mx-auto my-10">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-rose-200">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-[#261C19] mb-1">Gagal Memuat Analitik</h3>
        <p className="text-xs text-slate-500 mb-6">
          Terjadi kesalahan saat mengunduh data keuangan platform. Pastikan koneksi server berjalan lancar.
        </p>
        <button
          onClick={reload}
          className="px-6 py-2.5 bg-[#261C19] hover:bg-[#B38E5D] text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
        >
          🔄 Muat Ulang Analitik
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER CONTROL BAR */}
      <div className="bg-white rounded-3xl border border-[#D7C4B0] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h1 className="text-xl font-black text-[#261C19] tracking-tight">Analitik Pendapatan Platform</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B38E5D]/15 text-[#261C19] border border-[#B38E5D]/40">
              Kavana Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas kotor, pengeluaran, margin laba, dan langganan premium secara real-time ({year}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#FAF5EF] p-1 rounded-xl border border-[#D7C4B0]">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'chart'
                  ? 'bg-[#261C19] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#261C19]'
              }`}
            >
              📈 Grafik Trend
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'table'
                  ? 'bg-[#261C19] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#261C19]'
              }`}
            >
              📋 Tabel Rincian
            </button>
          </div>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-[#D7C4B0] px-4 py-2 rounded-xl bg-[#FAF5EF] text-xs font-bold text-[#261C19] hover:border-[#B38E5D] focus:outline-none focus:ring-2 focus:ring-[#B38E5D]/20 cursor-pointer shadow-xs transition"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#261C19] text-white p-6 rounded-3xl border border-[#3D2D29] shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B38E5D]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-[#D7C4B0] uppercase tracking-wider">Pendapatan Kotor</span>
              <span className="w-8 h-8 rounded-xl bg-[#B38E5D]/20 border border-[#B38E5D]/40 text-[#B38E5D] flex items-center justify-center text-sm">
                💰
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">{formatRupiah(grossIncome)}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-[#3D2D29] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total Pemasukan</span>
            <span className="text-[#B38E5D] font-bold">100% Volume</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#D7C4B0] shadow-xs flex flex-col justify-between hover:border-rose-300 transition">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
              <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-sm">
                💸
              </span>
            </div>
            <h3 className="text-2xl font-black text-rose-600 tracking-tight">{formatRupiah(totalExpenses)}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Beban Operasional</span>
            <span className="text-rose-500 font-bold">
              {grossIncome > 0 ? ((totalExpenses / grossIncome) * 100).toFixed(1) : 0}% Rasio
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FAF5EF] to-white p-6 rounded-3xl border border-[#D7C4B0] shadow-xs flex flex-col justify-between hover:border-[#B38E5D] transition">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Laba Bersih</span>
              <span className="w-8 h-8 rounded-xl bg-[#B38E5D]/15 border border-[#B38E5D]/30 text-[#B38E5D] flex items-center justify-center text-sm">
                📈
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#261C19] tracking-tight">{formatRupiah(netProfit)}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D7C4B0]/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Keuntungan Netto</span>
            <span className="text-emerald-600 font-extrabold">Net Value</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#D7C4B0] shadow-xs flex flex-col justify-between hover:border-[#B38E5D] transition">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Margin Keuntungan</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-sm">
                🎯
              </span>
            </div>
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{profitMargin}%</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Efisiensi Profit</span>
            <span className="text-slate-600 font-bold">{profitMargin > 20 ? 'Sangat Sehat' : 'Normal'}</span>
          </div>
        </div>
      </div>

      {/* 3. RINCIAN 4 SUMBER PENDAPATAN */}
      <div className="bg-white rounded-3xl border border-[#D7C4B0] p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-[#261C19] text-base">Rincian Sumber Pendapatan</h2>
            <p className="text-xs text-slate-500">Breakdown 4 pilar pemasukan platform Kavana</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#B38E5D] bg-[#FAF5EF] px-3 py-1 rounded-full border border-[#D7C4B0]">
            4 Sources Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {incomeSources.map((source) => {
            const percent = grossIncome > 0 ? ((source.value / grossIncome) * 100).toFixed(1) : 0;

            return (
              <div
                key={source.id}
                className="border border-[#D7C4B0] p-5 rounded-2xl bg-[#FAF5EF]/30 hover:bg-white hover:shadow-md transition group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#D7C4B0] shadow-xs flex items-center justify-center text-2xl group-hover:scale-105 transition">
                    {source.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${source.badgeBg}`}>
                    {percent}% Contribution
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{source.label}</p>
                <h4 className="text-xl font-black text-[#261C19] mt-1">{formatRupiah(source.value)}</h4>

                <div className="w-full bg-slate-100 rounded-full h-1.5 my-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: source.color }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">{source.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. GRAFIK KEUANGAN & DISTRIBUSI PENDAPATAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D7C4B0] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-[#261C19] text-base">Kurva Tren Keuangan Bulanan</h2>
              <p className="text-xs text-slate-500">
                Perbandingan Pendapatan Kotor, Pengeluaran, dan Laba Bersih ({year})
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#B38E5D]"></span>
                <span className="text-slate-600">Kotor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Pengeluaran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#261C19]"></span>
                <span className="text-slate-600">Laba Bersih</span>
              </div>
            </div>
          </div>

          {activeTab === 'chart' ? (
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgChartPath.width} ${svgChartPath.height}`}
                className="w-full h-auto min-w-[600px] overflow-visible"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y =
                    svgChartPath.padding +
                    ratio * (svgChartPath.height - svgChartPath.padding * 2);
                  return (
                    <line
                      key={idx}
                      x1={svgChartPath.padding}
                      y1={y}
                      x2={svgChartPath.width - svgChartPath.padding}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                <defs>
                  <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B38E5D" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#B38E5D" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={svgChartPath.grossArea} fill="url(#grossGradient)" />

                <path
                  d={svgChartPath.grossPath}
                  fill="none"
                  stroke="#B38E5D"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d={svgChartPath.expensePath}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                />
                <path
                  d={svgChartPath.netPath}
                  fill="none"
                  stroke="#261C19"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {monthlyTrends.map((m, idx) => {
                  const x = svgChartPath.getX(idx);
                  const yGross = svgChartPath.getY(m.gross);
                  const isHovered = hoveredMonth === idx;

                  return (
                    <g
                      key={m.month}
                      className="cursor-pointer transition"
                      onMouseEnter={() => setHoveredMonth(idx)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {isHovered && (
                        <line
                          x1={x}
                          y1={svgChartPath.padding}
                          x2={x}
                          y2={svgChartPath.height - svgChartPath.padding}
                          stroke="#261C19"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}

                      <circle
                        cx={x}
                        cy={yGross}
                        r={isHovered ? 6 : 4}
                        fill="#B38E5D"
                        stroke="#261C19"
                        strokeWidth={isHovered ? 2 : 1}
                      />

                      <text
                        x={x}
                        y={svgChartPath.height - 2}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        fill={isHovered ? '#261C19' : '#64748B'}
                      >
                        {m.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredMonth !== null && (
                <div className="absolute top-2 right-4 bg-[#261C19] text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 border border-[#B38E5D]/40 backdrop-blur-md">
                  <p className="font-bold text-[#B38E5D] border-b border-[#3D2D29] pb-1">
                    Bulan: {monthlyTrends[hoveredMonth].month} {year}
                  </p>
                  <p className="text-slate-200">
                    Kotor:{' '}
                    <span className="font-bold text-white">
                      {formatRupiah(monthlyTrends[hoveredMonth].gross)}
                    </span>
                  </p>
                  <p className="text-rose-300">
                    Pengeluaran:{' '}
                    <span className="font-bold">
                      {formatRupiah(monthlyTrends[hoveredMonth].expense)}
                    </span>
                  </p>
                  <p className="text-emerald-400">
                    Laba Bersih:{' '}
                    <span className="font-bold">
                      {formatRupiah(monthlyTrends[hoveredMonth].net)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#FAF5EF] text-slate-500 font-bold border-b border-[#D7C4B0] uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Bulan</th>
                    <th className="px-4 py-3">Pendapatan Kotor</th>
                    <th className="px-4 py-3">Pengeluaran</th>
                    <th className="px-4 py-3">Laba Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyTrends.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-[#261C19]">{m.month}</td>
                      <td className="px-4 py-3 font-semibold text-[#B38E5D]">{formatRupiah(m.gross)}</td>
                      <td className="px-4 py-3 text-rose-600">{formatRupiah(m.expense)}</td>
                      <td className="px-4 py-3 font-extrabold text-[#261C19]">{formatRupiah(m.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT 1 COL: Distribution Bar */}
        <div className="bg-white rounded-3xl border border-[#D7C4B0] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-[#261C19] text-base mb-1">Distribusi Pemasukan</h2>
            <p className="text-xs text-slate-500 mb-6">Proporsi kontribusi pendapatan platform</p>

            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex mb-6 border border-[#D7C4B0]/50">
              {incomeSources.map((source) => {
                const percent = grossIncome > 0 ? (source.value / grossIncome) * 100 : 0;
                if (percent <= 0) return null;
                return (
                  <div
                    key={source.id}
                    style={{ width: `${percent}%`, backgroundColor: source.color }}
                    className="h-full transition-all duration-500"
                    title={`${source.label}: ${percent.toFixed(1)}%`}
                  ></div>
                );
              })}
            </div>

            <div className="space-y-4">
              {incomeSources.map((source) => {
                const percent = grossIncome > 0 ? ((source.value / grossIncome) * 100).toFixed(1) : 0;

                return (
                  <div key={source.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-md shadow-xs"
                        style={{ backgroundColor: source.color }}
                      ></span>
                      <span className="font-bold text-[#261C19]">{source.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#261C19]">{formatRupiah(source.value)}</p>
                      <p className="text-[10px] text-slate-400">{percent}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#D7C4B0]/50 bg-[#FAF5EF] p-4 rounded-2xl border border-[#D7C4B0]">
            <p className="text-[11px] text-[#261C19] font-bold">💡 Catatan Keuangan</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Pendapatan Akun Premium dan Slot Properti terakumulasi secara otomatis dari transaksi pembayaran yang telah sukses diproses.
            </p>
          </div>
        </div>
      </div>

      {/* 5. INFORMASI METRIK PLATFORM */}
      <div className="bg-white rounded-3xl border border-[#D7C4B0] p-6 shadow-xs">
        <h2 className="font-bold text-[#261C19] text-base mb-4">Informasi Merek &amp; Konfigurasi Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="border border-[#D7C4B0] p-5 rounded-2xl bg-[#FAF5EF]/40">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Slot / Listing Properti Active
            </span>
            <p className="font-black text-[#10B981] text-2xl mt-1">
              {totalListings} Slot
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total slot / fee iklan terbayar</p>
          </div>

          <div className="border border-[#D7C4B0] p-5 rounded-2xl bg-[#FAF5EF]/40">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pendapatan Listing Properti
            </span>
            <p className="font-black text-[#261C19] text-2xl mt-1">
              {formatRupiah(listingRevenue)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Total dari biaya pasang slot/listing
            </p>
          </div>

          <div className="border border-[#D7C4B0] p-5 rounded-2xl bg-[#FAF5EF]/40">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Langganan Akun Premium Aktif
            </span>
            <p className="font-black text-[#B38E5D] text-2xl mt-1">
              {activePremiumUsers} Member
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Status keanggotaan aktif periode ini</p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-[#261C19] text-white flex justify-between items-center flex-wrap gap-3">
          <p className="text-xs text-slate-300">
            ⚙️ Atur tarif slot listing &amp; harga paket langganan premium di menu <b>Pengaturan Website</b>.
          </p>
          <span className="text-[11px] font-mono font-bold text-[#B38E5D] bg-[#FAF5EF]/10 px-3 py-1 rounded-xl border border-[#B38E5D]/30">
            Kavana Superadmin Panel
          </span>
        </div>
      </div>
    </div>
  );
}