import React, { useState } from 'react';
import { Mapel } from '../../types';
import {
  exportMapelToCSV,
  parseMapelCSV,
  downloadCSV,
  MAPEL_CSV_TEMPLATE,
} from '../../utils/csvHelper';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';

interface MasterMapelProps {
  mapelList: Mapel[];
  onSaveMapel: (mapel: Mapel) => void;
  onDeleteMapel: (id: string) => void;
  onImportMapel?: (imported: Mapel[]) => void;
}

export const MasterMapel: React.FC<MasterMapelProps> = ({
  mapelList,
  onSaveMapel,
  onDeleteMapel,
  onImportMapel,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingMapel, setEditingMapel] = useState<Mapel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [mapelToDelete, setMapelToDelete] = useState<Mapel | null>(null);

  const [formData, setFormData] = useState<Partial<Mapel>>({
    id: '',
    kode: '',
    nama: '',
    kelompok: 'Umum',
  });

  const generateUniqueMapelId = (list: Mapel[]): string => {
    let nextNum = list.length + 1;
    let candidate = `MP-${String(nextNum).padStart(2, '0')}`;
    while (list.some((m) => m.id === candidate)) {
      nextNum++;
      candidate = `MP-${String(nextNum).padStart(2, '0')}`;
    }
    return candidate;
  };

  const handleOpenAdd = () => {
    const newId = generateUniqueMapelId(mapelList);
    setFormData({
      id: newId,
      kode: '',
      nama: '',
      kelompok: 'Umum',
    });
    setEditingMapel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mapel: Mapel) => {
    setEditingMapel(mapel);
    setFormData({ ...mapel });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nama.trim() || !formData.kode || !formData.kode.trim()) return;

    let finalId = formData.id;
    if (!editingMapel && (!finalId || mapelList.some((m) => m.id === finalId))) {
      finalId = generateUniqueMapelId(mapelList);
    }

    const finalMapel: Mapel = {
      id: finalId || `MP-${Date.now()}`,
      kode: formData.kode.trim().toUpperCase(),
      nama: formData.nama.trim(),
      kelompok: formData.kelompok || 'Umum',
    };

    onSaveMapel(finalMapel);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (mapelToDelete) {
      onDeleteMapel(mapelToDelete.id);
      setMapelToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const csv = exportMapelToCSV(mapelList);
    downloadCSV(`data-mapel-madrasah-${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleDownloadTemplate = () => {
    downloadCSV('template-import-mapel.csv', MAPEL_CSV_TEMPLATE);
  };

  const handleImportSubmit = () => {
    setImportStatus('');
    if (!csvInput.trim()) {
      setImportStatus('Silakan tempel isi CSV atau unggah file.');
      return;
    }

    const parsed = parseMapelCSV(csvInput);
    if (parsed.length === 0) {
      setImportStatus('Gagal membaca data. Pastikan format CSV sesuai template.');
      return;
    }

    if (onImportMapel) {
      onImportMapel(parsed);
    } else {
      parsed.forEach((m) => onSaveMapel(m));
    }

    setImportStatus(`Berhasil mengimpor ${parsed.length} mata pelajaran!`);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setCsvInput('');
      setImportStatus('');
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvInput(content);
      };
      reader.readAsText(file);
    }
  };

  const filtered = mapelList.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Mata Pelajaran ({mapelList.length} Mapel)
          </h2>
          <p className="text-xs text-slate-500">
            Daftar kurikulum mata pelajaran umum, keagamaan, dan muatan lokal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari mata pelajaran atau kode..."
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-xs"
        />
      </div>

      {/* Mapel List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((mapel) => (
          <div
            key={mapel.id}
            className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-900 text-white font-mono">
                    {mapel.kode}
                  </span>
                  <span
                    className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mapel.kelompok === 'Agama'
                        ? 'bg-emerald-100 text-emerald-800'
                        : mapel.kelompok === 'Muatan Lokal'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {mapel.kelompok}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(mapel)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                    title="Edit Mapel"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapelToDelete(mapel)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus Mapel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 mt-2">{mapel.nama}</h4>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">ID: {mapel.id}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
          <p className="text-xs font-bold">Tidak ada mata pelajaran ditemukan.</p>
        </div>
      )}

      {/* Modal Add/Edit Mapel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-300" />
                {editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Mata Pelajaran: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ilmu Pengetahuan Alam dan Sosial (IPAS)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode Singkat: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode || ''}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                    placeholder="IPAS / MTK"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono font-bold outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelompok:</label>
                  <select
                    value={formData.kelompok || 'Umum'}
                    onChange={(e) => setFormData({ ...formData, kelompok: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none bg-white font-medium"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Agama">Agama</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  {editingMapel ? 'Simpan Perubahan' : 'Tambahkan Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-teal-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-300" />
                Impor Data Mata Pelajaran dari CSV
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900">
                <div>
                  <p className="font-bold">Gunakan Format Template</p>
                  <p className="text-[11px] text-teal-700">Unduh template CSV untuk data mata pelajaran</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center gap-1 text-[11px] cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Template
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih File CSV:</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Atau Tempel Isi CSV di Sini:</label>
                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={`Kode,Nama Mata Pelajaran,Kelompok\nIPAS,"Ilmu Pengetahuan Alam dan Sosial",Umum\nQH,"Al-Qur'an Hadis",Agama`}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono text-[11px] outline-none"
                />
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-slate-100 font-bold text-slate-800 text-xs">
                  {importStatus}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md shadow-teal-700/20 cursor-pointer"
                >
                  Mulai Impor Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={mapelToDelete !== null}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus "${mapelToDelete?.nama}" (${mapelToDelete?.kode})? Jadwal terkait mata pelajaran ini akan terpengaruh.`}
        confirmText="Ya, Hapus Mapel"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setMapelToDelete(null)}
      />
    </div>
  );
};
