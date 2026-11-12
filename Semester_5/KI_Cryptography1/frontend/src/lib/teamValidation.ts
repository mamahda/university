export const INVITE_CODE_REGEX = /^[A-Za-z0-9]{8}$/

export function normalizeTeamName(raw: string): string {
  return raw.trim()
}

export function validateTeamName(raw: string): string | null {
  const normalized = normalizeTeamName(raw)
  if (normalized.length < 1 || normalized.length > 50) {
    return 'Nama tim wajib diisi (1–50 karakter).'
  }
  return null
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase()
}

export function validateInviteCode(raw: string): string | null {
  const normalized = normalizeInviteCode(raw)
  if (!INVITE_CODE_REGEX.test(normalized)) {
    return 'Kode undangan tim harus terdiri dari 8 karakter huruf atau angka.'
  }
  return null
}

/**
 * `https://github.com/<owner>/<repo>` exactly, per the contract for
 * `PUT /api/teams/me/repo`. A trailing slash or `.git` suffix is tolerated and
 * stripped by `normalizeRepoUrl`; a deeper path is not a repository root.
 */
export const GITHUB_REPO_URL_REGEX =
  /^https:\/\/github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9._-]+$/

export function normalizeRepoUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '')
}

export function validateRepoUrl(raw: string): string | null {
  const normalized = normalizeRepoUrl(raw)
  if (normalized.length === 0) {
    return 'URL repositori GitHub wajib diisi.'
  }
  if (!GITHUB_REPO_URL_REGEX.test(normalized)) {
    return 'URL harus berformat https://github.com/<pemilik>/<repo>.'
  }
  return null
}
