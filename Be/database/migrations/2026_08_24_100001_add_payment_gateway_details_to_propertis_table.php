<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ditambahkolom bukti transaksi Midtrans Gateway (payment_status, transaction_id, order_id, payment_type)
     * dan perlu producti enum approval_status untuk dukung status 'waiting_verification' / 'pending'.
     */
    public function up(): void
    {
        if (Schema::hasTable('propertis')) {
            // 1. KOLOM BUKTI TRANSAKCJA GATEWAY
            foreach ([
                'payment_status'  => 'string',
                'transaction_id'  => 'string',
                'order_id'        => 'string',
                'payment_type'    => 'string',
            ] as $column => $type) {
                if (!Schema::hasColumn('propertis', $column)) {
                    Schema::table('propertis', function (Blueprint $table) use ($column, $type) {
                        $table->$type($column)->nullable()->after('payment_proof');
                    });
                }
            }

            // 2. PERLUAKSIE ENUM approval_status agar support waiting_verification / pending
            $col = DB::select("SHOW COLUMNS FROM propertis LIKE 'approval_status'");
            if (!empty($col)) {
                $columnType = $col[0]->Type;
                if (strpos($columnType, 'waiting_verification') === false) {
                    DB::statement("ALTER TABLE propertis MODIFY approval_status ENUM('pending_payment','active','rejected','waiting_verification','pending','pending_verification') DEFAULT 'active'");
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('propertis')) {
            if (Schema::hasColumn('propertis', 'payment_type')) {
                Schema::table('propertis', function (Blueprint $table) {
                    $table->dropColumn('payment_type');
                });
            }
            if (Schema::hasColumn('propertis', 'order_id')) {
                Schema::table('propertis', function (Blueprint $table) {
                    $table->dropColumn('order_id');
                });
            }
            if (Schema::hasColumn('propertis', 'transaction_id')) {
                Schema::table('propertis', function (Blueprint $table) {
                    $table->dropColumn('transaction_id');
                });
            }
            if (Schema::hasColumn('propertis', 'payment_status')) {
                Schema::table('propertis', function (Blueprint $table) {
                    $table->dropColumn('payment_status');
                });
            }
        }
    }
};