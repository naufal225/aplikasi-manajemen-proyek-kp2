<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Symfony\Component\CssSelector\Node\FunctionNode;

/**
 * 
 *
 * @property int $id
 * @property int|null $id_divisi
 * @property string $nama_proyek
 * @property string|null $deskripsi_proyek
 * @property string $tenggat_waktu
 * @property float $progress
 * @property string $status
 * @property string $tanggal_mulai
 * @property string|null $tanggal_selesai
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Divisi|null $divisi
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tugas> $tugas
 * @property-read int|null $tugas_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereDeskripsiProyek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereIdDivisi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereNamaProyek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereProgress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereTanggalMulai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereTanggalSelesai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereTenggatWaktu($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Proyek whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Proyek extends Model
{
    protected $table = 'proyek';

    protected $guarded = ['id'];

    public function divisi() {
        return $this->belongsTo(Divisi::class, 'id_divisi');
    }

    public function tugas() {
        return $this->hasMany(Tugas::class, 'id_proyek');
    }
}
