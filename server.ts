import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// File storage path for persistent server-side JSON database
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial dataset
const INITIAL_DATA = {
  settings: {
    namaMadrasah: 'Madrasah Ibtidaiyah Negeri 1 Model',
    npsn: '60728192',
    alamatMadrasah: 'Jl. Kemenag No. 45, Komplek Pendidikan Islami, Jakarta Timur',
    namaKepalaMadrasah: 'Drs. H. M. Syaifuddin, M.Pd.I',
    nipKepalaMadrasah: '197405121999031004',
    logoUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=160&auto=format&fit=crop&q=80',
    timezone: 'Asia/Jakarta',
    latitudeMadrasah: -6.229728,
    longitudeMadrasah: 106.829445,
    radiusAbsensiMeter: 150,
    batasTerlambatMenit: 10,
    modeQR: 'PERMANEN',
    fiturLokasi: true,
    fiturSelfie: true,
    modeRamadan: false,
    toleransiScanAwalMenit: 15,
    autoRefreshIntervalDetik: 15,
    googleSheetsWebhookUrl: '',
    hideDemoButtons: true,
  },
  users: [
    {
      id: 'USR-ADMIN',
      username: 'admin',
      name: 'Administrator Madrasah',
      role: 'ADMIN',
      email: 'admin@madrasah.sch.id',
      nip: '198801152014031002',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'USR-KEPALA',
      username: 'kepala',
      name: 'Drs. H. M. Syaifuddin, M.Pd.I',
      role: 'KEPALA',
      email: 'kepala@madrasah.sch.id',
      nip: '197405121999031004',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
  ],
  guru: [],
  kelas: [
    {
      id: 'KELAS-6A',
      namaKelas: 'Kelas 6A',
      tingkat: '6',
      ruangan: 'Gedung Umar bin Khattab Lt. 2 R.201',
      qrCode: 'QR-KELAS-6A-WM928',
      status: 'AKTIF',
      kapasitas: 28,
    },
    {
      id: 'KELAS-6B',
      namaKelas: 'Kelas 6B',
      tingkat: '6',
      ruangan: 'Gedung Umar bin Khattab Lt. 2 R.202',
      qrCode: 'QR-KELAS-6B-WM929',
      status: 'AKTIF',
      kapasitas: 30,
    },
    {
      id: 'KELAS-5A',
      namaKelas: 'Kelas 5A',
      tingkat: '5',
      ruangan: 'Gedung Abu Bakar Ash-Shiddiq Lt. 1 R.101',
      qrCode: 'QR-KELAS-5A-WM814',
      status: 'AKTIF',
      kapasitas: 30,
    },
    {
      id: 'KELAS-5B',
      namaKelas: 'Kelas 5B',
      tingkat: '5',
      ruangan: 'Gedung Abu Bakar Ash-Shiddiq Lt. 1 R.102',
      qrCode: 'QR-KELAS-5B-WM815',
      status: 'AKTIF',
      kapasitas: 29,
    },
    {
      id: 'KELAS-4A',
      namaKelas: 'Kelas 4A',
      tingkat: '4',
      ruangan: 'Gedung Ali bin Abi Thalib Lt. 1 R.103',
      qrCode: 'QR-KELAS-4A-WM701',
      status: 'AKTIF',
      kapasitas: 28,
    },
    {
      id: 'KELAS-4B',
      namaKelas: 'Kelas 4B',
      tingkat: '4',
      ruangan: 'Gedung Ali bin Abi Thalib Lt. 1 R.104',
      qrCode: 'QR-KELAS-4B-WM702',
      status: 'AKTIF',
      kapasitas: 31,
    },
  ],
  mapel: [
    { id: 'MP-01', kode: 'IPAS', nama: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', kelompok: 'Umum' },
    { id: 'MP-02', kode: 'BIND', nama: 'Bahasa Indonesia', kelompok: 'Umum' },
    { id: 'MP-03', kode: 'MTK', nama: 'Matematika', kelompok: 'Umum' },
    { id: 'MP-04', kode: 'QH', nama: "Al-Qur'an Hadis", kelompok: 'Agama' },
    { id: 'MP-05', kode: 'AA', nama: 'Akidah Akhlak', kelompok: 'Agama' },
    { id: 'MP-06', kode: 'FIQ', nama: 'Fikih', kelompok: 'Agama' },
    { id: 'MP-07', kode: 'SKI', nama: 'Sejarah Kebudayaan Islam (SKI)', kelompok: 'Agama' },
    { id: 'MP-08', kode: 'BARB', nama: 'Bahasa Arab', kelompok: 'Agama' },
    { id: 'MP-09', kode: 'PJOK', nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kelompok: 'Umum' },
    { id: 'MP-10', kode: 'SBDP', nama: 'Seni Budaya dan Prakarya', kelompok: 'Muatan Lokal' },
  ],
  jadwal: [],
  presensi: [],
  logs: [],
  lastUpdated: new Date().toISOString(),
};

// In-memory cached database object for fast access & persistence
let memoryDb: any = null;

function readDb(): any {
  if (memoryDb) {
    return memoryDb;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          memoryDb = {
            settings: { ...INITIAL_DATA.settings, ...(parsed.settings || {}) },
            users: Array.isArray(parsed.users) ? parsed.users : INITIAL_DATA.users,
            guru: Array.isArray(parsed.guru) ? parsed.guru : (parsed.guru !== undefined ? [] : INITIAL_DATA.guru),
            kelas: Array.isArray(parsed.kelas) ? parsed.kelas : (parsed.kelas !== undefined ? [] : INITIAL_DATA.kelas),
            mapel: Array.isArray(parsed.mapel) ? parsed.mapel : (parsed.mapel !== undefined ? [] : INITIAL_DATA.mapel),
            jadwal: Array.isArray(parsed.jadwal) ? parsed.jadwal : (parsed.jadwal !== undefined ? [] : INITIAL_DATA.jadwal),
            presensi: Array.isArray(parsed.presensi) ? parsed.presensi : (parsed.presensi !== undefined ? [] : INITIAL_DATA.presensi),
            logs: Array.isArray(parsed.logs) ? parsed.logs : [],
            lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          };
          return memoryDb;
        }
      }
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }

  // Initialize with initial dataset
  memoryDb = JSON.parse(JSON.stringify(INITIAL_DATA));
  writeDb(memoryDb);
  return memoryDb;
}

