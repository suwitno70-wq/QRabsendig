import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { getCurrentCoordinates } from '../../utils/geo';
import { generateGASBackendCode } from '../../utils/gasExporter';
import { AppStorage } from '../../utils/storage';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Settings,
  Building2,
  MapPin,
  Clock,
  Shield,
  Code2,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Database,
  RefreshCw,
  AlertTriangle,
  FileJson,
  CheckCircle2,
  Server,
} from 'lucide-react';

interface SystemSettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData?: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'GENERAL' | 'GEOFENCE' | 'DATABASE' | 'GAS_CODE'>('GENERAL');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [backupMsg, setBackupMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isClearAbsensiConfirmOpen, setIsClearAbsensiConfirmOpen] = useState<boolean>(false);

  const gasCode = generateGASBackendCode(formData);

  const handleGetCurrentLocation = async () => {
    setIsGettingGps(true);
    try {
      const pos = await getCurrentCoordinates();
      setFormData((prev) => ({
        ...prev,
        latitudeMadrasah: pos.latitude,
        longitudeMadrasah: pos.longitude,
      }));
    } catch {
      alert('Gagal mengambil lokasi GPS saat ini. Pastikan izin lokasi aktif pada browser/perangkat Anda.');
    } finally {
      setIsGettingGps(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyGAS = () => {
    navigator.clipboard.writeText(gasCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadGAS = () => {
    const blob = new Blob([gasCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = () => {
    const backupJson = AppStorage.exportFullBackupJSON();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `si-absen-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg({ text: 'Cadangan database berhasil diunduh (JSON)!', success: true });
    setTimeout(() => setBackupMsg(null), 4000);
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await AppStorage.importFullBackupJSON(text);
        if (res.success) {
          setBackupMsg({ text: 'Database berhasil dipulihkan dari file backup!', success: true });
          if (onResetData) onResetData();
        } else {
          setBackupMsg({ text: res.message, success: false });
        }
      } catch (err: any) {
        setBackupMsg({ text: `Gagal membaca file: ${err.message}`, success: false });
      }
      setTimeout(() => setBackupMsg(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDatabase = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    setIsResetConfirmOpen(false);
    await AppStorage.resetToSampleData();
    setBackupMsg({ text: 'Database telah disetel ulang ke data standar bawaan.', success: true });
    if (onResetData) onResetData();
    setTimeout(() => setBackupMsg(null), 4000);
  };

  const handleConfirmClearAbsensi = async () => {
    setIsClearAbsensiConfirmOpen(false);
    await AppStorage.clearAllAbsensi();
    setBackupMsg({ text: 'Seluruh riwayat presensi berhasil dibersihkan.', success: true });
    if (onResetData) onResetData();
    setTimeout(() => setBackupMsg(null), 4000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Pengaturan Sistem &amp; Manajemen Database
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi identitas madrasah, radius GPS, sinkronisasi cloud, backup, dan Google Apps Script
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Server className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Server Database Aktif (Realtime)
            </span>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => setActiveSubTab('GENERAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'GENERAL'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Identitas &amp; Aturan
          </button>
          <button
            onClick={() => setActiveSubTab('GEOFENCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'GEOFENCE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Lokasi GPS &amp; Radius
          </button>
          <button
            onClick={() => setActiveSubTab('DATABASE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'DATABASE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Backup &amp; Database
          </button>
          <button
            onClick={() => setActiveSubTab('GAS_CODE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'GAS_CODE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Google Apps Script Backend
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan sistem berhasil disimpan dan disinkronkan ke server!</span>
        </div>
      )}

      {backupMsg && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            backupMsg.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {backupMsg.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{backupMsg.text}</span>
        </div>
      )}

      {/* Tab 1: IDENTITAS & ATURAN */}
      {activeSubTab === 'GENERAL' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Identitas Madrasah / Sekolah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Madrasah / Sekolah:</label>
              <input
                type="text"
                required
                value={formData.namaMadrasah}
                onChange={(e) => setFormData({ ...formData, namaMadrasah: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">NPSN:</label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Madrasah:</label>
            <input
              type="text"
              required
              value={formData.alamatMadrasah}
              onChange={(e) => setFormData({ ...formData, alamatMadrasah: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Madrasah:</label>
              <input
                type="text"
                required
                value={formData.namaKepalaMadrasah}
                onChange={(e) => setFormData({ ...formData, namaKepalaMadrasah: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala Madrasah:</label>
              <input
                type="text"
                required
                value={formData.nipKepalaMadrasah}
                onChange={(e) => setFormData({ ...formData, nipKepalaMadrasah: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 pt-3">
            Aturan Absensi &amp; Validasi Mengajar Realtime
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Toleransi Sebelum Jam Masuk (Menit):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.toleransiScanAwalMenit ?? 15}
                onChange={(e) => setFormData({ ...formData, toleransiScanAwalMenit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400">Scan dibuka sebelum jam mulai jadwal.</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Batas Dianggap Terlambat (Menit):
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.batasTerlambatMenit ?? 10}
                onChange={(e) => setFormData({ ...formData, batasTerlambatMenit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400">Lewat dari menit ini status 'TERLAMBAT'.</span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Auto-Refresh Live Monitoring (Detik):
              </label>
              <input
                type="number"
                min="3"
                max="60"
                value={formData.autoRefreshIntervalDetik ?? 15}
                onChange={(e) => setFormData({ ...formData, autoRefreshIntervalDetik: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400">Interval update data live Kepala Madrasah.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Wajib Foto Selfie Guru</p>
                <p className="text-[11px] text-slate-500">Guru mengambil foto selfie saat scan QR</p>
              </div>
              <input
                type="checkbox"
                checked={formData.fiturSelfie ?? true}
                onChange={(e) => setFormData({ ...formData, fiturSelfie: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Validasi Radius Lokasi (GPS)</p>
                <p className="text-[11px] text-slate-500">Kunci absensi hanya dalam area madrasah</p>
              </div>
              <input
                type="checkbox"
                checked={formData.fiturLokasi ?? true}
                onChange={(e) => setFormData({ ...formData, fiturLokasi: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between sm:col-span-2">
              <div>
                <p className="font-bold text-slate-800">Mode Produksi Resmi (Sembunyikan Pintasan Demo)</p>
                <p className="text-[11px] text-slate-500">Menyembunyikan tombol auto-login dan bypass pengujian untuk lingkungan sekolah asli</p>
              </div>
              <input
                type="checkbox"
                checked={formData.hideDemoButtons ?? true}
                onChange={(e) => setFormData({ ...formData, hideDemoButtons: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: GEOFENCE & GPS */}
      {activeSubTab === 'GEOFENCE' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Pengaturan Geofencing &amp; Titik Koordinat Madrasah
              </h3>
              <p className="text-slate-500 text-[11px]">
                Hanya guru yang berada di dalam radius ini yang dapat melakukan absensi scan QR
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingGps}
              className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              {isGettingGps ? 'Mendeteksi...' : 'Ambil Koordinat Saya Saat Ini'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Latitude Madrasah:</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitudeMadrasah}
                onChange={(e) => setFormData({ ...formData, latitudeMadrasah: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Longitude Madrasah:</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitudeMadrasah}
                onChange={(e) => setFormData({ ...formData, longitudeMadrasah: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Radius Toleransi (Meter):</label>
              <input
                type="number"
                min="10"
                max="5000"
                required
                value={formData.radiusAbsensiMeter}
                onChange={(e) => setFormData({ ...formData, radiusAbsensiMeter: Number(e.target.value) || 150 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Shield className="w-4 h-4 text-emerald-700" />
              Keamanan Geofencing Anti-Kecurangan:
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Guru di luar radius <strong>{formData.radiusAbsensiMeter} meter</strong> dari koordinat [{formData.latitudeMadrasah}, {formData.longitudeMadrasah}] akan secara transparan diverifikasi posisinya oleh sistem, mencegah titip absen atau scan dari rumah.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              Simpan Koordinat GPS
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: DATABASE BACKUP & RESTORE */}
      {activeSubTab === 'DATABASE' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Cadangan &amp; Pemulihan Database (Backup &amp; Restore)
            </h3>
            <p className="text-slate-500 text-[11px]">
              Simpan salinan database aplikasi ke komputer Anda atau pulihkan data dari file JSON cadangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Unduh Cadangan Database Lengkap (JSON)</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Menyimpan seluruh data: Guru, Kelas, Mapel, Jadwal Mengajar, Presensi, dan Pengaturan Sistem dalam format JSON yang aman.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Backup (.json)</span>
              </button>
            </div>

            {/* Restore Backup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Pulihkan Database dari File Cadangan</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Pilih file JSON backup yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh isi data sekolah.
                </p>
              </div>

              <label className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center">
                <FileJson className="w-4 h-4" />
                <span>Pilih File Backup JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestoreBackupFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Danger Zone */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Zona Pembersihan &amp; Reset Database:
            </h4>
            <p className="text-rose-700 text-[11px] leading-relaxed">
              Tindakan di bawah ini bersifat permanen. Anda dapat membersihkan catatan absensi saja atau menyetel ulang seluruh database aplikasi.
            </p>
            <div className="pt-1 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setIsClearAbsensiConfirmOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat Presensi Saja</span>
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Setel Ulang Seluruh Data ke Bawaan (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: GOOGLE APPS SCRIPT CODE */}
      {activeSubTab === 'GAS_CODE' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                Script Backend Google Apps Script (Code.gs)
              </h3>
              <p className="text-slate-500 text-[11px]">
                Script backend lengkap untuk dipasang di Google Spreadsheet &gt; Ekstensi &gt; Apps Script
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyGAS}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Tersalin!' : 'Salin Kode'}
              </button>
              <button
                onClick={handleDownloadGAS}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Code.gs
              </button>
            </div>
          </div>

          {/* Webhook Google Spreadsheet */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Integrasi Otomatis ke Google Spreadsheet (Opsional Webhook):
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Jika Anda sudah men-deploy script Apps Script di bawah sebagai Web App, masukkan URL Web App Google Script Anda di bawah ini agar setiap ada guru yang melakukan scan presensi, datanya langsung terkirim otomatis masuk ke baris Google Sheets Anda secara live.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={formData.googleSheetsWebhookUrl || ''}
                onChange={(e) => setFormData({ ...formData, googleSheetsWebhookUrl: e.target.value })}
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-emerald-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition text-xs shrink-0 cursor-pointer"
              >
                Simpan URL Webhook
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-emerald-400">
              Langkah Singkat Pasang ke Google Spreadsheet:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Buka Google Spreadsheet baru Anda.</li>
              <li>Klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.</li>
              <li>Hapus isi default di file <code>Code.gs</code>, lalu paste kode di bawah ini.</li>
              <li>Jalankan fungsi <code>setupDatabase()</code> sekali untuk otomatis membuat seluruh Sheet database.</li>
              <li>Klik <strong>Deploy &gt; New Deployment &gt; Web App</strong>, pilih akses <em>Anyone (Siapa saja)</em>.</li>
              <li>Salin URL Web App dan tempelkan di kotak isian Google Sheets di atas.</li>
            </ol>
          </div>

          <div className="relative">
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed border border-emerald-950">
              {gasCode}
            </pre>
          </div>
        </div>
      )}

      {/* Reset Database Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Seluruh Database"
        message="PERINGATAN: Seluruh data Guru, Kelas, Mapel, Jadwal, dan Riwayat Presensi akan disetel ulang ke data bawaan awal. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Reset Database"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Clear Attendance Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAbsensiConfirmOpen}
        title="Bersihkan Riwayat Presensi Saja"
        message="Apakah Anda yakin ingin mengosongkan seluruh riwayat presensi? Data master Guru, Kelas, Mapel, dan Jadwal akan tetap tersimpan aman."
        confirmText="Ya, Bersihkan Riwayat Presensi"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmClearAbsensi}
        onCancel={() => setIsClearAbsensiConfirmOpen(false)}
      />
    </div>
  );
};
