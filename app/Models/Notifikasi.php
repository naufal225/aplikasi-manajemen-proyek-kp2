<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';

    protected $guarded = ['id'];

    public function target()
    {
        return $this->morphTo();
    }

    protected $casts = [
        'dibaca' => 'boolean',
    ];

    // Opsional: relasi manual tergantung target_type
    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class, 'id_target')->where('target', 'karyawan');
    }

    public function division()
    {
        return $this->belongsTo(Divisi::class, 'id_target')->where('target', 'divisi');
    }
}
