<?php

namespace App\Services;

use App\Models\DokumenSewa;
use App\Models\Pemesanan;
use App\Models\Properti;
use Carbon\Carbon;

class LeaseAgreementService
{
    /**
     * Format Rupiah: 1500000 => Rp 1.500.000
     */
    public static function formatRupiah($amount): string
    {
        return 'Rp ' . number_format((float) $amount, 0, ',', '.');
    }

    /**
     * Format tanggal Indonesia: 2026-09-27 => 27 September 2026
     */
    public static function formatTanggalIndo($date): string
    {
        if (empty($date)) return '-';
        try {
            return Carbon::parse($date)->locale('id')->translatedFormat('d F Y');
        } catch (\Exception $e) {
            return Carbon::parse($date)->format('d-m-Y');
        }
    }

    /**
     * Parser utama: replace semua placeholder {TAG} dengan data riil.
     */
    public static function parse(?string $template, ?Properti $properti = null, ?Pemesanan $pemesanan = null, ?DokumenSewa $dokumen = null, ?string $nomorKamarOverride = null): string
    {
        if (empty($template)) return '';

        // Resolve properti via pemesanan/dokumen jika tidak direct
        if (!$properti && $pemesanan && $pemesanan->properti) {
            $properti = $pemesanan->properti;
        }
        if (!$properti && $dokumen && $dokumen->pemesanan && $dokumen->pemesanan->properti) {
            $properti = $dokumen->pemesanan->properti;
        }

        // Resolve pemesanan via dokumen
        if (!$pemesanan && $dokumen && $dokumen->pemesanan) {
            $pemesanan = $dokumen->pemesanan;
        }

        // Values
        $namaProperti   = $properti->title ?? $properti->nama_properti ?? '-';
        $alamatProperti = $properti->address ?? $properti->alamat ?? '-';
        $hargaSewa      = self::formatRupiah($properti->price_per_month ?? $pemesanan->total_price ?? 0);

        // Fasilitas gabungan
        $fasilitas = $properti->facilities ?? '-';
        if (!empty($properti->public_facilities)) {
            $fasilitas .= ', ' . $properti->public_facilities;
        } elseif (!empty($properti->fasilitas_bersama)) {
            $fasilitas .= ', ' . $properti->fasilitas_bersama;
        }

        $aturan = $properti->rules ?? $properti->aturan ?? $properti->aturan_kos ?? '-';

        // Nomor kamar
        $nomorKamar = $nomorKamarOverride;
        if (!$nomorKamar) {
            $nomorKamar = $pemesanan->kamar->nomor_kamar ?? $pemesanan->kamar->nama_kamar ?? $dokumen->pemesanan->kamar->nomor_kamar ?? '-';
        }
        if ($nomorKamar === '-' && $pemesanan && !empty($pemesanan->kamar_id)) {
            // fallback sudah handled
        }

        $durasi = $pemesanan ? ($pemesanan->duration_months . ' Bulan') : '-';
        $namaPenyewa = $pemesanan->customer->name ?? $dokumen->pemesanan->customer->name ?? '-';

        $tglMulai = self::formatTanggalIndo($dokumen->start_date ?? $pemesanan->check_in_date ?? null);
        $tglSelesai = self::formatTanggalIndo($dokumen->end_date ?? null);

        // Jika dokumen end_date belum ada tapi pemesanan ada, hitung dari check_in + duration
        if ($tglSelesai === '-' && $pemesanan && $pemesanan->check_in_date && $pemesanan->duration_months) {
            try {
                $start = Carbon::parse($pemesanan->check_in_date);
                $end = $start->copy()->addMonths((int)$pemesanan->duration_months);
                $tglSelesai = self::formatTanggalIndo($end);
                // Jika tglMulai masih '-', hitung juga
                if ($tglMulai === '-') {
                    $tglMulai = self::formatTanggalIndo($start);
                }
            } catch (\Exception $e) {}
        }
        // Jika tglMulai masih '-' tapi dokumen punya start_date
        if ($tglMulai === '-' && $dokumen && $dokumen->start_date) {
            $tglMulai = self::formatTanggalIndo($dokumen->start_date);
        }

        $replacements = [
            '{NAMA_PROPERTI}'   => $namaProperti,
            '{ALAMAT_PROPERTI}' => $alamatProperti,
            '{HARGA_SEWA}'      => $hargaSewa,
            '{FASILITAS}'       => $fasilitas,
            '{ATURAN}'          => $aturan,
            '{NOMOR_KAMAR}'     => $nomorKamar,
            '{DURASI}'          => $durasi,
            '{NAMA_PENYEWA}'    => $namaPenyewa,
            '{TANGGAL_MULAI}'   => $tglMulai,
            '{TANGGAL_SELESAI}' => $tglSelesai,
        ];

        // Replace case-sensitive exact tag
        $result = strtr($template, $replacements);

        return $result;
    }

    /**
     * Cek apakah template masih mengandung placeholder yang belum ter-replace
     */
    public static function containsPlaceholder(?string $text): bool
    {
        if (empty($text)) return false;
        return preg_match('/\{[A-Z_]+\}/', $text) === 1;
    }
}
