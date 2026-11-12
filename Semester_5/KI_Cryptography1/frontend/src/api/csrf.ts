export const CSRF_COOKIE_NAME = 'csrf_access_token'
export const CSRF_HEADER_NAME = 'X-CSRF-TOKEN'

const MUTATING_METHODS: ReadonlySet<string> = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function requiresCsrfHeader(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase())
}

export function getCookie(name: string, cookieSource?: string): string | null {
  const rawCookieString =
    cookieSource ?? (typeof document !== 'undefined' ? document.cookie : undefined)

  if (!rawCookieString) {
    return null
  }

  const segments = rawCookieString.split(';')
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed) {
      continue
    }
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) {
      continue
    }
    const key = trimmed.slice(0, eqIndex).trim()
    if (key === name) {
      const value = trimmed.slice(eqIndex + 1)
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }

  return null
}

export function getCsrfToken(cookieSource?: string): string | null {
  return getCookie(CSRF_COOKIE_NAME, cookieSource)
}
