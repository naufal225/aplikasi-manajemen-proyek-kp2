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
        Schema::create('file_bukti_pengerjaan_tugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_tugas')->constrained('tugas')->cascadeOnDelete();
            $table->foreignId('id_user')->constrained('users')->cascadeOnDelete();
            $table->string('nama_file');
            $table->string('path_file');
            $table->string('mime_type');
            $table->bigInteger('ukuran_file');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_bukti_pengerjaan_tugas');
    }
};
