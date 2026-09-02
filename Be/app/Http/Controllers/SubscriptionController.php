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
     * 💳 USER: Kirim Bukti Pembayaran Premium
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'package_type'     => 'required|in:monthly,yearly',
            'proof_of_payment' => 'required|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        $user = Auth::user();

        // Tentukan harga paket
        $amount = $request->package_type === 'monthly' ? 50000 : 500000;

        // Simpan file bukti pembayaran
        $proofPath = $request->file('proof_of_payment')->store('subscriptions', 'public');

        $subscription = Subscription::create([
            'user_id'          => $user->id,
            'package_type'     => $request->package_type,
            'amount'           => $amount,
            'proof_of_payment' => $proofPath,
            'status'           => 'pending',
        ]);

        // Notifikasi ke SuperAdmin
        SuperAdminNotificationService::send(
            'new_subscription',
            'Pengajuan Premium Baru',
            $user->name . ' mengajukan paket premium (' . strtoupper($request->package_type) . ').',
            '/superadmin/subscriptions'
        );

        return response()->json([
            'message' => 'Pengajuan pembayaran premium berhasil dikirim. Menunggu verifikasi SuperAdmin.',
            'data'    => $subscription
        ], 201);
    }

    /**
     * 🔍 USER: Cek Status Langganan Saat Ini
     */
    public function mySubscription()
    {
        $user = Auth::user();
        $latestSubscription = Subscription::where('user_id', $user->id)
            ->latest()
            ->first();

        return response()->json([
            'is_premium'    => $user->is_premium,
            'premium_until' => $user->premium_until, //[cite: 5]
            'latest_order'  => $latestSubscription
        ], 200);
    }

    /**
     * 👑 SUPERADMIN: Ambil Semua Daftar Pengajuan Premium
     */
    public function indexSuperAdmin(Request $request)
    {
        $query = Subscription::with('user:id,name,email,phone')
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->get();

        return response()->json([
            'data' => $subscriptions
        ], 200);
    }

    /**
     * 👑 SUPERADMIN: Setujui (Approve) Pembayaran Premium
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

        // Jika user masih punya sisa durasi premium, tambahkan dari tanggal expired tersebut[cite: 5]
        $baseDate = ($user->premium_until && Carbon::parse($user->premium_until)->isFuture())
            ? Carbon::parse($user->premium_until) //[cite: 5]
            : now();

        $newExpiry = $subscription->package_type === 'monthly'
            ? $baseDate->addMonth()
            : $baseDate->addYear();

        // Update tanggal expired di tabel users[cite: 5]
        $user->update([
            'premium_until' => $newExpiry, //[cite: 5]
        ]);

        // Update status pengajuan
        $subscription->update([
            'status'      => 'approved',
            'approved_at' => now(),
        ]);

        return response()->json([
            'message'       => 'Pembayaran berhasil dikonfirmasi! Akun user kini aktif sebagai Premium.',
            'premium_until' => $user->premium_until, //[cite: 5]
            'subscription'  => $subscription
        ], 200);
    }

    /**
     * 👑 SUPERADMIN: Tolak (Reject) Pembayaran Premium
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
}