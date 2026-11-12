import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import {
  ConsentGuard,
  ProtectedRoute,
  RoleGuard,
} from './components/guards/RouteGuards'
import { AppShell } from './components/layout/AppShell'
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage'
import { AdminJuriPage } from './pages/admin/AdminJuriPage'
import { AdminParticipantDetailPage } from './pages/admin/AdminParticipantDetailPage'
import { AdminParticipantsPage } from './pages/admin/AdminParticipantsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage'
import { BenchmarksPage } from './pages/admin/BenchmarksPage'
import { JuriTeamDetailPage } from './pages/juri/JuriTeamDetailPage'
import { JuriTeamsPage } from './pages/juri/JuriTeamsPage'
import { ConsentPage } from './pages/auth/ConsentPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { LandingPage } from './pages/LandingPage'
import { ParticipantDashboardPage } from './pages/participant/ParticipantDashboardPage'
import { ProfilePage } from './pages/participant/ProfilePage'
import { EncryptionInspectorPage } from './pages/participant/EncryptionInspectorPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated routes */}
        <Route element={<ProtectedRoute />}>
          {/* Explicit Privacy Consent Gate (peserta only) */}
          <Route
            path="/consent"
            element={
              <RoleGuard allowedRoles={['peserta']}>
                <ConsentPage />
              </RoleGuard>
            }
          />

          {/* Participant routes (require peserta role + latest privacy consent) */}
          <Route element={<RoleGuard allowedRoles={['peserta']} />}>
            <Route element={<ConsentGuard />}>
              <Route path="/dashboard" element={<ParticipantDashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Documents, team and video now live on the dashboard itself.
                  The old routes stay as redirects so saved links keep working. */}
              <Route path="/documents" element={<Navigate to="/dashboard" replace />} />
              <Route path="/team" element={<Navigate to="/dashboard" replace />} />
              <Route path="/video" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Shared Encryption Inspector (all authenticated roles; peserta gated by ConsentGuard) */}
          <Route element={<RoleGuard allowedRoles={['peserta', 'juri', 'superadmin']} />}>
            <Route element={<ConsentGuard />}>
              <Route path="/encryption-inspector" element={<EncryptionInspectorPage />} />
            </Route>
          </Route>

          {/* Juri routes */}
          <Route element={<RoleGuard allowedRoles={['juri']} />}>
            <Route path="/juri/teams" element={<JuriTeamsPage />} />
            <Route path="/juri/teams/:teamId" element={<JuriTeamDetailPage />} />
          </Route>

          {/* Superadmin routes */}
          <Route element={<RoleGuard allowedRoles={['superadmin']} />}>
            <Route path="/admin/participants" element={<AdminParticipantsPage />} />
            <Route
              path="/admin/participants/:userId"
              element={<AdminParticipantDetailPage />}
            />
            <Route path="/admin/teams" element={<AdminTeamsPage />} />
            <Route path="/admin/juri" element={<AdminJuriPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/benchmarks" element={<BenchmarksPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
