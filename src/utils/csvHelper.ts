import { Guru, Kelas, Mapel, Jadwal, AbsensiRecord } from '../types';

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------- GURU CSV ----------------
export const GURU_CSV_TEMPLATE = `NIP,NIK,Nama Lengkap,Username,Password,Mapel Utama,No HP,Pendidikan,Email
198506122010011018,3174091206850001,"Ahmad Fauzi, S.Pd.I",ahmad,password123,IPAS & Sains,081234567890,S1 PAI,ahmad.fauzi@min1model.sch.id
199003152015022004,3174091503900002,"Siti Rahmawati, S.Pd",siti,password123,Bahasa Indonesia,081298765432,S1 Bahasa,siti.rahma@min1model.sch.id
`;

export function exportGuruToCSV(guruList: Guru[]): string {
  const header = 'ID,NIP,NIK,Nama Lengkap,Username,Password,Mapel Utama,No HP,Status,Pendidikan,Email\n';
  const rows = guruList.map((g) => {
    return `"${g.id}","${g.nip || ''}","${g.nik || ''}","${(g.nama || '').replace(/"/g, '""')}","${g.username}","${g.password || 'password123'}","${(g.mapelUtama || '').replace(/"/g, '""')}","${g.noHp || ''}","${g.status}","${(g.pendidikan || '').replace(/"/g, '""')}","${g.email || ''}"`;
  });
  return header + rows.join('\n');
}

export function parseGuruCSV(csvText: string): Guru[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Guru[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCSVLine(lines[i]);
    if (rawCols.length >= 3) {
      const nip = rawCols[0]?.trim() || '';
      const nik = rawCols[1]?.trim() || '';
      const nama = rawCols[2]?.trim() || '';
      const username = rawCols[3]?.trim() || nama.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || `guru${i}`;
      const password = rawCols[4]?.trim() || 'password123';
      const mapelUtama = rawCols[5]?.trim() || 'Guru Kelas';
      const noHp = rawCols[6]?.trim() || '';
      const pendidikan = rawCols[7]?.trim() || 'S1 Pendidikan';
      const email = rawCols[8]?.trim() || `${username}@madrasah.sch.id`;

      if (nama) {
        results.push({
          id: `GURU-${String(Date.now()).slice(-4)}${i}`,
          nip,
          nik,
          nama,
          username,
          password,
          mapelUtama,
          noHp,
          status: 'AKTIF',
          fotoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          pendidikan,
          email,
        });
      }
    }
  }
  return results;
}

// ---------------- KELAS CSV ----------------
export const KELAS_CSV_TEMPLATE = `Nama Kelas,Tingkat,Nama Wali Kelas,Ruangan,Kapasitas
Kelas 6A,6,Ahmad Fauzi,Gedung Umar Lt. 2 R.201,28
Kelas 6B,6,Siti Rahmawati,Gedung Umar Lt. 2 R.202,30
`;

export function exportKelasToCSV(kelasList: Kelas[]): string {
  const header = 'ID Kelas,Nama Kelas,Tingkat,Nama Wali Kelas,Ruangan,QR Code,Kapasitas,Status\n';
  const rows = kelasList.map((k) => {
    return `"${k.id}","${k.namaKelas}","${k.tingkat}","${k.waliKelasNama || ''}","${k.ruangan || ''}","${k.qrCode}","${k.kapasitas || 30}","${k.status}"`;
  });
  return header + rows.join('\n');
}

