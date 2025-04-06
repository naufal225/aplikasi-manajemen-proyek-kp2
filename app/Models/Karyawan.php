<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Karyawan extends Model
{
    use HasFactory, HasApiTokens, Notifiable;
    protected $table = 'karyawan';

    protected $guarded = ['id'];

    public function divisi() {
        return $this->belongsTo(Divisi::class, 'id_divisi');
    }

    public function manajerFor() {
        return $this->belongsTo(Divisi::class, 'id_manajer') ?? null;
    }

    public function isManajer()
    {
        return Divisi::where('id_manajer', $this->id)->exists() ? "manager" : "employee";
    }
}
