export type Gender = 'Putra' | 'Putri';
export type Kehadiran = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
export type Nilai = 100 | 90 | 80 | 70 | 50 | 0;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface Siswa {
  id: string;
  name: string;
  gender: Gender;
  kelas: string;
  kelompok: string;
}

export interface Staff {
  id: string;
  name: string;
  gender: Gender;
  email: string;
}

export interface MasterKegiatan {
  id: string;
  name: string;
  gender: Gender;
  sops: string[];
  target_staff_ids: string[]; 
  target_kelompok: string[]; 
  tipe: 'Rutin' | 'Insidental';
  hari: string; // "1,2,3,4,5,6,7"
  pekan: string; // "1,2,3,4,5"
}

export interface AbsensiRecord {
  targetId: string; // id staff or siswa
  targetName: string;
  kehadiran: Kehadiran;
  nilai: Nilai;
}

export interface FormKegiatanData {
  id: string;
  type: 'kegiatan';
  kegiatanId: string;
  kegiatanName: string;
  staffId: string; // Staff Penanggung Jawab
  staffName: string;
  catatan: string;
  absensi: AbsensiRecord[];
  fotoUrl?: string; // base64
  email: string;
  waktu: string; // ISO string
  gender: Gender;
}

export interface FormSupervisiData {
  id: string;
  type: 'supervisi';
  kegiatanId: string;
  kegiatanName: string;
  staffId: string; // Staff Penanggung Jawab
  staffName: string;
  kelompok: string;
  absensi: AbsensiRecord[];
  sopChecklist: { sop: string; checked: boolean }[];
  email: string;
  waktu: string;
  gender: Gender;
}

export type AppData = {
  kegiatanRecords: FormKegiatanData[];
  supervisiRecords: FormSupervisiData[];
};