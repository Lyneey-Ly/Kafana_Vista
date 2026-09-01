<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_advertisements', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            $table->string('status', 50)->default('pending')->after('is_active');
            $table->string('payment_status', 50)->default('pending')->after('status');
            $table->string('payment_method', 50)->nullable()->after('payment_status');
            $table->string('payment_proof')->nullable()->after('payment_method');
            $table->text('rejection_reason')->nullable()->after('payment_proof');
            $table->text('admin_notes')->nullable()->after('rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('vendor_advertisements', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['administrator_id']);
            $table->dropColumn([
                'user_id',
                'administrator_id',
                'status',
                'payment_status',
                'payment_method',
                'payment_proof',
                'rejection_reason',
                'admin_notes',
            ]);
        });
    }
};