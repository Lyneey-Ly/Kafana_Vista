<?php

namespace App\Http\Controllers;

use App\Models\Properti; 
use App\Models\User;
use App\Services\SuperAdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    /**
     * Tampilkan data properti dengan filter pencarian dinamis & relasi pemilik (Public / Katalog)
     */
    public function index(Request $request)
    {
        $query = Properti::with(['pemilik', 'kamars'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews'); 

        $user = Auth::guard('sanctum')->user();

        // Jika dipanggil dari Dashboard Admin (?my_properties=true)
        if ($request->boolean('my_properties')) {
            if ($user) {
                $role = strtolower($user->role ?? '');
                // Jika Admin biasa, HANYA ambil properti miliknya sendiri
                if (!in_array($role, ['superadmin', 'super_admin'])) {
                    $query->where('pemilik_id', $user->id);
                }
            }
        } 
        // Atau jika dikirim filter ID pemilik secara langsung
        elseif ($request->filled('pemilik_id')) {
            $query->where('pemilik_id', $request->pemilik_id);
        } 
        else {
            // Untuk Katalog Publik: Hanya tampilkan properti yang berstatus persetujuan 'active'
            $query->where('approval_status', 'active');
        }

        // Filter Pencarian Umum (Public / Catalog)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('address', 'LIKE', '%' . $search . '%')
                  ->orWhere('title', 'LIKE', '%' . $search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('gender_type')) {
            $query->where('gender_type', $request->gender_type);
        }

        if ($request->filled('min_price')) {
            $query->where('price_per_month', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price_per_month', '<=', $request->max_price);
        }

        $properties = $query->latest()->get();

        // Auto-sync status operasional jika approval_status sudah 'active'
        $properties->transform(function ($item) {
            if (in_array(strtolower($item->approval_status ?? ''), ['active', 'approved']) && $item->status === 'Menunggu Verifikasi') {
                $item->status = 'Tersedia';
            }
            return $item;
        });

        return response()->json([
            'message' => 'Success fetch and filter properties',
            'count'   => $properties->count(),
            'data'    => $properties
        ], 200);
    }

    /**
     * KHUSUS DASHBOARD ADMIN: Ambil properti terfilter otomatis berdasarkan admin yang login
     */
    public function indexAdmin(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated. Silakan login terlebih dahulu!'
            ], 401);
        }

        $query = Properti::with(['pemilik', 'kamars'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $role = strtolower($user->role ?? '');
        $isSuperAdmin = in_array($role, ['superadmin', 'super_admin']);

        // Jika BUKAN Superadmin, paksa HANYA ambil properti milik admin yang login
        if (!$isSuperAdmin) {
            $query->where('pemilik_id', $user->id);
        }

        $properties = $query->latest()->get();

        // Auto-sync status operasional jika approval_status sudah 'active'
        $properties->transform(function ($item) {
            if (in_array(strtolower($item->approval_status ?? ''), ['active', 'approved']) && $item->status === 'Menunggu Verifikasi') {
                $item->status = 'Tersedia';
            }
            return $item;
        });

        return response()->json([
            'message' => 'Success fetch admin properties',
            'count'   => $properties->count(),
            'data'    => $properties
        ], 200);
    }

    /**
     * Simpan data properti baru beserta foto utama, galeri, template perjanjian & monetisasi
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'               => 'required|string|max:255',
            'type'                => 'required|string',
            'gender_type'         => 'required|string',
            'price_per_month'     => 'required|numeric',
            'address'             => 'required|string',
            'latitude'            => 'nullable|numeric|between:-90,90',
            'longitude'           => 'nullable|numeric|between:-180,180',
            'facilities'          => 'nullable|string',
            'public_facilities'   => 'nullable|string',
            'rules'               => 'nullable|string',
            'description'         => 'nullable|string',
            'template_perjanjian' => 'nullable|string',
            'lease_agreement'     => 'nullable|string',
            'status'              => 'nullable|string',
            'is_paid_slot'        => 'nullable|boolean',
            'approval_status'     => 'nullable|in:pending_payment,active,rejected',
            'main_image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'gallery_images'      => 'nullable|array',
            'gallery_images.*'    => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated. Silakan login terlebih dahulu!'
            ], 401);
        }

        // 1. Handle Main Image
        $imagePath = null;
        if ($request->hasFile('main_image')) {
            $imagePath = $request->file('main_image')->store('properti', 'public');
        }

        // 2. Handle Gallery Images
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $galleryPaths[] = $file->store('properti/galeri', 'public');
            }
        }

        // Ambil isi dokumen dari lease_agreement atau template_perjanjian
        $templateText = $request->input('lease_agreement') ?? $request->input('template_perjanjian');

        // Pengaturan Monetisasi
        $isPaidSlot = $request->boolean('is_paid_slot', false);
        $approvalStatus = $request->input('approval_status', $isPaidSlot ? 'pending_payment' : 'active');

        $property = Properti::create([
            'pemilik_id'          => $user->id,
            'title'               => $request->title,
            'type'                => $request->type,
            'gender_type'         => $request->gender_type,
            'price_per_month'     => $request->price_per_month,
            'address'             => $request->address,
            'latitude'            => $request->latitude,
            'longitude'           => $request->longitude,
            'facilities'          => $request->facilities ?? 'Kamar Mandi Dalam',
            'public_facilities'   => $request->public_facilities,
            'rules'               => $request->rules,
            'description'         => $request->description,
            'template_perjanjian' => $templateText,
            'status'              => $request->status ?? 'Menunggu Verifikasi',
            'is_paid_slot'        => $isPaidSlot,
            'approval_status'     => $approvalStatus,
            'main_image'          => $imagePath,
            'gallery_images'      => $galleryPaths,
        ]);

        $property->load(['pemilik', 'kamars']);

        // Notifikasi SuperAdmin: properti baru menunggu verifikasi / pembayaran slot
        if (in_array($approvalStatus, ['pending_payment', 'waiting_verification'])) {
            SuperAdminNotificationService::send(
                'property_approval',
                'Properti Baru Menunggu Verifikasi',
                'Properti "' . $property->title . '" diajukan oleh ' . ($user->name ?? 'Pemilik Kost') . ' dan memerlukan peninjauan.',
                '/superadmin/approval'
            );
        }

        return response()->json([
            'message' => 'Property created successfully!',
            'data'    => $property
        ], 201);
    }

    /**
     * Tampilkan detail properti berdasarkan ID
     */
    public function show($id)
    {
        $property = Properti::with(['pemilik', 'kamars'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // Auto-sync status jika approval_status sudah 'active'
        if (in_array(strtolower($property->approval_status ?? ''), ['active', 'approved']) && $property->status === 'Menunggu Verifikasi') {
            $property->status = 'Tersedia';
        }

        return response()->json([
            'message' => 'Success fetch property detail',
            'data'    => $property
        ], 200);
    }

    /**
     * Update data properti, foto utama, galeri, template perjanjian & status monetisasi
     */
    public function update(Request $request, $id)
    {
        $property = Properti::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // Cek Hak Akses
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            $role = strtolower($user->role ?? '');
            $isSuperAdmin = in_array($role, ['superadmin', 'super_admin']);
            if ($property->pemilik_id !== $user->id && !$isSuperAdmin) {
                return response()->json([
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk mengubah properti ini.'
                ], 403);
            }
        }

        $request->validate([
            'title'               => 'sometimes|required|string|max:255',
            'type'                => 'sometimes|required|string',
            'gender_type'         => 'sometimes|required|string',
            'price_per_month'     => 'sometimes|required|numeric',
            'address'             => 'sometimes|required|string',
            'latitude'            => 'nullable|numeric|between:-90,90',
            'longitude'           => 'nullable|numeric|between:-180,180',
            'facilities'          => 'sometimes|nullable|string',
            'public_facilities'   => 'sometimes|nullable|string',
            'rules'               => 'sometimes|nullable|string',
            'description'         => 'sometimes|nullable|string',
            'template_perjanjian' => 'sometimes|nullable|string',
            'lease_agreement'     => 'sometimes|nullable|string',
            'status'              => 'sometimes|required|string',
            'is_paid_slot'        => 'sometimes|nullable|boolean',
            'approval_status'     => 'sometimes|nullable|in:pending_payment,active,rejected',
            'main_image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'gallery_images'      => 'nullable|array',
            'gallery_images.*'    => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $data = $request->except(['main_image', 'gallery_images', 'lease_agreement']);

        if ($request->has('lease_agreement') || $request->has('template_perjanjian')) {
            $templateText = $request->input('lease_agreement') ?? $request->input('template_perjanjian');
            $data['template_perjanjian'] = $templateText;
        }

        if ($request->hasFile('main_image')) {
            if ($property->main_image && Storage::disk('public')->exists($property->main_image)) {
                Storage::disk('public')->delete($property->main_image);
            }
            $data['main_image'] = $request->file('main_image')->store('properti', 'public');
        }

        if ($request->hasFile('gallery_images')) {
            if ($property->gallery_images && is_array($property->gallery_images)) {
                foreach ($property->gallery_images as $oldPath) {
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
            }

            $newGalleryPaths = [];
            foreach ($request->file('gallery_images') as $file) {
                $newGalleryPaths[] = $file->store('properti/galeri', 'public');
            }
            $data['gallery_images'] = $newGalleryPaths;
        }

        $property->update($data);

        $freshProperty = $property->fresh(['pemilik', 'kamars']);
        if (in_array(strtolower($freshProperty->approval_status ?? ''), ['active', 'approved']) && $freshProperty->status === 'Menunggu Verifikasi') {
            $freshProperty->status = 'Tersedia';
        }

        // NOTIFIKASI: ke SuperAdmin — properti diupdate pemilik
        try {
            if ($user && strtolower($user->role ?? '') !== 'superadmin' && strtolower($user->role ?? '') !== 'super_admin') {
                SuperAdminNotificationService::send(
                    'property_approval',
                    'Properti Diperbarui',
                    'Properti "' . $freshProperty->title . '" diperbarui oleh ' . ($user->name ?? 'Pemilik Kost') . '.',
                    '/superadmin/approval'
                );
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal notif property update: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Property updated successfully!',
            'data'    => $freshProperty
        ], 200);
    }

    /**
     * Hapus data properti beserta semua file foto (utama & galeri) dengan Otorisasi Super Admin
     */
    public function destroy(Request $request, $id)
    {
        $property = Properti::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // Cek Hak Akses Pengguna Logged-in
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            $role = strtolower($user->role ?? '');
            $isSuperAdmin = in_array($role, ['superadmin', 'super_admin']);
            if ($property->pemilik_id !== $user->id && !$isSuperAdmin) {
                return response()->json([
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk menghapus properti ini.'
                ], 403);
            }
        }

        // Validasi Otorisasi Password Super Admin
        $request->validate([
            'superadmin_password' => 'required|string',
        ]);

        $superadmin = User::whereIn('role', ['superadmin', 'super_admin'])->first();

        if (!$superadmin || !Hash::check($request->superadmin_password, $superadmin->password)) {
            return response()->json([
                'message' => 'Verifikasi Gagal! Password Super Admin tidak valid.'
            ], 403);
        }

        // Hapus Foto Utama
        if ($property->main_image && Storage::disk('public')->exists($property->main_image)) {
            Storage::disk('public')->delete($property->main_image);
        }

        // Hapus Foto Galeri
        if ($property->gallery_images && is_array($property->gallery_images)) {
            foreach ($property->gallery_images as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        // Hapus Data Properti dari Database
        $property->delete();

        return response()->json([
            'message' => 'Berhasil! Properti berhasil dihapus oleh otorisasi Super Admin.'
        ], 200);
    }
}