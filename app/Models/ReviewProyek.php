<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property int $id_proyek
 * @property int|null $id_admin
 * @property string|null $hasil_review
 * @property string|null $catatan
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Proyek $proyek
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereCatatan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereHasilReview($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereIdAdmin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereIdProyek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewProyek whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ReviewProyek extends Model
{
    protected $table = "review_proyek";

    protected $guarded = ['id'];

    public function proyek() {
        return $this->belongsTo(Proyek::class, 'id_proyek');
    }
}
