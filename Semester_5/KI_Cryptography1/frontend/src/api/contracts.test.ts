import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  API_ERROR_CODES,
  ApiClientError,
  AUDIT_ACTIONS,
  CIPHER_TYPES,
  DOCUMENT_TYPES,
  FINALIZE_MISSING_ITEMS,
  isApiClientError,
  ITEM_FIELDS,
  USER_ROLES,
  VERIFICATION_STATUSES,
  type ApiEndpointContractMap,
  type ItemMeta,
  type Me,
  type Team,
  type VerifyParticipantRequest,
} from './index'

describe('src/api TypeScript Contracts & Error Models', () => {
  it('exposes exact domain value tuples matching Dokumentasi API enums', () => {
    expect(USER_ROLES).toEqual(['peserta', 'juri', 'superadmin'])
    expect(VERIFICATION_STATUSES).toEqual([
      'belum_lengkap',
      'menunggu',
      'terverifikasi',
      'ditolak',
    ])
    expect(DOCUMENT_TYPES).toEqual(['ktp', 'ktm', 'twibbon'])
    expect(ITEM_FIELDS).toEqual(['ktp', 'ktm', 'twibbon', 'proposal', 'video'])
    expect(CIPHER_TYPES).toEqual(['aes', 'des', 'rc4'])
    expect(FINALIZE_MISSING_ITEMS).toEqual([
      'proposal',
      'video',
      'repo_url',
      'min_members',
      'members_incomplete',
    ])
    expect(AUDIT_ACTIONS).toContain('integrity_failure')
    expect(API_ERROR_CODES).toContain('consent_required')
    expect(API_ERROR_CODES).toContain('csrf_failed')
    expect(API_ERROR_CODES).toContain('integrity_error')
  })

  it('models ItemMeta, Me, and Team strictly in snake_case with nullable fields', () => {
    const sampleItem: ItemMeta = {
      item_id: '3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93',
      field: 'ktp',
      content_type: 'image/jpeg',
      size_bytes: 482_113,
      original_filename: 'ktp-budi.jpg',
      uploaded_at: '2026-10-26T10:15:00+07:00',
    }

    const sampleMe: Me = {
      id: 'b1a7c2d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d',
      email: 'budi@mahasiswa.ac.id',
      role: 'peserta',
      full_name: 'Budi Santoso',
      verification_status: 'menunggu',
      consent: {
        policy_version: '1.0',
        agreed_at: '2026-10-26T09:00:00+07:00',
      },
      current_policy_version: '1.0',
      team: {
        id: '9c8b7a6d-5e4f-4321-8765-0fedcba98765',
        name: 'Tim Garuda',
        status: 'draft',
        is_leader: true,
      },
    }

    const sampleTeam: Team = {
      id: '9c8b7a6d-5e4f-4321-8765-0fedcba98765',
      name: 'Tim Garuda',
      code: 'K7M2Q9XA',
      status: 'draft',
      leader_id: sampleMe.id,
      created_at: '2026-10-27T13:00:00+07:00',
      finalized_at: null,
      members: [
        {
          user_id: sampleMe.id,
          full_name: 'Budi Santoso',
          is_leader: true,
          profile_complete: true,
          documents_complete: true,
        },
      ],
      submission: {
        proposal: null,
        video: null,
        repo_url: null,
      },
      finalize_missing: ['proposal', 'video', 'repo_url', 'min_members'],
    }

    expect(sampleItem.item_id).toBeTruthy()
    expect(sampleMe.team?.is_leader).toBe(true)
    expect(sampleTeam.finalize_missing).toContain('min_members')

    expectTypeOf<ApiEndpointContractMap['POST /api/auth/login']['response']>().toEqualTypeOf<{
      user: Me
    }>()
    expectTypeOf<ApiEndpointContractMap['GET /api/me']['response']>().toEqualTypeOf<Me>()
    expectTypeOf<
      ApiEndpointContractMap['PATCH /api/admin/participants/{user_id}']['request']
    >().toEqualTypeOf<VerifyParticipantRequest>()
  })

  it('provides typed helpers on ApiClientError for validation, auth, consent, CSRF, and integrity errors', () => {
    const validationErr = new ApiClientError({
      status: 400,
      code: 'validation_error',
      message: 'Data tidak valid',
      details: {
        fields: { phone: 'Nomor HP harus diawali 08 atau +62' },
      },
    })

    expect(isApiClientError(validationErr)).toBe(true)
    expect(validationErr.isValidationError()).toBe(true)
    expect(validationErr.fieldErrors.phone).toBe('Nomor HP harus diawali 08 atau +62')

    const finalizeErr = new ApiClientError({
      status: 409,
      code: 'finalize_requirements',
      message: 'Syarat submit final belum terpenuhi',
      details: {
        missing: ['proposal', 'video'],
      },
    })
    expect(finalizeErr.missingRequirements).toEqual(['proposal', 'video'])

    const integrityErr = new ApiClientError({
      status: 500,
      code: 'integrity_error',
      message: 'HMAC atau pencocokan tiga cipher gagal',
    })
    expect(integrityErr.isIntegrityError()).toBe(true)
  })
})
