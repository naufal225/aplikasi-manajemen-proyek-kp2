<?php

namespace App\Imports;

use App\Models\Karyawan;
use App\Models\Divisi;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithUpserts;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Validation\ValidationException;

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
        if ($rows->isEmpty()) {
            throw ValidationException::withMessages([
                'file' => ['File kosong atau hanya berisi header tanpa data.']
            ]);
        }

        // Ambil header kolom dan validasi
        $header = array_keys($rows->first()->toArray());
        $expectedHeader = [
            'nama_divisi',
            'nama_lengkap',
            'email',
            'username',
            'jenis_kelamin',
            'nomor_telepon',
            'alamat',
            'tanggal_lahir',
            'password',
        ];

        // Cek apakah header sesuai dengan yang diharapkan
        $missingColumns = array_diff($expectedHeader, $header);
        if (!empty($missingColumns)) {
            throw ValidationException::withMessages([
                'file' => ['Nama kolom pada file tidak sesuai. Kolom yang hilang: ' . implode(', ', $missingColumns)]
            ]);
        }

        // Cek apakah ada data di bawah header
        if ($rows->count() === 0) {
            throw ValidationException::withMessages([
                'file' => ['File kosong atau hanya berisi header, tidak ada data yang dapat diimpor']
            ]);
        }

        // Lanjutkan dengan import data jika header sesuai
        foreach ($rows as $row) {
            // Skip empty rows
            if (empty(array_filter($row->toArray()))) {
                continue;
            }

            // Ambil ID divisi berdasarkan nama divisi
            $divisi = Divisi::where('nama_divisi', $row['nama_divisi'])->first();
            $id_divisi = $divisi ? $divisi->id : null;

            // Normalisasi jenis kelamin
            $jenis_kelamin = strtoupper(trim($row['jenis_kelamin']));
            if (!in_array($jenis_kelamin, ['LAKI-LAKI', 'PEREMPUAN'])) {
                $jenis_kelamin = 'LAKI-LAKI'; // Default jika format salah
            }

            // **Konversi tanggal dari format Excel ke format MySQL**
            $tanggal_lahir = $row['tanggal_lahir'];
            if (is_numeric($tanggal_lahir)) {
                $tanggal_lahir = Carbon::createFromDate(1900, 1, 1)->addDays($tanggal_lahir - 2)->format('Y-m-d');
            } else {
                // Jika bukan angka, coba parsing sebagai string biasa
                try {
                    $tanggal_lahir = Carbon::parse($tanggal_lahir)->format('Y-m-d');
                } catch (\Exception $e) {
                    $tanggal_lahir = null; // Atur null jika tidak bisa diproses
                }
            }

            $karyawan = Karyawan::firstOrNew([
                'email' => $row['email'],
                'username' => $row['username'],
            ]);

            $karyawan->fill([
                'id_divisi' => $id_divisi,
                'nama_lengkap' => $row['nama_lengkap'],
                'jenis_kelamin' => $jenis_kelamin,
                'nomor_telepon' => $row['nomor_telepon'],
                'alamat' => $row['alamat'],
                'tanggal_lahir' => $tanggal_lahir,
            ]);

            if (!$karyawan->exists || !empty($row['password'])) {
                $karyawan->password = bcrypt(!empty($row['password']) ? $row['password'] : 'password');
            }

            $karyawan->save();
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
