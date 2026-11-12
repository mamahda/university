import type { Me } from '../../api/types'
import type { RouteNavigationState } from '../../components/guards/RouteGuards'
import {
  getDefaultHomeRoute,
  isRouteAllowedForRole,
  needsPrivacyConsent,
} from '../../stores/authStore'

export function sanitizeReturnPath(rawFrom: unknown): string | null {
  if (typeof rawFrom !== 'string') {
    return null
  }
  if (!rawFrom.startsWith('/') || rawFrom.startsWith('//')) {
    return null
  }
  return rawFrom
}

export function resolvePostAuthNavigation(
  user: Me,
  locationState: unknown,
): { to: string; state?: RouteNavigationState } {
  const rawFrom =
    typeof locationState === 'object' && locationState !== null && 'from' in locationState
      ? (locationState as RouteNavigationState).from
      : undefined

  const cleanFrom = sanitizeReturnPath(rawFrom)
  const fromPathname = cleanFrom ? (cleanFrom.split('?')[0] ?? '') : ''
  const validRoleTarget =
    cleanFrom && isRouteAllowedForRole(fromPathname, user.role) ? cleanFrom : null

  if (needsPrivacyConsent(user)) {
    return {
      to: '/consent',
      state: { from: validRoleTarget ?? '/dashboard' },
    }
  }

  return {
    to: validRoleTarget ?? getDefaultHomeRoute(user),
  }
}
