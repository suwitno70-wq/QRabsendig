import {
  AppSettings,
  Guru,
  Kelas,
  Mapel,
  Jadwal,
  AbsensiRecord,
  SystemLog,
  User,
  AttendanceStatus,
} from '../types';

export const STORAGE_KEYS = {
  SETTINGS: 'si_absen_settings_v4',
  USERS: 'si_absen_users_v4',
  CURRENT_USER: 'si_absen_current_user_v4',
  GURU: 'si_absen_guru_v4',
  KELAS: 'si_absen_kelas_v4',
  MAPEL: 'si_absen_mapel_v4',
  JADWAL: 'si_absen_jadwal_v4',
  ABSENSI: 'si_absen_absensi_v4',
  LOGS: 'si_absen_logs_v4',
  SYNC_TIMESTAMP: 'si_absen_sync_ts_v4',
};

// Initial Seed Settings
export const INITIAL_SETTINGS: AppSettings = {
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
};

export const INITIAL_USERS: User[] = [
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
];

export const INITIAL_GURU: Guru[] = [];

export const INITIAL_KELAS: Kelas[] = [
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
];

export const INITIAL_MAPEL: Mapel[] = [
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
];

export const INITIAL_JADWAL: Jadwal[] = [];

export const INITIAL_ABSENSI: AbsensiRecord[] = [];

type StorageListener = () => void;

export class AppStorage {
  private static listeners: Set<StorageListener> = new Set();
  private static syncInitialized = false;
  private static isSyncing = false;
  private static pendingMutations = 0;
  private static lastMutationTime = 0;
  private static isOnline = true;

  // Subscription pattern for reactive state updates
  static subscribe(callback: StorageListener): () => void {
    this.listeners.add(callback);
    this.initSync();
    return () => {
      this.listeners.delete(callback);
    };
  }

  static notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  // --- REAL-TIME SERVER SYNC ENGINE ---
  static initSync() {
    if (this.syncInitialized || typeof window === 'undefined') return;
    this.syncInitialized = true;

    // Pull initial server sync
    this.pullServerSync();

    // Auto-poll every 5 seconds for real-time live monitoring
    setInterval(() => {
      this.pullServerSync();
    }, 5000);
  }

  static isServerConnected(): boolean {
    return this.isOnline;
  }

  static async pullServerSync() {
    // If a local mutation (save/edit/delete) is in progress or was just performed within 2.5s, skip polling
    if (this.isSyncing || this.pendingMutations > 0 || Date.now() - this.lastMutationTime < 2500) return;
    try {
      this.isSyncing = true;
      const res = await fetch('/api/sync');
      if (!res.ok) {
        this.isOnline = false;
        return;
      }
      const result = await res.json();
      this.isOnline = true;

      if (result.success && result.data && this.pendingMutations === 0 && Date.now() - this.lastMutationTime >= 2500) {
        const serverDb = result.data;
        let hasChanges = false;

        // Sync Guru
        if (serverDb.guru && Array.isArray(serverDb.guru)) {
          const localGuru = this.getGuruList();
          if (JSON.stringify(localGuru) !== JSON.stringify(serverDb.guru)) {
            localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(serverDb.guru));
            hasChanges = true;
          }
        }

        // Sync Users
        if (serverDb.users && Array.isArray(serverDb.users)) {
          const localUsers = this.getUsers();
          if (JSON.stringify(localUsers) !== JSON.stringify(serverDb.users)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(serverDb.users));
            hasChanges = true;
          }
        }

        // Sync Kelas
        if (serverDb.kelas && Array.isArray(serverDb.kelas)) {
          const localKelas = this.getKelasList();
          if (JSON.stringify(localKelas) !== JSON.stringify(serverDb.kelas)) {
            localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(serverDb.kelas));
            hasChanges = true;
          }
        }

