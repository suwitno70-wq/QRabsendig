import QRCode from 'qrcode';

export interface ClassQRPayload {
  type: 'MADRASAH_CLASS_QR';
  kelasId: string;
  namaKelas: string;
  qrCode: string;
  createdAt: string;
  salt?: string;
}

/**
 * Generate standard QR Code as base64 Data URL
 */
export async function generateQRDataUrl(text: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: options?.width || 360,
      color: {
        dark: options?.color?.dark || '#064e3b', // Kemenag deep forest emerald
        light: options?.color?.light || '#ffffff',
      },
      ...options,
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

/**
 * Encodes class data into standard QR payload string
 */
export function encodeClassQRPayload(kelasId: string, namaKelas: string, qrCode: string): string {
  // Format readable by both JSON and quick string checks
  const payload: ClassQRPayload = {
    type: 'MADRASAH_CLASS_QR',
    kelasId,
    namaKelas,
    qrCode,
    createdAt: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

/**
 * Decodes scanned text into Class ID and code
 */
export function decodeClassQR(scannedText: string): { kelasId?: string; qrCode: string; raw: string } {
  const trimmed = scannedText.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && parsed.qrCode) {
      return {
        kelasId: parsed.kelasId,
        qrCode: parsed.qrCode,
        raw: trimmed,
      };
    }
  } catch {
    // If not JSON, handle direct ID or code format like "QR-KELAS-6A-WM928" or "KELAS-6A"
  }
  return {
    qrCode: trimmed,
    raw: trimmed,
  };
}
