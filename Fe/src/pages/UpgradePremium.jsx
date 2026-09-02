import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpgradePremium() {
  const [packageType, setPackageType] = useState('monthly'); // 'monthly' | 'yearly'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mySubscription, setMySubscription] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Base URL API (sesuai setup Laravel kamu)
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Helper Ambil Token
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  // Fetch status langganan saat komponen dimuat
  useEffect(() => {
    fetchMySubscription();
  }, []);

  const fetchMySubscription = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/my-subscription`,
        getAuthHeader()
      );
      setMySubscription(response.data);
    } catch (err) {
      console.error('Gagal mengambil status subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Pilih File Gambar
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setFeedback({ type: 'error', text: 'File harus berupa gambar (JPG/PNG).' });
        return;
      }
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB Limit
        setFeedback({ type: 'error', text: 'Ukuran file maksimal 4MB.' });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setFeedback({ type: '', text: '' });
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFeedback({ type: 'error', text: 'Silakan upload bukti pembayaran terlebih dahulu.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    const formData = new FormData();
    formData.append('package_type', packageType);
    formData.append('proof_of_payment', file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/subscribe`,
        formData,
        getAuthHeader()
      );

      setFeedback({ type: 'success', text: response.data.message });
      setFile(null);
      setPreviewUrl(null);
      
      // Refresh status langganan
      fetchMySubscription();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal mengunggah bukti pembayaran.';
      setFeedback({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B38E5D]"></div>
      </div>
    );
  }

  const latestOrder = mySubscription?.latest_order;
  const isPending = latestOrder?.status === 'pending';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-amber-100 text-[#B38E5D] text-xs font-bold rounded-full uppercase tracking-wider">
          ⭐ Member Premium
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#261C19]">
          Tingkatkan Pengalaman Kamu
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Dapatkan akses penuh ke seluruh fitur eksklusif dengan berlangganan paket premium.
        </p>
      </div>

      {/* Jika User Memiliki Pengajuan yang Masih PENDING */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-amber-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
              ⏳
            </div>
            <div>
              <h3 className="font-bold text-base">Pembayaran Sedang Diverifikasi</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Pengajuan paket <span className="font-semibold uppercase">{latestOrder.package_type}</span> kamu sedang ditinjau oleh SuperAdmin. Mohon tunggu dalam 1x24 jam.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg uppercase">
            Status: Pending
          </span>
        </div>
      )}

      {/* Grid Utama: Pilih Paket & Form Upload */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        
        {/* Kolom 1: Pilihan Paket & Info Rekening */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#261C19]">1. Pilih Paket Langganan</h2>
          
          <div className="space-y-3">
            {/* Paket Bulanan */}
            <div
              onClick={() => setPackageType('monthly')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex justify-between items-center ${
                packageType === 'monthly'
                  ? 'border-[#B38E5D] bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <h3 className="font-bold text-[#261C19]">Paket Bulanan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Akses premium selama 30 hari</p>
                <p className="text-lg font-extrabold text-[#B38E5D] mt-2">
                  Rp 50.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </p>
              </div>
              <input
                type="radio"
                name="package"
                checked={packageType === 'monthly'}
                onChange={() => setPackageType('monthly')}
                className="w-5 h-5 accent-[#B38E5D]"
              />
            </div>

            {/* Paket Tahunan */}
            <div
              onClick={() => setPackageType('yearly')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex justify-between items-center relative overflow-hidden ${
                packageType === 'yearly'
                  ? 'border-[#B38E5D] bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="absolute top-0 right-0 bg-[#B38E5D] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                Hemat 17%
              </div>
              <div>
                <h3 className="font-bold text-[#261C19]">Paket Tahunan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Akses premium selama 365 hari</p>
                <p className="text-lg font-extrabold text-[#B38E5D] mt-2">
                  Rp 500.000 <span className="text-xs font-normal text-slate-400">/ tahun</span>
                </p>
              </div>
              <input
                type="radio"
                name="package"
                checked={packageType === 'yearly'}
                onChange={() => setPackageType('yearly')}
                className="w-5 h-5 accent-[#B38E5D]"
              />
            </div>
          </div>

          {/* Kotak Rekening Pembayaran */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transfer Ke Rekening Resmi:
            </h3>
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Bank BCA</p>
                <p className="font-mono text-base font-bold text-slate-800">123-456-7890</p>
                <p className="text-xs text-slate-500">a.n. PT Aplikasi Kost Premium</p>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText('1234567890')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition"
              >
                Salin
              </button>
            </div>
          </div>
        </div>

        {/* Kolom 2: Upload Bukti Bayar & Form */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#261C19]">2. Upload Bukti Transfer</h2>

          {feedback.text && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold ${
                feedback.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Box Upload / Preview */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/80 transition relative cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                disabled={isPending || submitting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Bukti Transfer"
                    className="max-h-48 mx-auto rounded-xl object-contain shadow-xs border border-slate-200"
                  />
                  <p className="text-xs text-slate-500">Klik untuk mengganti gambar</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 bg-amber-100 text-[#B38E5D] rounded-full flex items-center justify-center mx-auto text-xl">
                    📁
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    Klik atau tarik bukti transfer ke sini
                  </p>
                  <p className="text-xs text-slate-400">Format: JPG, PNG (Maks. 4MB)</p>
                </div>
              )}
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isPending || submitting || !file}
              className="w-full py-3.5 bg-[#B38E5D] hover:bg-[#8c6d43] text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengirim Bukti Bayar...</span>
                </>
              ) : (
                <span>Kirim Bukti Pembayaran</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}