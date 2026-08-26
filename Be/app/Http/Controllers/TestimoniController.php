<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Testimoni;
use Illuminate\Support\Facades\Auth;

class TestimoniController extends Controller
{
    // Kirim testimoni baru (Customer) - Hanya 1x per akun[cite: 5]
    public function store(Request $request)
    {
        $userId = Auth::guard('sanctum')->id();

        if (!$userId) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Cek apakah user sudah pernah mengirim testimoni[cite: 5]
        $alreadySubmitted = Testimoni::where('user_id', $userId)->exists();
        if ($alreadySubmitted) {
            return response()->json([
                'message' => 'Anda sudah pernah memberikan testimoni. Setiap akun hanya diperbolehkan memberikan 1 testimoni.'
            ], 422);
        }

        $request->validate([
            'properti_id' => 'nullable|exists:propertis,id',
            'review'      => 'required|string',
            'rating'      => 'required|integer|min:1|max:5',
        ]);

        $testimoni = Testimoni::create([
            'user_id'     => $userId,
            'properti_id' => $request->properti_id ?? null,
            'review'      => $request->review,
            'rating'      => $request->rating,
        ]);

        $testimoni->load('user');

        return response()->json([
            'message' => 'Terima kasih atas ulasannya!', 
            'data'    => $testimoni
        ], 201);
    }

    // Ambil semua testimoni (Public)[cite: 5]
    public function index()
    {
        try {
            $data = Testimoni::with('user')->latest()->get();

            return response()->json(['data' => $data], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil testimoni',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // Update testimoni (Hanya pemilik testimoni)
    public function update(Request $request, $id)
    {
        $userId = Auth::guard('sanctum')->id();

        if (!$userId) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $testimoni = Testimoni::find($id);

        if (!$testimoni) {
            return response()->json([
                'message' => 'Testimoni tidak ditemukan.'
            ], 404);
        }

        // Validasi kepemilikan
        if ($testimoni->user_id != $userId) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk mengubah testimoni ini.'
            ], 403);
        }

        $request->validate([
            'properti_id' => 'nullable|exists:propertis,id',
            'review'      => 'required|string',
            'rating'      => 'required|integer|min:1|max:5',
        ]);

        $testimoni->update([
            'properti_id' => $request->properti_id ?? $testimoni->properti_id,
            'review'      => $request->review,
            'rating'      => $request->rating,
        ]);

        $testimoni->load('user');

        return response()->json([
            'message' => 'Testimoni berhasil diperbarui!',
            'data'    => $testimoni
        ], 200);
    }

    // Hapus testimoni (Hanya pemilik testimoni)
    public function destroy($id)
    {
        $userId = Auth::guard('sanctum')->id();

        if (!$userId) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $testimoni = Testimoni::find($id);

        if (!$testimoni) {
            return response()->json([
                'message' => 'Testimoni tidak ditemukan.'
            ], 404);
        }

        // Validasi kepemilikan
        if ($testimoni->user_id != $userId) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menghapus testimoni ini.'
            ], 403);
        }

        $testimoni->delete();

        return response()->json([
            'message' => 'Testimoni berhasil dihapus.'
        ], 200);
    }
}