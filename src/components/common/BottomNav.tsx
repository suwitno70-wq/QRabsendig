import React from 'react';
import { UserRole } from '../../types';
import {
  Home,
  QrCode,
  Calendar,
  History,
  User as UserIcon,
  Activity,
  MapPin,
  FileText,
  Users,
  Settings,
  Building2,
} from 'lucide-react';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenScanner?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  activeTab,
  onTabChange,
  onOpenScanner,
}) => {
  const renderGuruNav = () => (
    <div className="flex items-center justify-around w-full">
      <button
        id="guru-nav-home"
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center py-2 px-3 text-xs font-semibold transition ${
          activeTab === 'home' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span>Beranda</span>
      </button>

      <button
        id="guru-nav-schedule"
        onClick={() => onTabChange('schedule')}
        className={`flex flex-col items-center py-2 px-3 text-xs font-semibold transition ${
          activeTab === 'schedule' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Calendar className={`w-5 h-5 mb-0.5 ${activeTab === 'schedule' ? 'stroke-[2.5]' : ''}`} />
        <span>Jadwal</span>
      </button>

      {/* Floating Center Scan Button for Guru */}
      <button
        id="guru-nav-scan-floating"
        onClick={() => (onOpenScanner ? onOpenScanner() : onTabChange('home'))}
        className="relative -top-4 flex flex-col items-center group focus:outline-none cursor-pointer"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xl shadow-emerald-900/30 border-4 border-white transition transform group-hover:scale-105 group-active:scale-95">
          <QrCode className="w-7 h-7 animate-pulse text-emerald-300" />
        </div>
        <span className="text-[10px] font-extrabold text-emerald-900 -mt-0.5 uppercase tracking-wider">
          Scan QR
        </span>
      </button>

      <button
        id="guru-nav-history"
        onClick={() => onTabChange('history')}
        className={`flex flex-col items-center py-2 px-3 text-xs font-semibold transition ${
          activeTab === 'history' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <History className={`w-5 h-5 mb-0.5 ${activeTab === 'history' ? 'stroke-[2.5]' : ''}`} />
        <span>Riwayat</span>
      </button>

      <button
        id="guru-nav-profile"
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center py-2 px-3 text-xs font-semibold transition ${
          activeTab === 'profile' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <UserIcon className={`w-5 h-5 mb-0.5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
        <span>Profil</span>
      </button>
    </div>
  );

  const renderKepalaNav = () => (
    <div className="flex items-center justify-around w-full">
      <button
        id="kepala-nav-live"
        onClick={() => onTabChange('live')}
        className={`flex flex-col items-center py-2 px-2 text-xs font-semibold transition ${
          activeTab === 'live' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Activity className={`w-5 h-5 mb-0.5 ${activeTab === 'live' ? 'stroke-[2.5]' : ''}`} />
        <span>Live</span>
      </button>

      <button
        id="kepala-nav-map"
        onClick={() => onTabChange('map')}
        className={`flex flex-col items-center py-2 px-2 text-xs font-semibold transition ${
          activeTab === 'map' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <MapPin className={`w-5 h-5 mb-0.5 ${activeTab === 'map' ? 'stroke-[2.5]' : ''}`} />
        <span>Peta Lokasi</span>
      </button>

      <button
        id="kepala-nav-report"
        onClick={() => onTabChange('report')}
        className={`flex flex-col items-center py-2 px-2 text-xs font-semibold transition ${
          activeTab === 'report' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <FileText className={`w-5 h-5 mb-0.5 ${activeTab === 'report' ? 'stroke-[2.5]' : ''}`} />
        <span>Rekap</span>
      </button>

      <button
        id="kepala-nav-teachers"
        onClick={() => onTabChange('teachers')}
        className={`flex flex-col items-center py-2 px-2 text-xs font-semibold transition ${
          activeTab === 'teachers' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'teachers' ? 'stroke-[2.5]' : ''}`} />
        <span>Guru</span>
      </button>
    </div>
  );

  const renderAdminNav = () => (
    <div className="flex items-center justify-around w-full">
      <button
        id="admin-nav-dashboard"
        onClick={() => onTabChange('admin_dashboard')}
        className={`flex flex-col items-center py-2 px-1 text-[11px] font-semibold transition ${
          activeTab === 'admin_dashboard' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Home className={`w-4 h-4 mb-0.5 ${activeTab === 'admin_dashboard' ? 'stroke-[2.5]' : ''}`} />
        <span>Dashboard</span>
      </button>

      <button
        id="admin-nav-guru"
        onClick={() => onTabChange('admin_guru')}
        className={`flex flex-col items-center py-2 px-1 text-[11px] font-semibold transition ${
          activeTab === 'admin_guru' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Users className={`w-4 h-4 mb-0.5 ${activeTab === 'admin_guru' ? 'stroke-[2.5]' : ''}`} />
        <span>Guru</span>
      </button>

      <button
        id="admin-nav-jadwal"
        onClick={() => onTabChange('admin_jadwal')}
        className={`flex flex-col items-center py-2 px-1 text-[11px] font-semibold transition ${
          activeTab === 'admin_jadwal' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Calendar className={`w-4 h-4 mb-0.5 ${activeTab === 'admin_jadwal' ? 'stroke-[2.5]' : ''}`} />
        <span>Jadwal</span>
      </button>

      <button
        id="admin-nav-qr"
        onClick={() => onTabChange('admin_posters')}
        className={`flex flex-col items-center py-2 px-1 text-[11px] font-semibold transition ${
          activeTab === 'admin_posters' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <QrCode className={`w-4 h-4 mb-0.5 ${activeTab === 'admin_posters' ? 'stroke-[2.5]' : ''}`} />
        <span>QR Poster</span>
      </button>

      <button
        id="admin-nav-rekap"
        onClick={() => onTabChange('admin_rekap')}
        className={`flex flex-col items-center py-2 px-1 text-[11px] font-semibold transition ${
          activeTab === 'admin_rekap' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <FileText className={`w-4 h-4 mb-0.5 ${activeTab === 'admin_rekap' ? 'stroke-[2.5]' : ''}`} />
        <span>Laporan</span>
      </button>

      <button
        id="admin-nav-pengaturan"
        onClick={() => onTabChange('admin_settings')}
        className={`flex flex-col items-center py-2 px-1 text-[11px] font-semibold transition ${
          activeTab === 'admin_settings' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Settings className={`w-4 h-4 mb-0.5 ${activeTab === 'admin_settings' ? 'stroke-[2.5]' : ''}`} />
        <span>Pengaturan</span>
      </button>
    </div>
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl pb-safe">
      <div className="max-w-md mx-auto px-2">
        {role === 'GURU' && renderGuruNav()}
        {role === 'KEPALA' && renderKepalaNav()}
        {role === 'ADMIN' && renderAdminNav()}
      </div>
    </nav>
  );
};
