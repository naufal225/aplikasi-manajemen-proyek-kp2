<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $nama_divisi
 * @property string|null $deskripsi
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $id_manajer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Karyawan> $karyawan
 * @property-read int|null $karyawan_count
 * @property-read \App\Models\Karyawan|null $manajer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Proyek> $proyek
 * @property-read int|null $proyek_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi whereDeskripsi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi whereIdManajer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi whereNamaDivisi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Divisi whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Divisi extends Model
{
    protected $table = 'divisi';

    protected $guarded = ['id'];

    public function karyawan() {
        return $this->hasMany(Karyawan::class, 'id_divisi');
    }

    public function proyek() {
        return $this->hasMany(Proyek::class, 'id_divisi');
    }

    public function manajer() {
        return $this->belongsTo(Karyawan::class, 'id_manajer');
    }
}
