import React from 'react';

export default function PremiumGuard({ isPremium, children }) {
  if (isPremium) {
    return children;
  }

  return (
    <div className="relative border-2 border-dashed border-amber-300 rounded-2xl p-8 bg-amber-50/40 text-center overflow-hidden shadow-xs">
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-3 border border-amber-200 shadow-xs">
          🔒
        </div>
        <h4 className="font-bold text-[#261C19] text-base">Fitur Khusus Member Premium</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          Konten atau fitur ini terkunci. Silakan tingkatkan keanggotaan kamu untuk membuka akses.
        </p>
        <button 
          onClick={() => alert('Arahkan ke halaman pembayaran / upgrade')}
          className="px-5 py-2.5 bg-[#B38E5D] hover:bg-[#8c6d43] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-2"
        >
          ⭐ Upgrade Ke Premium
        </button>
      </div>
    </div>
  );
}