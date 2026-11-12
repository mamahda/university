import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { validateProfileForm } from '@/lib/profileValidation'
import {
  seedMockActiveSession,
  setMockRegistrationDeadline,
} from '@/mocks/handlers'
import { AppRoutes } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { renderWithProviders } from '@/test/test-utils'

describe('validateProfileForm (7 field rules)', () => {
  const validBase = {
    full_name: 'Budi Santoso',
    nim: '5025231001',
    study_program: 'Teknik Informatika',
    institution: 'Institut Teknologi Sepuluh Nopember',
    birth_date: '2005-03-14',
    domicile: 'Surabaya',
    phone: '081234567890',
  }
  const fixedNow = new Date('2026-10-27T12:00:00+07:00')

  it('accepts valid 08 and +62 phone numbers and alphanumeric NIM', () => {
    expect(validateProfileForm(validBase, fixedNow)).toEqual({})
    expect(
      validateProfileForm(
        {
          ...validBase,
          nim: 'IT2024ABC99',
          phone: '+6281234567890',
        },
        fixedNow,
      ),
    ).toEqual({})
  })

  it('enforces all 7 field constraints (lengths, alphanumeric NIM, valid past date, phone prefix & digit count)', () => {
    const invalid = validateProfileForm(
      {
        full_name: '   ',
        nim: '12-34!',
        study_program: 'A',
        institution: 'X',
        birth_date: '2025-02-29',
        domicile: 'S',
        phone: '628123456789',
      },
      fixedNow,
    )

    expect(invalid.full_name).toBeDefined()
    expect(invalid.nim).toMatch(/huruf dan angka/i)
    expect(invalid.study_program).toMatch(/2–100 karakter/i)
    expect(invalid.institution).toMatch(/2–100 karakter/i)
    expect(invalid.birth_date).toMatch(/valid/i)
    expect(invalid.domicile).toMatch(/2–60 karakter/i)
    expect(invalid.phone).toMatch(/08 atau \+62/i)

    const futureDate = validateProfileForm(
      {
        ...validBase,
        birth_date: '2026-12-31',
      },
      fixedNow,
    )
    expect(futureDate.birth_date).toMatch(/masa depan/i)

    const shortPhone = validateProfileForm(
      {
        ...validBase,
        phone: '081234567',
      },
      fixedNow,
    )
    expect(shortPhone.phone).toBeDefined()
  })
})

describe('ProfilePage (/profile)', () => {
  it('loads encrypted profile, validates inputs, shows minor notice for under-18, and saves via PUT /api/profile', async () => {
    const user = userEvent.setup()
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/profile'] },
    })

    const nameInput = await screen.findByLabelText(/Nama Lengkap/i)
    expect(nameInput).toHaveValue('Budi Santoso')

    const phoneInput = screen.getByLabelText(/Nomor HP/i)
    await user.clear(phoneInput)
    await user.type(phoneInput, '12345')
    await user.click(screen.getByRole('button', { name: /Simpan Profil/i }))

    expect(
      screen.getByText(/Nomor HP harus diawali 08 atau \+62/i),
    ).toBeInTheDocument()

    // Enter valid +62 phone and an under-18 birth_date
    await user.clear(phoneInput)
    await user.type(phoneInput, '+6281299998888')

    const birthInput = screen.getByLabelText(/Tanggal Lahir/i)
    await user.clear(birthInput)
    await user.type(birthInput, '2010-05-10')

    expect(screen.getByTestId('minor-participant-notice')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Simpan Profil/i }))

    expect(await screen.findByTestId('profile-success-alert')).toHaveTextContent(
      /berhasil dienkripsi ulang/i,
    )
    expect(screen.getByTestId('profile-age-badge')).toHaveTextContent(/16 tahun/i)
  })

  it('prompts for re-verification confirmation ONLY when terverifikasi user edits full_name, nim, or institution', async () => {
    const user = userEvent.setup()
    const sessionUser = seedMockActiveSession('terverifikasi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/profile'] },
    })

    expect(await screen.findByTestId('profile-verification-badge')).toHaveTextContent(
      'Terverifikasi',
    )

    // 1. Editing non-sensitive field (domicile) saves directly without modal and stays Terverifikasi
    const domicileInput = screen.getByLabelText(/Domisili/i)
    await user.clear(domicileInput)
    await user.type(domicileInput, 'Gresik')
    await user.click(screen.getByRole('button', { name: /Simpan Profil/i }))

    expect(screen.queryByTestId('reverify-confirm-dialog')).not.toBeInTheDocument()
    expect(await screen.findByTestId('profile-success-alert')).toBeInTheDocument()
    expect(screen.getByTestId('profile-verification-badge')).toHaveTextContent('Terverifikasi')

    // 2. Editing institution triggers re-verification confirmation prompt
    const institutionInput = screen.getByLabelText(/Institusi/i)
    await user.clear(institutionInput)
    await user.type(institutionInput, 'Universitas Indonesia')
    await user.click(screen.getByRole('button', { name: /Simpan Profil/i }))

    const dialog = await screen.findByTestId('reverify-confirm-dialog')
    expect(within(dialog).getByText(/Institusi \/ Perguruan Tinggi/i)).toBeInTheDocument()

    // Cancel keeps Terverifikasi
    await user.click(within(dialog).getByRole('button', { name: /^Batal$/i }))
    expect(screen.queryByTestId('reverify-confirm-dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('profile-verification-badge')).toHaveTextContent('Terverifikasi')

    // Submit again and confirm -> transitions to Menunggu Verifikasi
    await user.click(screen.getByRole('button', { name: /Simpan Profil/i }))
    const dialogAgain = await screen.findByTestId('reverify-confirm-dialog')
    await user.click(
      within(dialogAgain).getByRole('button', { name: /Ya, Simpan & Verifikasi Ulang/i }),
    )

    expect(await screen.findByTestId('profile-verification-badge')).toHaveTextContent(
      'Menunggu Verifikasi',
    )
    expect(useAuthStore.getState().user?.verification_status).toBe('menunggu')
  })

  it('surfaces 409 deadline_passed error if registration deadline has passed', async () => {
    const user = userEvent.setup()
    setMockRegistrationDeadline('2020-01-01T00:00:00+07:00')
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/profile'] },
    })

    await screen.findByLabelText(/Nama Lengkap/i)
    await user.click(screen.getByRole('button', { name: /Simpan Profil/i }))

    expect(await screen.findByTestId('profile-error-alert')).toHaveTextContent(
      /Tenggat pendaftaran telah terlewat/i,
    )
  })
})
