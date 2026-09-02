<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlaylistController extends Controller
{
    // Ambil semua playlist milik user yang sedang login
    public function index(Request $request)
    {
        $playlists = $request->user()->playlists()->withCount('tracks')->latest()->get();
        return response()->json($playlists);
    }

    // Buat playlist baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'cover' => 'nullable|image|max:2048',
        ]);

        $coverUrl = null;
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('playlists/covers', 'public');
            $coverUrl = Storage::url($path);
        }

        $playlist = $request->user()->playlists()->create([
            'name' => $request->name,
            'cover_url' => $coverUrl,
        ]);

        return response()->json([
            'message' => 'Playlist berhasil dibuat',
            'playlist' => $playlist
        ], 201);
    }

    // Detail playlist beserta daftar lagunya
    public function show(Request $request, $id)
    {
        $playlist = $request->user()->playlists()->with('tracks')->findOrFail($id);
        return response()->json($playlist);
    }

    // Update nama / cover playlist
    public function update(Request $request, $id)
    {
        $playlist = $request->user()->playlists()->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'cover' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('cover')) {
            if ($playlist->cover_url) {
                $oldPath = str_replace('/storage/', '', $playlist->cover_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('cover')->store('playlists/covers', 'public');
            $playlist->cover_url = Storage::url($path);
        }

        if ($request->has('name')) {
            $playlist->name = $request->name;
        }

        $playlist->save();

        return response()->json([
            'message' => 'Playlist berhasil diperbarui',
            'playlist' => $playlist
        ]);
    }

    // Hapus playlist
    public function destroy(Request $request, $id)
    {
        $playlist = $request->user()->playlists()->findOrFail($id);
        
        if ($playlist->cover_url) {
            $oldPath = str_replace('/storage/', '', $playlist->cover_url);
            Storage::disk('public')->delete($oldPath);
        }

        $playlist->delete();

        return response()->json(['message' => 'Playlist berhasil dihapus']);
    }

    // Tambah lagu ke playlist
    public function addTrack(Request $request, $id)
    {
        $request->validate([
            'track_id' => 'required|exists:tracks,id',
        ]);

        $playlist = $request->user()->playlists()->findOrFail($id);
        $playlist->tracks()->syncWithoutDetaching([$request->track_id]);

        return response()->json(['message' => 'Lagu berhasil ditambahkan ke playlist']);
    }

    // Hapus lagu dari playlist
    public function removeTrack(Request $request, $id, $trackId)
    {
        $playlist = $request->user()->playlists()->findOrFail($id);
        $playlist->tracks()->detach($trackId);

        return response()->json(['message' => 'Lagu berhasil dihapus dari playlist']);
    }
}