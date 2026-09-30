import React, { useState } from 'react';

// Data Daftar Properti (Kos Putra, Kos Putri, Kontrakan)
const DATA_PROPERTI = [
  {
    id: 'kos-putra-1',
    tipe: 'Kos Putra',
    nama: 'Kos Putra Barokah Standar',
    alamat: 'Jl. Sukabirus No. 42, Dayeuhkolot, Bandung',
    hargaPerBulan: 750000,
    gambar: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800',
    deskripsi: 'Kamar kos nyaman dan tenang, cocok untuk mahasiswa atau pekerja.',
    fasilitasKamar: ['Kasur (Spring Bed)', 'Lemari Pakaian', 'Meja & Kursi Belajar'],
    fasilitasBersama: ['Kamar Mandi Luar', 'Dapur Bersama', 'Area Parkir Motor']
  },
  {
    id: 'kos-putri-1',
    tipe: 'Kos Putri',
    nama: 'Kos Putri Mawar Asri',
    alamat: 'Jl. Sukabirus No. 15, Dayeuhkolot, Bandung',
    hargaPerBulan: 850000,
    gambar: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800',
    deskripsi: 'Kos khusus putri aman dengan gerbang auto-lock dan CCTV 24 jam.',
    fasilitasKamar: ['Kamar Mandi Dalam', 'AC', 'Kasur Spring Bed'],
    fasilitasBersama: ['Dapur Bersama', 'WiFi 100Mbps', 'Mesin Cuci']
  },
  {
    id: 'kontrakan-1',
    tipe: 'Kontrakan',
    nama: 'Kontrakan House 2 Kamar',
    alamat: 'Gg. PGA No. 8, Dayeuhkolot, Bandung',
    hargaPerBulan: 2500000,
    gambar: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800',
    deskripsi: 'Rumah kontrakan minimalis 1 lantai, cocok untuk sewa sekelompok teman.',
    fasilitasKamar: ['2 Kamar Tidur', 'Ruang Tamu Luas', 'Dapur Pribadi'],
    fasilitasBersama: ['Garasi Mobil', 'Air PDAM', 'Listrik PLN 1300W']
  }
];

function KatalogProperti({ onPilihProperti }) {
  const [filter, setFilter] = useState('Semua');

  // Filter properti berdasarkan kategori yang diklik
  const propertiFiltered = DATA_PROPERTI.filter((item) => {
    if (filter === 'Semua') return true;
    return item.tipe === filter;
  });

  return (
    <div className="max-w-full overflow-x-hidden bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Judul */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-bold text-gray-900 text-2xl sm:text-3xl lg:text-4xl mb-2">Pilih Hunian Impianmu</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Temukan Kos Putra, Kos Putri, atau Kontrakan sesuai kebutuhanmu</p>
        </div>

        {/* Tombol Filter Kategori */}
        <div className="flex justify-center gap-3 mb-8 sm:mb-10 flex-wrap">
          {['Semua', 'Kos Putra', 'Kos Putri', 'Kontrakan'].map((kat) => (
            <button
              key={kat}
              onClick={() => setFilter(kat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-colors duration-200 min-h-11 min-w-11 cursor-pointer ${
                filter === kat
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Grid Kartu Properti */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {propertiFiltered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between border border-gray-100"
            >
              <div>
                {/* Gambar Properti */}
                <div className="overflow-hidden">
                  <img src={item.gambar} alt={item.nama} className="w-full h-48 object-cover" />
                </div>

                {/* Detail Singkat */}
                <div className="p-4 sm:p-5">
                  <span className="text-amber-600 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
                    {item.tipe}
                  </span>
                  <h3 className="text-gray-900 font-semibold mt-1.5 mb-1 text-base sm:text-lg leading-tight">{item.nama}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 flex items-start gap-1">
                    <span aria-hidden>📍</span>
                    <span>{item.alamat}</span>
                  </p>
                  <div className="text-amber-600 text-lg sm:text-xl font-bold mb-1">
                    Rp {item.hargaPerBulan.toLocaleString('id-ID')} <span className="text-xs sm:text-sm font-normal text-gray-500">/ bulan</span>
                  </div>
                </div>
              </div>

              {/* Tombol Lihat Detail */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <button
                  onClick={() => onPilihProperti(item)}
                  className="w-full py-3.5 min-h-11 min-w-11 bg-white border border-amber-500 text-amber-600 rounded-xl font-bold text-xs sm:text-sm hover:bg-amber-50 active:bg-amber-100 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  Lihat Detail Kamar <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KatalogProperti;
