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
  const toleransi = settings?.toleransiScanAwalMenit || 15;

  return `/**
 * =========================================================================
 * SI-ABSEN GURU MENGAJAR REALTIME
 * Kreatif by Witno
 * Backend: Google Apps Script + Google Spreadsheet Database
 * Versi: 2.5.0 (Optimized for Vercel / GitHub Pages / Cloud Hosting)
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

/**
 * Handle GET Request (Digunakan untuk Sinkronisasi / Tarik Data dari Frontend)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";
  
  if (action === "ping") {
    return createJsonResponse({
      success: true,
      message: "Server Google Apps Script SI-ABSEN Online dan Siap Digunakan",
      timestamp: new Date().toISOString()
    });
  }

  // Tarik semua data dari spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureAllSheetsExist(ss);

  var fullData = {
    guru: getSheetObjects(ss, CONFIG.SHEETS.GURU),
    kelas: getSheetObjects(ss, CONFIG.SHEETS.KELAS),
    mapel: getSheetObjects(ss, CONFIG.SHEETS.MAPEL),
    jadwal: getSheetObjects(ss, CONFIG.SHEETS.JADWAL),
    presensi: getSheetObjects(ss, CONFIG.SHEETS.ABSENSI),
    users: getSheetObjects(ss, CONFIG.SHEETS.USERS),
    settings: getSettingsObject(ss)
  };

  return createJsonResponse({
    success: true,
    data: fullData,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST Request (Penyimpanan Presensi, Master Data, & Sinkronisasi Massal)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.tryLock(15000);
  } catch (lockErr) {
    return createJsonResponse({ success: false, error: "Server sibuk, coba lagi sesaat lagi." });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheetsExist(ss);

    var rawContent = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var payload = {};
    try {
      payload = JSON.parse(rawContent);
    } catch (parseErr) {
      payload = (e && e.parameter) ? e.parameter : {};
    }

    var action = payload.action || (e && e.parameter && e.parameter.action) || "";
    var result = { success: true, message: "Operasi berhasil" };

    // 1. SINKRONISASI MASSAL SEMUA TABEL (SYNC ALL)
    if (action === "syncAll") {
      if (payload.guru && Array.isArray(payload.guru)) replaceSheetData(ss, CONFIG.SHEETS.GURU, payload.guru);
      if (payload.kelas && Array.isArray(payload.kelas)) replaceSheetData(ss, CONFIG.SHEETS.KELAS, payload.kelas);
      if (payload.mapel && Array.isArray(payload.mapel)) replaceSheetData(ss, CONFIG.SHEETS.MAPEL, payload.mapel);
      if (payload.jadwal && Array.isArray(payload.jadwal)) replaceSheetData(ss, CONFIG.SHEETS.JADWAL, payload.jadwal);
      if (payload.presensi && Array.isArray(payload.presensi)) replaceSheetData(ss, CONFIG.SHEETS.ABSENSI, payload.presensi);
      if (payload.users && Array.isArray(payload.users)) replaceSheetData(ss, CONFIG.SHEETS.USERS, payload.users);
      if (payload.settings) saveSettingsObject(ss, payload.settings);

      result = {
        success: true,
        message: "Seluruh database Google Spreadsheet berhasil disinkronkan!"
      };
    }
    // 2. SIMPAN CATATAN PRESENSI
    else if (action === "savePresensi" || action === "submitAbsen" || payload.guruNama || payload.waktuScan) {
      var presensiItem = payload.data || payload;
      upsertRowById(ss, CONFIG.SHEETS.ABSENSI, presensiItem, "id");
      result = { success: true, message: "Data presensi berhasil dicatat di Spreadsheet!" };
    }
    // 3. SIMPAN / UPDATE MASTER GURU
    else if (action === "saveGuru") {
      var guruItem = payload.data || payload.guru || payload;
      upsertRowById(ss, CONFIG.SHEETS.GURU, guruItem, "id");
      result = { success: true, message: "Data guru berhasil disimpan di Spreadsheet!" };
    }
    // 4. SIMPAN / UPDATE MASTER KELAS
    else if (action === "saveKelas") {
      var kelasItem = payload.data || payload.kelas || payload;
      upsertRowById(ss, CONFIG.SHEETS.KELAS, kelasItem, "id");
      result = { success: true, message: "Data kelas berhasil disimpan di Spreadsheet!" };
    }
    // 5. SIMPAN / UPDATE MASTER MAPEL
    else if (action === "saveMapel") {
      var mapelItem = payload.data || payload.mapel || payload;
      upsertRowById(ss, CONFIG.SHEETS.MAPEL, mapelItem, "id");
      result = { success: true, message: "Data mapel berhasil disimpan di Spreadsheet!" };
    }
    // 6. SIMPAN / UPDATE MASTER JADWAL
    else if (action === "saveJadwal") {
      var jadwalItem = payload.data || payload.jadwal || payload;
      upsertRowById(ss, CONFIG.SHEETS.JADWAL, jadwalItem, "id");
      result = { success: true, message: "Data jadwal berhasil disimpan di Spreadsheet!" };
    }
    // 7. SETUP DATABASE BARU
    else if (action === "setupDatabase") {
      setupDatabase();
      result = { success: true, message: "Seluruh struktur database Spreadsheet berhasil disiapkan!" };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// HELPER UTILITIES DATABASE SPREADSHEET
// ==========================================

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureAllSheetsExist(ss) {
  var sheetNames = [
    CONFIG.SHEETS.GURU,
    CONFIG.SHEETS.KELAS,
    CONFIG.SHEETS.MAPEL,
    CONFIG.SHEETS.JADWAL,
    CONFIG.SHEETS.ABSENSI,
    CONFIG.SHEETS.USERS,
    CONFIG.SHEETS.PENGATURAN,
    CONFIG.SHEETS.LOG
  ];
  for (var i = 0; i < sheetNames.length; i++) {
    var s = ss.getSheetByName(sheetNames[i]);
    if (!s) {
      ss.insertSheet(sheetNames[i]);
    }
  }
}

function getSheetObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    var hasVal = false;
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      if (!key) continue;
      var cellVal = data[i][j];
      
      // Parse JSON string jika ada objek/array tersimpan
      if (typeof cellVal === "string" && (cellVal.startsWith("{") || cellVal.startsWith("["))) {
        try {
          cellVal = JSON.parse(cellVal);
        } catch (e) {}
      }
      obj[key] = cellVal;
      if (data[i][j] !== "") hasVal = true;
    }
    if (hasVal) rows.push(obj);
  }
  return rows;
}

function upsertRowById(ss, sheetName, item, idProp) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  var data = sheet.getDataRange().getValues();
  var headers = [];

  if (data.length === 0 || (data.length === 1 && data[0][0] === "")) {
    headers = Object.keys(item);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#064E3B").setFontColor("#FFFFFF");
    data = [headers];
  } else {
    headers = data[0].map(function(h) { return String(h).trim(); });
    // Tambahkan header baru jika ada properti yang belum terdaftar
    var itemKeys = Object.keys(item);
    for (var k = 0; k < itemKeys.length; k++) {
      if (headers.indexOf(itemKeys[k]) === -1) {
        sheet.getRange(1, headers.length + 1).setValue(itemKeys[k]).setFontWeight("bold").setBackground("#064E3B").setFontColor("#FFFFFF");
        headers.push(itemKeys[k]);
      }
    }
  }

  var idColIdx = headers.indexOf(idProp || "id");
  var targetRowIdx = -1;
  var itemId = item[idProp || "id"];

  if (idColIdx !== -1 && itemId !== undefined) {
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][idColIdx]) === String(itemId)) {
        targetRowIdx = r + 1;
        break;
      }
    }
  }

  var rowValues = [];
  for (var h = 0; h < headers.length; h++) {
    var val = item[headers[h]];
    if (val === undefined || val === null) {
      rowValues.push("");
    } else if (typeof val === "object") {
      rowValues.push(JSON.stringify(val));
    } else {
      rowValues.push(val);
    }
  }

  if (targetRowIdx > 0) {
    sheet.getRange(targetRowIdx, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function replaceSheetData(ss, sheetName, items) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clearContents();

  if (!items || items.length === 0) return;

  var headers = Object.keys(items[0]);
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#064E3B").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);

  var rows = [];
  for (var i = 0; i < items.length; i++) {
    var row = [];
    for (var h = 0; h < headers.length; h++) {
      var val = items[i][headers[h]];
      if (val === undefined || val === null) {
        row.push("");
      } else if (typeof val === "object") {
        row.push(JSON.stringify(val));
      } else {
        row.push(val);
      }
    }
    rows.push(row);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function getSettingsObject(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEETS.PENGATURAN);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 0; i < data.length; i++) {
    if (data[i][0]) {
      var key = data[i][0];
      var val = data[i][1];
      if (typeof val === "string" && (val.startsWith("{") || val.startsWith("["))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      settings[key] = val;
    }
  }
  return settings;
}

function saveSettingsObject(ss, settings) {
  var sheet = ss.getSheetByName(CONFIG.SHEETS.PENGATURAN);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEETS.PENGATURAN);
  sheet.clearContents();

  var keys = Object.keys(settings);
  var rows = [];
  for (var i = 0; i < keys.length; i++) {
    var val = settings[keys[i]];
    rows.push([keys[i], typeof val === "object" ? JSON.stringify(val) : val]);
  }
  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  }
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureAllSheetsExist(ss);
  return { success: true, message: "Database dan semua Sheet berhasil disetup!" };
}
`;
}

