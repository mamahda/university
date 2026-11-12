import { create } from 'zustand'
import type { ConsentInfo, Me, UserRole, VerificationStatus } from '../api/types'

export type { UserRole, VerificationStatus }

export function needsPrivacyConsent(user: Me | null): boolean {
  if (!user || user.role !== 'peserta') {
    return false
  }
  if (!user.consent) {
    return true
  }
  return user.consent.policy_version !== user.current_policy_version
}

export function getDefaultHomeRoute(user: Me): string {
  switch (user.role) {
    case 'peserta':
      return needsPrivacyConsent(user) ? '/consent' : '/dashboard'
    case 'juri':
      return '/juri/teams'
    case 'superadmin':
      return '/admin/participants'
  }
}

export function isRouteAllowedForRole(pathname: string, role: UserRole): boolean {
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/consent'
  ) {
    return false
  }
  if (pathname.startsWith('/admin')) {
    return role === 'superadmin'
  }
  if (pathname.startsWith('/juri')) {
    return role === 'juri'
  }
  if (pathname.startsWith('/encryption-inspector')) {
    return true
  }
  return role === 'peserta'
}

interface AuthUiState {
  sessionChecked: boolean
  isBootstrapping: boolean
  user: Me | null
  setSessionUser: (user: Me | null) => void
  setBootstrapping: (isBootstrapping: boolean) => void
  updateUserConsent: (consent: ConsentInfo) => void
  markConsentOutdated: (latestPolicyVersion?: string) => void
  markSessionChecked: () => void
  clearSession: () => void
}

export const useAuthStore = create<AuthUiState>((set) => ({
  sessionChecked: false,
  isBootstrapping: false,
  user: null,
  setSessionUser: (user) =>
    set({
      user,
      sessionChecked: true,
      isBootstrapping: false,
    }),
  setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
  updateUserConsent: (consent) =>
    set((state) => {
      if (!state.user) {
        return state
      }
      return {
        user: {
          ...state.user,
          consent,
          current_policy_version: consent.policy_version,
        },
      }
    }),
  markConsentOutdated: (latestPolicyVersion) =>
    set((state) => {
      if (!state.user || state.user.role !== 'peserta') {
        return state
      }
      return {
        user: {
          ...state.user,
          consent: null,
          current_policy_version: latestPolicyVersion ?? state.user.current_policy_version,
        },
      }
    }),
  markSessionChecked: () => set({ sessionChecked: true, isBootstrapping: false }),
  clearSession: () =>
    set({
      user: null,
      sessionChecked: true,
      isBootstrapping: false,
    }),
}))
