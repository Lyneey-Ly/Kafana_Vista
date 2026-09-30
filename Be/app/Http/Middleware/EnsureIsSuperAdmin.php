<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !in_array(strtolower($user->role ?? ''), ['superadmin', 'super_admin'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak! Fitur ini khusus untuk Superadmin.'
            ], 403);
        }

        return $next($request);
    }
}
