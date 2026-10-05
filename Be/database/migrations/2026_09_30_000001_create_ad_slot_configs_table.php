<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ad_slot_configs', function (Blueprint $table) {
            $table->id();
            $table->string('placement')->unique(); // home_hero, sidebar, etc.
            $table->string('label');
            $table->string('description')->nullable();
            // dimensions
            $table->unsignedInteger('width');  // expected width px
            $table->unsignedInteger('height'); // expected height px
            $table->unsignedInteger('min_width')->nullable();
            $table->unsignedInteger('min_height')->nullable();
            $table->unsignedInteger('max_width')->nullable();
            $table->unsignedInteger('max_height')->nullable();
            $table->string('aspect_ratio')->nullable(); // e.g. "3:1", "1:1"
            $table->decimal('aspect_tolerance', 4, 3)->default(0.05); // 5%
            $table->json('allowed_extensions'); // ["jpg","jpeg","png","webp"]
            $table->json('allowed_mimes'); // ["image/jpeg","image/png","image/webp"]
            $table->unsignedInteger('max_file_size_kb'); // 2048 = 2MB
            $table->boolean('is_strict_dimension')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_slot_configs');
    }
};
