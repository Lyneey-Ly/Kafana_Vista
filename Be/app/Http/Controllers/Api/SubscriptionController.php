<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Services\SuperAdminNotificationService;

class SubscriptionController extends Controller
{
    /**
     * USER: Kirim Bukti Pembayaran Premium
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'package_type'     => 'required|in:monthly,yearly',
            'proof_of_payment' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        try {
            $user = Auth::user();
            $amount = $request->package_type === 'monthly' ? 50000 : 500000;

            $proofPath = $request->file('proof_of_payment')->store('subscriptions', 'public');

            $subscription = Subscription::create([
                'user_id'          => $user->id,
                'package_type'     => $request->package_type,
                'amount'           => $amount,
                'proof_of_payment' => $proofPath,
                'status'           => 'pending',
            ]);

            if (class_exists(SuperAdminNotificationService::class)) {
                SuperAdminNotificationService::send(
                    'new_subscription',
                    'Pengajuan Premium Baru',
                    $user->name . ' mengajukan paket premium (' . strtoupper($request->package_type) . ').',
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

            $latestSubscription = Subscription::where('user_id', $user->id)
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
                'latest_order'  => $latestSubscription
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
        $query = Subscription::with('user:id,name,email,phone')
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

        $newExpiry = $subscription->package_type === 'monthly'
            ? $baseDate->addMonth()
            : $baseDate->addYear();

        // Update tanggal tenggat sekaligus flag boolean is_premium
        $user->update([
            'premium_until' => $newExpiry,
            'is_premium'    => true,
        ]);

        $subscription->update([
            'status'      => 'approved',
            'approved_at' => now(),
        ]);

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

            $history = Subscription::where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(function ($sub) {
                    return [
                        'id'               => $sub->id,
                        'package_type'     => $sub->package_type,
                        'amount'           => (float) $sub->amount,
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