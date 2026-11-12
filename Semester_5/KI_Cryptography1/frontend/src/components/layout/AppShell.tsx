import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  FileCheck2,
  Gauge,
  Gavel,
  Home,
  LogOut,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import markUrl from '@/assets/brand/schematics-mark.svg'
import saturnusUrl from '@/assets/brand/saturnus.svg'
import { apiClient, type Me, type UserRole } from '@/api'
import {
  BORDER,
  FOCUS,
  NAV_BTN_FILLED,
  NAV_BTN_OUTLINE,
  SURFACE_CARD,
  SURFACE_PAGE,
} from '@/components/ui/tokens'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

interface NavItem {
  to: string
  label: string
  Icon: typeof Home
  /** `end` keeps a parent route from matching its own children. */
  end?: boolean
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  peserta: [
    { to: '/dashboard', label: 'Home', Icon: Home },
    { to: '/profile', label: 'Profil Saya', Icon: User },
    { to: '/encryption-inspector', label: 'Encryption Inspector', Icon: ShieldCheck },
  ],
  juri: [
    { to: '/juri/teams', label: 'Home', Icon: Home, end: true },
    { to: '/encryption-inspector', label: 'Encryption Inspector', Icon: ShieldCheck },
  ],
  superadmin: [
    { to: '/admin/participants', label: 'Verifikasi Peserta', Icon: FileCheck2, end: true },
    { to: '/admin/teams', label: 'Daftar Tim', Icon: Users },
    { to: '/admin/juri', label: 'Akun Juri', Icon: Gavel },
    { to: '/admin/settings', label: 'Pengaturan', Icon: SlidersHorizontal },
    { to: '/admin/audit-logs', label: 'Audit Log', Icon: ScrollText },
    { to: '/admin/benchmarks', label: 'Benchmarks', Icon: Gauge },
    { to: '/encryption-inspector', label: 'Encryption Inspector', Icon: ShieldCheck },
  ],
}

/** The bar's height: a compact 64px, with a 1px rule under it. */
const NAV_HEIGHT = 64

/**
 * The bar shows only while the page sits at its very top and slides away on
 * the first pixel of scroll, so the page keeps its full height while you read.
 */
function useNavAutoHide(): boolean {
  const [hidden, setHidden] = useState(() => window.scrollY > 0)

  useEffect(() => {
    function onScroll() {
      setHidden(window.scrollY > 0)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return hidden
}

/** Two letters from the display name, or from the email when there is no name. */
function initialsOf(fullName: string | null, email: string): string {
  const source = fullName?.trim() || email
  const parts = source.split(/[\s.@_-]+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part[0] ?? '')
  return (letters.join('') || source[0] || '?').toUpperCase()
}

function SideNavLink({ item }: { item: NavItem }) {
  const { to, label, Icon, end } = item

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition ${FOCUS} ${
          isActive ? 'bg-white/10 text-white' : 'text-ink-2 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

/** The account card on the left: who is signed in, and where they can go. */
function Sidebar({ user, items }: { user: Me; items: NavItem[] }) {
  return (
    <aside className="lg:sticky lg:top-6 lg:w-[17rem] lg:shrink-0">
      <div className="rounded-2xl border border-edge bg-panel p-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <p className="truncate text-center font-display text-lg font-semibold text-ink">
          {user.full_name ?? user.email}
        </p>
        <p className="mt-0.5 text-center text-xs text-ink-3">{ROLE_LABELS[user.role]}</p>

        <div
          aria-hidden="true"
          className="mx-auto mt-5 flex aspect-square w-24 items-center justify-center rounded-full bg-sky font-display text-3xl font-bold text-night lg:w-28"
        >
          {initialsOf(user.full_name, user.email)}
        </div>

        <nav aria-label="Navigasi utama" className="mt-6 flex flex-col gap-1">
          {items.map((item) => (
            <SideNavLink key={item.to} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

const ROLE_LABELS: Record<UserRole, string> = {
  peserta: 'Peserta',
  juri: 'Juri',
  superadmin: 'Superadmin',
}

/** The portal's bar, fixed to the top, with the space it takes reserved below it. */
function TopBar() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const navHidden = useNavAutoHide()

  const logoutMutation = useMutation({
    mutationFn: apiClient.auth.logout,
    onSettled: () => {
      useAuthStore.getState().clearSession()
      queryClient.clear()
      void navigate('/login', { replace: true })
    },
  })

  return (
    <>
    {/* One compact bar: the product's mark and name on the left, the account
        on the right, both on the same edges as the sidebar and the cards. */}
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-edge bg-ground transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        navHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-[90px]">
        <NavLink to="/" className={`${FOCUS} flex items-center gap-2.5 rounded-lg`}>
          <img src={markUrl} alt="" className="h-8 w-auto" />
          <span className="font-display text-lg font-semibold text-white">
            Schematics NIC 2026
          </span>
        </NavLink>

        <div className="flex items-center gap-3">
          <div className="hidden text-sm text-white/70 sm:block" data-testid="session-badge">
            {user ? `${user.email} (${user.role})` : 'Guest'}
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className={NAV_BTN_OUTLINE}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </button>
          ) : (
            <nav aria-label="Navigasi tamu" className="flex items-center gap-3">
              <NavLink to="/register" className={NAV_BTN_FILLED}>
                Register
              </NavLink>
              <NavLink to="/login" className={NAV_BTN_OUTLINE}>
                Login
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </header>
    {/* The bar is fixed, so the page keeps its own space for it. */}
    <div aria-hidden="true" style={{ height: NAV_HEIGHT }} />
    </>
  )
}

/**
 * The signed-in screens' ground stays flat; Saturnus in the top corner is its
 * one piece of decoration.
 */
function DashboardBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <img
        src={saturnusUrl}
        alt=""
        className="absolute top-24 right-0 hidden w-48 max-w-none sm:block xl:w-60"
      />
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const notices = useUiStore((state) => state.notices)

  // The auth screens carry their own lockup, so they get no bar at all; the
  // landing page keeps the bar but runs edge to edge under it.
  const isAuthRoute =
    location.pathname === '/login' || location.pathname === '/register'
  const isFullBleedCanvasRoute = isAuthRoute || location.pathname === '/'
  // Every signed-in screen sets its navy cards on the brand's ground, beside
  // the account card on the left.
  const isSheetRoute = !isFullBleedCanvasRoute

  return (
    <div
      className={`relative min-h-screen ${SURFACE_PAGE} text-ink`}
    >
      {isSheetRoute ? <DashboardBackdrop /> : null}
      {isAuthRoute ? null : <TopBar />}

      {notices.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 pt-4" role="status">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`mb-2 rounded-2xl border ${BORDER} ${SURFACE_CARD} px-4 py-2.5 text-sm text-ink-2`}
            >
              {notice.message}
            </div>
          ))}
        </div>
      ) : null}

      {isSheetRoute ? (
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:px-[90px]">
          {user ? <Sidebar user={user} items={NAV_BY_ROLE[user.role]} /> : null}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="w-full">
          <Outlet />
        </main>
      )}
    </div>
  )
}
