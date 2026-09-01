<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuperAdminFinance extends Model
{
    use HasFactory;

    protected $table = 'super_admin_finances';

    protected $fillable = [
        'type',
        'category',
        'amount',
        'description',
        'transaction_date',
        'proof_file',
        'is_system_generated', 
        'reference_id'
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'transaction_date' => 'date',
        'is_system_generated' => 'boolean',
    ];
}