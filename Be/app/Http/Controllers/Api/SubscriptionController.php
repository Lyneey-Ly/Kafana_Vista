<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPackage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Services\NotificationService;
use App\Services\SuperAdminNotificationService;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    /**
     * USER: Kirim Bukti Pembayaran Premium (dinamis, pakai subscription_packages)
     * Kompatibel: terima package_type (slug legacy), package_id, atau slug
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'package_type'     => 'nullable|string|max:50', // slug legacy: monthly,yearly,lifetime
            'package_id'       => 'nullable|integer|exists:subscription_packages,id',
            'slug'             => 'nullable|string|max:50',
            'proof_of_payment' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
            'sender_name'      => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:100',
            'unique_code'      => 'nullable|integer|min:0|max:999',
        ]);

        // Resolve paket: prioritaskan package_id > slug > package_type
        $pkg = null;
        $slugInput = $request->input('slug') ?? $request->input('package_type');

        if ($request->filled('package_id')) {
            $pkg = SubscriptionPackage::where('id', $request->package_id)->where('is_active', true)->first();
        }
        if (!$pkg && $slugInput) {
            $pkg = SubscriptionPackage::where('slug', $slugInput)->where('is_active', true)->first();
            // Fallback case-insensitive / key_id
            if (!$pkg) {
                $pkg = SubscriptionPackage::where('key_id', $slugInput)->where('is_active', true)->first();
            }
        }

        if (!$pkg) {
            return response()->json([
                'message' => 'Paket langganan tidak ditemukan atau tidak aktif. Silakan refresh halaman paket.',
            ], 422);
        }

        $uniqueCode = (int) ($request->input('unique_code', 0));
        // Validasi unique_code dari FE (100-999), tapi izinkan 0 untuk backward compat
        $amount = (float) $pkg->price + $uniqueCode;

        try {
            $user = Auth::user();
            $proofPath = $request->file('proof_of_payment')->store('subscriptions', 'public');

            $subscription = Subscription::create([
                'user_id'                  => $user->id,
                'subscription_package_id'  => $pkg->id,
                'package_type'             => $pkg->slug,
                'amount'                   => $amount,
                'unique_code'              => $uniqueCode,
                'proof_of_payment'         => $proofPath,
                'status'                   => 'pending',
            ]);

            if (class_exists(SuperAdminNotificationService::class)) {
                SuperAdminNotificationService::send(
                    'new_subscription',
                    'Pengajuan Premium Baru',
                    $user->name . ' mengajukan paket premium (' . strtoupper($pkg->slug) . ' - ' . $pkg->name . ').',
                    '/superadmin/subscriptions'
                );
            }

            return response()->json([
                'message' => 'Pengajuan pembayaran premium berhasil dikirim. Menunggu verifikasi SuperAdmin.',
                'data'    => $subscription
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengunggah bukti pembayaran.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * USER: Cek Status Langganan Saat Ini
     */
    public function mySubscription()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $latestSubscription = Subscription::with('package')->where('user_id', $user->id)
                ->latest()
                ->first();

            $isPremium = false;
            if (!empty($user->premium_until)) {
                $isPremium = Carbon::parse($user->premium_until)->isFuture();
            } elseif (isset($user->is_premium)) {
                $isPremium = (bool) $user->is_premium;
            }

            return response()->json([
                'is_premium'    => $isPremium,
                'premium_until' => $user->premium_until,
                'latest_order'  => $latestSubscription,
                // Tambahan agar FE bisa tampilkan paket aktif jika diperlukan
                'subscription_package' => $latestSubscription?->package,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil status langganan.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SUPERADMIN: Ambil Semua Daftar Pengajuan Premium
     */
    public function indexSuperAdmin(Request $request)
    {
        $query = Subscription::with(['user:id,name,email,phone', 'package'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'data' => $query->get()
        ], 200);
    }

    /**
     * SUPERADMIN: Setujui (Approve) Pembayaran Premium
     */
    public function approve($id)
    {
        $subscription = Subscription::findOrFail($id);

        if ($subscription->status !== 'pending') {
            return response()->json([
                'message' => 'Transaksi ini sudah diproses sebelumnya.'
            ], 400);
        }

        $user = User::findOrFail($subscription->user_id);

        $baseDate = ($user->premium_until && Carbon::parse($user->premium_until)->isFuture())
            ? Carbon::parse($user->premium_until)
            : now();

        // Resolve durasi dari paket dinamis, fallback ke legacy mapping
        $pkg = $subscription->package;
        if (!$pkg && $subscription->package_type) {
            $pkg = SubscriptionPackage::where('slug', $subscription->package_type)->first();
        }
        $durationDays = $pkg ? (int) $pkg->duration_days : ($subscription->package_type === 'monthly' ? 30 : 365);
        // Lifetime 36500 ditangani generik via addDays
        $newExpiry = $baseDate->copy()->addDays($durationDays);

        // Update tanggal tenggat sekaligus flag boolean is_premium
        $user->update([
            'premium_until' => $newExpiry,
            'is_premium'    => true,
        ]);

        $subscription->update([
            'status'      => 'approved',
            'approved_at' => now(),
        ]);

        // NOTIFIKASI: ke customer — premium disetujui
        try {
            $pkgName = $pkg ? $pkg->name : strtoupper($subscription->package_type);
            NotificationService::send(
                $user->id,
                'Premium Disetujui',
                "Pengajuan premium {$pkgName} Anda telah disetujui. Masa aktif hingga " . Carbon::parse($newExpiry)->format('d M Y') . ". Nikmati fitur premium!",
                '/my-subscription',
                'subscription_approved'
            );
        } catch (\Throwable $e) {
            Log::warning('Gagal kirim notif subscription approved: ' . $e->getMessage());
        }

        return response()->json([
            'message'       => 'Pembayaran berhasil dikonfirmasi! Akun user kini aktif sebagai Premium.',
            'premium_until' => $user->premium_until,
            'subscription'  => $subscription
        ], 200);
    }

    /**
     * SUPERADMIN: Tolak (Reject) Pembayaran Premium
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        $subscription = Subscription::findOrFail($id);

        if ($subscription->status !== 'pending') {
            return response()->json([
                'message' => 'Transaksi ini sudah diproses sebelumnya.'
            ], 400);
        }

        $subscription->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        // NOTIFIKASI: ke customer — premium ditolak + alasan
        try {
            $user = User::find($subscription->user_id);
            if ($user) {
                NotificationService::send(
                    $user->id,
                    'Premium Ditolak',
                    "Pengajuan premium Anda ditolak. Alasan: {$request->rejection_reason}",
                    '/my-subscription',
                    'subscription_rejected'
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal kirim notif subscription rejected: ' . $e->getMessage());
        }

        return response()->json([
            'message'      => 'Pengajuan premium berhasil ditolak.',
            'subscription' => $subscription
        ], 200);
    }

    /**
     * USER: Riwayat Transaksi
     */
    public function history()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $history = Subscription::with('package')->where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(function ($sub) {
                    return [
                        'id'               => $sub->id,
                        'package_type'     => $sub->package_type,
                        'package'          => $sub->package ? [
                            'slug' => $sub->package->slug,
                            'name' => $sub->package->name,
                            'price' => (float) $sub->package->price,
                        ] : null,
                        'amount'           => (float) $sub->amount,
                        'unique_code'      => $sub->unique_code,
                        'status'           => $sub->status,
                        'proof_of_payment' => $sub->proof_of_payment ? asset('storage/' . $sub->proof_of_payment) : null,
                        'rejection_reason' => $sub->rejection_reason,
                        'created_at'       => $sub->created_at ? $sub->created_at->format('d M Y, H:i') : '-',
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => $history
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil riwayat transaksi.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}