<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    use HasFactory;
    protected $table = 'karyawan';

    protected $guarded = ['id'];

    public function divisi() {
        return $this->belongsTo(Divisi::class, 'id_divisi');
    }

    public function manajerFor() {
        return $this->belongsTo(Divisi::class, 'id_manajer');
    }

}
