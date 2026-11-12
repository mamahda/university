import type { ParticipantProfile, UpdateProfileRequest } from '@/api'

export type ProfileFieldName = keyof UpdateProfileRequest

export type ProfileFieldErrors = Partial<Record<ProfileFieldName, string>>

const NIM_REGEX = /^[A-Za-z0-9]{5,20}$/
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/
const PHONE_REGEX = /^(?:08\d{8,13}|\+62\d{8,13})$/

export const REVERIFY_SENSITIVE_FIELDS = [
  'full_name',
  'nim',
  'institution',
] as const

export type ReverifySensitiveField = (typeof REVERIFY_SENSITIVE_FIELDS)[number]

export const PROFILE_FIELD_LABELS: Record<ProfileFieldName, string> = {
  full_name: 'Nama Lengkap',
  nim: 'NIM / NRP',
  study_program: 'Program Studi',
  institution: 'Institusi / Perguruan Tinggi',
  birth_date: 'Tanggal Lahir',
  domicile: 'Domisili (Kota / Kabupaten)',
  phone: 'Nomor HP (WhatsApp)',
}

export function getLocalTodayIso(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseValidCalendarDate(
  isoDate: string,
): { year: number; month: number; day: number } | null {
  const match = ISO_DATE_REGEX.exec(isoDate)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

export function computeAgeFromBirthDate(
  birthDateIso: string,
  referenceDate: Date = new Date(),
): number | null {
  const parsed = parseValidCalendarDate(birthDateIso)
  if (!parsed) {
    return null
  }

  const refYear = referenceDate.getFullYear()
  const refMonth = referenceDate.getMonth() + 1
  const refDay = referenceDate.getDate()

  let age = refYear - parsed.year
  if (
    refMonth < parsed.month ||
    (refMonth === parsed.month && refDay < parsed.day)
  ) {
    age -= 1
  }

  return age >= 0 ? age : null
}

export function normalizeProfileInput(raw: UpdateProfileRequest): UpdateProfileRequest {
  return {
    full_name: raw.full_name.trim(),
    nim: raw.nim.trim(),
    study_program: raw.study_program.trim(),
    institution: raw.institution.trim(),
    birth_date: raw.birth_date.trim(),
    domicile: raw.domicile.trim(),
    phone: raw.phone.trim(),
  }
}

/**
 * Validates all 7 participant profile fields against Dokumentasi API rules:
 * - full_name: 1–100 chars
 * - nim: alphanumeric only, 5–20 chars
 * - study_program: 2–100 chars
 * - institution: 2–100 chars
 * - birth_date: valid YYYY-MM-DD calendar date, not in the future
 * - domicile: 2–60 chars
 * - phone: starts with 08 or +62, 10–15 digits total
 */
export function validateProfileForm(
  rawValues: UpdateProfileRequest,
  now: Date = new Date(),
): ProfileFieldErrors {
  const values = normalizeProfileInput(rawValues)
  const errors: ProfileFieldErrors = {}

  if (values.full_name.length < 1 || values.full_name.length > 100) {
    errors.full_name = 'Nama lengkap wajib diisi (1–100 karakter).'
  }

  if (!NIM_REGEX.test(values.nim)) {
    errors.nim = 'NIM hanya boleh berisi huruf dan angka (5–20 karakter).'
  }

  if (values.study_program.length < 2 || values.study_program.length > 100) {
    errors.study_program = 'Program studi harus terdiri dari 2–100 karakter.'
  }

  if (values.institution.length < 2 || values.institution.length > 100) {
    errors.institution = 'Nama institusi harus terdiri dari 2–100 karakter.'
  }

  const parsedBirthDate = parseValidCalendarDate(values.birth_date)
  if (!parsedBirthDate) {
    errors.birth_date = 'Masukkan tanggal lahir yang valid (format YYYY-MM-DD).'
  } else {
    const todayIso = getLocalTodayIso(now)
    if (values.birth_date > todayIso) {
      errors.birth_date = 'Tanggal lahir tidak boleh berada di masa depan.'
    }
  }

  if (values.domicile.length < 2 || values.domicile.length > 60) {
    errors.domicile = 'Domisili (kota/kabupaten) harus terdiri dari 2–60 karakter.'
  }

  if (!PHONE_REGEX.test(values.phone)) {
    errors.phone = 'Nomor HP harus diawali 08 atau +62 dengan total 10–15 digit angka.'
  }

  return errors
}

/**
 * Returns which identity fields (`full_name`, `nim`, `institution`) changed relative
 * to an already-verified profile, triggering the re-verification confirmation prompt.
 */
export function getChangedReverifyFields(
  savedProfile: Pick<ParticipantProfile, 'full_name' | 'nim' | 'institution'> | null | undefined,
  nextValues: UpdateProfileRequest,
): ReverifySensitiveField[] {
  if (!savedProfile) {
    return []
  }

  const normalized = normalizeProfileInput(nextValues)
  return REVERIFY_SENSITIVE_FIELDS.filter((field) => {
    const previous = (savedProfile[field] ?? '').trim()
    return previous !== normalized[field]
  })
}
