import React, { useState } from 'react';
import API from '../api';
import Swal from 'sweetalert2';

export default function CreatePlaylistModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', name);
    data.append('description', description);
    if (coverFile) {
      data.append('cover', coverFile);
    }

    try {
      await API.post('/playlists', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Playlist berhasil dibuat.',
        timer: 1500,
        showConfirmButton: false,
      });

      setName('');
      setDescription('');
      setCoverFile(null);
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuat Playlist',
        text: error.response?.data?.message || 'Terjadi kesalahan validasi data.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md text-white">
        <h3 className="text-xl font-bold mb-4">Buat Playlist Baru</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Nama Playlist</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Cth: Lagu Santai Malam"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Deskripsi (Opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Koleksi lagu favorit..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Foto Sampul Playlist (Opsional)</label>
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
              {loading ? 'Menyimpan...' : 'Buat Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}