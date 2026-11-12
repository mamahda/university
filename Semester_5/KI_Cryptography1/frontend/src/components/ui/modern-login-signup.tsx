import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { apiClient, isApiClientError } from '@/api'
import lockupUrl from '@/assets/brand/schematics-lockup.svg'
import { SpaceScene } from '@/components/ui/SpaceScene'
import { cn } from '@/lib/utils'
import { resolvePostAuthNavigation } from '@/pages/auth/authNavigation'
import { useAuthStore } from '@/stores/authStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 10

/** The portal's field: a hairline dark rule on white, 6px corners. */
const FIELD_INPUT =
  'w-full rounded-md border-[0.8px] border-[#000219] bg-transparent px-3 py-2.5 text-sm text-[#000219] placeholder:text-[#6b7280] focus:border-[#0b6f93] focus:outline-2 focus:outline-offset-1 focus:outline-[#0b6f93]'

/** The brand's one filled control: flat sky, black label, full width. */
const SUBMIT =
  'mt-1 w-full cursor-pointer rounded-[10px] bg-sky px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#8ee0fb] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f93]'

/** Sky reads at 1.8:1 on white, so the inline link takes its darker step. */
const SWITCH_LINK =
  'cursor-pointer font-semibold text-[#0b6f93] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6f93]'

export interface ModernLoginSignupProps {
  initialMode?: 'login' | 'register'
  syncWithRouter?: boolean
  className?: string
}

