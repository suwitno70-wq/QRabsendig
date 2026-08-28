import React, { useState, useEffect } from 'react';
import { User, AppSettings } from '../../types';
import { formatTanggalIndonesia, formatJam } from '../../utils/dateHelper';
import { LogOut, UserCheck, Shield, GraduationCap, Building2, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  settings: AppSettings;
  onLogout: () => void;
  onSwitchRole?: (role: 'ADMIN' | 'KEPALA' | 'GURU') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  onLogout,
  onSwitchRole,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return {
          label: 'ADMINISTRATOR',
          bg: 'bg-amber-100 text-amber-800 border border-amber-300',
          dot: 'bg-amber-500',
          icon: <Shield className="w-3 h-3 mr-1" />,
        };
      case 'KEPALA':
        return {
          label: 'KEPALA MADRASAH',
          bg: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <UserCheck className="w-3 h-3 mr-1" />,
        };
      case 'GURU':
      default:
        return {
          label: 'GURU MENGAJAR',
          bg: 'bg-teal-100 text-teal-800 border border-teal-300',
          dot: 'bg-teal-500',
          icon: <GraduationCap className="w-3 h-3 mr-1" />,
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand info on mobile / Madrasah name on desktop */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile-only logo avatar */}
          <div className="lg:hidden w-9 h-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0 border border-emerald-700">
            <Building2 className="w-5 h-5 text-emerald-300" />
          </div>

          <div className="min-w-0 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">
              {currentUser.role === 'GURU' ? 'Madrasah Pengajar' : 'Nama Madrasah'}
            </span>
            <span className="font-bold text-emerald-900 text-sm sm:text-base truncate leading-tight">
              {settings.namaMadrasah}
            </span>
          </div>
        </div>

        {/* Right: Live Clock & Monospace Time + User Profile */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Date & Monospace Live Clock */}
          <div className="text-right hidden sm:block">
            <div className="text-xs sm:text-sm font-bold text-slate-700 leading-tight">
              {formatTanggalIndonesia(currentTime)}
            </div>
            <div className="text-xs text-emerald-600 font-mono font-bold flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>{formatJam(currentTime)} WIB</span>
            </div>
          </div>

          {/* User Profile Trigger */}
          <div className="relative">
            <button
              id="user-profile-menu-button"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-1 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 transition-all cursor-pointer text-left shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center overflow-hidden shrink-0 text-xs">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>

              <div className="hidden md:block max-w-[130px]">
                <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium truncate">
                  {badge.label}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showRoleSwitcher && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Akun Sedang Masuk
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser.email || `@${currentUser.username}`}
                  </p>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Switch Role (Only shown when hideDemoButtons is false) */}
                {onSwitchRole && !settings.hideDemoButtons && (
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                      Ganti Akun Pengujian:
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => {
                          onSwitchRole('GURU');
                          setShowRoleSwitcher(false);
                        }}
                        className={`text-[11px] py-1.5 px-1 rounded-xl font-bold text-center transition cursor-pointer ${
                          currentUser.role === 'GURU'
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Guru
                      </button>
                      <button
                        onClick={() => {
                          onSwitchRole('KEPALA');
                          setShowRoleSwitcher(false);
                        }}
                        className={`text-[11px] py-1.5 px-1 rounded-xl font-bold text-center transition cursor-pointer ${
                          currentUser.role === 'KEPALA'
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Kepala
                      </button>
                      <button
                        onClick={() => {
                          onSwitchRole('ADMIN');
                          setShowRoleSwitcher(false);
                        }}
                        className={`text-[11px] py-1.5 px-1 rounded-xl font-bold text-center transition cursor-pointer ${
                          currentUser.role === 'ADMIN'
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                )}

                {/* Logout */}
                <div className="p-1">
                  <button
                    id="logout-button"
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar dari Aplikasi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
