import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Guru,
  Kelas,
  Mapel,
  Jadwal,
  AbsensiRecord,
  AppSettings,
  ToastMessage,
} from './types';
import { AppStorage } from './utils/storage';
import { playSuccessSound, playErrorSound, playBeepSound } from './utils/audio';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { LoginView } from './components/auth/LoginView';
import { QRScannerModal } from './components/scanner/QRScannerModal';

// Guru Components
import { TeacherHome } from './components/guru/TeacherHome';
import { TeacherSchedule } from './components/guru/TeacherSchedule';
import { TeacherHistory } from './components/guru/TeacherHistory';
import { TeacherProfile } from './components/guru/TeacherProfile';

// Kepala Madrasah Components
import { LiveMonitoringDashboard } from './components/kepala/LiveMonitoringDashboard';
import { MapMonitoringView } from './components/kepala/MapMonitoringView';

// Admin Components
import { MasterGuru } from './components/admin/MasterGuru';
import { MasterKelas } from './components/admin/MasterKelas';
import { MasterMapel } from './components/admin/MasterMapel';
import { MasterJadwal } from './components/admin/MasterJadwal';
import { QRClassPosters } from './components/admin/QRClassPosters';
import { RekapLaporan } from './components/admin/RekapLaporan';
import { SystemSettings } from './components/admin/SystemSettings';

