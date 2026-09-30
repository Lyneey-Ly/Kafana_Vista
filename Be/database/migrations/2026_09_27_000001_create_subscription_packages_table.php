<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_packages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // monthly, yearly, lifetime, custom
            $table->string('key_id')->nullable()->unique(); // alias slug for compatibility
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('period'); // "/ bulan", "/ tahun", "sekali bayar"
            $table->integer('duration_days');
            $table->string('badge')->nullable(); // e.g. "Hemat 17%"
            $table->string('savings_text')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_packages');
    }
};
