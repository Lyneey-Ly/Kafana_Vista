<?php

namespace App\Services;

use App\Models\AdSlotConfig;
use Illuminate\Http\UploadedFile;

class AdImageValidatorService
{
    /**
     * Validate a single uploaded image against a placement config.
     *
     * @return array{valid: bool, errors: string[], width?: int, height?: int, aspect?: float, mime?: string, size_kb?: int}
     */
    public function validate(UploadedFile $file, string $placement): array
    {
        $config = AdSlotConfig::where('placement', $placement)->first();

        // Fallback to 'custom' if placement not found
        if (!$config) {
            $config = AdSlotConfig::where('placement', 'custom')->first();
        }

        if (!$config) {
            return [
                'valid' => false,
                'errors' => ["Konfigurasi untuk placement '{$placement}' tidak ditemukan. Hubungi admin."],
            ];
        }

        $errors = [];

        // 1. Mime & extension
        $mime = $file->getMimeType();
        $ext = strtolower($file->getClientOriginalExtension());
        // Normalize jpeg/jpg alias
        $extNormalized = $ext === 'jpeg' ? 'jpg' : $ext;

        $allowedMimes = $config->allowed_mimes ?? [];
        $allowedExts = array_map(fn($e) => strtolower($e) === 'jpeg' ? 'jpg' : strtolower($e), $config->allowed_extensions ?? []);

        // Allow both jpeg/jpg interchangeably
        $mimeOk = in_array($mime, $allowedMimes, true);
        $extOk = in_array($extNormalized, $allowedExts, true) || in_array($ext, $allowedExts, true);

        if (!$mimeOk || !$extOk) {
            $errors[] = "Format tidak didukung ({$ext}/{$mime}). Format yang diperbolehkan untuk '{$config->label}': " . implode(', ', $config->allowed_extensions) . ".";
        }

        // 2. File size
        $sizeKb = (int) ceil($file->getSize() / 1024);
        if ($sizeKb > $config->max_file_size_kb) {
            $errors[] = "Ukuran file {$sizeKb}KB melebihi batas {$config->max_file_size_kb}KB (" . round($config->max_file_size_kb/1024,2) . "MB) untuk '{$config->label}'.";
        }

        // 3. Dimensions & aspect ratio
        $imageInfo = @getimagesize($file->getPathname());
        if ($imageInfo === false) {
            $errors[] = "File bukan gambar valid atau rusak.";
            return [
                'valid' => empty($errors),
                'errors' => $errors,
                'mime' => $mime,
                'size_kb' => $sizeKb,
            ];
        }

        [$width, $height] = $imageInfo;

        // Strict dimension check
        if ($config->is_strict_dimension) {
            if ($width !== (int)$config->width || $height !== (int)$config->height) {
                $errors[] = "Dimensi harus tepat {$config->width}x{$config->height}px, terdeteksi {$width}x{$height}px.";
            }
        } else {
            // Tolerant: check min/max if set
            if ($config->min_width && $width < $config->min_width) {
                $errors[] = "Lebar minimal {$config->min_width}px, terdeteksi {$width}px.";
            }
            if ($config->min_height && $height < $config->min_height) {
                $errors[] = "Tinggi minimal {$config->min_height}px, terdeteksi {$height}px.";
            }
            if ($config->max_width && $width > $config->max_width) {
                $errors[] = "Lebar maksimal {$config->max_width}px, terdeteksi {$width}px.";
            }
            if ($config->max_height && $height > $config->max_height) {
                $errors[] = "Tinggi maksimal {$config->max_height}px, terdeteksi {$height}px.";
            }
        }

        // Aspect ratio check (always, even if strict=false, to catch wrong orientation)
        if ($config->aspect_ratio && $config->expected_aspect) {
            $actualAspect = $height != 0 ? $width / $height : 0;
            $expected = $config->expected_aspect;
            $tolerance = (float) $config->aspect_tolerance;
            $diff = abs($actualAspect - $expected);
            // also allow swapped? No, must match orientation
            if ($expected > 0 && $diff > $tolerance) {
                $actualRatio = $this->toRatioString($width, $height);
                $errors[] = "Rasio aspek harus {$config->aspect_ratio} (toleransi ±" . (int)($tolerance*100) . "%), terdeteksi {$actualRatio} ({$width}x{$height}). Silakan crop gambar.";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'width' => $width,
            'height' => $height,
            'aspect' => $height != 0 ? round($width / $height, 4) : null,
            'mime' => $mime,
            'size_kb' => $sizeKb,
        ];
    }

    /**
     * Validate multiple files at once, returns per-file results
     *
     * @param UploadedFile[] $files
     * @return array{all_valid: bool, results: array<int, array>}
     */
    public function validateBatch(array $files, string $placement): array
    {
        $results = [];
        $allValid = true;
        foreach ($files as $idx => $file) {
            $res = $this->validate($file, $placement);
            $results[$idx] = $res;
            if (!$res['valid']) $allValid = false;
        }
        return ['all_valid' => $allValid, 'results' => $results];
    }

    private function toRatioString(int $w, int $h): string
    {
        $gcd = $this->gcd($w, $h);
        if ($gcd === 0) return "{$w}:{$h}";
        return ($w / $gcd) . ':' . ($h / $gcd);
    }

    private function gcd(int $a, int $b): int
    {
        $a = abs($a); $b = abs($b);
        while ($b !== 0) { $t = $b; $b = $a % $b; $a = $t; }
        return $a;
    }
}
