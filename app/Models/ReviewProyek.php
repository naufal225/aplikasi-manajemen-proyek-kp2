<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewProyek extends Model
{
    protected $table = "review_proyek";

    protected $guarded = ['id'];

    public function proyek() {
        return $this->belongsTo(Proyek::class, 'id_proyek');
    }
}
