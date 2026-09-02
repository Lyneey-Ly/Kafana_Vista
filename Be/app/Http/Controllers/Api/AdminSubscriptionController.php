<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminSubscriptionController extends Controller
{
    /**
     * Mengambil daftar seluruh transaksi langganan (dengan filter status)
     */
    public function index(Request $request)
    {
        $status = $request->get('status', 'pending');

        $query = Subscription::with('user:id,name,email,phone')
            ->orderBy('created_at', 'desc');

        if (in_array($status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $status);
        }

        $subscriptions = $query->get()->map(function ($sub) {
            return [
                'id'                   => $sub->id,
                'user_id'              => $sub->user_id,
                'user_name'            => $sub->user->name ?? 'N/A',
                'user_email'           => $sub->user->email ?? 'N/A',
                'user_phone'           => $sub->user->phone ?? '-',
                'package_type'         => $sub->package_type,
                'amount'               => (float) $sub->amount,
                'proof_of_payment_url' => asset('storage/' . $sub->proof_of_payment),
                'status'               => $sub->status,
                'rejection_reason'     => $sub->rejection_reason,
                'created_at'           => $sub->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $subscriptions
        ], 200);
    }

    /**
     * Setujui Pembayaran & Tambah Durasi Premium User
     */
    public function approve($id)
    {
        $subscription = Subscription::with('user')->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        if ($subscription->status !== 'pending') {
            return response()->json(['message' => 'Transaksi ini sudah diproses sebelumnya.'], 400);
        }

        $user = $subscription->user;
        if (!$user) {
            return response()->json(['message' => 'User pemilik transaksi tidak ditemukan.'], 404);
        }

        // Tentukan jumlah hari tambahan
        $daysToAdd = $subscription->package_type === 'yearly' ? 365 : 30;

        // Hitung dari tanggal premium_until lama jika masih berlaku, atau dari waktu sekarang
        $baseDate = ($user->premium_until && Carbon::parse($user->premium_until)->isFuture())
            ? Carbon::parse($user->premium_until)
            : Carbon::now();

        $user->premium_until = $baseDate->addDays($daysToAdd);
        $user->save();

        // Update status transaksi
        $subscription->status = 'approved';
        $subscription->rejection_reason = null;
        $subscription->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Langganan berhasil disetujui. Masa aktif premium user diperbarui.',
            'data'    => [
                'subscription'  => $subscription,
                'premium_until' => $user->premium_until->format('Y-m-d H:i:s'),
            ]
        ], 200);
    }

    /**
     * Tolak Pembayaran Langganan
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000'
        ]);

        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        if ($subscription->status !== 'pending') {
            return response()->json(['message' => 'Transaksi ini sudah diproses sebelumnya.'], 400);
        }

        $subscription->status = 'rejected';
        $subscription->rejection_reason = $request->rejection_reason;
        $subscription->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Transaksi langganan berhasil ditolak.',
            'data'    => $subscription
        ], 200);
    }
}