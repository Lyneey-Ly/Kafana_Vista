<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsPremium
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->is_premium) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak. Fitur ini khusus untuk akun Premium.'
            ], 403);
        }

        return $next($request);
    }
}
