<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vendor_advertisements', function (Blueprint $table) {
            $table->foreignId('administrator_id')
                ->nullable()
                ->after('user_id')
                ->constrained('administrators')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_advertisements', function (Blueprint $table) {
            $table->dropForeign(['administrator_id']);
            $table->dropColumn('administrator_id');
        });
    }
};