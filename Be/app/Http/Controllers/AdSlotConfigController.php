<?php

namespace App\Http\Controllers;

use App\Models\AdSlotConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdSlotConfigController extends Controller
{
    /**
     * Public: list all active configs (for FE dropdown & validator)
     */
    public function index()
    {
        $configs = Cache::remember('ad_slot_configs_all', 3600, function () {
            return AdSlotConfig::where('is_active', true)->orderBy('sort_order')->get();
        });

        return response()->json([
            'status' => 'success',
            'data' => $configs->map(fn($c) => $c->toPublicArray()),
        ]);
    }

    /**
     * Public: get single placement config
     */
    public function show(string $placement)
    {
        $config = Cache::remember("ad_slot_config_{$placement}", 3600, function () use ($placement) {
            return AdSlotConfig::where('placement', $placement)->first();
        });

        if (!$config) {
            // fallback to custom
            $config = AdSlotConfig::where('placement', 'custom')->first();
            if (!$config) {
                return response()->json(['message' => 'Konfigurasi tidak ditemukan'], 404);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $config->toPublicArray(),
        ]);
    }

    // --- SuperAdmin CRUD (protected by EnsureIsAdmin + role check) ---

    public function indexAdmin()
    {
        // reuse superadmin check pattern
        if (!$this->isSuperAdmin()) {
            return response()->json(['message' => 'Hanya SuperAdmin yang dapat mengakses.'], 403);
        }
        $configs = AdSlotConfig::orderBy('sort_order')->get();
        return response()->json(['status' => 'success', 'data' => $configs]);
    }

    public function store(Request $request)
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['message' => 'Hanya SuperAdmin yang dapat mengakses.'], 403);
        }

        $validated = $request->validate([
            'placement' => 'required|string|max:100|unique:ad_slot_configs,placement',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'width' => 'required|integer|min:1|max:10000',
            'height' => 'required|integer|min:1|max:10000',
            'min_width' => 'nullable|integer|min:1|max:10000',
            'min_height' => 'nullable|integer|min:1|max:10000',
            'max_width' => 'nullable|integer|min:1|max:10000',
            'max_height' => 'nullable|integer|min:1|max:10000',
            'aspect_ratio' => 'nullable|string|max:20|regex:/^\d+:\d+$/',
            'aspect_tolerance' => 'nullable|numeric|min:0|max:0.5',
            'allowed_extensions' => 'required|array|min:1',
            'allowed_extensions.*' => 'string|max:10',
            'allowed_mimes' => 'required|array|min:1',
            'allowed_mimes.*' => 'string|max:50',
            'max_file_size_kb' => 'required|integer|min:10|max:10240',
            'is_strict_dimension' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0|max:999',
        ]);

        $config = AdSlotConfig::create($validated);
        Cache::forget('ad_slot_configs_all');
        Cache::forget("ad_slot_config_{$config->placement}");

        return response()->json(['status' => 'success', 'message' => 'Konfigurasi slot berhasil dibuat.', 'data' => $config], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['message' => 'Hanya SuperAdmin yang dapat mengakses.'], 403);
        }

        $config = AdSlotConfig::find($id);
        if (!$config) return response()->json(['message' => 'Konfigurasi tidak ditemukan'], 404);

        $validated = $request->validate([
            'placement' => 'sometimes|required|string|max:100|unique:ad_slot_configs,placement,' . $id,
            'label' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'width' => 'sometimes|required|integer|min:1|max:10000',
            'height' => 'sometimes|required|integer|min:1|max:10000',
            'min_width' => 'nullable|integer|min:1|max:10000',
            'min_height' => 'nullable|integer|min:1|max:10000',
            'max_width' => 'nullable|integer|min:1|max:10000',
            'max_height' => 'nullable|integer|min:1|max:10000',
            'aspect_ratio' => 'nullable|string|max:20|regex:/^\d+:\d+$/',
            'aspect_tolerance' => 'nullable|numeric|min:0|max:0.5',
            'allowed_extensions' => 'sometimes|required|array|min:1',
            'allowed_extensions.*' => 'string|max:10',
            'allowed_mimes' => 'sometimes|required|array|min:1',
            'allowed_mimes.*' => 'string|max:50',
            'max_file_size_kb' => 'sometimes|required|integer|min:10|max:10240',
            'is_strict_dimension' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0|max:999',
        ]);

        $oldPlacement = $config->placement;
        $config->update($validated);
        Cache::forget('ad_slot_configs_all');
        Cache::forget("ad_slot_config_{$oldPlacement}");
        Cache::forget("ad_slot_config_{$config->placement}");

        return response()->json(['status' => 'success', 'message' => 'Konfigurasi diperbarui.', 'data' => $config]);
    }

    public function destroy($id)
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['message' => 'Hanya SuperAdmin yang dapat mengakses.'], 403);
        }

        $config = AdSlotConfig::find($id);
        if (!$config) return response()->json(['message' => 'Konfigurasi tidak ditemukan'], 404);

        $placement = $config->placement;
        $config->delete();
        Cache::forget('ad_slot_configs_all');
        Cache::forget("ad_slot_config_{$placement}");

        return response()->json(['status' => 'success', 'message' => 'Konfigurasi dihapus.']);
    }

    private function isSuperAdmin(): bool
    {
        $user = auth()->user();
        if (!$user) return false;
        $role = strtolower($user->role ?? '');
        return in_array($role, ['superadmin', 'super_admin', 'super-admin']);
    }
}
