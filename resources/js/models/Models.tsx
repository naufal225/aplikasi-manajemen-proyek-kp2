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

export interface Divisi {
    id: number,
    nama_divisi: string,
    jumlah_karyawan?: number | null,
    nama_manajer?: string | null,
    jumlah_proyek?: number,
    deskripsi?: string | null,
    id_manajer?: number | null
}

export interface KaryawanForDivisi {
    id: number,
    nama_karyawan: string,
    divisi: Divisi | null
}

export interface Karyawan {
    id: number | null,
    nama_lengkap: string,
    divisi: Divisi,
    email?: string,
    alamat?: string,
    jenis_kelamin?: string,
    nomor_telepon?: string,
    username?: string,
    tanggal_lahir?: string
}

export interface Proyek {
  id: number
  nama_proyek: string
  deskripsi_proyek: string | null
  id_divisi: number
  divisi?: {
    id: number
    nama_divisi: string
  } | null
  status: "pending" | "in-progress" | "waiting_for_review" | "done"
  progress: number
  tanggal_mulai: string
  tenggat_waktu: string
}

export interface PersetujuanForm {
  catatan: string
  hasil_review: "approved" | "rejected" | ""
}

export interface Tugas {
    id: number
    id_proyek: number
    nama_tugas: string
    deskripsi: string | null
    status: 'pending' | 'in-progress' | 'done'
    tanggal_mulai: string
    tenggat_waktu: string
    bukti_pengerjaan: BuktiPengerjaan[] // diperbaiki dari string/null jadi array
    penanggung_jawab: Karyawan | null
  }
  
  export interface BuktiPengerjaan {
    id: number
    path_file: string
    bukti_type: string
    created_at: string
  }

export interface UserProfile {
   id: number
   nama_lengkap: string
   username: string
   email: string
   tipe_admin: "admin" | "owner"
   jenis_kelamin: "LAKI-LAKI" | "PEREMPUAN"
   nomor_telepon: string
   alamat: string
   tanggal_lahir: string
   foto_profil?: string | null
 }
