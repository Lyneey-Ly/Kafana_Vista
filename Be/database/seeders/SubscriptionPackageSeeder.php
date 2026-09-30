<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPackage;

class SubscriptionPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'slug' => 'monthly',
                'key_id' => 'monthly',
                'name' => 'Paket Bulanan',
                'subtitle' => 'Akses fleksibel tanpa komitmen jangka panjang',
                'price' => 50000,
                'period' => '/ bulan',
                'duration_days' => 30,
                'badge' => null,
                'savings_text' => null,
                'is_popular' => false,
                'features' => [
                    'Akses Tanpa Batas Finance Tracker',
                    'Randomizer Makan & Resep Hemat Kost',
                    'Kalkulator Survival & Budget Planner',
                    'Game Launcher Hub Premium Access',
                    'Music Dashboard Stream Quality High',
                    'Dukungan Prioritas 24/7',
                ],
                'is_active' => true,
            ],
            [
                'slug' => 'yearly',
                'key_id' => 'yearly',
                'name' => 'Paket Tahunan',
                'subtitle' => 'Pilihan paling populer bagi pengguna hemat',
                'price' => 500000,
                'period' => '/ tahun',
                'duration_days' => 365,
                'badge' => 'Hemat 17%',
                'savings_text' => 'Hemat Rp 100.000 dibanding bulanan',
                'is_popular' => true,
                'features' => [
                    'Semua Fitur Paket Bulanan',
                    'Bonus 2 Bulan Gratis',
                    'Ekspor Laporan Keuangan ke PDF/Excel',
                    'Kustomisasi Tema Dashboard Premium',
                    'Prioritas Pertama Verifikasi Transaksi',
                    'Bebas Iklan Sepenuhnya',
                ],
                'is_active' => true,
            ],
            [
                'slug' => 'lifetime',
                'key_id' => 'lifetime',
                'name' => 'Paket Lifetime',
                'subtitle' => 'Bayar sekali untuk akses seumur hidup',
                'price' => 1200000,
                'period' => 'sekali bayar',
                'duration_days' => 36500,
                'badge' => 'Best Value',
                'savings_text' => 'Akses selamanya tanpa biaya tambahan',
                'is_popular' => false,
                'features' => [
                    'Semua Fitur Paket Tahunan',
                    'Akses Selamanya Tanpa Batas',
                    'Akses Dini Fitur Baru (Beta Tester)',
                    'Lencana Eksklusif Founder Member',
                    'Sesi Konsultasi Finansial Kost 1-on-1',
                    'Jaminan Tanpa Kenaikan Harga',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            SubscriptionPackage::updateOrCreate(
                ['slug' => $pkg['slug']],
                $pkg
            );
        }
    }
}
