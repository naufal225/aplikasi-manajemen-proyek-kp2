<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property int $id_proyek
 * @property int|null $id_karyawan
 * @property string $nama_tugas
 * @property string $deskripsi_tugas
 * @property string $tenggat_waktu
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FileBuktiPengerjaanTugas> $fileBukti
 * @property-read int|null $file_bukti_count
 * @property-read \App\Models\Karyawan|null $karyawan
 * @property-read \App\Models\Proyek $proyek
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereDeskripsiTugas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereIdKaryawan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereIdProyek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereNamaTugas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereTenggatWaktu($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Tugas extends Model
{
    protected $table = 'tugas';

    protected $guarded = ['id'];

    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }

    public function proyek()
    {
        return $this->belongsTo(Proyek::class, 'id_proyek');
    }

    public function fileBukti()
    {
        return $this->hasMany(FileBuktiPengerjaanTugas::class, 'id_tugas');
    }
}
