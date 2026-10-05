<?php

namespace App\Http\Controllers;

use App\Models\VendorAdvertisement;
use App\Models\AdSlotConfig;
use App\Models\Administrator;
use App\Services\AdImageValidatorService;
use App\Services\FinanceService;
use App\Services\NotificationService;
use App\Services\SuperAdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VendorAdController extends Controller
{
    /**
     * ENDPOINT PUBLIK: Mengambil Iklan Aktif Berdasarkan Tanggal & Penempatan
     */
    public function getActiveAds(Request $request)
    {
        $today = Carbon::today();

        $query = VendorAdvertisement::where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today);

        if ($request->has('placement')) {
            $query->where('placement', $request->placement);
        }

        $ads = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data'   => $ads
        ], 200);
    }

    /**
     * LOGGED-IN USER / ADMIN KOST: Ambil daftar iklan milik user/admin yang sedang login
     */
    public function myAds(Request $request)
    {
        $currentUser = $request->user();
        $query = VendorAdvertisement::query();

        // Deteksi apakah pengakses adalah Administrator (Pemilik Kost) atau User biasa
        if ($currentUser instanceof Administrator) {
            $query->where('administrator_id', $currentUser->id);
        } else if ($currentUser) {
            $query->where('user_id', $currentUser->id);
        }

        $ads = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data'   => $ads
        ], 200);
    }

    /**
     * SUPERADMIN: Tampilkan semua data untuk dashboard
     */
    public function index()
    {
        $ads = VendorAdvertisement::latest()->get();
        return response()->json(['status' => 'success', 'data' => $ads], 200);
    }

    /**
     * TAMBAH IKLAN BARU (User / Admin Pemilik Kost)
     * Validasi dinamis berdasarkan AdSlotConfig (format, dimensi, rasio, size)
     */
    public function store(Request $request)
    {
        // Resolve slot config untuk aturan dinamis
        $placementInput = $request->input('placement');
        $slotConfig = AdSlotConfig::where('placement', $placementInput)->first()
            ?? AdSlotConfig::where('placement', 'custom')->first();

        // Build mimes & max size dari config jika tersedia
        $mimeRule = 'image|mimes:jpeg,png,jpg,webp';
        $maxRule = 'max:2048';
        if ($slotConfig) {
            $mimeRule = 'image|mimes:' . implode(',', $slotConfig->allowed_extensions);
            $maxRule = 'max:' . $slotConfig->max_file_size_kb;
        }

        $validated = $request->validate([
            'vendor_name'     => 'required|string|max:255',
            'description'     => 'nullable|string',
            'banner_images'   => 'required|array|min:1',
            'banner_images.*' => $mimeRule . '|' . $maxRule,
            'link_url'        => 'nullable|url|max:255',
            'placement'       => 'required|string|max:100',
            'price'           => 'nullable|numeric|min:0',
            'start_date'      => 'required|date',
            'end_date'        => 'required|date|after_or_equal:start_date',
            'is_active'       => 'boolean'
        ]);

        // --- VALIDASI KETAT: dimensi & rasio aspek per file ---
        if ($request->hasFile('banner_images')) {
            $validator = app(AdImageValidatorService::class);
            $files = $request->file('banner_images');
            $batch = $validator->validateBatch($files, $validated['placement']);
            if (!$batch['all_valid']) {
                $errors = [];
                foreach ($batch['results'] as $idx => $res) {
                    if (!$res['valid']) {
                        $errors["banner_images.{$idx}"] = $res['errors'];
                    }
                }
                return response()->json([
                    'message' => 'Validasi gambar gagal. Periksa format, dimensi, rasio, atau ukuran file.',
                    'errors' => $errors,
                    'details' => $batch['results'],
                ], 422);
            }
        }

        // Simpan semua file foto ke storage
        $uploadedImages = [];
        if ($request->hasFile('banner_images')) {
            foreach ($request->file('banner_images') as $file) {
                $uploadedImages[] = $file->store('vendor_ads', 'public');
            }
        }

        $validated['banner_image'] = json_encode($uploadedImages);
        $validated['is_active']    = $request->input('is_active', true);

        // Binding ID Pemilik Iklan secara otomatis sesuai model akun
        $currentUser = $request->user();
        if ($currentUser instanceof Administrator) {
            $validated['administrator_id'] = $currentUser->id;
        } else if ($currentUser) {
            $validated['user_id'] = $currentUser->id;
        }

        unset($validated['banner_images']);

        $ad = VendorAdvertisement::create($validated);

        // NOTIFIKASI: ke SuperAdmin — pengajuan iklan baru
        try {
            $ownerName = $currentUser->name ?? $currentUser->email ?? 'Pengguna';
            SuperAdminNotificationService::send(
                'vendor_ad',
                'Pengajuan Iklan Baru',
                "{$ownerName} mengajukan iklan vendor \"{$ad->vendor_name}\" ({$ad->placement}) menunggu verifikasi.",
                '/superadmin/vendor-ads'
            );
        } catch (\Throwable $e) { Log::warning('Gagal notif vendor store: '.$e->getMessage()); }

        return response()->json([
            'status'  => 'success',
            'message' => 'Iklan vendor berhasil ditambahkan.',
            'data'    => $ad
        ], 201);
    }

    /**
     * SUPERADMIN: Tampilkan Satu Iklan
     */
    public function show($id)
    {
        $ad = VendorAdvertisement::find($id);
        if (!$ad) {
            return response()->json(['message' => 'Iklan tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $ad], 200);
    }

    /**
     * SUPERADMIN: Verifikasi Pembayaran & Approval Status Iklan
     */
    public function verify(Request $request, $id)
    {
        $ad = VendorAdvertisement::find($id);

        if (!$ad) {
            return response()->json(['message' => 'Iklan tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'status'           => 'required|in:active,rejected,pending,paused',
            'payment_status'   => 'required|in:pending,verified,paid,rejected',
            'rejection_reason' => 'nullable|string',
            'admin_notes'      => 'nullable|string',
        ]);

        // Otomatis atur boolean is_active & simpan ke Finance Tracker
        if ($validated['status'] === 'active') {
            $validated['is_active'] = true;

            // AUTO RECORDING: Catat pemasukan iklan vendor ke Finance Tracker
            $desc = "Pemasukan Iklan Vendor - {$ad->vendor_name} ({$ad->placement})";
            FinanceService::recordIncome('vendor_ad', $ad->price, $desc, "AD-{$ad->id}");

        } elseif (in_array($validated['status'], ['rejected', 'paused'])) {
            $validated['is_active'] = false;

            // AUTO VOID: Hapus catatan keuangan jika status ditolak atau dijeda
            FinanceService::removeIncome('vendor_ad', "AD-{$ad->id}");
        }

        $ad->update($validated);

        // NOTIFIKASI: ke pemilik iklan — status iklan berubah + alasan jika rejected
        try {
            $ownerId = $ad->user_id ?? $ad->administrator_id;
            if ($ownerId) {
                $statusLabel = ucfirst($validated['status']);
                $alasan = !empty($validated['rejection_reason']) ? " Alasan: {$validated['rejection_reason']}" : '';
                $title = $validated['status'] === 'active' ? 'Iklan Disetujui' : ($validated['status'] === 'rejected' ? 'Iklan Ditolak' : "Iklan {$statusLabel}");
                $type = $validated['status'] === 'active' ? 'vendor_ad_approved' : ($validated['status'] === 'rejected' ? 'vendor_ad_rejected' : 'vendor_ad');
                NotificationService::send(
                    $ownerId,
                    $title,
                    "Iklan \"{$ad->vendor_name}\" status: {$statusLabel}.{$alasan}",
                    '/vendor-ads/my-ads',
                    $type
                );
            }
        } catch (\Throwable $e) { Log::warning('Gagal notif vendor verify: '.$e->getMessage()); }

        return response()->json([
            'status'  => 'success',
            'message' => 'Status dan verifikasi iklan berhasil diperbarui.',
            'data'    => $ad
        ], 200);
    }

    /**
     * SUPERADMIN / ADMIN: Update Data Iklan
     */
    public function update(Request $request, $id)
    {
        $ad = VendorAdvertisement::find($id);
        
        if (!$ad) {
            return response()->json(['message' => 'Iklan tidak ditemukan'], 404);
        }

        // Resolve slot config untuk aturan dinamis (jika placement diubah)
        $targetPlacement = $request->input('placement', $ad->placement);
        $slotConfig = AdSlotConfig::where('placement', $targetPlacement)->first()
            ?? AdSlotConfig::where('placement', 'custom')->first();
        $mimeRule = 'image|mimes:jpeg,png,jpg,webp';
        $maxRule = 'max:2048';
        if ($slotConfig) {
            $mimeRule = 'image|mimes:' . implode(',', $slotConfig->allowed_extensions);
            $maxRule = 'max:' . $slotConfig->max_file_size_kb;
        }

        $validated = $request->validate([
            'vendor_name'      => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'banner_images'    => 'nullable|array',
            'banner_images.*'  => $mimeRule . '|' . $maxRule,
            'link_url'         => 'nullable|url|max:255',
            'placement'        => 'sometimes|required|string|max:100',
            'price'            => 'nullable|numeric|min:0',
            'start_date'       => 'sometimes|required|date',
            'end_date'         => 'sometimes|required|date|after_or_equal:start_date',
            'is_active'        => 'boolean',
            'status'           => 'sometimes|string',
            'payment_status'   => 'sometimes|string',
            'payment_method'   => 'nullable|string',
            'payment_proof'    => 'nullable|string',
            'rejection_reason' => 'nullable|string',
            'admin_notes'      => 'nullable|string',
        ]);

        // Validasi dimensi/rasio jika ada file baru
        if ($request->hasFile('banner_images')) {
            $validator = app(AdImageValidatorService::class);
            $files = $request->file('banner_images');
            $batch = $validator->validateBatch($files, $targetPlacement);
            if (!$batch['all_valid']) {
                $errors = [];
                foreach ($batch['results'] as $idx => $res) {
                    if (!$res['valid']) $errors["banner_images.{$idx}"] = $res['errors'];
                }
                return response()->json([
                    'message' => 'Validasi gambar gagal.',
                    'errors' => $errors,
                    'details' => $batch['results'],
                ], 422);
            }
        }

        // Jika ada unggahan gambar baru
        if ($request->hasFile('banner_images')) {
            // Hapus gambar-gambar lama
            $oldImages = json_decode($ad->banner_image, true);
            if (is_array($oldImages)) {
                foreach ($oldImages as $oldImg) {
                    Storage::disk('public')->delete($oldImg);
                }
            } else if ($ad->banner_image) {
                Storage::disk('public')->delete($ad->banner_image);
            }

            // Simpan gambar-gambar baru
            $uploadedImages = [];
            foreach ($request->file('banner_images') as $file) {
                $uploadedImages[] = $file->store('vendor_ads', 'public');
            }
            $validated['banner_image'] = json_encode($uploadedImages);
        }

        unset($validated['banner_images']);

        $ad->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data iklan berhasil diperbarui.',
            'data'    => $ad
        ], 200);
    }

    /**
     * SUPERADMIN: Hapus Iklan
     */
    public function destroy($id)
    {
        $ad = VendorAdvertisement::find($id);

        if (!$ad) {
            return response()->json(['message' => 'Iklan tidak ditemukan'], 404);
        }

        // Hapus file dari storage
        $images = json_decode($ad->banner_image, true);
        if (is_array($images)) {
            foreach ($images as $img) {
                Storage::disk('public')->delete($img);
            }
        } else if ($ad->banner_image) {
            Storage::disk('public')->delete($ad->banner_image);
        }

        // Hapus juga catatan keuangan yang terkait jika ada
        FinanceService::removeIncome('vendor_ad', "AD-{$ad->id}");

        // NOTIFIKASI: ke pemilik — iklan dihapus
        try {
            $ownerId = $ad->user_id ?? $ad->administrator_id;
            if ($ownerId) {
                NotificationService::send(
                    $ownerId,
                    'Iklan Dihapus',
                    "Iklan \"{$ad->vendor_name}\" telah dihapus oleh admin.",
                    '/vendor-ads/my-ads',
                    'vendor_ad'
                );
            }
        } catch (\Throwable $e) { Log::warning('Gagal notif vendor destroy: '.$e->getMessage()); }

        $ad->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Iklan dan file gambar berhasil dihapus.'
        ], 200);
    }
}