        // Sync Mapel
        if (serverDb.mapel && Array.isArray(serverDb.mapel)) {
          const localMapel = this.getMapelList();
          if (JSON.stringify(localMapel) !== JSON.stringify(serverDb.mapel)) {
            localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(serverDb.mapel));
            hasChanges = true;
          }
        }

        // Sync Jadwal
        if (serverDb.jadwal && Array.isArray(serverDb.jadwal)) {
          const localJadwal = this.getJadwalList();
          if (JSON.stringify(localJadwal) !== JSON.stringify(serverDb.jadwal)) {
            localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(serverDb.jadwal));
            hasChanges = true;
          }
        }

        // Sync Absensi (authoritative server sync, no resurrecting deleted records)
        if (serverDb.presensi && Array.isArray(serverDb.presensi)) {
          const localAbsensi = this.getAbsensiList();
          if (JSON.stringify(localAbsensi) !== JSON.stringify(serverDb.presensi)) {
            localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(serverDb.presensi));
            hasChanges = true;
          }
        }

        // Sync Settings
        if (serverDb.settings) {
          const localSettings = this.getSettings();
          if (JSON.stringify(localSettings) !== JSON.stringify(serverDb.settings)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(serverDb.settings));
            hasChanges = true;
          }
        }

        if (hasChanges) {
          this.notify();
        }
      }
    } catch {
      this.isOnline = false;
    } finally {
      this.isSyncing = false;
    }
  }

  static async pushAllToServer() {
    try {
      const payload = {
        settings: this.getSettings(),
        guru: this.getGuruList(),
        users: this.getUsers(),
        kelas: this.getKelasList(),
        mapel: this.getMapelList(),
        jadwal: this.getJadwalList(),
        presensi: this.getAbsensiList(),
        logs: this.getLogs(),
      };
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      this.isOnline = true;
    } catch {
      this.isOnline = false;
    }
  }

  // --- SETTINGS ---
  static getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static async saveSettings(settings: AppSettings): Promise<boolean> {
    this.pendingMutations++;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      this.logAction('Pengaturan sistem disimpan', 'ADMIN', 'INFO', settings.namaMadrasah);
      this.notify();

      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        this.isOnline = true;
      } catch (err) {
        console.warn('Saving settings to server API failed, cached locally', err);
      }
      return true;
    } finally {
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  // --- USERS & AUTH ---
  static getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  }

  static getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.logAction(`Login ${user.role}: ${user.name}`, user.username, 'SUCCESS', user.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  // --- GURU ---
  static getGuruList(): Guru[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GURU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(INITIAL_GURU));
      return INITIAL_GURU;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_GURU;
    } catch {
      return INITIAL_GURU;
    }
  }

  static async saveGuru(guru: Guru): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getGuruList();
      const index = list.findIndex((g) => g.id === guru.id);
      if (index >= 0) {
        list[index] = guru;
      } else {
        list.push(guru);
      }
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));
      this.syncUserForGuru(guru);
      this.logAction(`Data guru disimpan: ${guru.nama}`, 'ADMIN', 'INFO', guru.id);
      this.notify();

      try {
        const res = await fetch('/api/guru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guru),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.guruList) {
            localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(json.guruList));
          }
          if (json.users) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(json.users));
          }
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Sync guru to server failed, data saved locally', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static async deleteGuru(id: string): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getGuruList().filter((g) => g.id !== id);
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));

      const users = this.getUsers().filter((u) => u.guruId !== id);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Clean up wali kelas in kelas
      const kelas = this.getKelasList().map((k) =>
        k.waliKelasId === id ? { ...k, waliKelasId: '-', waliKelasNama: '-' } : k
      );
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(kelas));

      // Clean up assigned jadwal
      const jadwal = this.getJadwalList().filter((j) => j.guruId !== id);
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwal));

      this.logAction(`Guru dihapus: ${id}`, 'ADMIN', 'WARNING', id);
      this.notify();

      try {
        const res = await fetch(`/api/guru/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.guruList) localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(json.guruList));
          if (json.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(json.users));
          if (json.kelasList) localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(json.kelasList));
          if (json.jadwalList) localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(json.jadwalList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Delete guru on server failed, updated locally', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  private static syncUserForGuru(guru: Guru) {
    const users = this.getUsers();
    const existingIndex = users.findIndex((u) => u.guruId === guru.id || u.username === guru.username);
    const userObj: User = {
      id: existingIndex >= 0 ? users[existingIndex].id : `USR-${guru.id}`,
      username: guru.username,
      name: guru.nama,
      role: 'GURU',
      guruId: guru.id,
      email: guru.email || '',
      nip: guru.nip || '',
      avatarUrl: guru.fotoUrl || '',
    };
    if (existingIndex >= 0) {
      users[existingIndex] = userObj;
    } else {
      users.push(userObj);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- KELAS ---
  static getKelasList(): Kelas[] {
    const raw = localStorage.getItem(STORAGE_KEYS.KELAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS));
      return INITIAL_KELAS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_KELAS;
    } catch {
      return INITIAL_KELAS;
    }
  }

  static async saveKelas(kelas: Kelas): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getKelasList();
      const index = list.findIndex((k) => k.id === kelas.id);
      if (index >= 0) {
        list[index] = kelas;
      } else {
        list.push(kelas);
      }
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
      this.logAction(`Data kelas disimpan: ${kelas.namaKelas}`, 'ADMIN', 'INFO', kelas.id);
      this.notify();

      try {
        const res = await fetch('/api/kelas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(kelas),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.kelasList) localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(json.kelasList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Sync kelas to server failed, data saved locally', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static async deleteKelas(id: string): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getKelasList().filter((k) => k.id !== id);
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));

      const jadwal = this.getJadwalList().filter((j) => j.kelasId !== id);
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwal));

      this.logAction(`Kelas dihapus: ${id}`, 'ADMIN', 'WARNING', id);
      this.notify();

      try {
        const res = await fetch(`/api/kelas/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.kelasList) localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(json.kelasList));
          if (json.jadwalList) localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(json.jadwalList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Delete kelas on server failed', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  // --- MAPEL ---
  static getMapelList(): Mapel[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MAPEL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(INITIAL_MAPEL));
      return INITIAL_MAPEL;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_MAPEL;
    } catch {
      return INITIAL_MAPEL;
    }
  }

  static async saveMapel(mapel: Mapel): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getMapelList();
      const index = list.findIndex((m) => m.id === mapel.id);
      if (index >= 0) {
        list[index] = mapel;
      } else {
        list.push(mapel);
      }
      localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(list));
      this.logAction(`Mata pelajaran disimpan: ${mapel.nama}`, 'ADMIN', 'INFO', mapel.kode);
      this.notify();

      try {
        const res = await fetch('/api/mapel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapel),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.mapelList) localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(json.mapelList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Sync mapel to server failed, saved locally', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static async deleteMapel(id: string): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getMapelList().filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(list));

      const jadwal = this.getJadwalList().filter((j) => j.mapelId !== id);
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwal));

      this.logAction(`Mapel dihapus: ${id}`, 'ADMIN', 'WARNING', id);
      this.notify();

      try {
        const res = await fetch(`/api/mapel/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.mapelList) localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(json.mapelList));
          if (json.jadwalList) localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(json.jadwalList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Delete mapel on server failed', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  // --- JADWAL ---
  static getJadwalList(): Jadwal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JADWAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(INITIAL_JADWAL));
      return INITIAL_JADWAL;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_JADWAL;
    } catch {
      return INITIAL_JADWAL;
    }
  }

  static async saveJadwal(jadwal: Jadwal): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getJadwalList();
      const index = list.findIndex((j) => j.id === jadwal.id);
      if (index >= 0) {
        list[index] = jadwal;
      } else {
        list.push(jadwal);
      }
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(list));
      this.logAction(
        `Jadwal disimpan: ${jadwal.hari} (${jadwal.kelasNama} - ${jadwal.mapelNama})`,
        'ADMIN',
        'INFO',
        jadwal.id
      );
      this.notify();

      try {
        const res = await fetch('/api/jadwal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jadwal),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.jadwalList) localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(json.jadwalList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Sync jadwal to server failed, saved locally', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static async deleteJadwal(id: string): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getJadwalList().filter((j) => j.id !== id);
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(list));
      this.logAction(`Jadwal dihapus: ${id}`, 'ADMIN', 'WARNING', id);
      this.notify();

      try {
        const res = await fetch(`/api/jadwal/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.jadwalList) localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(json.jadwalList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Delete jadwal on server failed', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  // --- ABSENSI ---
  static getAbsensiList(): AbsensiRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ABSENSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(INITIAL_ABSENSI));
      return INITIAL_ABSENSI;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_ABSENSI;
    } catch {
      return INITIAL_ABSENSI;
    }
  }

  static async deleteAbsensi(id: string): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getAbsensiList().filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
      this.logAction(`Data presensi dihapus: ${id}`, 'ADMIN', 'WARNING', id);
      this.notify();

      try {
        const res = await fetch(`/api/presensi/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.presensiList) localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(json.presensiList));
        }
        this.isOnline = true;
      } catch (e) {
        console.warn('Delete presensi on server failed', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static async clearAllAbsensi(): Promise<boolean> {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify([]));
      this.logAction('Seluruh riwayat presensi dibersihkan', 'ADMIN', 'WARNING', 'Clear All Presensi');
      this.notify();

      try {
        await fetch('/api/presensi', {
          method: 'DELETE',
        });
        this.isOnline = true;
      } catch (e) {
        console.warn('Clear presensi on server failed', e);
      }
      return true;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static recordAbsensi(record: AbsensiRecord): AbsensiRecord {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getAbsensiList();
      const existingIndex = list.findIndex(
        (a) => a.tanggal === record.tanggal && a.jadwalId === record.jadwalId && a.guruId === record.guruId
      );

      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...record };
      } else {
        list.unshift(record);
      }

      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
      this.logAction(
        `Presensi berhasil: ${record.guruNama} di ${record.kelasNama} (${record.status})`,
        record.guruNama,
        'SUCCESS',
        `Jadwal: ${record.jadwalId}, Jam: ${record.waktuScan}`
      );

      // Post to Server Database for multi-device live sync
      fetch('/api/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).catch(() => {});

      // Forward to Google Sheets Webhook if configured
      const settings = this.getSettings();
      if (settings.googleSheetsWebhookUrl && settings.googleSheetsWebhookUrl.trim().startsWith('http')) {
        try {
          fetch(settings.googleSheetsWebhookUrl.trim(), {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: record.id,
              tanggal: record.tanggal,
              guruNama: record.guruNama,
              nip: record.nip,
              mataPelajaranNama: record.mapelNama,
              kelasNama: record.kelasNama,
              jamMulai: record.jamMulai,
              jamSelesai: record.jamSelesai,
              statusKehadiran: record.status,
              jarakMeter: record.distanceFromSchool || 0,
              latitude: record.latitude || 0,
              longitude: record.longitude || 0,
              waktuScanMasuk: record.waktuScan,
              fotoSelfieUrl: record.selfieUrl || '',
            }),
          }).catch(() => {});
        } catch (err) {
          console.error('Failed to post to Google Sheets Webhook:', err);
        }
      }

      this.notify();
      return record;
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static updateAbsensiStatus(id: string, status: AttendanceStatus, waktuSelesai?: string, materiAjar?: string) {
    this.pendingMutations++;
    this.lastMutationTime = Date.now();
    try {
      const list = this.getAbsensiList();
      const item = list.find((a) => a.id === id);
      if (item) {
        item.status = status;
        if (waktuSelesai) item.waktuSelesai = waktuSelesai;
        if (materiAjar) item.materiAjar = materiAjar;
        localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
        this.logAction(`Update status presensi: ${item.guruNama} -> ${status}`, item.guruNama, 'INFO', id);

        fetch('/api/presensi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(() => {});

        this.notify();
      }
    } finally {
      this.lastMutationTime = Date.now();
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }

  static finishAbsensi(id: string, materiAjar?: string) {
    const now = new Date();
    const waktuSelesai = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.updateAbsensiStatus(id, 'SELESAI_MENGAJAR', waktuSelesai, materiAjar);
  }

  // --- LOGS ---
  static getLogs(): SystemLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static logAction(action: string, actor: string, type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS', details: string = '') {
    const logs = this.getLogs();
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      actor,
      action,
      details,
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  static clearLogs() {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    this.pushAllToServer();
    this.notify();
  }

  // --- BACKUP & RESTORE UTILITIES ---
  static exportFullBackupJSON(): string {
    const fullDb = {
      settings: this.getSettings(),
      users: this.getUsers(),
      guru: this.getGuruList(),
      kelas: this.getKelasList(),
      mapel: this.getMapelList(),
      jadwal: this.getJadwalList(),
      presensi: this.getAbsensiList(),
      logs: this.getLogs(),
      exportTimestamp: new Date().toISOString(),
      appVersion: '2.0.0',
    };
    return JSON.stringify(fullDb, null, 2);
  }

  static async importFullBackupJSON(jsonStr: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        throw new Error('Format JSON tidak valid');
      }

      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (Array.isArray(data.users)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (Array.isArray(data.guru)) localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(data.guru));
      if (Array.isArray(data.kelas)) localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(data.kelas));
      if (Array.isArray(data.mapel)) localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(data.mapel));
      if (Array.isArray(data.jadwal)) localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(data.jadwal));
      if (Array.isArray(data.presensi)) localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(data.presensi));

      // Push to server database
      await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      this.logAction('Database dipulihkan dari file backup', 'ADMIN', 'SUCCESS', 'Backup Restore');
      this.notify();
      return { success: true, message: 'Database berhasil dipulihkan!' };
    } catch (err: any) {
      return { success: false, message: `Gagal memulihkan database: ${err.message}` };
    }
  }

  // --- RESET TO DEFAULTS ---
  static async resetToSampleData() {
    this.pendingMutations++;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(INITIAL_GURU));
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS));
      localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(INITIAL_MAPEL));
      localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(INITIAL_JADWAL));
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(INITIAL_ABSENSI));
      localStorage.removeItem(STORAGE_KEYS.LOGS);

      try {
        await fetch('/api/reset', { method: 'POST' });
      } catch {}

      this.logAction('Database disetel ulang ke Data Awal', 'SYSTEM', 'SUCCESS', 'Reset Database');
      this.notify();
    } finally {
      this.pendingMutations = Math.max(0, this.pendingMutations - 1);
    }
  }
}
