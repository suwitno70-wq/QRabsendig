export type UserRole = 'ADMIN' | 'KEPALA' | 'GURU';

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'BELUM_ABSEN' | 'SEDANG_MENGAJAR' | 'SELESAI_MENGAJAR' | 'TIDAK_ADA_JADWAL';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  guruId?: string;
  email?: string;
  nip?: string;
  avatarUrl?: string;
}

export interface Guru {
  id: string;
  nip: string;
  nik: string;
  nama: string;
  username: string;
  password?: string;
  mapelUtama: string;
  noHp: string;
  status: 'AKTIF' | 'NONAKTIF';
  fotoUrl: string;
  pendidikan?: string;
  email?: string;
}

export interface Kelas {
  id: string;
  namaKelas: string; // e.g. "Kelas 6A"
  tingkat: string;   // e.g. "6"
  waliKelasId?: string;
  waliKelasNama?: string;
  ruangan: string;   // e.g. "Gedung A Lt. 2 R.201"
  qrCode: string;    // Unique string e.g. "QR-KELAS-6A-WM928"
  status: 'AKTIF' | 'NONAKTIF';
  kapasitas?: number;
}

export interface Mapel {
  id: string;
  kode: string;
  nama: string;
  kelompok: 'Umum' | 'Agama' | 'Peminatan' | 'Muatan Lokal';
}

export type Hari = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface Jadwal {
  id: string;
  hari: Hari;
  jamKe: number;       // 1, 2, 3...
  jamMulai: string;    // "07:00"
  jamSelesai: string;  // "07:35"
  guruId: string;
  guruNama: string;
  mapelId: string;
  mapelNama: string;
  kelasId: string;
  kelasNama: string;
  mode: 'NORMAL' | 'RAMADAN';
}

export interface AbsensiRecord {
  id: string;
  tanggal: string;         // YYYY-MM-DD
  guruId: string;
  guruNama: string;
  nip: string;
  kelasId: string;
  kelasNama: string;
  mapelId: string;
  mapelNama: string;
  jadwalId: string;
  jamKe: number;
  jamMulai: string;
  jamSelesai: string;
  waktuScan: string;       // HH:mm:ss
  waktuSelesai?: string;   // HH:mm:ss when completed
  status: AttendanceStatus;
  menitKeterlambatan: number;
  catatan?: string;
  materiAjar?: string;
  deviceInfo?: string;
  browser?: string;
  latitude?: number;
  longitude?: number;
  distanceFromSchool?: number; // in meters
  isInsideRadius?: boolean;
  selfieUrl?: string;
  qrCodeScanned: string;
  serverTimestamp: string;
}

export interface AppSettings {
  namaMadrasah: string;
  npsn: string;
  alamatMadrasah: string;
  namaKepalaMadrasah: string;
  nipKepalaMadrasah: string;
  logoUrl: string;
  timezone: string;
  latitudeMadrasah: number;
  longitudeMadrasah: number;
  radiusAbsensiMeter: number;
  batasTerlambatMenit: number;
  modeQR: 'PERMANEN' | 'DINAMIS';
  fiturLokasi: boolean;
  fiturSelfie: boolean;
  modeRamadan: boolean;
  toleransiScanAwalMenit: number; // berapa menit sebelum jam mulai boleh scan
  autoRefreshIntervalDetik: number;
  hideDemoButtons?: boolean;
  googleSheetsWebhookUrl?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  actor: string;
  action: string;
  details: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
