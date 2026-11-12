export const env = {
  /**
   * API base URL prefix. Defaults to "" so requests use same-origin `/api/*`
   * through Vite's proxy in development, preserving HttpOnly JWT + CSRF cookies.
   */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  /**
   * Opt-in Mock Service Worker flag for standalone frontend dev & testing.
   */
  enableMsw: import.meta.env.VITE_ENABLE_MSW === 'true',
} as const

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${env.apiBaseUrl}${normalizedPath}`
}
