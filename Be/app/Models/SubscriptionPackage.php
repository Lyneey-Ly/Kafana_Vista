<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'key_id',
        'name',
        'subtitle',
        'price',
        'period',
        'duration_days',
        'badge',
        'savings_text',
        'is_popular',
        'features',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'features' => 'array',
        'duration_days' => 'integer',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'subscription_package_id');
    }
}