function writeDb(data: any): boolean {
  try {
    memoryDb = data;
    memoryDb.lastUpdated = new Date().toISOString();
    
    // Atomic write to prevent partial file writes
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryDb, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// ----------------------------------------------------
// API ROUTES FOR CENTRALIZED DATA SYNC & CRUD
// ----------------------------------------------------

// 1. Get entire synced state
app.get('/api/sync', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db, timestamp: new Date().toISOString() });
});

// 2. Full Sync (Push client changes / authoritative replace)
app.post('/api/sync', (req, res) => {
  try {
    const incoming = req.body;
    let currentDb = readDb();

    if (incoming.guru && Array.isArray(incoming.guru)) {
      currentDb.guru = incoming.guru;
    }
    if (incoming.users && Array.isArray(incoming.users)) {
      currentDb.users = incoming.users;
    }
    if (incoming.kelas && Array.isArray(incoming.kelas)) {
      currentDb.kelas = incoming.kelas;
    }
    if (incoming.mapel && Array.isArray(incoming.mapel)) {
      currentDb.mapel = incoming.mapel;
    }
    if (incoming.jadwal && Array.isArray(incoming.jadwal)) {
      currentDb.jadwal = incoming.jadwal;
    }
    if (incoming.settings && typeof incoming.settings === 'object') {
      currentDb.settings = { ...currentDb.settings, ...incoming.settings };
    }
    if (incoming.presensi && Array.isArray(incoming.presensi)) {
      currentDb.presensi = incoming.presensi;
    }
    if (incoming.logs && Array.isArray(incoming.logs)) {
      currentDb.logs = incoming.logs.slice(0, 200);
    }

    writeDb(currentDb);
    res.json({ success: true, data: currentDb, message: 'Sinkronisasi berhasil' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Save/Update Single Guru
app.post('/api/guru', (req, res) => {
  try {
    const guru = req.body;
    if (!guru || !guru.nama || typeof guru.nama !== 'string' || !guru.nama.trim()) {
      return res.status(400).json({ success: false, error: 'Data guru tidak valid: Nama wajib diisi' });
    }

    const guruId = guru.id && guru.id.trim() ? guru.id.trim() : `GURU-${Date.now()}`;
    const cleanUsername = guru.username && guru.username.trim()
      ? guru.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
      : `guru_${Date.now().toString(36)}`;

    const sanitizedGuru = {
      id: guruId,
      nip: guru.nip?.trim() || '-',
      nik: guru.nik?.trim() || '-',
      nama: guru.nama.trim(),
      username: cleanUsername,
      password: guru.password?.trim() || 'password123',
      mapelUtama: guru.mapelUtama?.trim() || 'Umum',
      noHp: guru.noHp?.trim() || '-',
      status: guru.status || 'AKTIF',
      fotoUrl: guru.fotoUrl || '',
      pendidikan: guru.pendidikan?.trim() || 'S1 Pendidikan',
      email: guru.email?.trim() || '',
    };

    let currentDb = readDb();
    const list = Array.isArray(currentDb.guru) ? currentDb.guru : [];
    const index = list.findIndex((g: any) => g.id === sanitizedGuru.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...sanitizedGuru };
    } else {
      list.push(sanitizedGuru);
    }
    currentDb.guru = list;

    // Sync users list
    const users = Array.isArray(currentDb.users) ? currentDb.users : [];
    const userIndex = users.findIndex((u: any) => u.guruId === sanitizedGuru.id || u.username === sanitizedGuru.username);
    const userObj = {
      id: userIndex >= 0 ? users[userIndex].id : `USR-${sanitizedGuru.id}`,
      username: sanitizedGuru.username,
      name: sanitizedGuru.nama,
      role: 'GURU',
      guruId: sanitizedGuru.id,
      email: sanitizedGuru.email || '',
      nip: sanitizedGuru.nip || '',
      avatarUrl: sanitizedGuru.fotoUrl || '',
    };
    if (userIndex >= 0) {
      users[userIndex] = userObj;
    } else {
      users.push(userObj);
    }
    currentDb.users = users;

    writeDb(currentDb);
    res.json({ success: true, data: sanitizedGuru, guruList: currentDb.guru, users: currentDb.users });
  } catch (err: any) {
    console.error('Error saving guru:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b. Batch Save/Import Guru
app.post('/api/guru/batch', (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar guru tidak valid' });
    }

    let currentDb = readDb();
    const list = Array.isArray(currentDb.guru) ? [...currentDb.guru] : [];
    const users = Array.isArray(currentDb.users) ? [...currentDb.users] : [];

    for (const guru of items) {
      if (!guru.nama || !guru.nama.trim()) continue;
      const guruId = guru.id && guru.id.trim() ? guru.id.trim() : `GURU-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanUsername = guru.username && guru.username.trim()
        ? guru.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
        : `guru_${Date.now().toString(36)}`;

      const sanitizedGuru = {
        id: guruId,
        nip: guru.nip?.trim() || '-',
        nik: guru.nik?.trim() || '-',
        nama: guru.nama.trim(),
        username: cleanUsername,
        password: guru.password?.trim() || 'password123',
        mapelUtama: guru.mapelUtama?.trim() || 'Umum',
        noHp: guru.noHp?.trim() || '-',
        status: guru.status || 'AKTIF',
        fotoUrl: guru.fotoUrl || '',
        pendidikan: guru.pendidikan?.trim() || 'S1 Pendidikan',
        email: guru.email?.trim() || '',
      };

      const gIdx = list.findIndex((g: any) => g.id === sanitizedGuru.id);
      if (gIdx >= 0) {
        list[gIdx] = { ...list[gIdx], ...sanitizedGuru };
      } else {
        list.push(sanitizedGuru);
      }

      const uIdx = users.findIndex((u: any) => u.guruId === sanitizedGuru.id || u.username === sanitizedGuru.username);
      const userObj = {
        id: uIdx >= 0 ? users[uIdx].id : `USR-${sanitizedGuru.id}`,
        username: sanitizedGuru.username,
        name: sanitizedGuru.nama,
        role: 'GURU',
        guruId: sanitizedGuru.id,
        email: sanitizedGuru.email || '',
        nip: sanitizedGuru.nip || '',
        avatarUrl: sanitizedGuru.fotoUrl || '',
      };
      if (uIdx >= 0) {
        users[uIdx] = userObj;
      } else {
        users.push(userObj);
      }
    }

    currentDb.guru = list;
    currentDb.users = users;
    writeDb(currentDb);

    res.json({ success: true, count: items.length, guruList: currentDb.guru, users: currentDb.users });
  } catch (err: any) {
    console.error('Error batch saving guru:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Delete Single Guru (with clean cascade for users, kelas, and jadwal)
app.delete('/api/guru/:id', (req, res) => {
  try {
    const id = req.params.id;
    let currentDb = readDb();
    currentDb.guru = (currentDb.guru || []).filter((g: any) => g.id !== id);
    currentDb.users = (currentDb.users || []).filter((u: any) => u.guruId !== id);
    
    // Clean up wali kelas references
    currentDb.kelas = (currentDb.kelas || []).map((k: any) => {
      if (k.waliKelasId === id) {
        return { ...k, waliKelasId: '-', waliKelasNama: '-' };
      }
      return k;
    });

    // Remove any jadwal assigned to this deleted guru
    currentDb.jadwal = (currentDb.jadwal || []).filter((j: any) => j.guruId !== id);

    writeDb(currentDb);
    res.json({
      success: true,
      guruList: currentDb.guru,
      users: currentDb.users,
      kelasList: currentDb.kelas,
      jadwalList: currentDb.jadwal,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Save/Update Single Kelas
app.post('/api/kelas', (req, res) => {
  try {
    const kelas = req.body;
    if (!kelas || !kelas.id || !kelas.namaKelas) {
      return res.status(400).json({ success: false, error: 'Data kelas tidak valid' });
    }
    let currentDb = readDb();
    const list = currentDb.kelas || [];
    const index = list.findIndex((k: any) => k.id === kelas.id);
    if (index >= 0) {
      list[index] = kelas;
    } else {
      list.push(kelas);
    }
    currentDb.kelas = list;
    writeDb(currentDb);
    res.json({ success: true, data: kelas, kelasList: currentDb.kelas });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Delete Single Kelas (with cascade for jadwal)
app.delete('/api/kelas/:id', (req, res) => {
  try {
    const id = req.params.id;
    let currentDb = readDb();
    currentDb.kelas = (currentDb.kelas || []).filter((k: any) => k.id !== id);
    currentDb.jadwal = (currentDb.jadwal || []).filter((j: any) => j.kelasId !== id);
    writeDb(currentDb);
    res.json({ success: true, kelasList: currentDb.kelas, jadwalList: currentDb.jadwal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Save/Update Single Mapel
app.post('/api/mapel', (req, res) => {
  try {
    const mapel = req.body;
    if (!mapel || !mapel.id || !mapel.nama) {
      return res.status(400).json({ success: false, error: 'Data mapel tidak valid' });
    }
    let currentDb = readDb();
    const list = currentDb.mapel || [];
    const index = list.findIndex((m: any) => m.id === mapel.id);
    if (index >= 0) {
      list[index] = mapel;
    } else {
      list.push(mapel);
    }
    currentDb.mapel = list;
    writeDb(currentDb);
    res.json({ success: true, data: mapel, mapelList: currentDb.mapel });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Delete Single Mapel (with cascade for jadwal)
app.delete('/api/mapel/:id', (req, res) => {
  try {
    const id = req.params.id;
    let currentDb = readDb();
    currentDb.mapel = (currentDb.mapel || []).filter((m: any) => m.id !== id);
    currentDb.jadwal = (currentDb.jadwal || []).filter((j: any) => j.mapelId !== id);
    writeDb(currentDb);
    res.json({ success: true, mapelList: currentDb.mapel, jadwalList: currentDb.jadwal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Save/Update Single Jadwal
app.post('/api/jadwal', (req, res) => {
  try {
    const jadwal = req.body;
    if (!jadwal || !jadwal.id || !jadwal.hari) {
      return res.status(400).json({ success: false, error: 'Data jadwal tidak valid' });
    }
    let currentDb = readDb();
    const list = currentDb.jadwal || [];
    const index = list.findIndex((j: any) => j.id === jadwal.id);
    if (index >= 0) {
      list[index] = jadwal;
    } else {
      list.push(jadwal);
    }
    currentDb.jadwal = list;
    writeDb(currentDb);
    res.json({ success: true, data: jadwal, jadwalList: currentDb.jadwal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Delete Single Jadwal
app.delete('/api/jadwal/:id', (req, res) => {
  try {
    const id = req.params.id;
    let currentDb = readDb();
    currentDb.jadwal = (currentDb.jadwal || []).filter((j: any) => j.id !== id);
    writeDb(currentDb);
    res.json({ success: true, jadwalList: currentDb.jadwal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Save App Settings
app.post('/api/settings', (req, res) => {
  try {
    const settings = req.body;
    let currentDb = readDb();
    currentDb.settings = { ...currentDb.settings, ...settings };
    writeDb(currentDb);
    res.json({ success: true, settings: currentDb.settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Post/Update Presensi Scan
app.post('/api/presensi', (req, res) => {
  try {
    const newPresensi = req.body;
    if (!newPresensi || !newPresensi.id) {
      return res.status(400).json({ success: false, error: 'Invalid presensi data' });
    }

    let currentDb = readDb();
    const existingIndex = (currentDb.presensi || []).findIndex((p: any) => p.id === newPresensi.id);
    if (existingIndex >= 0) {
      currentDb.presensi[existingIndex] = { ...currentDb.presensi[existingIndex], ...newPresensi };
    } else {
      currentDb.presensi = [newPresensi, ...(currentDb.presensi || [])];
    }

    writeDb(currentDb);
    res.json({ success: true, data: newPresensi, presensiList: currentDb.presensi });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Delete Single Presensi
app.delete('/api/presensi/:id', (req, res) => {
  try {
    const id = req.params.id;
    let currentDb = readDb();
    currentDb.presensi = (currentDb.presensi || []).filter((p: any) => p.id !== id);
    writeDb(currentDb);
    res.json({ success: true, presensiList: currentDb.presensi });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13b. Clear all / batch Presensi
app.delete('/api/presensi', (req, res) => {
  try {
    let currentDb = readDb();
    currentDb.presensi = [];
    writeDb(currentDb);
    res.json({ success: true, presensiList: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Export/Backup full Database JSON
app.get('/api/backup/download', (req, res) => {
  const db = readDb();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=si-absen-backup-${new Date().toISOString().split('T')[0]}.json`);
  res.send(JSON.stringify(db, null, 2));
});

// 15. Restore database from JSON
app.post('/api/backup/restore', (req, res) => {
  try {
    const importedData = req.body;
    if (!importedData || typeof importedData !== 'object') {
      return res.status(400).json({ success: false, error: 'File format tidak valid' });
    }
    const cleanDb = {
      settings: { ...INITIAL_DATA.settings, ...(importedData.settings || {}) },
      users: Array.isArray(importedData.users) ? importedData.users : INITIAL_DATA.users,
      guru: Array.isArray(importedData.guru) ? importedData.guru : INITIAL_DATA.guru,
      kelas: Array.isArray(importedData.kelas) ? importedData.kelas : INITIAL_DATA.kelas,
      mapel: Array.isArray(importedData.mapel) ? importedData.mapel : INITIAL_DATA.mapel,
      jadwal: Array.isArray(importedData.jadwal) ? importedData.jadwal : INITIAL_DATA.jadwal,
      presensi: Array.isArray(importedData.presensi) ? importedData.presensi : [],
      logs: Array.isArray(importedData.logs) ? importedData.logs : [],
      lastUpdated: new Date().toISOString(),
    };
    writeDb(cleanDb);
    res.json({ success: true, data: cleanDb, message: 'Database berhasil dipulihkan dari backup' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Reset database to default sample data
app.post('/api/reset', (req, res) => {
  try {
    const freshDb = JSON.parse(JSON.stringify(INITIAL_DATA));
    writeDb(freshDb);
    res.json({ success: true, data: freshDb, message: 'Database berhasil disetel ulang' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// VITE & STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SI-ABSEN running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
