export interface DashboardAdminStats {
    total_divisi: number,
    total_karyawan: number,
    total_proyek_menunggu_persetujuan: number,
    total_proyek_terlambat: number,
    total_proyek: number
}

export interface MockProjects {
    id: number;
    nama_proyek: string;
    bulan_mulai: number; 
    tanggal_mulai: Date,
    tenggat_waktu: Date,
    durasi: number; 
    progress: number; 
    status: "pending" | "in-progress" | "waiting_for_review" | "done";
}

export interface TopKaryawan {
    id: number;
    nama_lengkap: string;
    divisi: string; 
    skor_kinerja: number; 
  }
  
