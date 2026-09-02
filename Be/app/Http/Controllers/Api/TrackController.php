<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TrackController extends Controller
{
    public function index()
    {
        return response()->json(Track::with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'audio' => 'required_without:audio_url|file|mimes:mp3,wav,ogg|max:15360', // Max 15MB
            'audio_url' => 'nullable|url',
            'cover' => 'nullable|image|max:2048',
        ]);

        $audioUrl = $request->audio_url;
        if ($request->hasFile('audio')) {
            $path = $request->file('audio')->store('tracks/audio', 'public');
            $audioUrl = Storage::url($path);
        }

        $coverUrl = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('tracks/covers', 'public');
            $coverUrl = Storage::url($coverPath);
        }

        $track = $request->user()->tracks()->create([
            'title' => $request->title,
            'artist' => $request->artist,
            'audio_url' => $audioUrl,
            'cover_url' => $coverUrl,
        ]);

        return response()->json(['message' => 'Lagu berhasil diunggah', 'track' => $track], 201);
    }

    public function toggleLike(Request $request, $id)
    {
        $user = $request->user();
        $user->likedTracks()->toggle($id);

        return response()->json(['message' => 'Status favorit diperbarui']);
    }
}