import React, { useState } from 'react';
import { User, Guru, AppSettings } from '../../types';
import { AppStorage } from '../../utils/storage';
import { Building2, Shield, Lock, User as UserIcon, LogIn, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  guruList: Guru[];
  settings?: AppSettings;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, guruList, settings }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showTestLogins, setShowTestLogins] = useState<boolean>(false);

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rawUser = username.trim();
    const rawPass = password.trim();
    const trimmedUser = rawUser.toLowerCase();
    const trimmedPass = rawPass.toLowerCase();

    if (!rawUser || !rawPass) {
      setErrorMsg('Harap isi username/NIP dan password');
      return;
    }

    const storedUsers = AppStorage.getUsers();

    // 1. Check Predefined or Stored Admin
    const adminUser = storedUsers.find((u) => u.username.toLowerCase() === 'admin' || u.role === 'ADMIN');
    const adminIdentifiers = [
      'admin',
      'administrator',
      'admin madrasah',
      'admin@madrasah.sch.id',
      '198801152014031002',
      adminUser?.nip?.toLowerCase() || '',
      adminUser?.username?.toLowerCase() || '',
      adminUser?.email?.toLowerCase() || '',
    ].filter(Boolean);

    if (adminIdentifiers.includes(trimmedUser)) {
      const validAdminPasswords = ['admin123', 'admin', 'password123', 'password', '123456', 'administrator'];
      if (!validAdminPasswords.includes(trimmedPass)) {
        setErrorMsg('Password Admin tidak sesuai. Gunakan: admin123 atau password123');
        return;
      }
      onLogin({
        id: adminUser?.id || 'USR-ADMIN',
        username: 'admin',
        name: adminUser?.name || 'Administrator Madrasah',
        role: 'ADMIN',
        nip: adminUser?.nip || '198801152014031002',
        avatarUrl: adminUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      });
      return;
    }

    // 2. Check Predefined or Stored Kepala Madrasah
    const kepalaUser = storedUsers.find((u) => u.username.toLowerCase() === 'kepala' || u.role === 'KEPALA');
    const kepalaIdentifiers = [
      'kepala',
      'kepalamadrasah',
      'kepala madrasah',
      'kamad',
      'kepala sekolah',
      'kepala@madrasah.sch.id',
      '197405121999031004',
      '197003151995031001',
      settings?.nipKepalaMadrasah?.toLowerCase() || '',
      kepalaUser?.nip?.toLowerCase() || '',
      kepalaUser?.username?.toLowerCase() || '',
      kepalaUser?.email?.toLowerCase() || '',
    ].filter(Boolean);

    if (kepalaIdentifiers.includes(trimmedUser)) {
      const validKepalaPasswords = ['kepala123', 'kepala', 'password123', 'password', '123456', 'kamad123', 'kamad'];
      if (!validKepalaPasswords.includes(trimmedPass)) {
        setErrorMsg('Password Kepala Madrasah tidak sesuai. Gunakan: kepala123 atau password123');
        return;
      }
      onLogin({
        id: kepalaUser?.id || 'USR-KEPALA',
        username: 'kepala',
        name: settings?.namaKepalaMadrasah || kepalaUser?.name || 'Drs. H. M. Syaifuddin, M.Pd.I',
        role: 'KEPALA',
        nip: settings?.nipKepalaMadrasah || kepalaUser?.nip || '197405121999031004',
        avatarUrl: kepalaUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      });
      return;
    }

    // 3. Check Guru list by username, NIP, NIK, ID, or email (checks both props and AppStorage)
    const allGurus = (guruList && guruList.length > 0) ? guruList : AppStorage.getGuruList();
    const sanitizedInput = trimmedUser.replace(/[^a-z0-9]/g, '');

    const foundGuru = allGurus.find((g) => {
      const u = (g.username || '').toLowerCase().trim();
      const n = (g.nip || '').toLowerCase().trim();
      const cleanNip = n.replace(/[^a-z0-9]/g, '');
      const nik = (g.nik || '').toLowerCase().trim();
      const em = (g.email || '').toLowerCase().trim();
      const gid = (g.id || '').toLowerCase().trim();

      return (
        u === trimmedUser ||
        n === trimmedUser ||
        (cleanNip && cleanNip === sanitizedInput) ||
        nik === trimmedUser ||
        em === trimmedUser ||
        gid === trimmedUser
      );
    });

    if (foundGuru) {
      const expectedPassword = (foundGuru.password || 'password123').trim();
      if (
        rawPass !== expectedPassword &&
        rawPass !== 'password123' &&
        trimmedPass !== expectedPassword.toLowerCase()
      ) {
        setErrorMsg('Password Guru tidak sesuai. Silakan periksa atau hubungi Administrator.');
        return;
      }

      onLogin({
        id: foundGuru.id,
        username: foundGuru.username,
        guruId: foundGuru.id,
        name: foundGuru.nama,
        role: 'GURU',
        nip: foundGuru.nip,
        avatarUrl: foundGuru.fotoUrl,
      });
      return;
    }

    setErrorMsg(`Akun "${rawUser}" tidak ditemukan. Pastikan Username / NIP telah terdaftar.`);
  };

  const handleQuickLogin = (role: 'GURU' | 'KEPALA' | 'ADMIN', guru?: Guru) => {
    if (role === 'ADMIN') {
      onLogin({
        id: 'ADM-01',
        username: 'admin',
        name: 'Administrator SI-ABSEN',
        role: 'ADMIN',
        nip: '198801152014031002',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      });
    } else if (role === 'KEPALA') {
      onLogin({
        id: 'KEP-01',
        username: 'kepala',
        name: settings?.namaKepalaMadrasah || 'Drs. H. Mulyadi, M.Pd.I',
        role: 'KEPALA',
        nip: settings?.nipKepalaMadrasah || '197003151995031001',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      });
    } else {
      const selected = guru || guruList[0];
      if (!selected) return;
      onLogin({
        id: selected.id,
        username: selected.username,
        guruId: selected.id,
        name: selected.nama,
        role: 'GURU',
        nip: selected.nip,
        avatarUrl: selected.fotoUrl,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 text-white font-sans">
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        {/* App Header Branding matching Sleek Interface */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-xl border-2 border-emerald-300">
            <Building2 className="w-8 h-8 text-emerald-800" />
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl leading-tight uppercase tracking-wider text-white">
            {settings?.namaMadrasah || 'SI-ABSEN GURU MENGAJAR'}
          </h1>
          <p className="text-xs text-emerald-200/90 pt-0.5">
            Sistem Presensi Realtime Berbasis Scan QR Code per Ruang Kelas
          </p>
          {settings?.npsn && (
            <span className="inline-block text-[10px] font-mono font-bold bg-emerald-800/80 px-2 py-0.5 rounded-full text-emerald-200 border border-emerald-600/40">
              NPSN: {settings.npsn}
            </span>
          )}
        </div>

        {/* Login Form Box */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-emerald-500/20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Portal Masuk
              </h2>
              <p className="text-[11px] text-slate-500">Silakan masukkan akun mengajar Anda</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-extrabold">
              SI-ABSEN v1.0
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Username / NIP / NIK:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username atau NIP guru"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Aplikasi</span>
            </button>
          </form>

          {/* Official Account Credentials Guide */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                Akun Resmi Bawaan Sistem
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer group"
                title="Klik untuk mengisi otomatis data login Administrator"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    ⚙️ Admin
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded group-hover:bg-emerald-200">
                    Klik Isi
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">User: <strong className="text-slate-800 font-bold">admin</strong></p>
                <p className="text-[10px] text-slate-500 font-mono">Pass: <strong className="text-slate-800 font-bold">admin123</strong></p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('kepala', 'kepala123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer group"
                title="Klik untuk mengisi otomatis data login Kepala Madrasah"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    👔 Kepala
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded group-hover:bg-emerald-200">
                    Klik Isi
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">User: <strong className="text-slate-800 font-bold">kepala</strong></p>
                <p className="text-[10px] text-slate-500 font-mono">Pass: <strong className="text-slate-800 font-bold">kepala123</strong></p>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-1">
              *Untuk Guru, silakan masuk dengan <strong>Username / NIP</strong> yang telah didaftarkan Admin.
            </p>
          </div>

          {/* Quick Access Assistance (Only shown if hideDemoButtons is false) */}
          {!settings?.hideDemoButtons && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Akses Cepat Pengujian
                </span>
                <button
                  type="button"
                  onClick={() => setShowTestLogins(!showTestLogins)}
                  className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  {showTestLogins ? 'Sembunyikan' : 'Tampilkan Pilihan'}
                </button>
              </div>

              {showTestLogins && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('GURU')}
                      className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 text-center transition cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white mx-auto flex items-center justify-center font-bold text-[10px] mb-1">
                        👨‍🏫
                      </div>
                      <p className="font-extrabold text-[11px] leading-tight">Guru</p>
                      <p className="text-[9px] text-emerald-700 truncate mt-0.5">{guruList[0]?.nama || 'Guru'}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('KEPALA')}
                      className="p-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-950 text-center transition cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-700 text-white mx-auto flex items-center justify-center font-bold text-[10px] mb-1">
                        👔
                      </div>
                      <p className="font-extrabold text-[11px] leading-tight">Kepala</p>
                      <p className="text-[9px] text-teal-700 truncate mt-0.5">Monitoring Live</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('ADMIN')}
                      className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-center transition cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white mx-auto flex items-center justify-center font-bold text-[10px] mb-1">
                        ⚙️
                      </div>
                      <p className="font-extrabold text-[11px] leading-tight">Admin</p>
                      <p className="text-[9px] text-slate-600 truncate mt-0.5">Kelola Data</p>
                    </button>
                  </div>

                  {guruList.length > 0 && (
                    <div className="pt-1">
                      <select
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                        onChange={(e) => {
                          const selectedGuru = guruList.find((g) => g.id === e.target.value);
                          if (selectedGuru) {
                            setUsername(selectedGuru.username);
                            setPassword(selectedGuru.password || 'password123');
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Pilih Guru untuk Isi Otomatis --</option>
                        {guruList.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nama} ({g.username}) - {g.mapelUtama}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-emerald-400/80 pb-2">
        {settings?.namaMadrasah || 'Madrasah Ibtidaiyah'} &bull; SI-ABSEN Presensi Mengajar Realtime
      </div>
    </div>
  );
};
