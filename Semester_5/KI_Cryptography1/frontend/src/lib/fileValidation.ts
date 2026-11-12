export const DOCUMENT_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const

export type AllowedDocumentMime = (typeof DOCUMENT_ALLOWED_MIMES)[number]

export type DetectedMagicMime = AllowedDocumentMime | 'video/mp4'

/**
 * Inspects leading magic bytes of a file/buffer to identify its true binary format:
 * - JPEG: FF D8 FF
 * - PNG:  89 50 4E 47 0D 0A 1A 0A
 * - PDF:  25 50 44 46 2D (%PDF-)
 * - MP4:  bytes 4..7 == 66 74 79 70 (ftyp)
 */
export function detectMagicMimeFromBytes(bytes: Uint8Array): DetectedMagicMime | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return 'application/pdf'
  }

  if (
    bytes.length >= 8 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return 'video/mp4'
  }

  return null
}

async function readLeadingBytes(blob: Blob, count = 16): Promise<Uint8Array> {
  const headerSlice = blob.slice(0, count)
  if (typeof headerSlice.arrayBuffer === 'function') {
    const buffer = await headerSlice.arrayBuffer()
    return new Uint8Array(buffer)
  }

  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result))
      } else {
        resolve(new Uint8Array())
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca header file'))
    reader.readAsArrayBuffer(headerSlice)
  })
}

export interface DocumentValidationResult {
  valid: boolean
  detectedMime: AllowedDocumentMime | null
  errorMessage: string | null
}

export interface VideoValidationResult {
  valid: boolean
  detectedMime: 'video/mp4' | null
  errorMessage: string | null
}

/** Proposal PDF ceiling from the API contract: 10 MB. */
export const PROPOSAL_MAX_BYTES = 10_485_760

/** Demo video MP4 ceiling from the API contract: 100 MB. */
export const VIDEO_MAX_BYTES = 104_857_600

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1_048_576) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1_048_576).toFixed(2)} MB`
}

/**
 * Client-side validation for the team proposal (`POST /api/teams/me/proposal`):
 * PDF only, non-empty, and at most `PROPOSAL_MAX_BYTES`. Unlike identity
 * documents, images are not accepted here.
 */
export async function validateProposalFile(
  file: File,
  maxBytes = PROPOSAL_MAX_BYTES,
): Promise<DocumentValidationResult> {
  if (file.size <= 0) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'File proposal tidak boleh kosong (0 byte).',
    }
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: `Ukuran proposal (${formatBytes(file.size)}) melebihi batas maksimal ${formatBytes(maxBytes)}.`,
    }
  }

  const declaredMime = file.type.trim().toLowerCase()
  if (
    declaredMime !== '' &&
    declaredMime !== 'application/octet-stream' &&
    declaredMime !== 'application/pdf'
  ) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'Proposal harus berupa file PDF.',
    }
  }

  const headerBytes = await readLeadingBytes(file, 16)
  if (detectMagicMimeFromBytes(headerBytes) !== 'application/pdf') {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'Signature biner (magic bytes) file bukan PDF yang sah.',
    }
  }

  return {
    valid: true,
    detectedMime: 'application/pdf',
    errorMessage: null,
  }
}

/**
 * Client-side validation for the team demo video (`POST /api/teams/me/video`):
 * MP4 only, non-empty, and at most `VIDEO_MAX_BYTES`. The size gate runs before
 * any byte is read so a 100 MB+ file is rejected without being buffered.
 */
export async function validateVideoFile(
  file: File,
  maxBytes = VIDEO_MAX_BYTES,
): Promise<VideoValidationResult> {
  if (file.size <= 0) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'File video tidak boleh kosong (0 byte).',
    }
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: `Ukuran video (${formatBytes(file.size)}) melebihi batas maksimal ${formatBytes(maxBytes)}.`,
    }
  }

  const declaredMime = file.type.trim().toLowerCase()
  if (
    declaredMime !== '' &&
    declaredMime !== 'application/octet-stream' &&
    declaredMime !== 'video/mp4'
  ) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'Video demo harus berupa file MP4.',
    }
  }

  const headerBytes = await readLeadingBytes(file, 16)
  if (detectMagicMimeFromBytes(headerBytes) !== 'video/mp4') {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'Signature biner (magic bytes) file bukan MP4 yang sah.',
    }
  }

  return {
    valid: true,
    detectedMime: 'video/mp4',
    errorMessage: null,
  }
}

/**
 * Performs client-side validation for participant identity documents (`ktp`, `ktm`, `twibbon`):
 * 1. Non-empty file & `size <= maxBytes` (default 5 MB = 5,242,880 B)
 * 2. Magic-byte signature must match JPEG, PNG, or PDF
 * 3. Browser-reported MIME type (if provided) must align with detected magic bytes
 */
export async function validateDocumentFile(
  file: File,
  maxBytes = 5_242_880,
): Promise<DocumentValidationResult> {
  if (file.size <= 0) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: 'File tidak boleh kosong (0 byte).',
    }
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: `Ukuran file (${formatBytes(file.size)}) melebihi batas maksimal ${formatBytes(maxBytes)}.`,
    }
  }

  const normalizedDeclaredMime =
    file.type === 'image/jpg' ? 'image/jpeg' : file.type.trim().toLowerCase()

  if (
    normalizedDeclaredMime !== '' &&
    normalizedDeclaredMime !== 'application/octet-stream' &&
    !(DOCUMENT_ALLOWED_MIMES as readonly string[]).includes(normalizedDeclaredMime)
  ) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage:
        'Format file tidak didukung. Hanya file JPG, PNG, atau PDF yang diizinkan.',
    }
  }

  const headerBytes = await readLeadingBytes(file, 16)
  const detected = detectMagicMimeFromBytes(headerBytes)

  if (
    !detected ||
    !(DOCUMENT_ALLOWED_MIMES as readonly string[]).includes(detected)
  ) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage:
        'Signature biner (magic bytes) file tidak sesuai format JPG, PNG, atau PDF.',
    }
  }

  const detectedDocMime = detected as AllowedDocumentMime

  if (
    normalizedDeclaredMime !== '' &&
    normalizedDeclaredMime !== 'application/octet-stream' &&
    normalizedDeclaredMime !== detectedDocMime
  ) {
    return {
      valid: false,
      detectedMime: null,
      errorMessage: `Tipe MIME file (${normalizedDeclaredMime}) tidak cocok dengan isi biner sebenarnya (${detectedDocMime}).`,
    }
  }

  return {
    valid: true,
    detectedMime: detectedDocMime,
    errorMessage: null,
  }
}
