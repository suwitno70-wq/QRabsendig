import React, { useState, useEffect } from 'react';
import { User, AppSettings, Jadwal, AbsensiRecord, Kelas } from '../../types';
import { formatTanggalIndonesia, getHariIni, formatJam } from '../../utils/dateHelper';
import {
  QrCode,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  CheckCheck,
  BookOpen,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface TeacherHomeProps {
  currentUser: User;
  settings: AppSettings;
  jadwalList: Jadwal[];
  absensiList: AbsensiRecord[];
  kelasList: Kelas[];
  onOpenScanner: () => void;
  onFinishSession: (absensiId: string) => void;
  onViewSchedule: () => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({
  currentUser,
  settings,
  jadwalList,
  absensiList,
  kelasList,
  onOpenScanner,
  onFinishSession,
  onViewSchedule,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const hariIni = getHariIni(now);
  const todayStr = now.toISOString().split('T')[0];
  const teacherId = currentUser.guruId || currentUser.id;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter schedules for today
  const mySchedulesToday = jadwalList.filter(
    (j) => j.guruId === teacherId && (j.hari === hariIni || j.mode === 'NORMAL')
  );

  // Today's attendance records for this teacher
  const myAbsensiToday = absensiList.filter(
    (a) => a.tanggal === todayStr && a.guruId === teacherId
  );

  // Check if currently actively teaching
  const activeSession = myAbsensiToday.find((a) => a.status === 'SEDANG_MENGAJAR');

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background ornamentation */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 opacity-15">
          <QrCode className="w-28 h-28" />
        </div>

        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-emerald-100 backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3 h-3 mr-1 text-emerald-300" />
              Sistem Absensi Mengajar Realtime
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Assalamu'alaikum,
            </h2>
            <h3 className="text-base sm:text-lg font-bold text-emerald-100 truncate">
              {currentUser.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100/90 pt-1">
            <div className="flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>{formatTanggalIndonesia(now)}</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-xl font-mono font-bold text-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>{formatJam(now)} WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE TEACHING SESSION ALERT (if teaching right now) */}
      {activeSession && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-3xl p-4 shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <PlayCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Sedang Mengajar
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    Mulai {activeSession.waktuScan}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                  {activeSession.kelasNama} • {activeSession.mapelNama}
                </h4>
                <p className="text-xs text-slate-600 truncate">
                  {activeSession.materiAjar || 'Sesi pembelajaran sedang berlangsung'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onFinishSession(activeSession.id)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Selesai</span>
            </button>
          </div>
        </div>
      )}

      {/* PRIMARY ACTION: BIG SCAN BUTTON */}
      <div className="pt-1">
        <button
          id="btn-scan-qr-teacher"
          onClick={onOpenScanner}
          className="w-full py-4 px-5 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-extrabold text-base shadow-xl shadow-emerald-800/20 active:scale-[0.98] transition flex items-center justify-center gap-3 border-2 border-emerald-400/40 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <div className="leading-tight">SCAN QR ABSEN MENGAJAR</div>
            <div className="text-[11px] text-emerald-200 font-normal">
              Arahkan kamera ke QR Code kelas yang dituju
            </div>
          </div>
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Jadwal Hari Ini</p>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">{mySchedulesToday.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-center shadow-xs">
          <p className="text-[10px] font-bold text-emerald-700 uppercase">Sudah Absen</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{myAbsensiToday.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-center shadow-xs">
          <p className="text-[10px] font-bold text-amber-700 uppercase">Belum Selesai</p>
          <p className="text-xl font-extrabold text-amber-700 mt-0.5">
            {Math.max(0, mySchedulesToday.length - myAbsensiToday.filter(a => a.status === 'SELESAI_MENGAJAR').length)}
          </p>
        </div>
      </div>

      {/* JADWAL SAYA HARI INI */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Jadwal Mengajar Hari Ini ({hariIni})
          </h4>
          <button
            onClick={onViewSchedule}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            Lihat Semua Jadwal →
          </button>
        </div>

        {mySchedulesToday.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-slate-700">Tidak Ada Jadwal Hari Ini</p>
            <p className="text-[11px]">Anda bebas tugas mengajar pada hari {hariIni}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mySchedulesToday.map((jdw) => {
              const matchedAbsensi = myAbsensiToday.find((a) => a.jadwalId === jdw.id);
              const matchedKelas = kelasList.find((k) => k.id === jdw.kelasId);

              let statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Belum Absen
                </span>
              );

              if (matchedAbsensi) {
                if (matchedAbsensi.status === 'SEDANG_MENGAJAR') {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Sedang Mengajar
                    </span>
                  );
                } else if (matchedAbsensi.status === 'SELESAI_MENGAJAR') {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Selesai Mengajar
                    </span>
                  );
                } else if (matchedAbsensi.status === 'HADIR' || matchedAbsensi.status === 'TERLAMBAT') {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {matchedAbsensi.status}
                    </span>
                  );
                }
              }

              return (
                <div
                  key={jdw.id}
                  className={`bg-white rounded-2xl p-3.5 border transition shadow-xs ${
                    matchedAbsensi?.status === 'SEDANG_MENGAJAR'
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200/90 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Jam Ke-{jdw.jamKe}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {jdw.jamMulai} - {jdw.jamSelesai}
                        </span>
                        {statusBadge}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                        {jdw.kelasNama} • {jdw.mapelNama}
                      </h4>

                      {matchedKelas && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{matchedKelas.ruangan}</span>
                        </div>
                      )}

                      {matchedAbsensi && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg mt-2 font-medium">
                          Tercatat scan pada: <strong>{matchedAbsensi.waktuScan} WIB</strong>
                          {matchedAbsensi.materiAjar && (
                            <div className="text-[10px] text-slate-600 truncate mt-0.5">
                              Materi: {matchedAbsensi.materiAjar}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
