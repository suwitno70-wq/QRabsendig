import React, { useState } from 'react';
import { AbsensiRecord, Guru, Kelas, Mapel, AppSettings } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  FileText,
  Download,
  Printer,
  Filter,
  Search,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Building2,
  Trash2,
} from 'lucide-react';

interface RekapLaporanProps {
  absensiList: AbsensiRecord[];
  guruList: Guru[];
  kelasList: Kelas[];
  mapelList: Mapel[];
  settings: AppSettings;
  onDeleteAbsensi?: (id: string) => void;
  onClearAllAbsensi?: () => void;
}

export const RekapLaporan: React.FC<RekapLaporanProps> = ({
  absensiList,
  guruList,
  kelasList,
  mapelList,
  settings,
  onDeleteAbsensi,
  onClearAllAbsensi,
}) => {
  const [periode, setPeriode] = useState<'HARIAN' | 'MINGGUAN' | 'BULANAN' | 'SEMUA'>('HARIAN');
  const [selectedGuru, setSelectedGuru] = useState<string>('ALL');
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<AbsensiRecord | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredData = absensiList.filter((item) => {
    if (selectedGuru !== 'ALL' && item.guruId !== selectedGuru) return false;
    if (selectedKelas !== 'ALL' && item.kelasId !== selectedKelas) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

    if (periode === 'HARIAN' && item.tanggal !== todayStr) return false;

    if (searchTerm) {
      const match =
        item.guruNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kelasNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mapelNama.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  // Export to Excel / CSV format
  const handleExportCSV = () => {
    const headers = [
      'ID Absensi',
      'Tanggal',
      'ID Guru',
      'Nama Guru',
      'NIP',
      'Kelas',
      'Mata Pelajaran',
      'Jam Ke',
      'Jam Mulai',
      'Jam Selesai',
      'Waktu Scan Masuk',
      'Status Kehadiran',
      'Keterlambatan (Menit)',
      'Materi / Catatan',
      'Jarak dari Madrasah (m)',
    ];

    const rows = filteredData.map((d) => [
      `"${d.id}"`,
      `"${d.tanggal}"`,
      `"${d.guruId}"`,
      `"${d.guruNama}"`,
      `"${d.nip}"`,
      `"${d.kelasNama}"`,
      `"${d.mapelNama}"`,
      `"${d.jamKe}"`,
      `"${d.jamMulai}"`,
      `"${d.jamSelesai}"`,
      `"${d.waktuScan}"`,
      `"${d.status}"`,
      `"${d.menitKeterlambatan}"`,
      `"${(d.materiAjar || d.catatan || '').replace(/"/g, '""')}"`,
      `"${d.distanceFromSchool ?? 0}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAP_ABSENSI_${periode}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmDeleteItem = () => {
    if (itemToDelete && onDeleteAbsensi) {
      onDeleteAbsensi(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleConfirmClearAll = () => {
    if (onClearAllAbsensi) {
      onClearAllAbsensi();
      setIsClearAllOpen(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Rekap &amp; Laporan Absensi Mengajar ({absensiList.length} Catatan)
          </h2>
          <p className="text-xs text-slate-500">
            Laporan rekapitulasi kehadiran guru saat mengajar di kelas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onClearAllAbsensi && absensiList.length > 0 && (
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Bersihkan Presensi
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Excel (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF / Print
          </button>
        </div>
      </div>

      {/* Filter Controls (Hidden on print) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          Filter Rekapitulasi:
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Periode:</label>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="HARIAN">Hari Ini ({todayStr})</option>
              <option value="MINGGUAN">Minggu Ini</option>
              <option value="BULANAN">Bulan Ini</option>
              <option value="SEMUA">Semua Riwayat</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Pilih Guru:</label>
            <select
              value={selectedGuru}
              onChange={(e) => setSelectedGuru(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">Semua Guru</option>
              {guruList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Pilih Kelas:</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Kehadiran:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="SEDANG_MENGAJAR">Sedang Mengajar</option>
              <option value="SELESAI_MENGAJAR">Selesai Mengajar</option>
              <option value="HADIR">Hadir Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRINTABLE DOCUMENT PREVIEW */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Formal Kop Madrasah (Visible on screen and print) */}
        <div className="border-b-2 border-slate-900 pb-3 space-y-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-800" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </h4>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
            {settings.namaMadrasah}
          </h2>
          <p className="text-xs text-slate-600">
            {settings.alamatMadrasah} • NPSN: {settings.npsn}
          </p>
          <div className="h-0.5 bg-slate-900 mt-2" />
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
            LAPORAN REKAPITULASI PRESENSI GURU MENGAJAR DI KELAS
          </h3>
          <p className="text-xs text-slate-500">
            Periode: <strong>{periode}</strong> • Tanggal Cetak: {todayStr}
          </p>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-white font-bold border border-emerald-900">
                <th className="p-2 text-center w-10">No</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">Nama Guru</th>
                <th className="p-2">Kelas</th>
                <th className="p-2">Mata Pelajaran</th>
                <th className="p-2 text-center">Jam Ke</th>
                <th className="p-2 text-center">Scan Masuk</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2">Materi / Topik Ajar</th>
                {onDeleteAbsensi && <th className="p-2 text-center print:hidden">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border border-slate-200 text-[11px]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={onDeleteAbsensi ? 10 : 9} className="p-6 text-center text-slate-400">
                    Tidak ada data absensi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold text-slate-600">{idx + 1}</td>
                    <td className="p-2 whitespace-nowrap font-mono">{item.tanggal}</td>
                    <td className="p-2 font-bold text-slate-900 whitespace-nowrap">{item.guruNama}</td>
                    <td className="p-2 font-bold text-emerald-800 whitespace-nowrap">{item.kelasNama}</td>
                    <td className="p-2">{item.mapelNama}</td>
                    <td className="p-2 text-center font-mono font-bold">{item.jamKe}</td>
                    <td className="p-2 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                      {item.waktuScan} WIB
                    </td>
                    <td className="p-2 text-center whitespace-nowrap">
                      {item.status === 'SEDANG_MENGAJAR' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          Sedang Mengajar
                        </span>
                      )}
                      {item.status === 'SELESAI_MENGAJAR' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                          Selesai
                        </span>
                      )}
                      {item.status === 'HADIR' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Hadir
                        </span>
                      )}
                      {item.status === 'TERLAMBAT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Terlambat (+{item.menitKeterlambatan}m)
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-slate-600">{item.materiAjar || item.catatan || '-'}</td>
                    {onDeleteAbsensi && (
                      <td className="p-2 text-center print:hidden whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Catatan Presensi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signature Area */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center break-inside-avoid">
          <div className="space-y-1">
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Kepala Madrasah</p>
            <div className="h-16" />
            <p className="font-black text-slate-900 underline">{settings.namaKepalaMadrasah}</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. {settings.nipKepalaMadrasah}</p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-500">Jakarta, {todayStr}</p>
            <p className="font-bold text-slate-800">Petugas / Operator SI-ABSEN</p>
            <div className="h-16" />
            <p className="font-black text-slate-900 underline">Administrator Madrasah</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. 198801152014031002</p>
          </div>
        </div>
      </div>

      {/* Delete Record Confirmation */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Hapus Catatan Presensi"
        message={`Apakah Anda yakin ingin menghapus catatan presensi guru ${itemToDelete?.guruNama} (${itemToDelete?.kelasNama} - ${itemToDelete?.mapelNama}) tanggal ${itemToDelete?.tanggal}?`}
        confirmText="Hapus Catatan"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Clear All Confirmation */}
      <ConfirmModal
        isOpen={isClearAllOpen}
        title="Bersihkan Seluruh Riwayat Presensi"
        message="PERINGATAN: Seluruh catatan riwayat absensi guru akan dihapus permanen dari sistem dan server. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Bersihkan Semua"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsClearAllOpen(false)}
      />
    </div>
  );
};
