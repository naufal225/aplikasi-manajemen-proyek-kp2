<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
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
 */
	class Divisi extends \Eloquent {}
}

namespace App\Models{
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
 */
	class FileBuktiPengerjaanTugas extends \Eloquent {}
}

namespace App\Models{
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
 */
	class Karyawan extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $judul
 * @property string|null $pesan
 * @property \Illuminate\Database\Eloquent\Model|\Eloquent $target
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
 */
	class Notifikasi extends \Eloquent {}
}

namespace App\Models{
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
 */
	class Proyek extends \Eloquent {}
}

namespace App\Models{
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
 */
	class ReviewProyek extends \Eloquent {}
}

namespace App\Models{
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
 */
	class Tugas extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $nama_lengkap
 * @property string $username
 * @property string $email
 * @property string $password
 * @property string $tipe_admin
 * @property string $jenis_kelamin
 * @property string $nomor_telepon
 * @property string $alamat
 * @property string $tanggal_lahir
 * @property string|null $foto_profil
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAlamat($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFotoProfil($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereJenisKelamin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereNamaLengkap($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereNomorTelepon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTanggalLahir($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTipeAdmin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUsername($value)
 */
	class User extends \Eloquent {}
}