export default function App() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return AppStorage.getCurrentUser();
  });

  // App Data (synced with AppStorage)
  const [settings, setSettings] = useState<AppSettings>(() => AppStorage.getSettings());
  const [guruList, setGuruList] = useState<Guru[]>(() => AppStorage.getGuruList());
  const [kelasList, setKelasList] = useState<Kelas[]>(() => AppStorage.getKelasList());
  const [mapelList, setMapelList] = useState<Mapel[]>(() => AppStorage.getMapelList());
  const [jadwalList, setJadwalList] = useState<Jadwal[]>(() => AppStorage.getJadwalList());
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(() => AppStorage.getAbsensiList());

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals & Overlays
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [posterKelasModal, setPosterKelasModal] = useState<Kelas | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Subscribe to reactive storage changes
  useEffect(() => {
    const unsubscribe = AppStorage.subscribe(() => {
      setSettings(AppStorage.getSettings());
      setGuruList(AppStorage.getGuruList());
      setKelasList(AppStorage.getKelasList());
      setMapelList(AppStorage.getMapelList());
      setJadwalList(AppStorage.getJadwalList());
      setAbsensiList(AppStorage.getAbsensiList());
    });
    return () => unsubscribe();
  }, []);

  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = (user: User) => {
    AppStorage.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab(user.role === 'GURU' ? 'home' : user.role === 'KEPALA' ? 'live' : 'admin_dashboard');
    playSuccessSound();
    addToast('success', `Selamat Datang, ${user.name}!`, `Masuk sebagai ${user.role}`);
  };

  const handleLogout = () => {
    AppStorage.setCurrentUser(null);
    setCurrentUser(null);
    setActiveTab('home');
    addToast('info', 'Anda telah keluar dari aplikasi');
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (newRole === 'ADMIN') {
      handleLogin({
        id: 'ADM-01',
        username: 'admin',
        name: 'Administrator SI-ABSEN',
        role: 'ADMIN',
        nip: '198801152014031002',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      });
    } else if (newRole === 'KEPALA') {
      handleLogin({
        id: 'KEP-01',
        username: 'kepala',
        name: settings.namaKepalaMadrasah,
        role: 'KEPALA',
        nip: settings.nipKepalaMadrasah,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      });
    } else {
      const guru = guruList[0];
      if (!guru) {
        addToast('warning', 'Belum Ada Data Guru', 'Silakan daftarkan guru melalui Master Data Guru di menu Admin.');
        return;
      }
      handleLogin({
        id: guru.id,
        username: guru.username,
        guruId: guru.id,
        name: guru.nama,
        role: 'GURU',
        nip: guru.nip,
        avatarUrl: guru.fotoUrl,
      });
    }
  };

  // Callback from scanner modal when attendance record is completed
  const handleAttendanceSuccess = (record: AbsensiRecord) => {
    AppStorage.recordAbsensi(record);
    setIsScannerOpen(false);
    playSuccessSound();
    addToast(
      'success',
      'Presensi Mengajar Berhasil!',
      `${record.guruNama} di ${record.kelasNama} (${record.mapelNama}) - Jam Ke-${record.jamKe}`
    );
  };

  const handleFinishTeachingSession = (absensiId: string) => {
    AppStorage.finishAbsensi(absensiId);
    playSuccessSound();
    addToast('success', 'Selesai Mengajar!', 'Status sesi telah diperbarui menjadi SELESAI');
  };

  // If not logged in, show Login page
  if (!currentUser) {
    return (
      <div className="font-sans antialiased text-slate-800 selection:bg-emerald-200">
        <LoginView onLogin={handleLogin} guruList={guruList} settings={settings} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-emerald-200">
      {/* Sleek Sidebar on Desktop (lg+) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenScanner={() => {
            playBeepSound();
            setIsScannerOpen(true);
          }}
          madrasahName={settings.namaMadrasah}
        />
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          settings={settings}
          onLogout={handleLogout}
          onSwitchRole={handleRoleSwitch}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* ================= GURU VIEWS ================= */}
          {currentUser.role === 'GURU' && (
            <>
              {(activeTab === 'home' || activeTab === 'beranda') && (
                <TeacherHome
                  currentUser={currentUser}
                  settings={settings}
                  jadwalList={jadwalList}
                  absensiList={absensiList}
                  kelasList={kelasList}
                  onOpenScanner={() => {
                    playBeepSound();
                    setIsScannerOpen(true);
                  }}
                  onFinishSession={handleFinishTeachingSession}
                  onViewSchedule={() => setActiveTab('schedule')}
                />
              )}

              {(activeTab === 'schedule' || activeTab === 'jadwal') && (
                <TeacherSchedule
                  currentUser={currentUser}
                  jadwalList={jadwalList}
                />
              )}

              {(activeTab === 'history' || activeTab === 'riwayat') && (
                <TeacherHistory
                  currentUser={currentUser}
                  absensiList={absensiList}
                />
              )}

              {(activeTab === 'profile' || activeTab === 'profil') && (
                <TeacherProfile
                  currentUser={currentUser}
                  settings={settings}
                  onLogout={handleLogout}
                  onUpdateUser={(updated) => {
                    setCurrentUser(updated);
                    addToast('success', 'Username / Password berhasil diperbarui!');
                  }}
                />
              )}
            </>
          )}

          {/* ================= KEPALA MADRASAH VIEWS ================= */}
          {currentUser.role === 'KEPALA' && (
            <>
              {(activeTab === 'live' || activeTab === 'dashboard') && (
                <LiveMonitoringDashboard
                  currentUser={currentUser}
                  settings={settings}
                  jadwalList={jadwalList}
                  absensiList={absensiList}
                  kelasList={kelasList}
                  guruList={guruList}
                  onRefresh={() => {
                    setAbsensiList(AppStorage.getAbsensiList());
                    addToast('info', 'Data diperbarui secara realtime');
                  }}
                  onOpenQRPosters={() => setActiveTab('admin_posters')}
                />
              )}

              {(activeTab === 'map' || activeTab === 'peta') && (
                <MapMonitoringView
                  settings={settings}
                  absensiList={absensiList}
                  guruList={guruList}
                />
              )}

              {(activeTab === 'report' || activeTab === 'laporan') && (
                <RekapLaporan
                  absensiList={absensiList}
                  guruList={guruList}
                  kelasList={kelasList}
                  mapelList={mapelList}
                  settings={settings}
                />
              )}

              {(activeTab === 'teachers' || activeTab === 'guru') && (
                <MasterGuru
                  guruList={guruList}
                  mapelList={mapelList}
                  onSaveGuru={async (g) => {
                    await AppStorage.saveGuru(g);
                    setGuruList(AppStorage.getGuruList());
                    addToast('success', 'Data guru diperbarui', g.nama);
                  }}
                  onDeleteGuru={async (id) => {
                    const deleted = guruList.find((g) => g.id === id);
                    await AppStorage.deleteGuru(id);
                    setGuruList(AppStorage.getGuruList());
                    addToast('info', 'Data guru dihapus', deleted?.nama || id);
                  }}
                  onImportGuru={async (imported) => {
                    await AppStorage.saveGuruList(imported);
                    setGuruList(AppStorage.getGuruList());
                    addToast('success', `Berhasil mengimpor ${imported.length} guru`);
                  }}
                />
              )}
            </>
          )}

          {/* ================= ADMIN VIEWS ================= */}
          {currentUser.role === 'ADMIN' && (
            <>
              {(activeTab === 'admin_dashboard' || activeTab === 'dashboard') && (
                <LiveMonitoringDashboard
                  currentUser={currentUser}
                  settings={settings}
                  jadwalList={jadwalList}
                  absensiList={absensiList}
                  kelasList={kelasList}
                  guruList={guruList}
                  onRefresh={() => {
                    setAbsensiList(AppStorage.getAbsensiList());
                  }}
                  onOpenQRPosters={() => setActiveTab('admin_posters')}
                />
              )}

              {(activeTab === 'admin_guru' || activeTab === 'guru') && (
                <MasterGuru
                  guruList={guruList}
                  mapelList={mapelList}
                  onSaveGuru={async (g) => {
                    await AppStorage.saveGuru(g);
                    setGuruList(AppStorage.getGuruList());
                    addToast('success', 'Data guru berhasil disimpan', g.nama);
                  }}
                  onDeleteGuru={async (id) => {
                    const deleted = guruList.find((g) => g.id === id);
                    await AppStorage.deleteGuru(id);
                    setGuruList(AppStorage.getGuruList());
                    addToast('info', 'Data guru dihapus', deleted?.nama || id);
                  }}
                  onImportGuru={async (imported) => {
                    await AppStorage.saveGuruList(imported);
                    setGuruList(AppStorage.getGuruList());
                    addToast('success', `Berhasil mengimpor ${imported.length} guru`);
                  }}
                />
              )}

              {(activeTab === 'admin_kelas' || activeTab === 'kelas') && (
                <MasterKelas
                  kelasList={kelasList}
                  guruList={guruList}
                  onSaveKelas={async (k) => {
                    await AppStorage.saveKelas(k);
                    setKelasList(AppStorage.getKelasList());
                    addToast('success', 'Data kelas berhasil disimpan', k.namaKelas);
                  }}
                  onDeleteKelas={async (id) => {
                    const deleted = kelasList.find((k) => k.id === id);
                    await AppStorage.deleteKelas(id);
                    setKelasList(AppStorage.getKelasList());
                    addToast('info', 'Data kelas dihapus', deleted?.namaKelas || id);
                  }}
                  onPreviewQR={(k) => {
                    setPosterKelasModal(k);
                    setActiveTab('admin_posters');
                  }}
                  onOpenQRPosters={() => setActiveTab('admin_posters')}
                  onImportKelas={async (imported) => {
                    for (const k of imported) {
                      await AppStorage.saveKelas(k);
                    }
                    setKelasList(AppStorage.getKelasList());
                    addToast('success', `Berhasil mengimpor ${imported.length} kelas`);
                  }}
                />
              )}

              {(activeTab === 'admin_mapel' || activeTab === 'mapel') && (
                <MasterMapel
                  mapelList={mapelList}
                  onSaveMapel={async (m) => {
                    await AppStorage.saveMapel(m);
                    setMapelList(AppStorage.getMapelList());
                    addToast('success', 'Data mapel disimpan', m.nama);
                  }}
                  onDeleteMapel={async (id) => {
                    const deleted = mapelList.find((m) => m.id === id);
                    await AppStorage.deleteMapel(id);
                    setMapelList(AppStorage.getMapelList());
                    addToast('info', 'Data mapel dihapus', deleted?.nama || id);
                  }}
                  onImportMapel={async (imported) => {
                    for (const m of imported) {
                      await AppStorage.saveMapel(m);
                    }
                    setMapelList(AppStorage.getMapelList());
                    addToast('success', `Berhasil mengimpor ${imported.length} mapel`);
                  }}
                />
              )}

              {(activeTab === 'admin_jadwal' || activeTab === 'jadwal') && (
                <MasterJadwal
                  jadwalList={jadwalList}
                  guruList={guruList}
                  kelasList={kelasList}
                  mapelList={mapelList}
                  onSaveJadwal={async (j) => {
                    await AppStorage.saveJadwal(j);
                    setJadwalList(AppStorage.getJadwalList());
                    addToast('success', 'Jadwal mengajar disimpan', `${j.hari} - ${j.kelasNama}`);
                  }}
                  onDeleteJadwal={async (id) => {
                    const deleted = jadwalList.find((j) => j.id === id);
                    await AppStorage.deleteJadwal(id);
                    setJadwalList(AppStorage.getJadwalList());
                    addToast('info', 'Jadwal dihapus', deleted ? `${deleted.hari} Jam Ke-${deleted.jamKe}` : id);
                  }}
                  onImportJadwal={async (imported) => {
                    for (const j of imported) {
                      await AppStorage.saveJadwal(j);
                    }
                    setJadwalList(AppStorage.getJadwalList());
                    addToast('success', `Berhasil mengimpor ${imported.length} jadwal`);
                  }}
                />
              )}

              {(activeTab === 'admin_posters' || activeTab === 'qr') && (
                <QRClassPosters
                  kelasList={kelasList}
                  settings={settings}
                  initialSelectedKelas={posterKelasModal}
                />
              )}

              {(activeTab === 'admin_rekap' || activeTab === 'rekap' || activeTab === 'laporan') && (
                <RekapLaporan
                  absensiList={absensiList}
                  guruList={guruList}
                  kelasList={kelasList}
                  mapelList={mapelList}
                  settings={settings}
                  onDeleteAbsensi={async (id) => {
                    await AppStorage.deleteAbsensi(id);
                    setAbsensiList(AppStorage.getAbsensiList());
                    addToast('info', 'Catatan presensi dihapus');
                  }}
                  onClearAllAbsensi={async () => {
                    await AppStorage.clearAllAbsensi();
                    setAbsensiList([]);
                    addToast('warning', 'Seluruh riwayat presensi telah dibersihkan');
                  }}
                />
              )}

              {(activeTab === 'admin_settings' || activeTab === 'settings' || activeTab === 'pengaturan') && (
                <SystemSettings
                  settings={settings}
                  onSaveSettings={async (s) => {
                    await AppStorage.saveSettings(s);
                    setSettings(AppStorage.getSettings());
                    addToast('success', 'Pengaturan sistem disimpan');
                  }}
                  onResetData={() => {
                    setGuruList(AppStorage.getGuruList());
                    setKelasList(AppStorage.getKelasList());
                    setMapelList(AppStorage.getMapelList());
                    setJadwalList(AppStorage.getJadwalList());
                    setAbsensiList(AppStorage.getAbsensiList());
                    setSettings(AppStorage.getSettings());
                    addToast('info', 'Data telah diperbarui dari database');
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Sleek Footer */}
        <footer className="h-10 bg-white border-t border-slate-200 px-6 sm:px-8 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div>SI-ABSEN GURU MENGAJAR v1.0.0 &bull; &copy; 2026</div>
          <div>Scan &bull; Mengajar &bull; Tercatat &bull; Realtime Cloud</div>
        </footer>
      </div>

      {/* QR Scanner Camera Modal */}
      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          currentUser={currentUser}
          settings={settings}
          jadwalList={jadwalList}
          kelasList={kelasList}
          absensiList={absensiList}
          onClose={() => setIsScannerOpen(false)}
          onAttendanceSuccess={handleAttendanceSuccess}
        />
      )}

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNav
        role={currentUser.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenScanner={() => {
          playBeepSound();
          setIsScannerOpen(true);
        }}
      />

      {/* Global Toast System */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} onRemove={removeToast} />
    </div>
  );
}
