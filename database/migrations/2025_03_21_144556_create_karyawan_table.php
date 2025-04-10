<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('karyawan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_divisi')->nullable()->constrained('divisi');
            $table->string('nama_lengkap');
            $table->string('email')->unique();
            $table->string('username')->unique();
            $table->enum('jenis_kelamin', ['LAKI-LAKI', 'PEREMPUAN']);
            $table->string('nomor_telepon');
            $table->string('alamat');
            $table->date('tanggal_lahir');
            $table->string('password');
            $table->longText('url_foto_profil')->nullable();
            $table->integer('skor_kinerja')->default(0)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('karyawan');
    }
};
