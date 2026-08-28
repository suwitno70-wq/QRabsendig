import React, { useState } from 'react';
import { User, AppSettings, Guru } from '../../types';
import { AppStorage } from '../../utils/storage';
import {
  User as UserIcon,
  Building2,
  Shield,
  Award,
  LogOut,
  KeyRound,
  CheckCircle2,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface TeacherProfileProps {
  currentUser: User;
  settings: AppSettings;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({
  currentUser,
  settings,
  onLogout,
  onUpdateUser,
}) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [username, setUsername] = useState(currentUser.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    if (!username.trim()) {
      setErrorMessage('Username tidak boleh kosong');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok');
      return;
    }

    // Find and update Guru record in AppStorage
    const guruList = AppStorage.getGuruList();
    const guruIndex = guruList.findIndex((g) => g.id === currentUser.guruId || g.username === currentUser.username);

    if (guruIndex >= 0) {
      const updatedGuru: Guru = {
        ...guruList[guruIndex],
        username: username.trim(),
        password: newPassword ? newPassword : (guruList[guruIndex].password || 'password123'),
      };
      AppStorage.saveGuru(updatedGuru);
    }

    // Update current user session
    const updatedUserObj: User = {
      ...currentUser,
      username: username.trim(),
    };
    AppStorage.setCurrentUser(updatedUserObj);
    if (onUpdateUser) {
      onUpdateUser(updatedUserObj);
    }

    setSaveSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3 relative overflow-hidden">
        <div className="w-24 h-24 rounded-full bg-emerald-100 mx-auto overflow-hidden border-4 border-emerald-600 shadow-lg">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-800 text-2xl font-bold">
              {currentUser.name.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            {currentUser.name}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            NIP. {currentUser.nip || '198506122010011018'}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Award className="w-3.5 h-3.5 mr-1" />
              Guru Pendidik Aktif
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
              @{currentUser.username}
            </span>
          </div>
        </div>
      </div>

      {/* Account Security / Change Username & Password Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Pengaturan Akun & Password
          </h4>
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            {showPasswordForm ? 'Tutup Form' : 'Ubah Username / Password'}
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Username dan password berhasil diperbarui!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handleSaveAccount} className="pt-2 border-t border-slate-100 space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">
                Username Login:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username baru"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <span className="text-[10px] text-slate-400">Username digunakan untuk masuk aplikasi.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">
                Password Baru:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassText(!showPassText)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {newPassword && (
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Ulangi Password Baru:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassText ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-800/20"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Akun</span>
            </button>
          </form>
        )}
      </div>

      {/* Madrasah Information */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-600" />
          Unit Kerja Madrasah
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Nama Madrasah:</span>
            <span className="font-bold text-slate-800 text-right">{settings.namaMadrasah}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">NPSN:</span>
            <span className="font-bold text-slate-800">{settings.npsn}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Kepala Madrasah:</span>
            <span className="font-bold text-slate-800 text-right">{settings.namaKepalaMadrasah}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Radius Lokasi Valid:</span>
            <span className="font-bold text-emerald-700">{settings.radiusAbsensiMeter} meter</span>
          </div>
        </div>
      </div>

      {/* App Branding & Credits */}
      <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-sm space-y-2 text-center">
        <div className="inline-block p-2 rounded-2xl bg-white/10 mb-1">
          <Shield className="w-6 h-6 text-emerald-300 mx-auto" />
        </div>
        <h4 className="text-sm font-extrabold text-white">
          SI-ABSEN GURU MENGAJAR REALTIME
        </h4>
        <p className="text-xs text-emerald-200">
          Kreatif by Witno • Versi 1.0.0
        </p>
        <p className="text-[11px] text-emerald-300/80 pt-1">
          Sistem Presensi Mengajar berbasis Scan QR Kelas, Waktu Server & Geofencing GPS.
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Keluar dari Aplikasi
      </button>
    </div>
  );
};
