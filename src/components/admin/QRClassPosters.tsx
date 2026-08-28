import React, { useState, useEffect } from 'react';
import { Kelas, AppSettings } from '../../types';
import { generateQRDataUrl } from '../../utils/qrHelper';
import {
  QrCode,
  Printer,
  Download,
  Building2,
  Sparkles,
  CheckCircle2,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface QRClassPostersProps {
  kelasList: Kelas[];
  settings: AppSettings;
  initialSelectedKelas?: Kelas | null;
}

export const QRClassPosters: React.FC<QRClassPostersProps> = ({
  kelasList,
  settings,
  initialSelectedKelas,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<Kelas>(
    initialSelectedKelas || kelasList[0]
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<number>(360);

  useEffect(() => {
    if (initialSelectedKelas) {
      setSelectedKelas(initialSelectedKelas);
    }
  }, [initialSelectedKelas]);

  useEffect(() => {
    if (selectedKelas) {
      loadQR(selectedKelas.qrCode);
    }
  }, [selectedKelas, qrSize]);

  const loadQR = async (code: string) => {
    setIsGenerating(true);
    try {
      const url = await generateQRDataUrl(code, {
        width: qrSize,
        color: { dark: '#064e3b', light: '#ffffff' },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-CODE-${selectedKelas.namaKelas.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            Cetak Poster QR Code Ruang Kelas
          </h2>
          <p className="text-xs text-slate-500">
            Cetak dan tempelkan poster resmi ini di dalam masing-masing ruang kelas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download QR PNG
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Poster (Print / PDF)
          </button>
        </div>
      </div>

      {/* Classroom Selector Pills (Hidden when printing) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs print:hidden">
        {kelasList.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedKelas(k)}
            className={`px-3 py-2 rounded-2xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedKelas?.id === k.id
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {k.namaKelas}
          </button>
        ))}
      </div>

      {/* PRINTABLE POSTER CARD (Formatted for A4 or clean wall sticker) */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-4 border-emerald-800 shadow-xl space-y-6 text-center print:border-2 print:shadow-none print:m-0 print:max-w-none">
        {/* Kop Madrasah */}
        <div className="border-b-2 border-emerald-800 pb-4 space-y-1">
          <div className="flex items-center justify-center gap-2 text-emerald-900">
            <Building2 className="w-6 h-6 text-emerald-700" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </h3>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
            {settings.namaMadrasah}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {settings.alamatMadrasah} • NPSN: {settings.npsn}
          </p>
        </div>

        {/* Poster Header */}
        <div className="space-y-1">
          <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs uppercase tracking-widest border border-emerald-300">
            POSTER PRESENSI RESMI KELAS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight pt-1">
            {selectedKelas.namaKelas}
          </h1>
          <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" />
            {selectedKelas.ruangan}
          </p>
          <p className="text-xs text-slate-500">
            Wali Kelas: <strong>{selectedKelas.waliKelasNama}</strong>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative inline-block p-4 rounded-3xl bg-emerald-50/50 border-3 border-emerald-600 shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code ${selectedKelas.namaKelas}`}
              className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-2xl"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          )}

          <div className="mt-2 text-xs font-mono font-bold text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-200 inline-block">
            {selectedKelas.qrCode}
          </div>
        </div>

        {/* Instructions for Teachers */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 max-w-md mx-auto text-xs">
          <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Petunjuk Absensi Guru Mengajar:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium leading-relaxed text-[11px]">
            <li>Buka aplikasi <strong>SI-ABSEN</strong> di HP Anda.</li>
            <li>Pastikan Anda telah login menggunakan akun Guru.</li>
            <li>Tekan tombol besar <strong>[ 📷 SCAN QR ABSEN MENGAJAR ]</strong>.</li>
            <li>Arahkan kamera HP ke QR Code di atas.</li>
            <li>Ambil foto selfie mengajar &amp; sistem memverifikasi jadwal Anda.</li>
          </ol>
        </div>

        {/* Poster Footer Signature Note */}
        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
          <span>SI-ABSEN GURU MENGAJAR REALTIME • Kreatif by Witno</span>
          <span>Dicetak otomatis sistem</span>
        </div>
      </div>
    </div>
  );
};
