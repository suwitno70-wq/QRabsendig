import React, { useState } from 'react';
import { User, Jadwal, Hari } from '../../types';
import { Calendar, Clock, BookOpen, Layers } from 'lucide-react';

interface TeacherScheduleProps {
  currentUser: User;
  jadwalList: Jadwal[];
}

const HARI_LIST: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const TeacherSchedule: React.FC<TeacherScheduleProps> = ({
  currentUser,
  jadwalList,
}) => {
  const [selectedHari, setSelectedHari] = useState<Hari>('Rabu');
  const teacherId = currentUser.guruId || currentUser.id;

  const mySchedules = jadwalList.filter((j) => j.guruId === teacherId);
  const filteredByDay = mySchedules.filter((j) => j.hari === selectedHari);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Jadwal Mengajar Mingguan
          </h2>
          <p className="text-xs text-slate-500">
            Total {mySchedules.length} jam mengajar terdaftar
          </p>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {HARI_LIST.map((hari) => {
          const count = mySchedules.filter((j) => j.hari === hari).length;
          const isActive = selectedHari === hari;
          return (
            <button
              key={hari}
              onClick={() => setSelectedHari(hari)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex flex-col items-center min-w-[64px] ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{hari}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full mt-0.5 ${
                  isActive ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count} sesi
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule list for selected day */}
      <div className="space-y-2.5">
        {filteredByDay.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada jadwal di hari {selectedHari}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Anda tidak memiliki jam mengajar pada hari ini.
            </p>
          </div>
        ) : (
          filteredByDay
            .sort((a, b) => a.jamKe - b.jamKe)
            .map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                        Jam Ke-{item.jamKe}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.jamMulai} - {item.jamSelesai}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 pt-1">
                      {item.mapelNama}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        {item.kelasNama}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                    Mode Normal
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
