<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Divisi extends Model
{
    protected $table = 'divisi';

    protected $guarded = ['id'];

    public function karyawan() {
        return $this->hasMany(Karyawan::class, 'id_karyawan');
    }

    public function manajer() {
        return $this->belongsTo(Karyawan::class, 'id_manajer');
    }
}
