import React, { useState } from 'react';
import { Guru, Mapel } from '../../types';
import {
  exportGuruToCSV,
  parseGuruCSV,
  downloadCSV,
  GURU_CSV_TEMPLATE,
} from '../../utils/csvHelper';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  X,
  Download,
  Upload,
  Camera,
  FileSpreadsheet,
  BookOpen,
  Key,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface MasterGuruProps {
  guruList: Guru[];
  mapelList: Mapel[];
  onSaveGuru: (guru: Guru) => Promise<void> | void;
  onDeleteGuru: (id: string) => Promise<void> | void;
  onImportGuru?: (imported: Guru[]) => Promise<void> | void;
}

// Compress and resize uploaded photos for fast storage and avoid quota issues
const compressImage = (file: File, maxDim = 256, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const MasterGuru: React.FC<MasterGuruProps> = ({
  guruList,
  mapelList,
  onSaveGuru,
  onDeleteGuru,
  onImportGuru,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  
  // Custom Delete Confirm Modal state
  const [guruToDelete, setGuruToDelete] = useState<Guru | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCredentials = (guru: Guru) => {
    const text = `Akun Login SI-ABSEN Guru:\nNama: ${guru.nama}\nUsername: ${guru.username}\nPassword: ${guru.password || 'password123'}\nNIP: ${guru.nip || '-'}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(guru.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Guru>>({
    id: '',
    nip: '',
    nik: '',
    nama: '',
    username: '',
    password: 'password123',
    mapelUtama: '',
    noHp: '',
    status: 'AKTIF',
    fotoUrl: '',
    pendidikan: '',
    email: '',
  });

  // Helper to generate guaranteed unique Guru ID
  const generateUniqueGuruId = (list: Guru[]): string => {
    const numericIds = (list || [])
      .map((g) => {
        const match = (g.id || '').match(/(\d+)/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    
    const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    const nextNum = maxNum + 1;
    let candidate = `GURU-${String(nextNum).padStart(2, '0')}`;
    
    // Safety check against collisions
    let collisionCount = 1;
    while ((list || []).some((g) => g.id === candidate)) {
      candidate = `GURU-${String(nextNum + collisionCount).padStart(2, '0')}`;
      collisionCount++;
    }
    return candidate;
  };

  // Helper to generate a unique username
  const generateUniqueUsername = (nama: string, list: Guru[]): string => {
    let base = nama
      ? nama.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
      : 'guru';
    if (!base) base = 'guru';
    let candidate = base;
    let counter = 1;
    while ((list || []).some((g) => (g.username || '').toLowerCase() === candidate.toLowerCase())) {
      candidate = `${base}${counter}`;
      counter++;
    }
    return candidate;
  };

  const handleOpenAdd = () => {
    const newId = generateUniqueGuruId(guruList);
    const defaultMapel = mapelList[0]?.nama || 'Umum';
    const avatarList = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    ];
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    setFormData({
      id: newId,
      nip: '',
      nik: '',
      nama: '',
      username: generateUniqueUsername('', guruList),
      password: 'password123',
      mapelUtama: defaultMapel,
      noHp: '',
      status: 'AKTIF',
      fotoUrl: randomAvatar,
      pendidikan: 'S1 Pendidikan',
      email: '',
    });
    setFormError('');
    setEditingGuru(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setFormData({ ...guru });
    setFormError('');
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 256, 0.82);
        setFormData((prev) => ({ ...prev, fotoUrl: compressed }));
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nama || !formData.nama.trim()) {
      setFormError('Nama lengkap guru wajib diisi.');
      return;
    }

    let finalId = formData.id;
    if (!editingGuru && (!finalId || (guruList || []).some((g) => g.id === finalId))) {
      finalId = generateUniqueGuruId(guruList);
    }

    const cleanUsername = (formData.username && formData.username.trim())
      ? formData.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
      : generateUniqueUsername(formData.nama, guruList);

    const finalGuru: Guru = {
      id: finalId || `GURU-${Date.now()}`,
      nip: formData.nip?.trim() || '-',
      nik: formData.nik?.trim() || '-',
      nama: formData.nama.trim(),
      username: cleanUsername,
      password: formData.password?.trim() || 'password123',
      mapelUtama: formData.mapelUtama?.trim() || mapelList[0]?.nama || 'Umum',
      noHp: formData.noHp?.trim() || '-',
      status: formData.status || 'AKTIF',
      fotoUrl:
        formData.fotoUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      pendidikan: formData.pendidikan?.trim() || 'S1 Pendidikan',
      email: formData.email?.trim() || '',
    };

    setIsSubmitting(true);
    try {
      await onSaveGuru(finalGuru);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan data guru. Silakan periksa kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (guruToDelete) {
      await onDeleteGuru(guruToDelete.id);
      setGuruToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const csv = exportGuruToCSV(guruList);
    downloadCSV(`data-guru-madrasah-${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleDownloadTemplate = () => {
    downloadCSV('template-import-guru.csv', GURU_CSV_TEMPLATE);
  };

  const handleImportSubmit = async () => {
    setImportStatus('');
    if (!csvInput.trim()) {
      setImportStatus('Silakan tempel isi CSV atau unggah file.');
      return;
    }

    const parsed = parseGuruCSV(csvInput);
    if (parsed.length === 0) {
      setImportStatus('Gagal membaca data. Pastikan format CSV sesuai template.');
      return;
    }

    try {
      if (onImportGuru) {
        await onImportGuru(parsed);
      } else {
        for (const g of parsed) {
          await onSaveGuru(g);
        }
      }

      setImportStatus(`Berhasil mengimpor ${parsed.length} guru!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvInput('');
        setImportStatus('');
      }, 1200);
    } catch (err: any) {
      setImportStatus(`Gagal mengimpor: ${err?.message || 'Terjadi kesalahan'}`);
    }
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

  const filtered = (guruList || []).filter(
    (g) =>
      (g.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.nip || '').includes(searchTerm) ||
      (g.mapelUtama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Manajemen Data Guru ({guruList.length} Pendidik)
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data guru, NIP, mapel utama, akun login, dan status mengajar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Ekspor ke Excel / CSV"
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
            <span>Tambah Guru</span>
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
          placeholder="Cari nama guru, NIP, username, atau mata pelajaran..."
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-xs"
        />
      </div>

      {/* Guru Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((guru) => (
          <div
            key={guru.id}
            className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 overflow-hidden shrink-0 flex items-center justify-center text-emerald-800 font-bold text-base shadow-xs">
                {guru.fotoUrl ? (
                  <img
                    src={guru.fotoUrl}
                    alt={guru.nama}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  guru.nama.charAt(0)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-xs truncate" title={guru.nama}>
                  {guru.nama}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">NIP: {guru.nip || '-'}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {guru.mapelUtama}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      guru.status === 'AKTIF'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {guru.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/70 p-2.5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Shield className="w-3 h-3 text-emerald-700" />
                  User:
                </span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  @{guru.username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Key className="w-3 h-3 text-amber-600" />
                  Pass:
                </span>
                <span className="font-mono text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {guru.password || 'password123'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCredentials(guru)}
                className="w-full mt-1 py-1 px-2 text-[10px] font-bold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedId === guru.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Kredensial Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Salin Info Login</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              {guru.noHp && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    WhatsApp:
                  </span>
                  <span className="text-slate-800 font-mono">{guru.noHp}</span>
                </div>
              )}
              {guru.email && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    Email:
                  </span>
                  <span className="text-slate-800 truncate max-w-[150px]">{guru.email}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">{guru.id}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(guru)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                  title="Edit Data Guru"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGuruToDelete(guru)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Hapus Guru"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-dashed border-slate-200">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
          <p className="text-xs font-bold">Tidak ada guru ditemukan.</p>
          <p className="text-[11px]">Silakan klik tombol "Tambah Guru" untuk menambahkan guru baru.</p>
        </div>
      )}

      {/* Modal Add/Edit Guru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-300" />
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3 text-xs flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      nama: newName,
                      username: !editingGuru && (!prev.username || prev.username.startsWith('guru'))
                        ? generateUniqueUsername(newName, guruList)
                        : prev.username,
                    }));
                  }}
                  placeholder="Contoh: Ahmad Fauzi, S.Pd.I"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP (atau NIK/NUPTK):</label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="198506122010011018"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mapel Utama:</label>
                  <select
                    value={formData.mapelUtama || ''}
                    onChange={(e) => setFormData({ ...formData, mapelUtama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none bg-white font-medium"
                  >
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.nama}>
                        {m.nama}
                      </option>
                    ))}
                    <option value="Umum">Umum / Guru Kelas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    placeholder="ahmad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password Login: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={formData.noHp || ''}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian:</label>
                  <select
                    value={formData.status || 'AKTIF'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none bg-white font-medium"
                  >
                    <option value="AKTIF">AKTIF (Mengajar)</option>
                    <option value="NON_AKTIF">NON-AKTIF</option>
                    <option value="CUTI">CUTI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir:</label>
                  <input
                    type="text"
                    value={formData.pendidikan || ''}
                    onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                    placeholder="S1 Pendidikan Agama Islam"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Madrasah:</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guru@min1model.sch.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto Profil / Avatar:</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.fotoUrl ? (
                      <img src={formData.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingGuru ? 'Simpan Perubahan' : 'Tambahkan Guru'}</span>
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
                Impor Data Guru dari Excel / CSV
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
                  <p className="text-[11px] text-teal-700">Unduh template CSV untuk mengisi data pendidik sekolah</p>
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
                  placeholder={`NIP,NIK,Nama Lengkap,Username,Password,Mapel Utama,No HP,Pendidikan,Email\n198506122010011018,3174091206850001,"Ahmad Fauzi, S.Pd.I",ahmad,password123,IPAS,081234567890,S1,ahmad@madrasah.sch.id`}
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

      {/* Reusable In-App Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={guruToDelete !== null}
        title="Hapus Data Guru"
        message={`Apakah Anda yakin ingin menghapus "${guruToDelete?.nama}"? Akun login dan riwayat terkait akan dihapus secara permanen.`}
        confirmText="Ya, Hapus Guru"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setGuruToDelete(null)}
      />
    </div>
  );
};
