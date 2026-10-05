import { useState, useEffect } from 'react';
import API from '../../api';
import Swal from 'sweetalert2';
import { Pencil, Trash2, Plus, Save, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';

const emptyForm = {
  placement: '',
  label: '',
  description: '',
  width: 1200,
  height: 400,
  min_width: 1200,
  min_height: 400,
  max_width: 2400,
  max_height: 800,
  aspect_ratio: '3:1',
  aspect_tolerance: 0.05,
  allowed_extensions: ['jpg','jpeg','png','webp'],
  allowed_mimes: ['image/jpeg','image/png','image/webp'],
  max_file_size_kb: 2048,
  is_strict_dimension: false,
  is_active: true,
  sort_order: 0,
};

export default function AdSlotConfigs() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/ad-slot-configs');
      setConfigs(res.data?.data || []);
    } catch (err) {
      // fallback public
      try {
        const res2 = await API.get('/ad-slot-configs');
        setConfigs(res2.data?.data || []);
      } catch (e) {
        console.error(e);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const startEdit = (cfg) => {
    setEditing(cfg.id);
    setForm({
      placement: cfg.placement,
      label: cfg.label,
      description: cfg.description || '',
      width: cfg.width,
      height: cfg.height,
      min_width: cfg.min_width ?? '',
      min_height: cfg.min_height ?? '',
      max_width: cfg.max_width ?? '',
      max_height: cfg.max_height ?? '',
      aspect_ratio: cfg.aspect_ratio || '',
      aspect_tolerance: cfg.aspect_tolerance ?? 0.05,
      allowed_extensions: cfg.allowed_extensions || [],
      allowed_mimes: cfg.allowed_mimes || [],
      max_file_size_kb: cfg.max_file_size_kb,
      is_strict_dimension: !!cfg.is_strict_dimension,
      is_active: !!cfg.is_active,
      sort_order: cfg.sort_order ?? 0,
    });
  };

  const startCreate = () => {
    setEditing('new');
    setForm({ ...emptyForm, placement: '', label: '' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'allowed_extensions' || name === 'allowed_mimes') {
      const arr = value.split(',').map(s => s.trim()).filter(Boolean);
      setForm(prev => ({ ...prev, [name]: arr }));
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    // normalize empty min/max to null
    const payload = {
      ...form,
      min_width: form.min_width === '' ? null : Number(form.min_width),
      min_height: form.min_height === '' ? null : Number(form.min_height),
      max_width: form.max_width === '' ? null : Number(form.max_width),
      max_height: form.max_height === '' ? null : Number(form.max_height),
      width: Number(form.width),
      height: Number(form.height),
      max_file_size_kb: Number(form.max_file_size_kb),
      aspect_tolerance: Number(form.aspect_tolerance),
      sort_order: Number(form.sort_order),
    };
    if (!payload.placement || !payload.label) {
      Swal.fire('Validasi', 'Placement dan label wajib diisi', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        await API.post('/admin/ad-slot-configs', payload);
        Swal.fire('Berhasil', 'Slot berhasil dibuat', 'success');
      } else {
        await API.put(`/admin/ad-slot-configs/${editing}`, payload);
        Swal.fire('Berhasil', 'Slot diperbarui', 'success');
      }
      setEditing(null);
      fetchConfigs();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : err.message;
      Swal.fire('Gagal', msg, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, placement) => {
    const res = await Swal.fire({
      title: `Hapus slot ${placement}?`,
      text: 'Data akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await API.delete(`/admin/ad-slot-configs/${id}`);
      Swal.fire('Terhapus', 'Slot dihapus', 'success');
      fetchConfigs();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || err.message, 'error');
    }
  };

  if (loading) return <div className="p-8 flex items-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /> Memuat konfigurasi slot...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2D2321] flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#B38E5D]" /> Kelola Slot Iklan (Image Rules)</h1>
          <p className="text-xs text-slate-500 mt-1">Atur format, dimensi, rasio, dan max size per placement. Perubahan langsung mempengaruhi validasi Frontend & Backend.</p>
        </div>
        <button onClick={startCreate} className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-sm font-bold hover:bg-[#8F6E45] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Slot
        </button>
      </div>

      <div className="grid gap-4">
        {configs.map(cfg => (
          <div key={cfg.id} className="bg-white border border-[#D7C4B0] rounded-xl overflow-hidden">
            {editing === cfg.id ? (
              <div className="p-5 space-y-4">
                <h3 className="font-bold text-sm">Edit: {cfg.placement}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="text-xs font-bold">Placement* <input name="placement" value={form.placement} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="home_hero" /></label>
                  <label className="text-xs font-bold">Label* <input name="label" value={form.label} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Width* <input type="number" name="width" value={form.width} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Height* <input type="number" name="height" value={form.height} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Min W <input type="number" name="min_width" value={form.min_width} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Min H <input type="number" name="min_height" value={form.min_height} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Max W <input type="number" name="max_width" value={form.max_width} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Max H <input type="number" name="max_height" value={form.max_height} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Rasio (W:H) <input name="aspect_ratio" value={form.aspect_ratio} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="3:1" /></label>
                  <label className="text-xs font-bold">Toleransi <input type="number" step="0.01" name="aspect_tolerance" value={form.aspect_tolerance} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Max KB <input type="number" name="max_file_size_kb" value={form.max_file_size_kb} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                  <label className="text-xs font-bold">Sort <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                </div>
                <label className="text-xs font-bold block">Deskripsi <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                <label className="text-xs font-bold block">Extensions (koma) <input name="allowed_extensions" value={form.allowed_extensions.join(',')} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="jpg,jpeg,png,webp" /></label>
                <label className="text-xs font-bold block">Mimes (koma) <input name="allowed_mimes" value={form.allowed_mimes.join(',')} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="is_strict_dimension" checked={form.is_strict_dimension} onChange={handleChange} /> Strict dimensi</label>
                  <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Aktif</label>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold flex items-center gap-1"><X className="w-4 h-4" /> Batal</button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </div>
            ) : (
              <div className="p-5 flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#FAF5EF] border border-[#D7C4B0] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-[#B38E5D] text-center leading-tight">{cfg.aspect_ratio}<br />{cfg.width}×{cfg.height}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#2D2321]">{cfg.label} <span className="text-xs font-mono text-slate-400">({cfg.placement})</span> {cfg.is_active ? '' : <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Nonaktif</span>}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{cfg.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] bg-white border border-slate-200 rounded-full px-2 py-0.5">{cfg.allowed_extensions.join('/').toUpperCase()}</span>
                    <span className="text-[10px] bg-white border border-slate-200 rounded-full px-2 py-0.5">{cfg.width}×{cfg.height} • {cfg.aspect_ratio}</span>
                    <span className="text-[10px] bg-white border border-slate-200 rounded-full px-2 py-0.5">{cfg.max_file_size_kb}KB</span>
                    {cfg.is_strict_dimension && <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 rounded-full px-2 py-0.5">Strict</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => startEdit(cfg)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-50"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(cfg.id, cfg.placement)} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {editing === 'new' && (
          <div className="bg-white border-2 border-[#B38E5D] rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-[#B38E5D]" /> Tambah Slot Baru</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="text-xs font-bold">Placement* <input name="placement" value={form.placement} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="promo_top" /></label>
              <label className="text-xs font-bold">Label* <input name="label" value={form.label} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Width* <input type="number" name="width" value={form.width} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Height* <input type="number" name="height" value={form.height} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Min W <input type="number" name="min_width" value={form.min_width} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Min H <input type="number" name="min_height" value={form.min_height} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Max W <input type="number" name="max_width" value={form.max_width} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Max H <input type="number" name="max_height" value={form.max_height} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Rasio <input name="aspect_ratio" value={form.aspect_ratio} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Toleransi <input type="number" step="0.01" name="aspect_tolerance" value={form.aspect_tolerance} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Max KB <input type="number" name="max_file_size_kb" value={form.max_file_size_kb} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs font-bold">Sort <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
            </div>
            <label className="text-xs font-bold block">Deskripsi <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
            <label className="text-xs font-bold block">Extensions <input name="allowed_extensions" value={form.allowed_extensions.join(',')} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
            <label className="text-xs font-bold block">Mimes <input name="allowed_mimes" value={form.allowed_mimes.join(',')} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="is_strict_dimension" checked={form.is_strict_dimension} onChange={handleChange} /> Strict</label>
              <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Aktif</label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold flex items-center gap-1"><X className="w-4 h-4" /> Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#B38E5D] text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        )}

        {configs.length === 0 && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-amber-600" />
            <p className="text-sm font-bold text-amber-800 mt-2">Belum ada konfigurasi slot</p>
            <p className="text-xs text-amber-700 mt-1">Jalankan seeder atau tambah manual.</p>
          </div>
        )}
      </div>
    </div>
  );
}
