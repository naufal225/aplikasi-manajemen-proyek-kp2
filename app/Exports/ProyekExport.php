<?php

namespace App\Exports;

use App\Models\Proyek;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class ProyekExport implements FromQuery, WithHeadings, WithMapping, WithColumnWidths, WithStyles
{
    protected $tanggal_awal;
    protected $tanggal_akhir;
    private $rowNumber = 0;

    public function __construct($tanggal_awal = null, $tanggal_akhir = null)
    {
        $this->tanggal_awal = $tanggal_awal ?? '1900-01-01';
        $this->tanggal_akhir = $tanggal_akhir ?? now()->toDateString();
    }

    /**
     * Query data proyek dengan filter tanggal
     */
    public function query()
    {
        return Proyek::query()
            ->whereBetween('tanggal_mulai', [$this->tanggal_awal, $this->tanggal_akhir]);
    }

    /**
     * Mapping data proyek ke format laporan
     */
    public function map($proyek): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $proyek->nama_proyek,
            $proyek->divisi->nama_divisi ?? 'N/A',
            $proyek->progress . '%',
            $proyek->tugas->count() ?? "0",
            $proyek->tugas->where('status', 'done')->count() ?? "0",
            $proyek->status,
            Carbon::parse($proyek->tanggal_mulai)->format('d-m-Y'),
            Carbon::parse($proyek->tenggat_waktu)->format('d-m-Y'),
            optional($proyek->tugas->where('status', 'done')->max('updated_at'))->format('d-m-Y') ?? 'Belum Selesai',
        ];
    }

    /**
     * Menambahkan header di file Excel
     */
    public function headings(): array
    {
        return [
            ['DATA LAPORAN PENGERJAAN PROYEK PERIODE (' . Carbon::parse($this->tanggal_awal)->format('d-m-Y') . ' s/d ' . Carbon::parse($this->tanggal_akhir)->format('d-m-Y') . ')'],
            [
                'No',
                'Nama Proyek',
                'Divisi',
                'Progress',
                'Total Tugas',
                'Tugas Selesai',
                'Status Proyek',
                'Tanggal Mulai',
                'Tenggat Waktu',
                'Tanggal Selesai',
            ],
        ];
    }

    /**
     * Menyesuaikan lebar kolom
     */
    public function columnWidths(): array
    {
        return [
            'A' => 5,    // No
            'B' => 30,   // Nama Proyek
            'C' => 20,   // Divisi
            'D' => 12,   // Progress
            'E' => 12,   // Total Tugas
            'F' => 15,   // Tugas Selesai
            'G' => 20,   // Status Proyek
            'H' => 15,   // Tanggal Mulai
            'I' => 15,   // Tenggat Waktu
            'J' => 15,   // Tanggal Selesai
        ];
    }

    /**
     * Menerapkan gaya pada lembar kerja
     */
    public function styles(Worksheet $sheet)
    {
        // Gaya untuk judul laporan
        $sheet->mergeCells('A1:J1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'alignment' => [
                'horizontal' => 'center',
            ],
            'fill' => [
                'fillType' => 'solid',
                'startColor' => ['rgb' => '4CAF50'],
            ],
        ]);

        // Gaya untuk header tabel
        $sheet->getStyle('A2:J2')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => 'solid',
                'startColor' => ['rgb' => '333333'],
            ],
        ]);

        // Menambahkan border pada seluruh sel yang berisi data
        $highestRow = $sheet->getHighestRow();
        $sheet->getStyle('A1:J' . $highestRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => 'thin',
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);
    }
}
