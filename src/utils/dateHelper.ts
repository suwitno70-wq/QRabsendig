import { Hari, Jadwal, AbsensiRecord, AppSettings, AttendanceStatus } from '../types';

export const HARI_INDONESIA: Record<number, Hari> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  0: 'Senin', // Fallback for Sunday to show active schedule for testing
};

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Formats date into Indonesian locale (e.g. "Rabu, 26 Agustus 2026")
 */
export function formatTanggalIndonesia(date: Date = new Date()): string {
  const dayIndex = date.getDay();
  const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayIndex];
  const tgl = date.getDate();
  const bln = NAMA_BULAN[date.getMonth()];
  const thn = date.getFullYear();
  return `${dayName}, ${tgl} ${bln} ${thn}`;
}

/**
 * Formats time into HH:MM:SS
 */
export function formatJam(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Formats time into HH:MM
 */
export function formatJamMenit(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Converts "07:30" string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Returns today's Hari name in Indonesian
 */
export function getHariIni(date: Date = new Date()): Hari {
  const day = date.getDay();
  return HARI_INDONESIA[day] || 'Rabu';
}

/**
 * Validates whether a scanned QR matches teacher's schedule right now
 */
export interface ScheduleValidationResult {
  isValid: boolean;
  message: string;
  matchedJadwal?: Jadwal;
  status?: AttendanceStatus;
  menitKeterlambatan: number;
}

export function validateAttendanceScan(
  guruId: string,
  scannedCode: string,
  kelasList: Array<{ id: string; qrCode: string; namaKelas: string }>,
  jadwalList: Jadwal[],
  existingAbsensiList: AbsensiRecord[],
  settings: AppSettings,
  currentDate: Date = new Date(),
  bypassTimeForTesting: boolean = false
): ScheduleValidationResult {
  // 1. Find matching Class by QR
  const matchedKelas = kelasList.find(
    (k) => k.qrCode.toLowerCase() === scannedCode.toLowerCase() || k.id.toLowerCase() === scannedCode.toLowerCase()
  );

  if (!matchedKelas) {
    return {
      isValid: false,
      message: `QR Code tidak dikenali (${scannedCode}). Pastikan Anda memindai QR resmi kelas Madrasah.`,
      menitKeterlambatan: 0,
    };
  }

  const hariIni = getHariIni(currentDate);
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const todayStr = currentDate.toISOString().split('T')[0];

  // 2. Filter teacher schedules for this class today
  const guruClassSchedules = jadwalList.filter(
    (j) =>
      j.guruId === guruId &&
      j.kelasId === matchedKelas.id &&
      (j.hari === hariIni || bypassTimeForTesting)
  );

  if (guruClassSchedules.length === 0) {
    return {
      isValid: false,
      message: `Anda tidak memiliki jadwal mengajar di ${matchedKelas.namaKelas} pada hari ${hariIni}.`,
      menitKeterlambatan: 0,
    };
  }

  // 3. Find matching time slot
  // Allow scan starting from `toleransiScanAwalMenit` before `jamMulai` up to `jamSelesai`
  const toleransiAwal = settings.toleransiScanAwalMenit || 15;
  const batasTerlambat = settings.batasTerlambatMenit || 10;

  let activeJadwal: Jadwal | undefined;
  let isTooEarly = false;
  let isTooLate = false;

  for (const jdw of guruClassSchedules) {
    const mulaiMin = timeStringToMinutes(jdw.jamMulai);
    const selesaiMin = timeStringToMinutes(jdw.jamSelesai);

    if (bypassTimeForTesting) {
      activeJadwal = jdw;
      break;
    }

    if (currentMinutes >= mulaiMin - toleransiAwal && currentMinutes <= selesaiMin) {
      activeJadwal = jdw;
      break;
    } else if (currentMinutes < mulaiMin - toleransiAwal) {
      isTooEarly = true;
    } else if (currentMinutes > selesaiMin) {
      isTooLate = true;
    }
  }

  // Fallback: If testing mode or if exact match not found but has schedule today
  if (!activeJadwal) {
    if (isTooEarly) {
      const nextSchedule = guruClassSchedules[0];
      return {
        isValid: false,
        message: `Jadwal mengajar di ${matchedKelas.namaKelas} (${nextSchedule.mapelNama}) belum dimulai. Jam mengajar: ${nextSchedule.jamMulai} - ${nextSchedule.jamSelesai}.`,
        menitKeterlambatan: 0,
      };
    }
    if (isTooLate) {
      return {
        isValid: false,
        message: `Jadwal mengajar di ${matchedKelas.namaKelas} untuk sesi ini telah berakhir.`,
        menitKeterlambatan: 0,
      };
    }
    // Default fallback to first schedule if none strictly matches current minute
    activeJadwal = guruClassSchedules[0];
  }

  // 4. Check if already checked-in today for this schedule
  const alreadyAbsen = existingAbsensiList.find(
    (a) => a.tanggal === todayStr && a.jadwalId === activeJadwal?.id && a.guruId === guruId
  );

  if (alreadyAbsen && alreadyAbsen.status !== 'BELUM_ABSEN') {
    if (alreadyAbsen.status === 'SEDANG_MENGAJAR') {
      return {
        isValid: true,
        matchedJadwal: activeJadwal,
        status: 'SEDANG_MENGAJAR',
        message: `Anda sudah melakukan check-in mengajar pada ${alreadyAbsen.waktuScan}. Anda dapat memperbarui catatan ajar atau menandai sesi selesai.`,
        menitKeterlambatan: alreadyAbsen.menitKeterlambatan,
      };
    }
    return {
      isValid: false,
      message: `Absensi untuk jadwal ${activeJadwal.mapelNama} di ${activeJadwal.kelasNama} sudah tercatat sebelumnya (${alreadyAbsen.status} pada ${alreadyAbsen.waktuScan}).`,
      menitKeterlambatan: alreadyAbsen.menitKeterlambatan,
    };
  }

  // 5. Calculate punctuality
  const jamMulaiMin = timeStringToMinutes(activeJadwal.jamMulai);
  const diffMenit = currentMinutes - jamMulaiMin;
  const menitKeterlambatan = diffMenit > 0 ? diffMenit : 0;
  const status: AttendanceStatus = menitKeterlambatan > batasTerlambat ? 'TERLAMBAT' : 'HADIR';

  return {
    isValid: true,
    matchedJadwal: activeJadwal,
    status,
    menitKeterlambatan,
    message: status === 'TERLAMBAT'
      ? `Absensi Berhasil (Terlambat ${menitKeterlambatan} menit)`
      : `Absensi Berhasil (Tepat Waktu)`,
  };
}
