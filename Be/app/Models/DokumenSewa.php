<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DokumenSewa extends Model
{
    use HasFactory;

    protected $table = 'dokumen_sewas';

    protected $fillable = [
    'pemesanan_id',
    'start_date',
    'end_date',
    'lease_agreement',
    'customer_signature',
    'admin_signature',
    'status',
    'signed_at',
    'template_perjanjian', // Tambahkan kolom ini
    ];

    // Relasi balik ke Pemesanan
    public function pemesanan()
    {
        return $this->belongsTo(Pemesanan::class, 'pemesanan_id');
    }

    /**
     * Accessor fallback: parsed lease_agreement jika masih mengandung placeholder.
     * Tidak overwrite kolom asli, hanya untuk response API jika dipanggil.
     */
    public function getLeaseAgreementParsedAttribute(): string
    {
        $raw = $this->lease_agreement ?? '';
        if (empty($raw)) return '';
        // Jika masih ada placeholder, parse otomatis
        if (\App\Services\LeaseAgreementService::containsPlaceholder($raw)) {
            // Ensure relasi ter-load untuk parsing optimal
            if (!$this->relationLoaded('pemesanan')) {
                $this->loadMissing(['pemesanan.customer', 'pemesanan.properti', 'pemesanan.kamar']);
            }
            $properti = $this->pemesanan?->properti;
            return \App\Services\LeaseAgreementService::parse($raw, $properti, $this->pemesanan, $this);
        }
        return $raw;
    }
}