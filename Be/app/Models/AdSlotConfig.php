<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdSlotConfig extends Model
{
    use HasFactory;

    protected $table = 'ad_slot_configs';

    protected $fillable = [
        'placement',
        'label',
        'description',
        'width',
        'height',
        'min_width',
        'min_height',
        'max_width',
        'max_height',
        'aspect_ratio',
        'aspect_tolerance',
        'allowed_extensions',
        'allowed_mimes',
        'max_file_size_kb',
        'is_strict_dimension',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'allowed_extensions' => 'array',
        'allowed_mimes' => 'array',
        'is_strict_dimension' => 'boolean',
        'is_active' => 'boolean',
        'aspect_tolerance' => 'decimal:3',
        'width' => 'integer',
        'height' => 'integer',
        'max_file_size_kb' => 'integer',
    ];

    /**
     * Get expected aspect ratio as float (e.g. "3:1" => 3.0)
     */
    public function getExpectedAspectAttribute(): ?float
    {
        if (!$this->aspect_ratio) return null;
        $parts = explode(':', $this->aspect_ratio);
        if (count($parts) !== 2) return null;
        $w = (float) $parts[0];
        $h = (float) $parts[1];
        if ($h == 0) return null;
        return $w / $h;
    }

    /**
     * Human readable max size
     */
    public function getMaxSizeMbAttribute(): float
    {
        return round($this->max_file_size_kb / 1024, 2);
    }

    /**
     * For API response
     */
    public function toPublicArray(): array
    {
        return [
            'placement' => $this->placement,
            'label' => $this->label,
            'description' => $this->description,
            'width' => $this->width,
            'height' => $this->height,
            'min_width' => $this->min_width,
            'min_height' => $this->min_height,
            'max_width' => $this->max_width,
            'max_height' => $this->max_height,
            'aspect_ratio' => $this->aspect_ratio,
            'aspect_tolerance' => (float) $this->aspect_tolerance,
            'expected_aspect' => $this->expected_aspect,
            'allowed_extensions' => $this->allowed_extensions,
            'allowed_mimes' => $this->allowed_mimes,
            'max_file_size_kb' => $this->max_file_size_kb,
            'max_file_size_mb' => $this->max_size_mb,
            'is_strict_dimension' => $this->is_strict_dimension,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}
