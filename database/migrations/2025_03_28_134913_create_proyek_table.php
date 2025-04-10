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
        Schema::create('proyek', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_divisi')->nullable()->constrained('divisi')->nullOnDelete();
            $table->string('nama_proyek');
            $table->text('deskripsi_proyek')->nullable();
            $table->date('tenggat_waktu');
            $table->float('progress')->default(0);
            $table->enum('status', ['pending','in-progress','waiting_for_review', 'done'])->default('pending');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyek');
    }
};
