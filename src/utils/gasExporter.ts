export interface GasFile {
  name: string;
  type: 'server_js' | 'html' | 'json';
  description: string;
  content: string;
}

export const GAS_SCRIPTS: GasFile[] = [
  {
    name: 'Config.gs',
    type: 'server_js',
    description: 'Konfigurasi Spreadsheet ID, nama madrasah, dan parameter sistem',
    content: `/**
 * SI-ABSEN GURU MENGAJAR REALTIME - Kreatif by Witno
 * File: Config.gs
 * Versi: 1.0.0
 */

var CONFIG = {
  // Ganti dengan ID Spreadsheet Google Anda jika tidak terikat langsung (Bound Script)
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  
  // Identitas Madrasah
  NAMA_MADRASAH: "Madrasah Ibtidaiyah Negeri 1 Model",
  NPSN: "60728192",
  ALAMAT: "Jl. Kemenag No. 45, Jakarta Timur",
  KEPALA_MADRASAH: "Drs. H. M. Syaifuddin, M.Pd.I",
  NIP_KEPALA: "197405121999031004",
  
  // Koordinat & Radius (Geofencing)
  LATITUDE_MADRASAH: -6.229728,
  LONGITUDE_MADRASAH: 106.829445,
  RADIUS_METER: 150,
  
  // Aturan Waktu
  TIMEZONE: "Asia/Jakarta",
  BATAS_TERLAMBAT_MENIT: 10,
  TOLERANSI_AWAL_MENIT: 15,
  
  // Nama Sheet Database
  SHEETS: {
    USERS: "USERS",
    GURU: "GURU",
    KELAS: "KELAS",
    MAPEL: "MAPEL",
    JADWAL: "JADWAL",
    ABSENSI: "ABSENSI",
    PENGATURAN: "PENGATURAN",
    LOG: "LOG"
  }
};
`,
  },
  {
    name: 'Code.gs',
    type: 'server_js',
    description: 'Routing utama Web App (doGet, doPost) & include helper',
    content: `/**
 * SI-ABSEN GURU MENGAJAR REALTIME - Kreatif by Witno
 * File: Code.gs
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('SI-ABSEN Guru Mengajar Realtime - Kreatif by Witno')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Handle AJAX Post Request jika menggunakan REST Endpoint
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result = { success: false, message: 'Aksi tidak dikenali' };
    
    if (action === 'login') {
      result = authLogin(data.username, data.password);
    } else if (action === 'submitAbsen') {
      result = apiSubmitAbsensi(data);
    } else if (action === 'getDashboard') {
      result = apiGetLiveDashboard();
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`,
  },
  {
    name: 'Database.gs',
    type: 'server_js',
    description: 'Setup otomatis struktur Google Sheets & helper database',
    content: `/**
 * File: Database.gs
 * Fungsi inisialisasi dan manipulasi Google Sheets
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetHeaders = {
    "USERS": ["ID User", "Username", "Password", "Nama Lengkap", "Role", "ID Guru", "Email", "Status"],
    "GURU": ["ID Guru", "NIP", "NIK", "Nama Guru", "Username", "Password", "Mapel Utama", "No HP", "Status", "Foto URL"],
    "KELAS": ["ID Kelas", "Nama Kelas", "Tingkat", "ID Wali Kelas", "Nama Wali Kelas", "Ruangan", "QR Code", "Status"],
    "MAPEL": ["ID Mapel", "Kode", "Nama Mapel", "Kelompok"],
    "JADWAL": ["ID Jadwal", "Hari", "Jam Ke", "Jam Mulai", "Jam Selesai", "ID Guru", "Nama Guru", "ID Mapel", "Nama Mapel", "ID Kelas", "Nama Kelas", "Mode"],
    "ABSENSI": ["ID Absensi", "Tanggal", "Jam Server", "ID Guru", "Nama Guru", "NIP", "ID Kelas", "Nama Kelas", "Mapel", "Jam Ke", "Jam Mulai", "Jam Selesai", "Status", "Waktu Scan", "Waktu Selesai", "Keterlambatan (Menit)", "Catatan / Materi", "Device", "Browser", "Latitude", "Longitude", "Jarak (m)", "Status Radius", "Foto Selfie URL", "QR Code"],
    "PENGATURAN": ["Kunci", "Nilai", "Keterangan"],
    "LOG": ["ID Log", "Timestamp", "Tipe", "Aktor", "Aksi", "Detail"]
  };
  
  for (var sheetName in sheetHeaders) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    var headers = sheetHeaders[sheetName];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0D5C3A").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  
  setupSampleData();
  return { success: true, message: "Database dan semua Sheet berhasil disetup!" };
}

function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}
`,
  },
  {
    name: 'Absensi.gs',
    type: 'server_js',
    description: 'Validasi server-side, jadwal matching, keterlambatan, dan pencatatan absensi',
    content: `/**
 * File: Absensi.gs
 * Logika validasi dan pencatatan absensi realtime
 */

function apiSubmitAbsensi(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var absensiSheet = ss.getSheetByName(CONFIG.SHEETS.ABSENSI);
  var jadwalSheet = ss.getSheetByName(CONFIG.SHEETS.JADWAL);
  
  var now = new Date();
  var timezone = CONFIG.TIMEZONE;
  var tanggalHariIni = Utilities.formatDate(now, timezone, "yyyy-MM-dd");
  var jamServer = Utilities.formatDate(now, timezone, "HH:mm:ss");
  
  // 1. Validasi Kelas via QR Code
  var kelasData = getSheetData(CONFIG.SHEETS.KELAS);
  var matchedKelas = null;
  for (var k = 0; k < kelasData.length; k++) {
    if (kelasData[k]["QR Code"] === payload.qrCode || kelasData[k]["ID Kelas"] === payload.qrCode) {
      matchedKelas = kelasData[k];
      break;
    }
  }
  
  if (!matchedKelas) {
    return { success: false, message: "QR Code Kelas tidak terdaftar dalam sistem!" };
  }
  
  // 2. Validasi Jadwal Guru
  var jadwalData = getSheetData(CONFIG.SHEETS.JADWAL);
  var hariArray = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var namaHari = hariArray[now.getDay()];
  
  var activeJadwal = null;
  for (var j = 0; j < jadwalData.length; j++) {
    var item = jadwalData[j];
    if (item["ID Guru"] === payload.guruId && 
        item["ID Kelas"] === matchedKelas["ID Kelas"] && 
        item["Hari"] === namaHari) {
      activeJadwal = item;
      break;
    }
  }
  
  if (!activeJadwal) {
    return { success: false, message: "Anda tidak memiliki jadwal mengajar di " + matchedKelas["Nama Kelas"] + " hari ini (" + namaHari + ")." };
  }
  
  // 3. Hitung Keterlambatan
  var jamMulai = activeJadwal["Jam Mulai"];
  var status = "HADIR";
  var keterlambatanMenit = 0;
  
  var absensiId = "ABS-" + Utilities.formatDate(now, timezone, "yyyyMMdd") + "-" + Math.floor(Math.random()*10000);
  
  var row = [
    absensiId,
    tanggalHariIni,
    jamServer,
    payload.guruId,
    payload.guruNama,
    payload.nip || "-",
    matchedKelas["ID Kelas"],
    matchedKelas["Nama Kelas"],
    activeJadwal["Nama Mapel"],
    activeJadwal["Jam Ke"],
    activeJadwal["Jam Mulai"],
    activeJadwal["Jam Selesai"],
    status,
    jamServer,
    "", // Waktu selesai
    keterlambatanMenit,
    payload.catatan || "Mulai Pembelajaran",
    payload.device || "-",
    payload.browser || "-",
    payload.latitude || 0,
    payload.longitude || 0,
    payload.distance || 0,
    payload.isInsideRadius ? "DI DALAM RADIUS" : "DI LUAR RADIUS",
    payload.selfieUrl || "",
    payload.qrCode
  ];
  
  absensiSheet.appendRow(row);
  logSystemAction("Absensi Mengajar Berhasil: " + payload.guruNama + " (" + matchedKelas["Nama Kelas"] + ")", payload.guruNama, "SUCCESS");
  
  return {
    success: true,
    message: "Absensi Berhasil Tercatat!",
    data: {
      absensiId: absensiId,
      kelasNama: matchedKelas["Nama Kelas"],
      mapelNama: activeJadwal["Nama Mapel"],
      jamMulai: activeJadwal["Jam Mulai"],
      jamSelesai: activeJadwal["Jam Selesai"],
      waktuScan: jamServer,
      status: status
    }
  };
}
`,
  },
  {
    name: 'Dashboard.gs',
    type: 'server_js',
    description: 'Endpoint data realtime dashboard monitoring Kepala Madrasah & Admin',
    content: `/**
 * File: Dashboard.gs
 * Menghasilkan statistik live monitoring mengajar realtime
 */

function apiGetLiveDashboard() {
  var now = new Date();
  var timezone = CONFIG.TIMEZONE;
  var todayStr = Utilities.formatDate(now, timezone, "yyyy-MM-dd");
  
  var guruList = getSheetData(CONFIG.SHEETS.GURU);
  var kelasList = getSheetData(CONFIG.SHEETS.KELAS);
  var jadwalList = getSheetData(CONFIG.SHEETS.JADWAL);
  var absensiList = getSheetData(CONFIG.SHEETS.ABSENSI);
  
  var hariArray = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var hariIni = hariArray[now.getDay()];
  
  var jadwalHariIni = jadwalList.filter(function(j) { return j["Hari"] === hariIni; });
  var absensiHariIni = absensiList.filter(function(a) { return a["Tanggal"] === todayStr; });
  
  var sedangMengajar = absensiHariIni.filter(function(a) { return a["Status"] === "SEDANG_MENGAJAR" || a["Status"] === "HADIR"; }).length;
  var terlambat = absensiHariIni.filter(function(a) { return a["Status"] === "TERLAMBAT"; }).length;
  var sudahAbsen = absensiHariIni.length;
  var belumAbsen = Math.max(0, jadwalHariIni.length - sudahAbsen);
  
  return {
    success: true,
    serverTime: Utilities.formatDate(now, timezone, "yyyy-MM-dd HH:mm:ss"),
    stats: {
      totalGuru: guruList.length,
      totalKelas: kelasList.length,
      totalJadwalHariIni: jadwalHariIni.length,
      sedangMengajar: sedangMengajar,
      sudahAbsen: sudahAbsen,
      belumAbsen: belumAbsen,
      terlambat: terlambat
    },
    liveList: absensiHariIni
  };
}
`,
  },
  {
    name: 'appsscript.json',
    type: 'json',
    description: 'Manifest Google Apps Script',
    content: `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}`,
  },
];

