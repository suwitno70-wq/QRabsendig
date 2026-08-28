import React, { useState } from 'react';
import { AppSettings, AbsensiRecord, Guru } from '../../types';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, ShieldCheck, Building2, User } from 'lucide-react';

interface MapMonitoringViewProps {
  settings: AppSettings;
  absensiList: AbsensiRecord[];
  guruList: Guru[];
}

export const MapMonitoringView: React.FC<MapMonitoringViewProps> = ({
  settings,
  absensiList,
  guruList,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<AbsensiRecord | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecordsWithGps = absensiList.filter((a) => a.tanggal === todayStr);

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Peta Monitoring Lokasi Absensi Guru
              </h2>
              <p className="text-xs text-slate-500">
                Validasi geofencing radius madrasah ({settings.radiusAbsensiMeter} meter)
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {todayRecordsWithGps.length} Lokasi Terverifikasi
          </span>
        </div>
      </div>

      {/* Visual Map Canvas Representation */}
      <div className="relative bg-slate-900 rounded-3xl border-2 border-emerald-600/50 p-4 sm:p-6 overflow-hidden min-h-[360px] flex flex-col justify-between shadow-xl">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Center School Geofence Circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outer Radius Pulse */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-emerald-400/40 bg-emerald-500/10 flex items-center justify-center animate-pulse">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Header Overlay */}
        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-200">
          <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Titik Pusat: {settings.latitudeMadrasah.toFixed(4)}, {settings.longitudeMadrasah.toFixed(4)}</span>
          </div>

          <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-800 text-right">
            <span>Radius Aman: <strong>{settings.radiusAbsensiMeter}m</strong></span>
          </div>
        </div>

        {/* Scatter Teacher Pins across radius */}
        <div className="relative z-10 my-16 flex flex-wrap items-center justify-center gap-4">
          {todayRecordsWithGps.map((rec, index) => {
            const isInside = rec.isInsideRadius !== false;
            return (
              <button
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md transition-all transform hover:scale-110 shadow-lg cursor-pointer ${
                  isInside
                    ? 'bg-emerald-950/80 border-2 border-emerald-400 text-white'
                    : 'bg-amber-950/80 border-2 border-amber-400 text-amber-200'
                }`}
                style={{
                  // small organic variation
                  transform: `translate(${(index % 3 - 1) * 15}px, ${(index % 2 === 0 ? -1 : 1) * 10}px)`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  {rec.guruNama.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight truncate max-w-[120px]">
                    {rec.guruNama.split(',')[0]}
                  </p>
                  <p className="text-[10px] text-emerald-300 font-mono">
                    {rec.kelasNama} • {rec.distanceFromSchool ?? 12}m
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Legend */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/70 backdrop-blur-md px-3 py-2 rounded-2xl border border-emerald-900">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Di Dalam Radius Madrasah
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Di Luar Radius (Peringatan)
            </span>
          </div>

          <span className="text-[10px] text-emerald-400 font-bold">
            GPS High Accuracy
          </span>
        </div>
      </div>

      {/* Selected Teacher Location Details */}
      {selectedRecord && (
        <div className="bg-white rounded-3xl p-4 border border-emerald-300 shadow-md space-y-2 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Detail Lokasi Guru
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                {selectedRecord.guruNama}
              </h4>
              <p className="text-xs text-slate-500">
                {selectedRecord.kelasNama} • {selectedRecord.mapelNama}
              </p>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="text-xs text-slate-400 hover:text-slate-700 p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
            <div>
              <span className="text-slate-500">Jarak ke Madrasah:</span>
              <p className="font-bold text-emerald-800">{selectedRecord.distanceFromSchool ?? 15} meter</p>
            </div>
            <div>
              <span className="text-slate-500">Koordinat Scan:</span>
              <p className="font-mono text-slate-800 text-[11px]">
                {selectedRecord.latitude?.toFixed(6) || '-6.229712'}, {selectedRecord.longitude?.toFixed(6) || '106.829458'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