interface AuthFieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export default function ModernLoginSignup({
  initialMode = 'login',
  syncWithRouter = false,
  className,
}: ModernLoginSignupProps) {
  const [localIsLogin, setLocalIsLogin] = useState(initialMode === 'login')
  const isLogin = syncWithRouter ? initialMode === 'login' : localIsLogin

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  const sessionChecked = useAuthStore((state) => state.sessionChecked)
  const user = useAuthStore((state) => state.user)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: apiClient.auth.login,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.user)
      const destination = resolvePostAuthNavigation(response.user, location.state)
      useAuthStore.getState().setSessionUser(response.user)
      void navigate(destination.to, { replace: true, state: destination.state })
    },
    onError: (err) => {
      if (isApiClientError(err)) {
        if (err.isValidationError()) {
          setFieldErrors({
            email: err.fieldErrors.email,
            password: err.fieldErrors.password,
          })
          setFormError(err.message)
          return
        }
        if (err.code === 'rate_limited') {
          setFormError(
            err.message || 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat.',
          )
          return
        }
        setFormError(err.message || 'Email atau password salah.')
        return
      }
      setFormError('Terjadi kesalahan tak terduga saat mencoba masuk.')
    },
  })

  const registerMutation = useMutation({
    mutationFn: apiClient.auth.register,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.user)
      const destination = resolvePostAuthNavigation(response.user, location.state)
      useAuthStore.getState().setSessionUser(response.user)
      void navigate(destination.to, { replace: true, state: destination.state })
    },
    onError: (err) => {
      if (isApiClientError(err)) {
        if (err.code === 'email_taken') {
          setFieldErrors({
            email: err.message || 'Email sudah terdaftar.',
          })
          setFormError(err.message || 'Email sudah digunakan oleh akun lain.')
          return
        }
        if (err.isValidationError()) {
          setFieldErrors({
            email: err.fieldErrors.email,
            password: err.fieldErrors.password,
          })
          setFormError(err.message)
          return
        }
        setFormError(err.message || 'Pendaftaran gagal diproses.')
        return
      }
      setFormError('Terjadi kesalahan tak terduga saat mendaftarkan akun.')
    },
  })

  const isPending = loginMutation.isPending || registerMutation.isPending

  if (sessionChecked && user && !isPending) {
    const destination = resolvePostAuthNavigation(user, location.state)
    return <Navigate to={destination.to} replace state={destination.state} />
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()
    const nextErrors: AuthFieldErrors = {}

    if (!trimmedEmail) {
      nextErrors.email = 'Email wajib diisi.'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Format email tidak valid.'
    }

    if (!password) {
      nextErrors.password = 'Password wajib diisi.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    loginMutation.mutate({
      email: trimmedEmail,
      password,
    })
  }

  function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()
    const nextErrors: AuthFieldErrors = {}

    if (!trimmedEmail) {
      nextErrors.email = 'Email wajib diisi.'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Format email tidak valid.'
    }

    if (!password) {
      nextErrors.password = 'Password wajib diisi.'
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Konfirmasi password wajib diisi.'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Konfirmasi password tidak cocok.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    registerMutation.mutate({
      email: trimmedEmail,
      password,
    })
  }

  function switchMode(targetLogin: boolean) {
    setFieldErrors({})
    setFormError(null)
    if (syncWithRouter) {
      void navigate(targetLogin ? '/login' : '/register', { state: location.state })
    } else {
      setLocalIsLogin(targetLogin)
    }
  }


  // Wording as the Schematics 2026 Figma sets it (nodes 342:716, 342:2808).
  const title = isLogin ? 'LOGIN' : 'REGISTRASI'
  const subtitle = isLogin
    ? 'Silahkan Masuk dengan Akun Anda'
    : 'Khusus mahasiswa peserta hackathon Schematics NIC'

  return (
    <div
      className={cn(
        'relative min-h-screen w-full overflow-hidden bg-ground',
        className,
      )}
    >
      <SpaceScene className="pointer-events-none absolute inset-0 h-full w-full" />
      {/* A scrim so the form keeps its contrast over the scene on small screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-ground/75 lg:bg-transparent"
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
        {/* The scene carries the left half at desktop width. */}
        <div aria-hidden="true" className="hidden lg:block" />

        <div className="w-full max-w-[440px] justify-self-center lg:justify-self-end">
          <h1 className="font-display text-[3rem] leading-[4rem] font-semibold text-white">
            {title}
          </h1>
          <p className="text-base text-white">{subtitle}</p>

          <section className="mt-4 rounded-xl bg-white p-6">
            {formError && (
              <div
                role="alert"
                data-testid={isLogin ? 'login-error-alert' : 'register-error-alert'}
                className="mb-4 flex items-start gap-2 rounded-lg border border-[#b42318]/30 bg-[#fef3f2] px-3 py-2.5 text-sm text-[#912018]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLoginSubmit} noValidate className="flex flex-col gap-4">
                <Field
                  id="login-email"
                  label="Email"
                  hint="Format email example@gmail.com"
                  error={fieldErrors.email}
                >
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.email)}
                    placeholder="Masukkan Alamat Email"
                    className={FIELD_INPUT}
                  />
                </Field>

                <Field id="login-password" label="Password" error={fieldErrors.password}>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.password)}
                      placeholder="Masukkan Password"
                      className={`${FIELD_INPUT} pr-10`}
                    />
                    <PasswordToggle shown={showPassword} onToggle={setShowPassword} />
                  </div>
                </Field>

                <button type="submit" disabled={loginMutation.isPending} className={SUBMIT}>
                  {loginMutation.isPending ? 'Memproses login...' : 'Masuk'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} noValidate className="flex flex-col gap-4">
                <Field
                  id="register-email"
                  label="Email Mahasiswa"
                  hint="Format email example@gmail.com"
                  error={fieldErrors.email}
                >
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.email)}
                    placeholder="Masukkan Alamat Email"
                    className={FIELD_INPUT}
                  />
                </Field>

                <Field
                  id="register-password"
                  label="Password (minimal 10 karakter)"
                  error={fieldErrors.password}
                >
                  <div className="relative">
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.password)}
                      placeholder="Masukkan Password"
                      className={`${FIELD_INPUT} pr-10`}
                    />
                    <PasswordToggle shown={showPassword} onToggle={setShowPassword} />
                  </div>
                </Field>

                <Field
                  id="register-confirm-password"
                  label="Konfirmasi Password"
                  error={fieldErrors.confirmPassword}
                >
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    placeholder="Ulangi Password Anda"
                    className={FIELD_INPUT}
                  />
                </Field>

                <button type="submit" disabled={registerMutation.isPending} className={SUBMIT}>
                  {registerMutation.isPending ? 'Mendaftarkan akun...' : 'Daftar & Masuk'}
                </button>
              </form>
            )}

            <p className="mt-4 text-center text-sm text-[#4b5563]">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              {syncWithRouter ? (
                <Link
                  to={isLogin ? '/register' : '/login'}
                  state={isLogin ? location.state : undefined}
                  className={SWITCH_LINK}
                >
                  {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
                </Link>
              ) : (
                <button type="button" onClick={() => switchMode(!isLogin)} className={SWITCH_LINK}>
                  {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
                </button>
              )}
            </p>
          </section>
        </div>
      </div>

      <img
        src={lockupUrl}
        alt="Schematics 2026"
        className="relative mx-auto mb-6 h-12 w-auto lg:absolute lg:right-10 lg:bottom-9 lg:mx-0 lg:mb-0 lg:h-16"
      />
    </div>
  )
}

/** Card-on-white field: a bold label with the portal's required marker. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      {/* The asterisk sits beside the label, not inside it, so the label's
          text stays exactly the field name; `aria-required` carries the rule. */}
      <div className="mb-1.5 flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-semibold text-[#000219]">
          {label}
        </label>
        <span aria-hidden="true" className="text-[#b42318]">
          *
        </span>
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[#b42318]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[#4b5563]">{hint}</p>
      ) : null}
    </div>
  )
}

function PasswordToggle({
  shown,
  onToggle,
}: {
  shown: boolean
  onToggle: (next: (prev: boolean) => boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle((prev) => !prev)}
      aria-label={shown ? 'Sembunyikan password' : 'Tampilkan password'}
      className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-[#4b5563] hover:text-[#000219]"
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}
