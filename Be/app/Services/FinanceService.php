<?php

namespace App\Services;

use App\Models\SuperAdminFinance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FinanceService
{
    /**
     * Mencatat pemasukan otomatis ke Finance Tracker
     */
    public static function recordIncome($category, $amount, $description, $referenceId)
    {
        try {
            // Cek agar tidak ada duplikasi data dengan reference_id dan category yang sama
            $exists = SuperAdminFinance::where('category', $category)
                ->where('reference_id', $referenceId)
                ->where('is_system_generated', true)
                ->exists();

            if (!$exists && $amount > 0) {
                SuperAdminFinance::create([
                    'type'                => 'income',
                    'category'            => $category,
                    'amount'              => $amount,
                    'description'         => $description,
                    'transaction_date'    => Carbon::today()->toDateString(),
                    'is_system_generated' => true,
                    'reference_id'        => $referenceId,
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Gagal mencatat auto-income: " . $e->getMessage());
        }
    }

    /**
     * Menghapus pencatatan jika transaksi dibatalkan (Void)
     */
    public static function removeIncome($category, $referenceId)
    {
        SuperAdminFinance::where('category', $category)
            ->where('reference_id', $referenceId)
            ->where('is_system_generated', true)
            ->delete();
    }
}