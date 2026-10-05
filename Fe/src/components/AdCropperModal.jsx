import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getCroppedFile, parseAspect } from '../utils/adValidator';

/**
 * Modal cropper untuk menyesuaikan gambar ke rasio slot iklan
 * Props:
 * - open: boolean
 * - file: File (original)
 * - config: AdSlotConfig (untuk aspect_ratio)
 * - onClose: () => void
 * - onCropped: (croppedFile: File) => void
 */
export default function AdCropperModal({ open, file, config, onClose, onCropped }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const aspect = config ? parseAspect(config.aspect_ratio) || (config.width / config.height) : 16 / 9;
  const imageSrc = file ? URL.createObjectURL(file) : null;

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!file || !croppedAreaPixels || !imageSrc) return;
    setIsProcessing(true);
    try {
      const cropped = await getCroppedFile(imageSrc, croppedAreaPixels, file, file.type);
      onCropped(cropped);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#D7C4B0]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D7C4B0] flex items-center justify-between bg-[#FAF5EF]">
          <div>
            <h3 className="text-sm font-bold text-[#2D2321]">Potong Gambar — {config?.label || config?.placement || 'Crop'}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rasio target: <span className="font-bold text-[#B38E5D]">{config?.aspect_ratio || '-'}</span> ({config?.width}×{config?.height}px) • Toleransi ±{Math.round((config?.aspect_tolerance||0.05)*100)}%
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative w-full h-[380px] bg-[#1a1a1a]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 bg-[#FAF5EF] border-t border-[#D7C4B0] space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#B38E5D]"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); }}
              className="ml-2 text-xs font-bold text-slate-600 hover:text-[#B38E5D] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          <p className="text-[10px] text-slate-400">Geser & zoom agar objek penting di dalam area potong. Hasil crop akan disesuaikan ke rasio slot.</p>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">
              Batal
            </button>
            <button
              onClick={handleApply}
              disabled={isProcessing || !croppedAreaPixels}
              className="px-6 py-2.5 bg-[#B38E5D] text-white rounded-lg text-sm font-bold hover:bg-[#8F6E45] disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? 'Memproses...' : <><Check className="w-4 h-4" /> Terapkan Crop</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
