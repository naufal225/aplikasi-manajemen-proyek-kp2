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
        Schema::create('tugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_proyek')->constrained('proyek')->cascadeOnDelete();
            $table->foreignId('id_karyawan')->nullable()->constrained('karyawan')->nullOnDelete();
            $table->string('nama_tugas');
            $table->text('deskripsi_tugas');
            $table->date('tenggat_waktu');
            $table->enum('status', ['pending','in-progress','waiting_for_review','done'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};
