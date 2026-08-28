import React, { useState, useEffect } from 'react';
import { User, AppSettings, Jadwal, AbsensiRecord, Kelas, Guru } from '../../types';
import { getHariIni, formatTanggalIndonesia, formatJam } from '../../utils/dateHelper';
import { StatCard } from '../common/StatCard';
import {
  Activity,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Camera,
  Layers,
  Sparkles,
  Users,
  QrCode,
  Download,
  LayoutGrid,
  ListFilter,
  TrendingUp,
} from 'lucide-react';

interface LiveMonitoringDashboardProps {
  currentUser: User;
  settings: AppSettings;
  jadwalList: Jadwal[];
  absensiList: AbsensiRecord[];
  kelasList: Kelas[];
  guruList: Guru[];
  onRefresh?: () => void;
  onOpenQRPosters?: () => void;
}

export const LiveMonitoringDashboard: React.FC<LiveMonitoringDashboardProps> = ({
  currentUser,
  settings,
  jadwalList,
  absensiList,
  kelasList,
  guruList,
  onRefresh,
  onOpenQRPosters,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const hariIni = getHariIni(currentTime);
  const todayStr = currentTime.toISOString().split('T')[0];

  // Auto-polling effect (simulating realtime refresh)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const pollTimer = setInterval(() => {
      setLastSync(new Date());
      if (onRefresh) onRefresh();
    }, (settings.autoRefreshIntervalDetik || 15) * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, [settings.autoRefreshIntervalDetik, onRefresh]);

  // Today's total scheduled sessions
  const todaySchedules = jadwalList.filter((j) => j.hari === hariIni);

  // Today's attendance records
  const todayAbsensi = absensiList.filter((a) => a.tanggal === todayStr);

  // Metrics computation
  const totalGuruCount = guruList.length || 24;
  const activeTeachingCount = todayAbsensi.filter((a) => a.status === 'SEDANG_MENGAJAR').length;
  const sudahAbsenCount = todayAbsensi.length;
  const terlambatCount = todayAbsensi.filter((a) => a.status === 'TERLAMBAT' || a.menitKeterlambatan > 0).length;
  const belumAbsenCount = Math.max(0, todaySchedules.length - sudahAbsenCount);

  // Build integrated list of all classrooms & scheduled teachers today
  const combinedMonitoringList = todaySchedules.map((schedule) => {
    const record = todayAbsensi.find((a) => a.jadwalId === schedule.id);
    const teacher = guruList.find((g) => g.id === schedule.guruId);
    const kelas = kelasList.find((k) => k.id === schedule.kelasId);

    let displayStatus: 'SEDANG_MENGAJAR' | 'SELESAI_MENGAJAR' | 'HADIR' | 'TERLAMBAT' | 'BELUM_ABSEN' = 'BELUM_ABSEN';
    if (record) {
      displayStatus = record.status as typeof displayStatus;
    }

    return {
      schedule,
      record,
      teacher,
      kelas,
      status: displayStatus,
    };
  });

  const filteredList = combinedMonitoringList.filter((item) => {
    const matchesSearch =
      item.schedule.guruNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.schedule.kelasNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.schedule.mapelNama.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* 4 Stat KPI Metric Cards with Bottom Accent Borders (Sleek Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Guru"
          value={totalGuruCount}
          subtitle="Pendidik terdaftar"
          color="emerald"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Sedang Mengajar"
          value={activeTeachingCount}
          subtitle="Aktif di dalam kelas"
          color="blue"
          badge="LIVE"
          icon={<PlayCircle className="w-5 h-5 text-blue-600 animate-pulse" />}
        />
        <StatCard
          title="Hadir / Absen"
          value={sudahAbsenCount}
          subtitle={`Dari total ${todaySchedules.length} jadwal`}
          color="amber"
          icon={<CheckCircle2 className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Belum Absen"
          value={belumAbsenCount}
          subtitle="Menunggu jam masuk"
          color="rose"
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
        />
      </div>

      {/* Main Grid: Realtime Table Feed (Col 8) + Sleek Preview & Stats Widget (Col 4) on xl */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Feed Table / Cards (Col 8 on xl) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Controls Bar: Search & Status Pills */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama guru, kelas, mapel..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
              <div className="flex gap-1.5 scrollbar-none text-xs">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'SEDANG_MENGAJAR', label: '🟢 Mengajar' },
                  { id: 'HADIR', label: '🔵 Hadir' },
                  { id: 'TERLAMBAT', label: '🟡 Terlambat' },
                  { id: 'BELUM_ABSEN', label: '🔴 Belum' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                      filterStatus === tab.id
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode('TABLE')}
                  title="Tampilan Tabel"
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'TABLE' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-500'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('CARDS')}
                  title="Tampilan Grid Kartu"
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'CARDS' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-500'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Realtime Teaching Feed Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Table Header Header Bar */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-slate-700 text-sm sm:text-base">
                  Aktivitas Mengajar Realtime
                </h2>
              </div>
              <div className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Auto Refresh: {settings.autoRefreshIntervalDetik || 15}s
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600 text-sm">Tidak ada sesi mengajar yang cocok</p>
                <p className="text-xs text-slate-400">Silakan ubah filter status atau kata kunci pencarian.</p>
              </div>
            ) : viewMode === 'TABLE' ? (
              /* Sleek Table Mode */
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Guru</th>
                      <th className="px-6 py-3">Kelas & Mapel</th>
                      <th className="px-6 py-3">Jadwal & Waktu</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredList.map((item) => {
                      const isTeaching = item.status === 'SEDANG_MENGAJAR';
                      const isLate = item.status === 'TERLAMBAT';
                      const isFinished = item.status === 'SELESAI_MENGAJAR' || item.status === 'HADIR';
                      const isNotYet = item.status === 'BELUM_ABSEN';

                      return (
                        <tr key={item.schedule.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-xs overflow-hidden shrink-0">
                                {item.teacher?.fotoUrl ? (
                                  <img
                                    src={item.teacher.fotoUrl}
                                    alt={item.schedule.guruNama}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  item.schedule.guruNama.charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-800">
                                  {item.schedule.guruNama}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  NIP: {item.teacher?.nip || '-'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-800">
                              {item.schedule.kelasNama}
                            </div>
                            <div className="text-xs text-emerald-600 font-semibold">
                              {item.schedule.mapelNama}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {item.schedule.jamMulai} - {item.schedule.jamSelesai}
                            </div>
                            {item.record && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Scan: {item.record.waktuScan} WIB
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {isTeaching && (
                              <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full shadow-xs animate-pulse inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                SEDANG MENGAJAR
                              </span>
                            )}
                            {isFinished && (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                HADIR
                              </span>
                            )}
                            {isLate && (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                TERLAMBAT
                              </span>
                            )}
                            {isNotYet && (
                              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                BELUM ABSEN
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid Cards Mode */
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredList.map((item) => {
                  const isTeaching = item.status === 'SEDANG_MENGAJAR';
                  const isFinished = item.status === 'SELESAI_MENGAJAR' || item.status === 'HADIR';
                  const isLate = item.status === 'TERLAMBAT';

                  return (
                    <div
                      key={item.schedule.id}
                      className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-2.5 ${
                        isTeaching
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                          {item.schedule.kelasNama}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {item.schedule.jamMulai} - {item.schedule.jamSelesai}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 overflow-hidden border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0">
                          {item.teacher?.fotoUrl ? (
                            <img
                              src={item.teacher.fotoUrl}
                              alt={item.schedule.guruNama}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            item.schedule.guruNama.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {item.schedule.guruNama}
                          </h4>
                          <p className="text-xs font-medium text-emerald-700 truncate">
                            {item.schedule.mapelNama}
                          </p>
                        </div>
                      </div>

                      {item.record && (
                        <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100 flex justify-between">
                          <span>Waktu Scan:</span>
                          <span className="font-bold text-slate-700">{item.record.waktuScan} WIB</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sleek Scanner Preview Card + Weekly Stats Widget (Col 4 on xl) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Sleek Scanner Preview Mockup Banner */}
          <div className="bg-emerald-800 p-6 rounded-3xl shadow-xl text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Glowing background bubble */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-700 rounded-full opacity-50 blur-lg pointer-events-none" />

            <div className="relative z-10 text-center mb-4 w-full">
              <div className="text-emerald-300 text-xs uppercase tracking-widest font-bold mb-3 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Preview Scanner Guru
              </div>

              {/* Smartphone Mockup Frame */}
              <div className="w-[200px] h-[260px] bg-slate-900 rounded-2xl border-4 border-slate-700 shadow-2xl relative overflow-hidden mx-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent" />

                {/* QR Target Scanning Zone */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-emerald-400 rounded-xl flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 absolute top-0 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[8px] uppercase tracking-tighter font-bold text-emerald-400 text-center">
                    Scan QR Kelas...
                  </span>
                </div>

                {/* Bottom Scanner Overlay details */}
                <div className="absolute bottom-3 left-0 right-0 px-2.5">
                  <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg text-[8px] text-left border border-white/10">
                    <div className="font-bold text-white mb-0.5">DASHBOARD GURU</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Status:</span>
                      <span className="text-emerald-300 font-bold">Siap Scan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenQRPosters) {
                  onOpenQRPosters();
                } else if (onRefresh) {
                  onRefresh();
                }
              }}
              className="relative z-10 w-full py-3 bg-emerald-400 text-emerald-950 font-extrabold rounded-xl text-xs shadow-lg hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <QrCode className="w-4 h-4" />
              <span>DOWNLOAD POSTER QR KELAS</span>
            </button>
          </div>

          {/* Weekly Statistics Bar Chart Widget (Matching Sleek Theme) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Statistik Presensi Mingguan
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                98.4% Hadir
              </span>
            </div>

            {/* Custom Sleek Bar Steps */}
            <div className="h-36 flex items-end justify-between gap-3 px-2 pb-2 pt-4">
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-emerald-200 rounded-t-lg transition-all" style={{ height: '70%' }} />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-emerald-300 rounded-t-lg transition-all" style={{ height: '85%' }} />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-emerald-500 rounded-t-lg transition-all shadow-xs" style={{ height: '95%' }} />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-emerald-600 rounded-t-lg transition-all shadow-xs" style={{ height: '80%' }} />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-emerald-800 rounded-t-lg transition-all shadow-md" style={{ height: '92%' }} />
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-slate-200 rounded-t-lg transition-all" style={{ height: '35%' }} />
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mt-2 px-1 border-t border-slate-100 pt-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selfie Modal Preview */}
      {selectedSelfie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3 text-center">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Bukti Foto Selfie Mengajar
            </h4>
            <div className="rounded-2xl overflow-hidden border-2 border-emerald-600 aspect-4/3">
              <img
                src={selectedSelfie}
                alt="Selfie Mengajar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setSelectedSelfie(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
