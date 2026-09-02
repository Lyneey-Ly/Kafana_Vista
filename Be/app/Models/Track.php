<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'artist', 'audio_url', 'cover_url', 'duration'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function playlists()
    {
        return $this->belongsToMany(Playlist::class, 'playlist_track');
    }

    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'liked_tracks');
    }
}