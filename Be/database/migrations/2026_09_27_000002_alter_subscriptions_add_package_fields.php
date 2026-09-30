<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add new columns if not exists
            if (!Schema::hasColumn('subscriptions', 'subscription_package_id')) {
                $table->foreignId('subscription_package_id')->nullable()->after('user_id')->constrained('subscription_packages')->nullOnDelete();
            }
            if (!Schema::hasColumn('subscriptions', 'unique_code')) {
                $table->integer('unique_code')->nullable()->after('amount');
            }
            // package_type will be altered to string below via raw SQL for MySQL enum handling
        });

        // Handle enum -> string conversion for package_type (MySQL)
        try {
            DB::statement("ALTER TABLE subscriptions MODIFY COLUMN package_type VARCHAR(50) NOT NULL");
        } catch (\Exception $e) {
            // Fallback: if not MySQL or already string, ignore
        }

        try {
            DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'");
        } catch (\Exception $e) {
        }
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'subscription_package_id')) {
                // Drop foreign first if exists
                try {
                    $table->dropForeign(['subscription_package_id']);
                } catch (\Exception $e) {
                }
                $table->dropColumn('subscription_package_id');
            }
            if (Schema::hasColumn('subscriptions', 'unique_code')) {
                $table->dropColumn('unique_code');
            }
        });

        try {
            DB::statement("ALTER TABLE subscriptions MODIFY COLUMN package_type ENUM('monthly','yearly') NOT NULL");
        } catch (\Exception $e) {
        }
    }
};
