<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Symfony\Component\CssSelector\Node\FunctionNode;

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