export function generateGASBackendCode(settings?: any): string {
  const madrasahName = settings?.namaMadrasah || "Madrasah Ibtidaiyah Negeri 1 Model";
  const npsn = settings?.npsn || "60728192";
  const alamat = settings?.alamatMadrasah || "Jl. Kemenag No. 45, Jakarta Timur";
  const kepala = settings?.namaKepalaMadrasah || "Drs. H. M. Syaifuddin, M.Pd.I";
  const nipKepala = settings?.nipKepalaMadrasah || "197405121999031004";
  const lat = settings?.latitudeMadrasah || -6.229728;
  const lng = settings?.longitudeMadrasah || 106.829445;
  const radius = settings?.radiusAbsensiMeter || 150;
  const batasLate = settings?.batasTerlambatMenit || 10;
  const toleransi = settings?.toleransiSebelumMasukMenit || 15;

  return `/**
 * =========================================================================
 * SI-ABSEN GURU MENGAJAR REALTIME
 * Kreatif by Witno
 * Backend: Google Apps Script + Google Spreadsheet Database
 * =========================================================================
 */

var CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  NAMA_MADRASAH: "${madrasahName}",
  NPSN: "${npsn}",
  ALAMAT: "${alamat}",
  KEPALA_MADRASAH: "${kepala}",
  NIP_KEPALA: "${nipKepala}",
  LATITUDE_MADRASAH: ${lat},
  LONGITUDE_MADRASAH: ${lng},
  RADIUS_METER: ${radius},
  BATAS_TERLAMBAT_MENIT: ${batasLate},
  TOLERANSI_AWAL_MENIT: ${toleransi},
  TIMEZONE: "Asia/Jakarta",
  SHEETS: {
    USERS: "USERS",
    GURU: "GURU",
    KELAS: "KELAS",
    MAPEL: "MAPEL",
    JADWAL: "JADWAL",
    ABSENSI: "ABSENSI",
    PENGATURAN: "PENGATURAN",
    LOG: "LOG"
  }
};

function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h1>SI-ABSEN GURU MENGAJAR REALTIME</h1><p>Kreatif by Witno</p><p>Backend Google Apps Script Aktif & Terhubung ke Spreadsheet.</p>"
  ).setTitle("SI-ABSEN Backend API");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result = { success: true, message: "Data diterima" };

    if (action === "submitAbsen" || data.guruNama || data.id) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("ABSENSI");
      if (!sheet) {
        setupDatabase();
        sheet = ss.getSheetByName("ABSENSI");
      }
      sheet.appendRow([
        data.id || "ABS-" + new Date().getTime(),
        data.tanggal || new Date().toISOString().split("T")[0],
        new Date().toLocaleTimeString(),
        data.guruId || "",
        data.guruNama || "",
        data.nip || "",
        data.kelasId || "",
        data.kelasNama || "",
        data.mataPelajaranNama || data.mapelNama || "",
        data.jamKe || "-",
        data.jamMulai || "",
        data.jamSelesai || "",
        data.statusKehadiran || data.status || "HADIR",
        data.waktuScanMasuk || data.waktuScan || "",
        data.waktuSelesai || "-",
        data.menitKeterlambatan || 0,
        data.catatan || data.materiAjar || "-",
        data.deviceInfo || "Web Mobile",
        data.browser || "Browser",
        data.latitude || 0,
        data.longitude || 0,
        data.jarakMeter || data.distanceFromSchool || 0,
        (data.distanceFromSchool && data.distanceFromSchool <= CONFIG.RADIUS_METER) ? "DALAM RADIUS" : "VALID",
        data.fotoSelfieUrl || data.selfieUrl || "-",
        data.qrCodeScanned || "-"
      ]);
      result = { success: true, message: "Absensi berhasil dicatat di Spreadsheet!" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetHeaders = {
    "USERS": ["ID User", "Username", "Password", "Nama Lengkap", "Role", "ID Guru", "Email", "Status"],
    "GURU": ["ID Guru", "NIP", "NIK", "Nama Guru", "Username", "Password", "Mapel Utama", "No HP", "Status", "Foto URL"],
    "KELAS": ["ID Kelas", "Nama Kelas", "Tingkat", "ID Wali Kelas", "Nama Wali Kelas", "Ruangan", "QR Code", "Status"],
    "MAPEL": ["ID Mapel", "Kode", "Nama Mapel", "Kelompok"],
    "JADWAL": ["ID Jadwal", "Hari", "Jam Ke", "Jam Mulai", "Jam Selesai", "ID Guru", "Nama Guru", "ID Mapel", "Nama Mapel", "ID Kelas", "Nama Kelas", "Mode"],
    "ABSENSI": ["ID Absensi", "Tanggal", "Jam Server", "ID Guru", "Nama Guru", "NIP", "ID Kelas", "Nama Kelas", "Mapel", "Jam Ke", "Jam Mulai", "Jam Selesai", "Status", "Waktu Scan", "Waktu Selesai", "Keterlambatan (Menit)", "Catatan / Materi", "Device", "Browser", "Latitude", "Longitude", "Jarak (m)", "Status Radius", "Foto Selfie URL", "QR Code"],
    "PENGATURAN": ["Kunci", "Nilai", "Keterangan"],
    "LOG": ["ID Log", "Timestamp", "Tipe", "Aktor", "Aksi", "Detail"]
  };

  for (var name in sheetHeaders) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    var headers = sheetHeaders[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#064E3B").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return { success: true, message: "Database dan semua Sheet berhasil disetup!" };
}
`;
}

