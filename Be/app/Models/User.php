<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'foto',
        'role',
        'google_id',
        'terms_accepted_at',
        'premium_until', // Disimpan agar bisa di-update via mass assignment
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'premium_until'     => 'datetime', // Di-cast ke Carbon instance agar bisa cek ->isFuture()
    ];

    // Otomatis menyertakan attribute 'is_premium' saat model diubah ke JSON
    protected $appends = [
        'is_premium',
    ];

    /**
     * Accessor untuk cek status premium aktif
     */
    public function getIsPremiumAttribute(): bool
    {
        return $this->premium_until && $this->premium_until->isFuture();
    }

    public function pemesanan()
    {
        return $this->hasMany(Pemesanan::class, 'customer_id');
    }

    public function pemesanans()
    {
        return $this->hasMany(Pemesanan::class, 'customer_id');
    }

    public function tracks()
{
    return $this->hasMany(Track::class);
}

public function playlists()
{
    return $this->hasMany(Playlist::class);
}

public function likedTracks()
{
    return $this->belongsToMany(Track::class, 'liked_tracks');
}   
}