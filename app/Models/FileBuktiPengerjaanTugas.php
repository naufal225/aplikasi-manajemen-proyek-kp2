<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property int $id_tugas
 * @property int|null $id_user
 * @property string $nama_file
 * @property string $path_file
 * @property string $mime_type
 * @property int $ukuran_file
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereIdTugas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereIdUser($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereNamaFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas wherePathFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereUkuranFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FileBuktiPengerjaanTugas whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class FileBuktiPengerjaanTugas extends Model
{
    protected $table = 'file_bukti_pengerjaan_tugas';

    protected $guarded = ['id'];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class, 'id_tugas');
    }
}
