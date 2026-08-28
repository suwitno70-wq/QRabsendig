import React, { useState } from 'react';
import { User, AbsensiRecord } from '../../types';
import { CheckCircle2, AlertTriangle, PlayCircle, Clock, MapPin, Calendar, FileText } from 'lucide-react';

interface TeacherHistoryProps {
  currentUser: User;
  absensiList: AbsensiRecord[];
}

export const TeacherHistory: React.FC<TeacherHistoryProps> = ({
  currentUser,
  absensiList,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const teacherId = currentUser.guruId || currentUser.id;

  const myHistory = absensiList.filter((a) => a.guruId === teacherId);

  const filtered = myHistory.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Riwayat Absensi Mengajar
        </h2>
        <p className="text-xs text-slate-500">
          Daftar seluruh catatan kehadiran dan waktu mengajar Anda di kelas
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {['ALL', 'SEDANG_MENGAJAR', 'SELESAI_MENGAJAR', 'HADIR', 'TERLAMBAT'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' && 'Semua'}
            {st === 'SEDANG_MENGAJAR' && 'Sedang Mengajar'}
            {st === 'SELESAI_MENGAJAR' && 'Selesai'}
            {st === 'HADIR' && 'Hadir Tepat Waktu'}
            {st === 'TERLAMBAT' && 'Terlambat'}
          </button>
        ))}
      </div>

      {/* History Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Absensi</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Riwayat akan otomatis terisi saat Anda memindai QR Code di kelas.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {item.kelasNama}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.tanggal}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {item.mapelNama}
                  </h4>
                </div>

                <div>
                  {item.status === 'SEDANG_MENGAJAR' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Sedang Mengajar
                    </span>
                  )}
                  {item.status === 'SELESAI_MENGAJAR' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Selesai
                    </span>
                  )}
                  {item.status === 'HADIR' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Hadir
                    </span>
                  )}
                  {item.status === 'TERLAMBAT' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Terlambat (+{item.menitKeterlambatan}m)
                    </span>
                  )}
                </div>
              </div>

              {/* Timing info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px]">Waktu Scan Masuk:</span>
                  <p className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {item.waktuScan} WIB
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px]">Jadwal Pelajaran:</span>
                  <p className="font-mono font-bold text-slate-800">
                    {item.jamMulai} - {item.jamSelesai}
                  </p>
                </div>
              </div>

              {/* Topic / Material note */}
              {item.materiAjar && (
                <div className="text-xs text-slate-700 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-800">Materi:</span> {item.materiAjar}
                </div>
              )}

              {/* Geolocation & Verification Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {item.distanceFromSchool !== undefined ? `${item.distanceFromSchool}m dari Madrasah` : 'GPS Verified'}
                </span>
                <span className="font-mono">ID: {item.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
