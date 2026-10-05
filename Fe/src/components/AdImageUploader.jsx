import { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, X, Crop, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { validateAdImages } from '../utils/adValidator';
import AdCropperModal from './AdCropperModal';

/**
 * Dynamic Ad Image Uploader
 * - Menampilkan guidelines sesuai slot config
 * - Validasi instan (mime, size, dimensi, rasio)
 * - Live preview + error per file
 * - Integrasi cropper jika rasio salah
 *
 * Props:
 * - placement: string
 * - config: AdSlotConfig | null
 * - files: File[]
 * - onChange: (files: File[], results: ValidateResult[]) => void
 * - maxFiles?: number (default 5)
 * - disabled?: boolean
 */
export default function AdImageUploader({ placement, config, files = [], onChange, maxFiles = 5, disabled = false }) {
  const [previews, setPreviews] = useState([]); // {url, file, result}
  const [validating, setValidating] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropIndex, setCropIndex] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);

  // Generate previews & validate whenever files/config changes
  useEffect(() => {
    let cancelled = false;
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    setValidating(true);
    const urls = files.map(f => URL.createObjectURL(f));

    const run = async () => {
      if (!config) {
        // Tanpa config, hanya preview tanpa validasi ketat
        if (!cancelled) {
          setPreviews(files.map((f, i) => ({
            url: urls[i],
            file: f,
            result: { valid: true, errors: [], width: null, height: null },
          })));
          setValidating(false);
        }
        return;
      }
      const { results } = await validateAdImages(files, config);
      if (!cancelled) {
        setPreviews(files.map((f, i) => ({
          url: urls[i],
          file: f,
          result: results[i],
        })));
        setValidating(false);
        // propagate results to parent
        onChange?.(files, results);
      }
    };
    run();

    return () => {
      cancelled = true;
      urls.forEach(u => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, config, placement]);

  const handleFileInput = useCallback(async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const combined = [...files, ...selected].slice(0, maxFiles);
    // Trigger parent update; validation will run via useEffect
    onChange?.(combined, []);
    e.target.value = '';
  }, [files, maxFiles, onChange]);

  const handleRemove = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    onChange?.(next, []);
  };

  const handleCrop = (idx) => {
    setCropFile(files[idx]);
    setCropIndex(idx);
    setCropOpen(true);
  };

  const handleCropped = (croppedFile) => {
    const next = [...files];
    next[cropIndex] = croppedFile;
    onChange?.(next, []);
    setCropOpen(false);
    setCropFile(null);
    setCropIndex(null);
  };

  if (!config) {
    return (
      <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-400" />
        <p className="text-xs text-slate-500 mt-2">Memuat aturan gambar untuk slot <span className="font-bold">{placement}</span>...</p>
        <input type="file" accept="image/*" multiple onChange={handleFileInput} disabled className="mt-3 text-xs" />
      </div>
    );
  }

  const hasErrors = previews.some(p => !p.result.valid);

  return (
    <div className="space-y-3">
      {/* Guidelines Card — dynamic */}
      <div className="bg-[#FAF5EF] border border-[#D7C4B0] rounded-xl p-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#2D2321] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#B38E5D]" />
          Syarat Gambar — {config.label}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="bg-white rounded-lg border border-[#D7C4B0] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Format</p>
            <p className="text-xs font-bold text-[#2D2321] mt-1">{config.allowed_extensions.join('/').toUpperCase()}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#D7C4B0] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Dimensi Ideal</p>
            <p className="text-xs font-bold text-[#2D2321] mt-1">{config.width}×{config.height}px</p>
            <p className="text-[9px] text-slate-500">{config.min_width && config.min_height ? `Min ${config.min_width}×${config.min_height}` : '—'}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#D7C4B0] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Rasio</p>
            <p className="text-xs font-bold text-[#2D2321] mt-1">{config.aspect_ratio}</p>
            <p className="text-[9px] text-slate-500">±{Math.round((config.aspect_tolerance)*100)}% toleransi</p>
          </div>
          <div className="bg-white rounded-lg border border-[#D7C4B0] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Max Size</p>
            <p className="text-xs font-bold text-[#2D2321] mt-1">{config.max_file_size_mb} MB</p>
            <p className="text-[9px] text-slate-500">{config.max_file_size_kb} KB</p>
          </div>
        </div>
        {config.description && <p className="text-[11px] text-slate-500 mt-2">{config.description}</p>}
        {config.is_strict_dimension && <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">⚠️ Slot ini mewajibkan dimensi <b>tepat</b> {config.width}×{config.height}px (tidak boleh lebih/kurang).</p>}
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((p, idx) => (
            <div key={idx} className={`relative rounded-xl overflow-hidden border-2 ${p.result.valid ? 'border-emerald-200' : 'border-rose-200'} bg-white group`}>
              {/* Image */}
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                <img src={p.url} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
              </div>
              {/* Info bar */}
              <div className="px-2.5 py-2 space-y-1">
                <p className="text-[11px] font-medium text-slate-700 truncate">{p.file.name}</p>
                <p className="text-[10px] text-slate-500">
                  {p.result.width && p.result.height ? `${p.result.width}×${p.result.height} • ${Math.ceil(p.file.size/1024)}KB • ${p.file.type.split('/')[1]}` : `${Math.ceil(p.file.size/1024)}KB`}
                </p>
                {p.result.valid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                      <AlertCircle className="w-3 h-3" /> Tidak valid
                    </span>
                    <ul className="text-[10px] text-rose-600 leading-snug list-disc list-inside">
                      {p.result.errors.map((err, ei) => <li key={ei}>{err}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              {/* Actions */}
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                {!p.result.valid && p.result.errors.some(e => e.toLowerCase().includes('rasio') || e.toLowerCase().includes('dimensi')) && (
                  <button
                    type="button"
                    onClick={() => handleCrop(idx)}
                    className="w-7 h-7 bg-[#B38E5D] text-white rounded-full flex items-center justify-center hover:bg-[#8F6E45] shadow"
                    title="Crop untuk perbaiki rasio"
                  >
                    <Crop className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black"
                  title="Hapus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {validating && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#B38E5D]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload control */}
      <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${hasErrors ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300 bg-white hover:border-[#B38E5D] hover:bg-[#FAF5EF]/50'}`}>
        <ImageIcon className={`w-8 h-8 mx-auto ${hasErrors ? 'text-rose-300' : 'text-slate-300'}`} />
        <p className="text-xs font-bold text-slate-700 mt-2">
          {previews.length >= maxFiles ? `Maksimal ${maxFiles} gambar tercapai` : 'Klik atau tarik file ke sini'}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Format: {config.allowed_extensions.join(', ').toUpperCase()} • Rasio {config.aspect_ratio} • Max {config.max_file_size_mb}MB per file • Ideal {config.width}×{config.height}px
        </p>
        <input
          type="file"
          accept={config.allowed_extensions.map(e => `.${e}`).join(',') + ',' + config.allowed_mimes.join(',')}
          multiple
          onChange={handleFileInput}
          disabled={disabled || previews.length >= maxFiles || validating}
          className="mt-3 w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#FAF5EF] file:text-[#B38E5D] hover:file:bg-[#F0E6DA] disabled:opacity-50 cursor-pointer"
        />
        {hasErrors && <p className="text-[11px] text-rose-600 mt-2 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Ada gambar yang tidak valid. Crop atau hapus sebelum melanjutkan.</p>}
      </div>

      {/* Cropper modal */}
      <AdCropperModal
        open={cropOpen}
        file={cropFile}
        config={config}
        onClose={() => { setCropOpen(false); setCropFile(null); }}
        onCropped={handleCropped}
      />
    </div>
  );
}
