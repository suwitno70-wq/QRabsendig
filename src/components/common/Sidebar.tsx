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
  Building2,
  BookOpen,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenScanner?: () => void;
  madrasahName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onTabChange,
  onOpenScanner,
}) => {
  // Navigation links definition by role
  const getNavItems = () => {
    switch (role) {
      case 'GURU':
        return [
          { id: 'home', label: 'Beranda Guru', icon: <Home className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'schedule', label: 'Jadwal Mengajar', icon: <Calendar className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'history', label: 'Riwayat Presensi', icon: <History className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'profile', label: 'Profil Saya', icon: <UserIcon className="w-4 h-4 mr-3 text-emerald-300" /> },
        ];
      case 'KEPALA':
        return [
          { id: 'live', label: 'Live Monitoring', icon: <Activity className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'map', label: 'Peta Lokasi Guru', icon: <MapPin className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'report', label: 'Laporan Rekap', icon: <FileText className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'teachers', label: 'Direktori Guru', icon: <Users className="w-4 h-4 mr-3 text-emerald-300" /> },
        ];
      case 'ADMIN':
      default:
        return [
          { id: 'admin_dashboard', label: 'Dashboard Admin', icon: <Home className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_guru', label: 'Data Guru', icon: <Users className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_kelas', label: 'Data Kelas', icon: <Building2 className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_mapel', label: 'Mata Pelajaran', icon: <BookOpen className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_jadwal', label: 'Jadwal Pelajaran', icon: <Calendar className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_posters', label: 'Cetak QR Kelas', icon: <QrCode className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_rekap', label: 'Laporan & Rekap', icon: <FileText className="w-4 h-4 mr-3 text-emerald-300" /> },
          { id: 'admin_settings', label: 'Pengaturan Sistem', icon: <Settings className="w-4 h-4 mr-3 text-emerald-300" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-emerald-900 text-white flex flex-col shrink-0 border-r border-emerald-800/50 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-emerald-800/50 text-center">
        <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-emerald-200">
          <div className="text-emerald-700 font-bold text-2xl tracking-tighter">K</div>
        </div>
        <h1 className="font-bold text-lg leading-tight uppercase tracking-wider text-white">
          SI-ABSEN GURU
        </h1>
        <p className="text-emerald-400 text-xs mt-1 italic font-medium">
          Kreatif by Witno
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 space-y-1">
        <div className="px-6 py-2 text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
          Menu Utama ({role})
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-emerald-800/60 border-r-4 border-emerald-400 text-white font-semibold'
                  : 'text-emerald-100 hover:bg-emerald-800/30 font-medium'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}

        {/* Quick QR Scan Action Button for Guru role */}
        {role === 'GURU' && onOpenScanner && (
          <div className="px-5 pt-4">
            <button
              onClick={onOpenScanner}
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <QrCode className="w-4 h-4 animate-pulse" />
              <span>SCAN QR KELAS</span>
            </button>
          </div>
        )}
      </nav>

      {/* Live Monitoring Status Footer */}
      <div className="mt-auto p-5">
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/60 rounded-xl text-xs font-mono text-emerald-300 border border-emerald-800/60 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-tight">LIVE MONITORING</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">WIB</span>
        </div>
      </div>
    </aside>
  );
};