export function parseKelasCSV(csvText: string, defaultWaliId?: string): Kelas[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Kelas[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length >= 2) {
      const namaKelas = cols[0]?.trim() || `Kelas ${i}`;
      const tingkat = cols[1]?.trim() || '1';
      const waliKelasNama = cols[2]?.trim() || '-';
      const ruangan = cols[3]?.trim() || `Ruang Kelas ${namaKelas}`;
      const kapasitas = parseInt(cols[4]?.trim() || '30', 10) || 30;

      const slug = namaKelas.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const codeId = `KELAS-${slug}`;
      results.push({
        id: codeId,
        namaKelas,
        tingkat,
        waliKelasId: defaultWaliId || 'GURU-01',
        waliKelasNama,
        ruangan,
        qrCode: `QR-${codeId}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'AKTIF',
        kapasitas,
      });
    }
  }
  return results;
}

// ---------------- MAPEL CSV ----------------
export const MAPEL_CSV_TEMPLATE = `Kode,Nama Mata Pelajaran,Kelompok
IPAS,Ilmu Pengetahuan Alam dan Sosial,Umum
QH,Al-Qur'an Hadis,Agama
MTK,Matematika,Umum
`;

export function exportMapelToCSV(mapelList: Mapel[]): string {
  const header = 'ID Mapel,Kode,Nama Mata Pelajaran,Kelompok\n';
  const rows = mapelList.map((m) => `"${m.id}","${m.kode}","${m.nama}","${m.kelompok}"`);
  return header + rows.join('\n');
}

export function parseMapelCSV(csvText: string): Mapel[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Mapel[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length >= 2) {
      const kode = cols[0]?.trim() || `MP${i}`;
      const nama = cols[1]?.trim() || '';
      const kelompok = (cols[2]?.trim() as any) || 'Umum';
      if (nama) {
        results.push({
          id: `MP-${String(i).padStart(2, '0')}`,
          kode,
          nama,
          kelompok: ['Umum', 'Agama', 'Muatan Lokal', 'Peminatan'].includes(kelompok) ? kelompok : 'Umum',
        });
      }
    }
  }
  return results;
}

// ---------------- JADWAL CSV ----------------
export const JADWAL_CSV_TEMPLATE = `Hari,Jam Ke,Jam Mulai,Jam Selesai,Nama Guru,Nama Kelas,Nama Mapel
Senin,1,07:00,07:35,Ahmad Fauzi,Kelas 6A,IPAS & Sains
Senin,2,07:35,08:10,Ahmad Fauzi,Kelas 6A,IPAS & Sains
`;

export function exportJadwalToCSV(jadwalList: Jadwal[]): string {
  const header = 'ID,Hari,Jam Ke,Jam Mulai,Jam Selesai,Nama Guru,Nama Kelas,Nama Mapel,Mode\n';
  const rows = jadwalList.map((j) => {
    return `"${j.id}","${j.hari}","${j.jamKe}","${j.jamMulai}","${j.jamSelesai}","${j.guruNama}","${j.kelasNama}","${j.mapelNama}","${j.mode}"`;
  });
  return header + rows.join('\n');
}

export function parseJadwalCSV(csvText: string, guruList: Guru[], kelasList: Kelas[], mapelList: Mapel[]): Jadwal[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Jadwal[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length >= 6) {
      const hari = (cols[0]?.trim() as any) || 'Senin';
      const jamKe = parseInt(cols[1]?.trim() || '1', 10) || 1;
      const jamMulai = cols[2]?.trim() || '07:00';
      const jamSelesai = cols[3]?.trim() || '07:35';
      const guruNamaInput = cols[4]?.trim() || '';
      const kelasNamaInput = cols[5]?.trim() || '';
      const mapelNamaInput = cols[6]?.trim() || '';

      // Match Guru
      const matchedGuru =
        guruList.find((g) => g.nama.toLowerCase().includes(guruNamaInput.toLowerCase())) || guruList[0];
      // Match Kelas
      const matchedKelas =
        kelasList.find((k) => k.namaKelas.toLowerCase().includes(kelasNamaInput.toLowerCase())) || kelasList[0];
      // Match Mapel
      const matchedMapel =
        mapelList.find((m) => m.nama.toLowerCase().includes(mapelNamaInput.toLowerCase())) || mapelList[0];

      if (matchedGuru && matchedKelas && matchedMapel) {
        results.push({
          id: `JDW-${Date.now().toString().slice(-4)}-${i}`,
          hari,
          jamKe,
          jamMulai,
          jamSelesai,
          guruId: matchedGuru.id,
          guruNama: matchedGuru.nama,
          mapelId: matchedMapel.id,
          mapelNama: matchedMapel.nama,
          kelasId: matchedKelas.id,
          kelasNama: matchedKelas.namaKelas,
          mode: 'NORMAL',
        });
      }
    }
  }
  return results;
}

// ---------------- REKAP PRESENSI CSV ----------------
export function exportPresensiToCSV(records: AbsensiRecord[]): string {
  const header =
    'ID Presensi,Tanggal,Hari,Waktu Scan,Waktu Selesai,Nama Guru,NIP,Kelas,Mata Pelajaran,Jam Ke,Jam Mulai,Jam Selesai,Status,Keterlambatan (Menit),Catatan / Materi,Status Lokasi,Jarak (m),Device\n';
  const rows = records.map((r) => {
    const hari = new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'long' });
    return `"${r.id}","${r.tanggal}","${hari}","${r.waktuScan}","${r.waktuSelesai || '-'}","${(r.guruNama || '').replace(/"/g, '""')}","${r.nip || '-'}","${r.kelasNama}","${(r.mapelNama || '').replace(/"/g, '""')}","${r.jamKe || '-'}","${r.jamMulai || '-'}","${r.jamSelesai || '-'}","${r.status}","${r.menitKeterlambatan || 0}","${(r.catatan || r.materiAjar || '-').replace(/"/g, '""')}","${r.isInsideRadius ? 'DI DALAM RADIUS' : 'LUAR RADIUS'}","${r.distanceFromSchool || 0}","${r.deviceInfo || '-'}"`;
  });
  return header + rows.join('\n');
}

// Helper to parse comma/semicolon/tab-separated CSV lines with quoted text
function parseCSVLine(text: string): string[] {
  const delimiter = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ',';
  const result: string[] = [];
  let current = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (insideQuote && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === delimiter && !insideQuote) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
