import React, { useState } from 'react';
import API from '../api'; // Sesuaikan dengan instance axios kamu
import Swal from 'sweetalert2';

export default function UploadTrackModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' atau 'url'
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    audio_url: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);

    if (uploadType === 'file' && audioFile) {
      data.append('audio', audioFile);
    } else {
      data.append('audio_url', formData.audio_url);
    }

    if (coverFile) {
      data.append('cover', coverFile);
    }

    try {
      await API.post('/tracks', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Lagu berhasil ditambahkan ke library.',
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengunggah lagu.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md text-white">
        <h3 className="text-xl font-bold mb-4">Tambah Lagu Baru</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Judul Lagu</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Cth: Boomerang"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Penyanyi / Artist</label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Cth: NIKI"
            />
          </div>

          {/* Opsi Tipe Input Audio */}
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={uploadType === 'file'}
                onChange={() => setUploadType('file')}
              />
              Upload MP3
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={uploadType === 'url'}
                onChange={() => setUploadType('url')}
              />
              URL Audio External
            </label>
          </div>

          {uploadType === 'file' ? (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">File Audio (.mp3, .wav)</label>
              <input
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Link Direct Audio URL</label>
              <input
                type="url"
                required
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Foto Cover Album (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded text-xs transition"
            >
              {loading ? 'Mengunggah...' : 'Simpan Lagu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}