<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPackage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionPackageController extends Controller
{
    private function isSuperAdmin(Request $request): bool
    {
        $user = $request->user();
        return $user && in_array(strtolower($user->role ?? ''), ['superadmin', 'super_admin']);
    }

    private function denyAccess()
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Akses ditolak! Fitur ini khusus untuk Superadmin.'
        ], 403);
    }

    private function transformPackage(SubscriptionPackage $pkg): array
    {
        return [
            'id' => $pkg->slug,
            'slug' => $pkg->slug,
            'key_id' => $pkg->key_id ?? $pkg->slug,
            'name' => $pkg->name,
            'subtitle' => $pkg->subtitle,
            'price' => (float) $pkg->price,
            'period' => $pkg->period,
            'duration_days' => (int) $pkg->duration_days,
            'durationDays' => (int) $pkg->duration_days,
            'badge' => $pkg->badge,
            'savings_text' => $pkg->savings_text,
            'savingsText' => $pkg->savings_text,
            'is_popular' => (bool) $pkg->is_popular,
            'isPopular' => (bool) $pkg->is_popular,
            'features' => $pkg->features ?? [],
            'is_active' => (bool) $pkg->is_active,
            'isActive' => (bool) $pkg->is_active,
            'created_at' => $pkg->created_at,
            'updated_at' => $pkg->updated_at,
        ];
    }

    /**
     * Public: GET /api/packages - paket aktif untuk user
     */
    public function indexPublic(Request $request)
    {
        $packages = SubscriptionPackage::where('is_active', true)
            ->orderBy('price', 'asc')
            ->get()
            ->map(fn($p) => $this->transformPackage($p));

        return response()->json([
            'status' => 'success',
            'data' => $packages,
        ], 200);
    }

    /**
     * Superadmin: GET /api/admin/packages OR /api/admin/superadmin/packages
     */
    public function indexAdmin(Request $request)
    {
        if (!$this->isSuperAdmin($request)) {
            return $this->denyAccess();
        }

        $packages = SubscriptionPackage::orderBy('is_active', 'desc')
            ->orderBy('price', 'asc')
            ->get()
            ->map(fn($p) => $this->transformPackage($p));

        return response()->json([
            'status' => 'success',
            'data' => $packages,
        ], 200);
    }

    /**
     * Superadmin: POST /api/admin/packages
     */
    public function store(Request $request)
    {
        if (!$this->isSuperAdmin($request)) {
            return $this->denyAccess();
        }

        $validated = $request->validate([
            'slug' => 'required|string|max:50|regex:/^[a-z0-9_-]+$/|unique:subscription_packages,slug',
            'key_id' => 'nullable|string|max:50|regex:/^[a-z0-9_-]+$/|unique:subscription_packages,key_id',
            'name' => 'required|string|max:100',
            'subtitle' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0|max:999999999',
            'period' => 'required|string|max:50',
            'duration_days' => 'required|integer|min:1|max:36500',
            'badge' => 'nullable|string|max:50',
            'savings_text' => 'nullable|string|max:255',
            'is_popular' => 'sometimes|boolean',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_active' => 'sometimes|boolean',
        ], [
            'price.min' => 'Harga tidak boleh negatif.',
            'duration_days.min' => 'Durasi minimal 1 hari.',
            'slug.regex' => 'Slug hanya boleh huruf kecil, angka, dash, underscore.',
        ]);

        $validated['key_id'] = $validated['key_id'] ?? $validated['slug'];
        $validated['is_popular'] = $request->boolean('is_popular', false);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['features'] = $validated['features'] ?? [];

        // Jika set popular true, reset yang lain (opsional single popular)
        // Biarkan multiple popular, tidak enforce

        $package = SubscriptionPackage::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Paket premium berhasil dibuat.',
            'data' => $this->transformPackage($package),
        ], 201);
    }

    /**
     * Superadmin: PUT /api/admin/packages/{id} / superadmin/packages/{id}
     * id bisa numeric id atau slug
     */
    public function update(Request $request, $id)
    {
        if (!$this->isSuperAdmin($request)) {
            return $this->denyAccess();
        }

        $package = SubscriptionPackage::where('id', $id)->orWhere('slug', $id)->first();
        if (!$package) {
            return response()->json(['message' => 'Paket tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'slug' => ['sometimes','string','max:50','regex:/^[a-z0-9_-]+$/', Rule::unique('subscription_packages','slug')->ignore($package->id)],
            'key_id' => ['sometimes','nullable','string','max:50','regex:/^[a-z0-9_-]+$/', Rule::unique('subscription_packages','key_id')->ignore($package->id)],
            'name' => 'sometimes|string|max:100',
            'subtitle' => 'nullable|string|max:255',
            'price' => 'sometimes|numeric|min:0|max:999999999',
            'period' => 'sometimes|string|max:50',
            'duration_days' => 'sometimes|integer|min:1|max:36500',
            'badge' => 'nullable|string|max:50',
            'savings_text' => 'nullable|string|max:255',
            'is_popular' => 'sometimes|boolean',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_active' => 'sometimes|boolean',
        ], [
            'price.min' => 'Harga tidak boleh negatif.',
        ]);

        // Handle boolean conversion
        if ($request->has('is_popular')) {
            $validated['is_popular'] = $request->boolean('is_popular');
        }
        if ($request->has('is_active')) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $package->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Paket premium berhasil diperbarui.',
            'data' => $this->transformPackage($package->fresh()),
        ], 200);
    }

    /**
     * Superadmin: DELETE /api/admin/packages/{id} -> nonaktifkan (soft)
     * Sesuai request: nonaktif saja, bukan hard delete
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->isSuperAdmin($request)) {
            return $this->denyAccess();
        }

        $package = SubscriptionPackage::where('id', $id)->orWhere('slug', $id)->first();
        if (!$package) {
            return response()->json(['message' => 'Paket tidak ditemukan'], 404);
        }

        // Soft deactivate instead of hard delete
        $package->update(['is_active' => false]);

        return response()->json([
            'status' => 'success',
            'message' => 'Paket premium berhasil dinonaktifkan.',
            'data' => $this->transformPackage($package->fresh()),
        ], 200);
    }

    /**
     * Toggle status helper for PUT via is_active
     */
    public function toggleStatus(Request $request, $id)
    {
        if (!$this->isSuperAdmin($request)) {
            return $this->denyAccess();
        }

        $package = SubscriptionPackage::where('id', $id)->orWhere('slug', $id)->first();
        if (!$package) {
            return response()->json(['message' => 'Paket tidak ditemukan'], 404);
        }

        $package->update(['is_active' => !$package->is_active]);

        return response()->json([
            'status' => 'success',
            'message' => $package->is_active ? 'Paket diaktifkan.' : 'Paket dinonaktifkan.',
            'data' => $this->transformPackage($package->fresh()),
        ], 200);
    }
}
