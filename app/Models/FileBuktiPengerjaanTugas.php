<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileBuktiPengerjaanTugas extends Model
{
    protected $table = 'file_bukti_pengerjaan_tugas';

    protected $guarded = ['id'];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class, 'id_tugas');
    }
}
