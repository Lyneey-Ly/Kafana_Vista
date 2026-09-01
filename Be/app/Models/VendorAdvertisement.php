<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorAdvertisement extends Model
{
    use HasFactory;

    protected $table = 'vendor_advertisements';

    protected $fillable = [
        'user_id',
        'administrator_id',
        'vendor_name',
        'description',
        'banner_image',
        'link_url',
        'placement',
        'price',
        'start_date',
        'end_date',
        'is_active',
        'status',
        'payment_status',
        'payment_method',
        'payment_proof',
        'rejection_reason',
        'admin_notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = ['banner_images'];

    public function getBannerImagesAttribute()
    {
        if (!$this->banner_image) {
            return [];
        }

        $decoded = json_decode($this->banner_image, true);
        if (is_array($decoded)) {
            return array_map(function ($img) {
                return str_starts_with($img, 'http') ? $img : asset('storage/' . $img);
            }, $decoded);
        }

        return [str_starts_with($this->banner_image, 'http') ? $this->banner_image : asset('storage/' . $this->banner_image)];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function administrator()
    {
        return $this->belongsTo(Administrator::class);
    }
}