<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * 
 *
 * @property int $id
 * @property int|null $id_divisi
 * @property string $nama_lengkap
 * @property string $email
 * @property string $username
 * @property string $jenis_kelamin
 * @property string $nomor_telepon
 * @property string $alamat
 * @property string $tanggal_lahir
 * @property string $password
 * @property string|null $url_foto_profil
 * @property int|null $skor_kinerja
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Divisi|null $divisi
 * @property-read \App\Models\Divisi|null $manajerFor
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\KaryawanFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereAlamat($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereIdDivisi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereJenisKelamin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereNamaLengkap($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereNomorTelepon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereSkorKinerja($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereTanggalLahir($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereUrlFotoProfil($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Karyawan whereUsername($value)
 * @mixin \Eloquent
 */
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
