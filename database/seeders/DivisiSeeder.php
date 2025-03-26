<?php

namespace Database\Seeders;

use App\Models\Divisi;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nama_nama_divisi = [
            'IT', 'Manajemen', 'Human Resources', 'Pmeme Handal', 'Psarkas Handal'
        ];

        foreach($nama_nama_divisi as $divisi) {
            Divisi::create([
                'nama_divisi' => $divisi
            ]);
        }
    }
}
