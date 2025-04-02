<?php

namespace App\Imports;

use App\Models\Karyawan;
use App\Models\Divisi;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithUpserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class KaryawanImport implements ToCollection, WithBatchInserts, WithUpserts, WithHeadingRow
{
    /**
     * Validasi kolom header agar sesuai yang diharapkan
     */
    public function headingRow(): int
    {
        return 1; // Menandakan bahwa baris pertama adalah header
    }

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty() || $rows->first() == null) {
            return response()->json(['status' => 'error',  'message' => 'File kosong atau hanya berisi header tanpa data.'], 400);
        }

        // Ambil header kolom dan validasi
        $header = $rows->first()->keys()->toArray();
        $expectedHeader = [
            'Nama Divisi',
            'Nama Lengkap',
            'Email',
            'Username',
            'Jenis Kelamin',
            'Nomor Telepon',
            'Alamat',
            'Tanggal Lahir',
            'Password',
        ];

        // Cek apakah header sesuai dengan yang diharapkan
        if ($header !== $expectedHeader) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nama kolom pada file tidak sesuai. Pastikan nama kolom sesuai template.'
            ], 400);
        }

        // Cek apakah ada data di bawah header
        if ($rows->count() <= 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'File kosong atau hanya berisi header, tidak ada data yang dapat diimpor'
            ], 400);
        }

        // Lanjutkan dengan import data jika header sesuai
        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // Lewati header

            // Ambil ID divisi berdasarkan nama divisi
            $divisi = Divisi::where('nama_divisi', $row[0])->first();
            $id_divisi = $divisi ? $divisi->id : null;

            // Normalisasi jenis kelamin
            $jenis_kelamin = strtoupper(trim($row[4]));
            if (!in_array($jenis_kelamin, ['LAKI-LAKI', 'PEREMPUAN'])) {
                $jenis_kelamin = 'LAKI-LAKI'; // Default jika format salah
            }

            // Upsert data karyawan berdasarkan email
            Karyawan::updateOrCreate(
                ['email' => $row[2]], // Kunci unik
                [
                    'id_divisi' => $id_divisi,
                    'nama_lengkap' => $row[1],
                    'username' => $row[3],
                    'jenis_kelamin' => $jenis_kelamin,
                    'nomor_telepon' => $row[5],
                    'alamat' => $row[6],
                    'tanggal_lahir' => $row[7],
                    'password' => bcrypt($row[8]),
                ]
            );
        }
    }

    public function batchSize(): int
    {
        return 600; // Memproses dalam batch 600 baris untuk efisiensi
    }

    public function uniqueBy()
    {
        return 'email'; // Mencegah duplikasi berdasarkan email
    }
}
