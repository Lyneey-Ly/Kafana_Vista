<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_type',
        'amount',
        'proof_of_payment',
        'status',
        'rejection_reason',
    ];

    public function user()
    {
        // Ubah $table menjadi $this
        return $this->belongsTo(User::class);
    }
}