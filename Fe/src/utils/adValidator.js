/**
 * Frontend validator untuk gambar iklan — mirror dari AdImageValidatorService (BE)
 * Validasi instan sebelum upload: mime, size, dimensi, rasio aspek
 */

export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a;
}

export function toRatioString(w, h) {
  const g = gcd(w, h);
  if (g === 0) return `${w}:${h}`;
  return `${w / g}:${h / g}`;
}

export function parseAspect(aspectStr) {
  if (!aspectStr) return null;
  const parts = aspectStr.split(':');
  if (parts.length !== 2) return null;
  const w = parseFloat(parts[0]);
  const h = parseFloat(parts[1]);
  if (!h || isNaN(w) || isNaN(h)) return null;
  return w / h;
}

/**
 * Load dimensions via Image() without uploading
 */
export function loadImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const res = { width: img.width, height: img.height };
      URL.revokeObjectURL(url);
      resolve(res);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memuat gambar. File mungkin rusak.'));
    };
    img.src = url;
  });
}

/**
 * Validate single file against a slot config (from GET /ad-slot-configs/{placement})
 * config shape: AdSlotConfig.toPublicArray()
 *
 * @returns {Promise<{valid: boolean, errors: string[], width?: number, height?: number, aspect?: number}>}
 */
export async function validateAdImage(file, config) {
  if (!config) {
    return { valid: false, errors: ['Konfigurasi slot tidak ditemukan.'] };
  }

  const errors = [];
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const extNorm = ext === 'jpeg' ? 'jpg' : ext;
  const mime = file.type;

  const allowedExts = (config.allowed_extensions || []).map(e => (e.toLowerCase() === 'jpeg' ? 'jpg' : e.toLowerCase()));
  const allowedMimes = config.allowed_mimes || [];

  const mimeOk = allowedMimes.includes(mime);
  const extOk = allowedExts.includes(extNorm) || allowedExts.includes(ext);

  if (!mimeOk || !extOk) {
    errors.push(`Format tidak didukung (${ext || 'unknown'}/${mime || 'unknown'}). Diperbolehkan: ${allowedExts.join(', ').toUpperCase()}.`);
  }

  const sizeKb = Math.ceil(file.size / 1024);
  if (sizeKb > config.max_file_size_kb) {
    errors.push(`Ukuran ${sizeKb}KB melebihi batas ${config.max_file_size_kb}KB (${config.max_file_size_mb}MB).`);
  }

  // Dimensions — async
  try {
    const { width, height } = await loadImageDimensions(file);

    if (config.is_strict_dimension) {
      if (width !== config.width || height !== config.height) {
        errors.push(`Dimensi harus tepat ${config.width}×${config.height}px, terdeteksi ${width}×${height}px.`);
      }
    } else {
      if (config.min_width && width < config.min_width) errors.push(`Lebar minimal ${config.min_width}px, terdeteksi ${width}px.`);
      if (config.min_height && height < config.min_height) errors.push(`Tinggi minimal ${config.min_height}px, terdeteksi ${height}px.`);
      if (config.max_width && width > config.max_width) errors.push(`Lebar maksimal ${config.max_width}px, terdeteksi ${width}px.`);
      if (config.max_height && height > config.max_height) errors.push(`Tinggi maksimal ${config.max_height}px, terdeteksi ${height}px.`);
    }

    if (config.aspect_ratio) {
      const expected = parseAspect(config.aspect_ratio);
      const tolerance = parseFloat(config.aspect_tolerance) || 0.05;
      if (expected) {
        const actual = height !== 0 ? width / height : 0;
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
          const actualStr = toRatioString(width, height);
          errors.push(`Rasio harus ${config.aspect_ratio} (toleransi ±${Math.round(tolerance*100)}%), terdeteksi ${actualStr} (${width}×${height}). Gunakan crop.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      width, height,
      aspect: height !== 0 ? width / height : null,
      mime, sizeKb,
    };
  } catch (e) {
    errors.push(e.message || 'Gagal membaca dimensi gambar.');
    return { valid: false, errors, mime, sizeKb };
  }
}

/**
 * Validate batch (parallel)
 */
export async function validateAdImages(files, config) {
  const results = await Promise.all(files.map(f => validateAdImage(f, config)));
  const allValid = results.every(r => r.valid);
  return { allValid, results };
}

/**
 * Helper: create cropped file from canvas (used by cropper)
 * Returns File object
 */
export async function getCroppedFile(imageSrc, croppedAreaPixels, originalFile, outputType) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const mimeType = outputType || originalFile.type || 'image/jpeg';
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Gagal membuat file crop.'));
      const base = originalFile.name.replace(/\.[^/.]+$/, '');
      const file = new File([blob], `${base}_cropped.${ext}`, { type: mimeType });
      resolve(file);
    }, mimeType, 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}
