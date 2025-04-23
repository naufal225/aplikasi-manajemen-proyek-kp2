<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $judul
 * @property string|null $pesan
 * @property Model|\Eloquent $target
 * @property int $id_target
 * @property bool $dibaca
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Divisi|null $division
 * @property-read \App\Models\Karyawan|null $karyawan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereDibaca($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereIdTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereJudul($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi wherePesan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notifikasi whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
