import { Siswa, Staff, MasterKegiatan } from '../types';

export const MASTER_STAFF: Staff[] = [
  { id: 'st1', name: 'Ahmad Ustadz', gender: 'Putra', email: 'ahmad@alfatah.com' },
  { id: 'st2', name: 'Budi Ustadz', gender: 'Putra', email: 'budi@alfatah.com' },
  { id: 'st3', name: 'Siti Ustadzah', gender: 'Putri', email: 'siti@alfatah.com' },
  { id: 'st4', name: 'Aisyah Ustadzah', gender: 'Putri', email: 'aisyah@alfatah.com' },
];

export const MASTER_SISWA: Siswa[] = [
  { id: 'sw1', name: 'Fulan', gender: 'Putra', kelas: '10A', kelompok: 'Kelompok 1 Putra' },
  { id: 'sw2', name: 'Fulan 2', gender: 'Putra', kelas: '10A', kelompok: 'Kelompok 1 Putra' },
  { id: 'sw3', name: 'Fulan 3', gender: 'Putra', kelas: '11B', kelompok: 'Kelompok 2 Putra' },
  { id: 'sw4', name: 'Fulanah', gender: 'Putri', kelas: '10C', kelompok: 'Kelompok 1 Putri' },
  { id: 'sw5', name: 'Fulanah 2', gender: 'Putri', kelas: '10C', kelompok: 'Kelompok 1 Putri' },
  { id: 'sw6', name: 'Fulanah 3', gender: 'Putri', kelas: '11D', kelompok: 'Kelompok 2 Putri' },
];

export const MASTER_KEGIATAN: MasterKegiatan[] = [
  { 
    id: 'kg1', 
    name: 'Sholat Subuh Berjamaah Putra', 
    gender: 'Putra',
    sops: ['Membangunkan santri 30 menit sebelum adzan', 'Mengecek shaf sholat', 'Dzikir bersama'],
    targetStaffIds: ['st1', 'st2'], // Hanya Ustadz Ahmad & Budi yang diabsen
    targetKelompok: ['Kelompok 1 Putra', 'Kelompok 2 Putra'] // Berlaku untuk semua kelompok putra
  },
  { 
    id: 'kg2', 
    name: 'Halaqah Tahfidz Pagi Putri', 
    gender: 'Putri',
    sops: ['Membuka halaqah tepat waktu', 'Menyimak setoran', 'Mencatat mutabaah'],
    targetStaffIds: ['st3'], // Misalnya hanya Ustadzah Siti yang bertanggung jawab di halaqah ini
    targetKelompok: ['Kelompok 1 Putri'] // Hanya menyupervisi kelompok 1 putri
  },
  { 
    id: 'kg3', 
    name: 'Kebersihan Asrama Putra', 
    gender: 'Putra',
    sops: ['Membagi tugas piket', 'Mengecek kamar mandi', 'Membuang sampah'],
    targetStaffIds: ['st2'], // Hanya Ustadz Budi
    targetKelompok: ['Kelompok 2 Putra'] // Khusus blok asrama kelompok 2
  },
];

export const KELOMPOK_LIST = [
  'Kelompok 1 Putra',
  'Kelompok 2 Putra',
  'Kelompok 1 Putri',
  'Kelompok 2 Putri',
];

export const KELAS_LIST = ['10A', '10B', '10C', '11A', '11B', '11C', '11D'];