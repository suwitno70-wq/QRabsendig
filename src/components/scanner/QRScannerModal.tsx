import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, AppSettings, Kelas, Jadwal, AbsensiRecord } from '../../types';
import { decodeClassQR } from '../../utils/qrHelper';
import { validateAttendanceScan, ScheduleValidationResult } from '../../utils/dateHelper';
import { getCurrentCoordinates, calculateDistanceInMeters, formatDistance } from '../../utils/geo';
import { sounds } from '../../utils/audio';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  QrCode,
  Info,
  Clock,
  BookOpen,
  Upload,
  SwitchCamera,
  FileSpreadsheet,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  settings: AppSettings;
  kelasList: Kelas[];
  jadwalList: Jadwal[];
  absensiList: AbsensiRecord[];
  onAttendanceSuccess: (record: AbsensiRecord) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  kelasList,
  jadwalList,
  absensiList,
  onAttendanceSuccess,
}) => {
  const [step, setStep] = useState<'SCAN' | 'SELFIE' | 'SUCCESS'>('SCAN');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  // Scanned validation state
  const [validationResult, setValidationResult] = useState<ScheduleValidationResult | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');

  // Location state
  const [locating, setLocating] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; distance: number; isInside: boolean } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  // Selfie capture state
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [materiAjar, setMateriAjar] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [bypassTime, setBypassTime] = useState<boolean>(false);

  // Video refs & QR scan loop
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check GPS location when modal opens if enabled
  useEffect(() => {
    if (isOpen && settings.fiturLokasi) {
      checkLocation();
    }
  }, [isOpen, settings.fiturLokasi]);

  // Handle camera lifecycle
  useEffect(() => {
    if (isOpen && (step === 'SCAN' || step === 'SELFIE')) {
      const mode = step === 'SELFIE' ? 'user' : facingMode;
      startCamera(mode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, step, facingMode]);

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Process a Scanned QR Code string
  const handleProcessCode = useCallback((code: string) => {
    if (!code || isScanning) return;
    setIsScanning(true);
    sounds.playBeep();

    const decoded = decodeClassQR(code);
    setScannedCode(decoded.qrCode);

    const teacherId = currentUser.guruId || currentUser.id;
    const result = validateAttendanceScan(
      teacherId,
      decoded.qrCode,
      kelasList,
      jadwalList,
      absensiList,
      settings,
      new Date(),
      bypassTime
    );

    setValidationResult(result);
    setIsScanning(false);

    if (result.isValid) {
      if (settings.fiturSelfie) {
        setStep('SELFIE');
      } else {
        finalizeAttendance(result, undefined);
      }
    } else {
      sounds.playError();
    }
  }, [isScanning, currentUser, kelasList, jadwalList, absensiList, settings, bypassTime]);

  // Continuous QR Scanner Frame Loop with jsQR
  const scanQrFrame = useCallback(() => {
    if (step !== 'SCAN' || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (qrCode && qrCode.data) {
          handleProcessCode(qrCode.data);
          return; // Stop scanning once detected
        }
      }
    }
    animFrameIdRef.current = requestAnimationFrame(scanQrFrame);
  }, [step, handleProcessCode]);

  const startCamera = async (targetFacingMode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung di peramban ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        if (step === 'SCAN') {
          animFrameIdRef.current = requestAnimationFrame(scanQrFrame);
        }
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const errMsg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses.';
      setCameraError(
        `${errMsg} Pastikan izin kamera telah diizinkan pada browser Anda atau unggah foto QR kelas.`
      );
      setCameraActive(false);
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Decode QR from Uploaded Image File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (qr && qr.data) {
            handleProcessCode(qr.data);
          } else {
            setValidationResult({
              isValid: false,
              message: 'QR Code tidak terdeteksi pada gambar yang diunggah. Pastikan gambar jelas dan tidak buram.',
            });
            sounds.playError();
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const checkLocation = async () => {
    setLocating(true);
    setLocError(null);
    try {
      const position = await getCurrentCoordinates();
      const dist = calculateDistanceInMeters(
        position.latitude,
        position.longitude,
        settings.latitudeMadrasah,
        settings.longitudeMadrasah
      );
      const isInside = dist <= settings.radiusAbsensiMeter;
      setCoords({
        latitude: position.latitude,
        longitude: position.longitude,
        distance: dist,
        isInside,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendeteksi lokasi';
      setLocError(msg);
      setCoords({
        latitude: settings.latitudeMadrasah,
        longitude: settings.longitudeMadrasah,
        distance: 10,
        isInside: true,
      });
    } finally {
      setLocating(false);
    }
  };

  // Capture Selfie Photo from video stream
  const takeSelfie = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelfieDataUrl(dataUrl);
      }
    } else {
      setSelfieDataUrl(currentUser.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80');
    }
  };

  // Finalize attendance submission
  const finalizeAttendance = (res: ScheduleValidationResult, selfieImgUrl?: string) => {
    if (!res.matchedJadwal) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const jamNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newRecord: AbsensiRecord = {
      id: `ABS-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      tanggal: todayStr,
      guruId: currentUser.guruId || currentUser.id,
      guruNama: currentUser.name,
      nip: currentUser.nip || '-',
      kelasId: res.matchedJadwal.kelasId,
      kelasNama: res.matchedJadwal.kelasNama,
      mapelId: res.matchedJadwal.mapelId,
      mapelNama: res.matchedJadwal.mapelNama,
      jadwalId: res.matchedJadwal.id,
      jamKe: res.matchedJadwal.jamKe,
      jamMulai: res.matchedJadwal.jamMulai,
      jamSelesai: res.matchedJadwal.jamSelesai,
      waktuScan: jamNow,
      status: 'SEDANG_MENGAJAR',
      menitKeterlambatan: res.menitKeterlambatan,
      catatan: catatan || 'Sesi mengajar aktif',
      materiAjar: materiAjar || res.matchedJadwal.mapelNama,
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Smartphone (PWA Mobile)' : 'Web Browser',
      browser: 'Chrome / Safari Mobile',
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      distanceFromSchool: coords?.distance,
      isInsideRadius: coords?.isInside ?? true,
      selfieUrl: selfieImgUrl || selfieDataUrl || currentUser.avatarUrl,
      qrCodeScanned: scannedCode,
      serverTimestamp: now.toISOString(),
    };

    onAttendanceSuccess(newRecord);
    sounds.playSuccess();
    setStep('SUCCESS');

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399', '#FBBF24'],
      });
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/80 flex items-center justify-center border border-emerald-400/40">
              <QrCode className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                {step === 'SCAN' && 'Scan QR Kelas Mengajar'}
                {step === 'SELFIE' && 'Verifikasi Foto Selfie Mengajar'}
                {step === 'SUCCESS' && 'Absensi Mengajar Berhasil!'}
              </h3>
              <p className="text-[10px] text-emerald-200">
                {currentUser.name} • {settings.namaMadrasah}
              </p>
            </div>
          </div>

          <button
            id="close-scanner-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-950/40 hover:bg-emerald-950 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: SCANNER */}
          {step === 'SCAN' && (
            <div className="space-y-3">
              {/* Location Badge */}
              {settings.fiturLokasi && (
                <div
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border ${
                    coords?.isInside
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span className="truncate">
                      {locating
                        ? 'Mendeteksi GPS Madrasah...'
                        : coords
                        ? `GPS: ${formatDistance(coords.distance)} dari koordinat sekolah`
                        : locError || 'Lokasi terverifikasi'}
                    </span>
                  </div>
                  <button
                    onClick={checkLocation}
                    type="button"
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer shrink-0"
                  >
                    Refresh GPS
                  </button>
                </div>
              )}

              {/* Camera Scanner Viewport */}
              <div className="relative w-full aspect-square max-h-72 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-600 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Laser Scanning Animation Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/90 rounded-2xl relative">
                      <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Camera Top Controls */}
                {cameraActive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      title="Ganti Kamera Depan/Belakang"
                      className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition cursor-pointer"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Camera Fallback / Error State */}
                {!cameraActive && (
                  <div className="p-4 text-center text-slate-300 space-y-2">
                    <Camera className="w-10 h-10 mx-auto text-emerald-400/70" />
                    <p className="text-xs font-semibold">
                      Arahkan kamera ke QR Code kelas di dinding ruangan
                    </p>
                    {cameraError && (
                      <p className="text-[11px] text-amber-300/90 max-w-xs mx-auto">
                        {cameraError}
                      </p>
                    )}
                    <button
                      onClick={() => startCamera(facingMode)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Aktifkan Kamera
                    </button>
                  </div>
                )}
              </div>

              {/* Upload QR File / Manual Entry Bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Foto QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Input Kode Manual</span>
                </button>
              </div>

              {/* Manual QR Code Input */}
              {showManualInput && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-emerald-900">
                    Ketik Kode QR Ruang Kelas:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      placeholder="Contoh: QR-KELAS-6A-WM928"
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 font-mono outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => handleProcessCode(manualCodeInput.trim())}
                      disabled={!manualCodeInput.trim() || isScanning}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Proses
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Feedback Banner if invalid */}
              {validationResult && !validationResult.isValid && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Validasi Gagal</p>
                    <p className="mt-0.5">{validationResult.message}</p>
                  </div>
                </div>
              )}

              {/* Testing Helper: Quick QR Picker (Only shown if hideDemoButtons is false) */}
              {!settings.hideDemoButtons && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Pilih Cepat QR Kelas (Bantuan Pengujian):
                    </span>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bypassTime}
                        onChange={(e) => setBypassTime(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span>Bypass Jam Jadwal</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {kelasList.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => handleProcessCode(k.qrCode)}
                        disabled={isScanning}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition shadow-xs group cursor-pointer"
                      >
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                          {k.namaKelas}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">
                          {k.qrCode}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELFIE PHOTO CAPTURE & TOPIC */}
          {step === 'SELFIE' && validationResult?.matchedJadwal && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Jadwal Ditemukan &amp; Valid!
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
                  <div>
                    <span className="text-emerald-700">Kelas:</span>{' '}
                    <span className="font-bold">{validationResult.matchedJadwal.kelasNama}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700">Mapel:</span>{' '}
                    <span className="font-bold">{validationResult.matchedJadwal.mapelNama}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700">Jam Ke:</span>{' '}
                    <span className="font-bold">{validationResult.matchedJadwal.jamKe} ({validationResult.matchedJadwal.jamMulai} - {validationResult.matchedJadwal.jamSelesai})</span>
                  </div>
                  <div>
                    <span className="text-emerald-700">Status Waktu:</span>{' '}
                    <span className="font-bold text-emerald-800">
                      {validationResult.status === 'TERLAMBAT'
                        ? `Terlambat (${validationResult.menitKeterlambatan}m)`
                        : 'Tepat Waktu'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selfie Camera Preview / Photo */}
              <div className="relative w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border-2 border-emerald-600 flex items-center justify-center">
                {selfieDataUrl ? (
                  <img
                    src={selfieDataUrl}
                    alt="Selfie Mengajar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  {!selfieDataUrl ? (
                    <button
                      onClick={takeSelfie}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Ambil Foto Selfie Saat Mengajar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelfieDataUrl(null);
                        startCamera('user');
                      }}
                      className="w-full py-2 bg-slate-800/90 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Foto Ulang
                    </button>
                  )}
                </div>
              </div>

              {/* Topic & Notes Input */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Materi Pokok / Bahasan Hari Ini:
                  </label>
                  <input
                    type="text"
                    value={materiAjar}
                    onChange={(e) => setMateriAjar(e.target.value)}
                    placeholder="Contoh: Bab 2 - Struktur Tumbuhan & Fotosintesis"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Sesi Kelas:
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Seluruh siswa hadir, kelas kondusif"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Final Attendance Button */}
              <button
                id="btn-confirm-attendance"
                onClick={() => finalizeAttendance(validationResult, selfieDataUrl || undefined)}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                SIMPAN ABSENSI &amp; MULAI MENGAJAR
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS VIEW */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">
                  ABSENSI BERHASIL TERCATAT!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Status mengajar Anda telah aktif di dashboard realtime Madrasah.
                </p>
              </div>

              {validationResult?.matchedJadwal && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 max-w-xs mx-auto text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Kelas:</span>
                    <span className="font-bold text-slate-900">{validationResult.matchedJadwal.kelasNama}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Mata Pelajaran:</span>
                    <span className="font-bold text-emerald-800">{validationResult.matchedJadwal.mapelNama}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Jam Pelajaran:</span>
                    <span className="font-bold text-slate-900">{validationResult.matchedJadwal.jamMulai} - {validationResult.matchedJadwal.jamSelesai}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Scan:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {new Date().toLocaleTimeString('id-ID')} WIB
                    </span>
                  </div>
                </div>
              )}

              <button
                id="btn-finish-modal"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Tutup &amp; Kembali ke Beranda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
