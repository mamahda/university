import { http, HttpResponse } from 'msw'
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../api/csrf'
import {
  DOCUMENT_TYPES,
  type AdminJuriAccount,
  type AdminParticipantListItem,
  type AdminTeamListItem,
  type AuditAction,
  type AuditLogItem,
  type AdminBenchmarksResponse,
  type BenchmarkEnv,
  type BenchmarkOperation,
  type BenchmarkRow,
  type BenchmarkSource,
  type CipherType,
  type ConsentInfo,
  type DocumentType,
  type FinalizeMissingItem,
  type ItemMeta,
  type JuriTeamSummary,
  type Me,
  type ParticipantDocumentsResponse,
  type ParticipantProfile,
  type PublicSettings,
  type Team,
  type TeamStatus,
  type UpdateProfileRequest,
  type UserRole,
  type VerificationStatus,
} from '../api/types'
import {
  DOCUMENT_ALLOWED_MIMES,
  detectMagicMimeFromBytes,
  type AllowedDocumentMime,
} from '../lib/fileValidation'
import {
  computeAgeFromBirthDate,
  getChangedReverifyFields,
  normalizeProfileInput,
  validateProfileForm,
} from '../lib/profileValidation'
import {
  normalizeInviteCode,
  normalizeRepoUrl,
  validateRepoUrl,
  validateTeamName,
} from '../lib/teamValidation'

export const DEFAULT_MOCK_SETTINGS: PublicSettings = {
  registration_deadline: '2026-11-20T23:59:00+07:00',
  submission_deadline: '2026-12-05T23:59:00+07:00',
  min_team_size: 2,
  max_team_size: 4,
  limits: {
    document_max_bytes: 5_242_880,
    proposal_max_bytes: 10_485_760,
    video_max_bytes: 104_857_600,
  },
}

const DEFAULT_POLICY_VERSION = '1.0'
const DEFAULT_POLICY_MARKDOWN = `## Pemberitahuan Privasi Schematics NIC
Panitia Schematics NIC mengumpulkan dan melindungi data pendaftaran peserta sesuai UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).

### Data yang Dikumpulkan
- Data pribadi umum: email, nama lengkap, NIM, program studi, institusi, domisili, dan nomor HP.
- Tanggal lahir untuk penandaan peserta berusia di bawah 18 tahun oleh superadmin.
- Dokumen verifikasi identitas: scan KTP, scan KTM/KRSM, dan bukti twibbon.
- Karya tim: proposal PDF, video demo MP4, dan tautan repositori GitHub.

### Keamanan & Hak Akses
- Seluruh data dan file dienkripsi tiga cipher (AES-CTR, DES-CTR, dan RC4) disertai HMAC-SHA256 dan pembungkusan kunci AES-256-GCM.
- Dokumen identitas hanya dapat dibuka oleh peserta pemilik dan superadmin (tercatat pada audit log).
- Juri hanya dapat melihat karya tim yang telah berstatus final.`

/** Minimal valid 1x1 dark PNG (68 bytes) */
const MOCK_PNG_BYTES = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x60, 0x60, 0x60, 0x00,
  0x00, 0x00, 0x04, 0x00, 0x01, 0xf6, 0x17, 0x38, 0x55, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
])

/** Minimal valid 1x1 grayscale JPEG */
const MOCK_JPEG_BYTES = Uint8Array.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x03, 0x02, 0x02, 0x02, 0x02, 0x02, 0x03,
  0x02, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03, 0x04, 0x06, 0x04, 0x04, 0x04, 0x04, 0x04, 0x08, 0x06,
  0x06, 0x05, 0x06, 0x09, 0x08, 0x0a, 0x0a, 0x09, 0x08, 0x09, 0x09, 0x0a, 0x0c, 0x0f, 0x0c, 0x0a,
  0x0b, 0x0e, 0x0b, 0x09, 0x09, 0x0d, 0x11, 0x0d, 0x0e, 0x0f, 0x10, 0x10, 0x11, 0x10, 0x0a, 0x0c,
  0x12, 0x13, 0x12, 0x10, 0x13, 0x0f, 0x10, 0x10, 0x10, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0xff, 0xc4, 0x00, 0x14,
  0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xd2, 0xcf, 0x20, 0xff,
  0xd9,
])

/** Minimal valid single-page PDF */
const MOCK_PDF_BYTES = new TextEncoder().encode(
  `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 68 >>
stream
BT /F1 16 Tf 72 720 Td (Schematics NIC Encrypted Document) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000359 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
429
%%EOF`,
)

function defaultBytesForContentType(contentType: string): Uint8Array {
  if (contentType === 'image/png') {
    return MOCK_PNG_BYTES
  }
  if (contentType === 'application/pdf') {
    return MOCK_PDF_BYTES
  }
  return MOCK_JPEG_BYTES
}

interface MockStoredItem {
  meta: ItemMeta
  bytes: Uint8Array
  ownerEmail: string
  tampered: boolean
}

interface MockAccountRecord {
  password: string
  user: Me
  profile: ParticipantProfile
  documents: ParticipantDocumentsResponse
  teamId: string | null
}

function createEmptyProfile(): ParticipantProfile {
  return {
    full_name: null,
    nim: null,
    study_program: null,
    institution: null,
    birth_date: null,
    domicile: null,
    phone: null,
    age: null,
    is_minor: null,
    profile_complete: false,
    verification_status: 'belum_lengkap',
    verification_note: null,
  }
}

function createEmptyDocuments(): ParticipantDocumentsResponse {
  return {
    ktp: null,
    ktm: null,
    twibbon: null,
    documents_complete: false,
  }
}

function computeFinalizeMissing(team: Team, minTeamSize: number): FinalizeMissingItem[] {
  const missing: FinalizeMissingItem[] = []
  if (!team.submission.proposal) {
    missing.push('proposal')
  }
  if (!team.submission.video) {
    missing.push('video')
  }
  if (!team.submission.repo_url) {
    missing.push('repo_url')
  }
  if (team.members.length < minTeamSize) {
    missing.push('min_members')
  }
  if (team.members.some((m) => !m.profile_complete || !m.documents_complete)) {
    missing.push('members_incomplete')
  }
  return missing
}

function createInitialStateData(policyVersion: string): {
  accounts: Map<string, MockAccountRecord>
  teams: Map<string, Team>
  items: Map<string, MockStoredItem>
} {
  const accounts = new Map<string, MockAccountRecord>()
  const teams = new Map<string, Team>()
  const items = new Map<string, MockStoredItem>()

  function registerDocItem(ownerEmail: string, meta: ItemMeta): ItemMeta {
    items.set(meta.item_id, {
      meta,
      bytes: defaultBytesForContentType(meta.content_type),
      ownerEmail,
      tampered: false,
    })
    return meta
  }

  const budiId = 'b1a7c2d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d'
  const sariId = 'd4e5f6a7-1111-4222-8333-444455556666'
  const garudaTeamId = '9c8b7a6d-5e4f-4321-8765-0fedcba98765'

  const garudaTeam: Team = {
    id: garudaTeamId,
    name: 'Tim Garuda',
    code: 'K7M2Q9XA',
    status: 'draft',
    leader_id: budiId,
    created_at: '2026-10-27T08:00:00+07:00',
    finalized_at: null,
    members: [
      {
        user_id: budiId,
        full_name: 'Budi Santoso',
        is_leader: true,
        profile_complete: true,
        documents_complete: true,
      },
      {
        user_id: sariId,
        full_name: 'Sari Dewi',
        is_leader: false,
        profile_complete: true,
        documents_complete: false,
      },
    ],
    submission: {
      proposal: null,
      video: null,
      repo_url: null,
    },
    finalize_missing: ['proposal', 'video', 'repo_url', 'members_incomplete'],
  }

  teams.set(garudaTeam.id, garudaTeam)

  accounts.set('budi@mahasiswa.ac.id', {
    password: 'rahasia-panjang-123',
    user: {
      id: budiId,
      email: 'budi@mahasiswa.ac.id',
      role: 'peserta',
      full_name: 'Budi Santoso',
      verification_status: 'menunggu',
      verification_note: null,
      consent: {
        policy_version: policyVersion,
        agreed_at: '2026-10-26T09:00:00+07:00',
      },
      current_policy_version: policyVersion,
      team: {
        id: garudaTeam.id,
        name: garudaTeam.name,
        status: garudaTeam.status,
        is_leader: true,
      },
    },
    profile: {
      full_name: 'Budi Santoso',
      nim: '5025231001',
      study_program: 'Teknik Informatika',
      institution: 'Institut Teknologi Sepuluh Nopember',
      birth_date: '2005-03-14',
      domicile: 'Surabaya',
      phone: '081234567890',
      age: 21,
      is_minor: false,
      profile_complete: true,
      verification_status: 'menunggu',
      verification_note: null,
    },
    documents: {
      ktp: registerDocItem('budi@mahasiswa.ac.id', {
        item_id: '3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93',
        field: 'ktp',
        content_type: 'image/jpeg',
        size_bytes: 482_113,
        original_filename: 'ktp-budi.jpg',
        uploaded_at: '2026-10-26T10:15:00+07:00',
      }),
      ktm: registerDocItem('budi@mahasiswa.ac.id', {
        item_id: '4a7d2f3b-9c5e-4d2a-8f8b-3c6e9d1a2b04',
        field: 'ktm',
        content_type: 'application/pdf',
        size_bytes: 612_400,
        original_filename: 'ktm-budi.pdf',
        uploaded_at: '2026-10-26T10:17:00+07:00',
      }),
      twibbon: registerDocItem('budi@mahasiswa.ac.id', {
        item_id: '5b8e3a4c-0d6f-4e3b-9a9c-4d7f0e2b3c15',
        field: 'twibbon',
        content_type: 'image/png',
        size_bytes: 924_110,
        original_filename: 'twibbon-budi.png',
        uploaded_at: '2026-10-26T10:20:00+07:00',
      }),
      documents_complete: true,
    },
    teamId: garudaTeam.id,
  })

  accounts.set('sari@mahasiswa.ac.id', {
    password: 'rahasia-panjang-123',
    user: {
      id: sariId,
      email: 'sari@mahasiswa.ac.id',
      role: 'peserta',
      full_name: 'Sari Dewi',
      verification_status: 'belum_lengkap',
      verification_note: null,
      consent: {
        policy_version: policyVersion,
        agreed_at: '2026-10-26T09:05:00+07:00',
      },
      current_policy_version: policyVersion,
      team: {
        id: garudaTeam.id,
        name: garudaTeam.name,
        status: garudaTeam.status,
        is_leader: false,
      },
    },
    profile: {
      full_name: 'Sari Dewi',
      nim: '5025231045',
      study_program: 'Teknik Informatika',
      institution: 'Institut Teknologi Sepuluh Nopember',
      birth_date: '2005-08-19',
      domicile: 'Surabaya',
      phone: '081234560011',
      age: 21,
      is_minor: false,
      profile_complete: true,
      verification_status: 'belum_lengkap',
      verification_note: null,
    },
    documents: {
      ktp: registerDocItem('sari@mahasiswa.ac.id', {
        item_id: '8a1b2c3d-1111-4222-8333-444455557701',
        field: 'ktp',
        content_type: 'image/jpeg',
        size_bytes: 390_100,
        original_filename: 'ktp-sari.jpg',
        uploaded_at: '2026-10-26T10:22:00+07:00',
      }),
      ktm: registerDocItem('sari@mahasiswa.ac.id', {
        item_id: '8a1b2c3d-1111-4222-8333-444455557702',
        field: 'ktm',
        content_type: 'application/pdf',
        size_bytes: 410_200,
        original_filename: 'ktm-sari.pdf',
        uploaded_at: '2026-10-26T10:25:00+07:00',
      }),
      twibbon: null,
      documents_complete: false,
    },
    teamId: garudaTeam.id,
  })

  accounts.set('terverifikasi@mahasiswa.ac.id', {
    password: 'rahasia-panjang-123',
    user: {
      id: 'a1b2c3d4-9999-4888-8777-666655554444',
      email: 'terverifikasi@mahasiswa.ac.id',
      role: 'peserta',
      full_name: 'Nadia Putri',
      verification_status: 'terverifikasi',
      verification_note: null,
      consent: {
        policy_version: policyVersion,
        agreed_at: '2026-10-26T09:10:00+07:00',
      },
      current_policy_version: policyVersion,
      team: null,
    },
    profile: {
      full_name: 'Nadia Putri',
      nim: '5025221088',
      study_program: 'Teknik Komputer',
      institution: 'Institut Teknologi Sepuluh Nopember',
      birth_date: '2004-11-05',
      domicile: 'Sidoarjo',
      phone: '+6281234567891',
      age: 21,
      is_minor: false,
      profile_complete: true,
      verification_status: 'terverifikasi',
      verification_note: null,
    },
    documents: {
      ktp: registerDocItem('terverifikasi@mahasiswa.ac.id', {
        item_id: '9a1b2c3d-1111-4222-8333-444455556601',
        field: 'ktp',
        content_type: 'image/jpeg',
        size_bytes: 310_200,
        original_filename: 'ktp-nadia.jpg',
        uploaded_at: '2026-10-26T10:30:00+07:00',
      }),
      ktm: registerDocItem('terverifikasi@mahasiswa.ac.id', {
        item_id: '9a1b2c3d-1111-4222-8333-444455556602',
        field: 'ktm',
        content_type: 'application/pdf',
        size_bytes: 420_500,
        original_filename: 'ktm-nadia.pdf',
        uploaded_at: '2026-10-26T10:32:00+07:00',
      }),
      twibbon: registerDocItem('terverifikasi@mahasiswa.ac.id', {
        item_id: '9a1b2c3d-1111-4222-8333-444455556603',
        field: 'twibbon',
        content_type: 'image/png',
        size_bytes: 512_000,
        original_filename: 'twibbon-nadia.png',
        uploaded_at: '2026-10-26T10:35:00+07:00',
      }),
      documents_complete: true,
    },
    teamId: null,
  })

  accounts.set('ditolak@mahasiswa.ac.id', {
    password: 'rahasia-panjang-123',
    user: {
      id: 'f1e2d3c4-b5a6-4789-8012-3456789abcde',
      email: 'ditolak@mahasiswa.ac.id',
      role: 'peserta',
      full_name: 'Rina Wijaya',
      verification_status: 'ditolak',
      verification_note: 'Scan KTM tidak terbaca, mohon unggah ulang dokumen yang jelas.',
      consent: {
        policy_version: policyVersion,
        agreed_at: '2026-10-26T09:30:00+07:00',
      },
      current_policy_version: policyVersion,
      team: null,
    },
    profile: {
      full_name: 'Rina Wijaya',
      nim: '5025231099',
      study_program: 'Sistem Informasi',
      institution: 'Universitas Contoh',
      birth_date: '2005-07-22',
      domicile: 'Malang',
      phone: '081298765432',
      age: 21,
      is_minor: false,
      profile_complete: true,
      verification_status: 'ditolak',
      verification_note: 'Scan KTM tidak terbaca, mohon unggah ulang dokumen yang jelas.',
    },
    documents: {
      ktp: registerDocItem('ditolak@mahasiswa.ac.id', {
        item_id: '6c9f4b5d-1e70-4f4c-8b0d-5e801f3c4d26',
        field: 'ktp',
        content_type: 'image/jpeg',
        size_bytes: 350_000,
        original_filename: 'ktp-rina.jpg',
        uploaded_at: '2026-10-26T11:00:00+07:00',
      }),
      ktm: registerDocItem('ditolak@mahasiswa.ac.id', {
        item_id: '7d0a5c6e-2f81-405d-9c1e-6f912a4d5e37',
        field: 'ktm',
        content_type: 'image/jpeg',
        size_bytes: 280_000,
        original_filename: 'ktm-rina-blur.jpg',
        uploaded_at: '2026-10-26T11:02:00+07:00',
      }),
      twibbon: registerDocItem('ditolak@mahasiswa.ac.id', {
        item_id: '8e1b6d7f-3092-416e-8d2f-70a23b5e6f48',
        field: 'twibbon',
        content_type: 'image/png',
        size_bytes: 510_000,
        original_filename: 'twibbon-rina.png',
        uploaded_at: '2026-10-26T11:05:00+07:00',
      }),
      documents_complete: true,
    },
    teamId: null,
  })

  accounts.set('baru@mahasiswa.ac.id', {
    password: 'rahasia-panjang-123',
    user: {
      id: 'c2b8d3e5-6f70-4b9c-8d1e-2f3a4b5c6d7e',
      email: 'baru@mahasiswa.ac.id',
      role: 'peserta',
      full_name: null,
      verification_status: 'belum_lengkap',
      verification_note: null,
      consent: null,
      current_policy_version: policyVersion,
      team: null,
    },
    profile: createEmptyProfile(),
    documents: createEmptyDocuments(),
    teamId: null,
  })

  accounts.set('juri1@panitia.id', {
    password: 'sementara-12345',
    user: {
      id: 'e4d3c2b1-a098-4765-8432-10fedcba9876',
      email: 'juri1@panitia.id',
      role: 'juri',
      full_name: null,
      verification_status: null,
      consent: null,
      current_policy_version: policyVersion,
      team: null,
    },
    profile: createEmptyProfile(),
    documents: createEmptyDocuments(),
    teamId: null,
  })

  accounts.set('admin@panitia.id', {
    password: 'superadmin-12345',
    user: {
      id: 'a0000000-0000-4000-8000-000000000001',
      email: 'admin@panitia.id',
      role: 'superadmin',
      full_name: null,
      verification_status: null,
      consent: null,
      current_policy_version: policyVersion,
      team: null,
    },
    profile: createEmptyProfile(),
    documents: createEmptyDocuments(),
    teamId: null,
  })

  return { accounts, teams, items }
}

interface MockServerState {
  settings: PublicSettings
  policyVersion: string
  policyMarkdown: string
  accounts: Map<string, MockAccountRecord>
  teams: Map<string, Team>
  items: Map<string, MockStoredItem>
  activeEmail: string | null
  csrfToken: string | null
  nextIdCounter: number
  /** Audit trail, newest first, as `GET /api/admin/audit-logs` returns it. */
  auditLogs: AuditLogItem[]
  /** Juri accounts live in `accounts`; only their creation time is extra. */
  juriCreatedAt: Map<string, string>
  /** Juri user id → assigned team ids. */
  juriAssignments: Map<string, string[]>
  nextAuditId: number
}

const initialSeed = createInitialStateData(DEFAULT_POLICY_VERSION)

const DEFAULT_JURI_CREATED_AT = '2026-10-20T09:00:00+07:00'

function createInitialAuditLogs(): AuditLogItem[] {
  return [
    {
      id: '503',
      actor_id: 'e4d3c2b1-a098-4765-8432-10fedcba9876',
      actor_email: 'juri1@panitia.id',
      actor_role: 'juri',
      action: 'view_item',
      item_id: '6c2d8e4f-0a1b-4c3d-9e5f-7a8b9c0d1e2f',
      subject_user_id: null,
      created_at: '2026-10-26T09:30:00+07:00',
    },
    {
      id: '502',
      actor_id: 'a0000000-0000-4000-8000-000000000001',
      actor_email: 'admin@panitia.id',
      actor_role: 'superadmin',
      action: 'verify_participant',
      item_id: null,
      subject_user_id: 'c3d4e5f6-2222-4333-8444-555566667777',
      created_at: '2026-10-25T14:05:00+07:00',
    },
    {
      id: '501',
      actor_id: 'a0000000-0000-4000-8000-000000000001',
      actor_email: 'admin@panitia.id',
      actor_role: 'superadmin',
      action: 'update_settings',
      item_id: null,
      subject_user_id: null,
      created_at: '2026-10-24T08:00:00+07:00',
    },
    {
      id: '500',
      actor_id: null,
      actor_email: null,
      actor_role: null,
      action: 'integrity_failure',
      item_id: '3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93',
      subject_user_id: null,
      created_at: '2026-10-23T22:41:00+07:00',
    },
  ]
}

const mockState: MockServerState = {
  settings: structuredClone(DEFAULT_MOCK_SETTINGS),
  policyVersion: DEFAULT_POLICY_VERSION,
  policyMarkdown: DEFAULT_POLICY_MARKDOWN,
  accounts: initialSeed.accounts,
  teams: initialSeed.teams,
  items: initialSeed.items,
  activeEmail: null,
  csrfToken: null,
  nextIdCounter: 100,
  auditLogs: createInitialAuditLogs(),
  juriCreatedAt: new Map([['juri1@panitia.id', DEFAULT_JURI_CREATED_AT]]),
  juriAssignments: new Map(),
  nextAuditId: 600,
}

function setBrowserCsrfCookie(token: string | null): void {
  if (typeof document === 'undefined') {
    return
  }
  if (token) {
    document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`
  } else {
    document.cookie = `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}

function findAccountByUserId(userId: string): MockAccountRecord | null {
  for (const account of mockState.accounts.values()) {
    if (account.user.id === userId) {
      return account
    }
  }
  return null
}

function syncTeamDerivedState(team: Team): Team {
  const updated: Team = {
    ...team,
    finalize_missing: computeFinalizeMissing(team, mockState.settings.min_team_size),
  }
  mockState.teams.set(updated.id, updated)

  for (const member of updated.members) {
    const account = findAccountByUserId(member.user_id)
    if (account) {
      account.teamId = updated.id
      account.user = {
        ...account.user,
        team: {
          id: updated.id,
          name: updated.name,
          status: updated.status,
          is_leader: updated.leader_id === account.user.id,
        },
      }
    }
  }

  return updated
}

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateMockInviteCode(seed: number): string {
  let value = seed * 7919 + 104729
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += INVITE_ALPHABET[value % INVITE_ALPHABET.length]
    value = Math.floor(value / 7) + (i + 3) * 31
  }
  return code
}

export function resetMockState(): void {
  const fresh = createInitialStateData(DEFAULT_POLICY_VERSION)
  mockState.settings = structuredClone(DEFAULT_MOCK_SETTINGS)
  mockState.policyVersion = DEFAULT_POLICY_VERSION
  mockState.policyMarkdown = DEFAULT_POLICY_MARKDOWN
  mockState.accounts = fresh.accounts
  mockState.teams = fresh.teams
  mockState.items = fresh.items
  mockState.activeEmail = null
  mockState.csrfToken = null
  mockState.nextIdCounter = 100
  mockState.auditLogs = createInitialAuditLogs()
  mockState.juriCreatedAt = new Map([['juri1@panitia.id', DEFAULT_JURI_CREATED_AT]])
  mockState.juriAssignments = new Map()
  mockState.nextAuditId = 600
  setBrowserCsrfCookie(null)
}

export function setMockPolicyVersion(version: string, markdown?: string): void {
  mockState.policyVersion = version
  if (markdown) {
    mockState.policyMarkdown = markdown
  }
  for (const record of mockState.accounts.values()) {
    record.user = {
      ...record.user,
      current_policy_version: version,
    }
  }
}

export function setMockRegistrationDeadline(deadlineIso: string): void {
  mockState.settings = {
    ...mockState.settings,
    registration_deadline: deadlineIso,
  }
}

export function setMockMaxTeamSize(maxTeamSize: number): void {
  mockState.settings = {
    ...mockState.settings,
    max_team_size: maxTeamSize,
  }
}

export function setMockTeamStatus(teamId: string, status: TeamStatus): boolean {
  const existing = mockState.teams.get(teamId)
  if (!existing) {
    return false
  }
  const updated: Team = {
    ...existing,
    status,
    finalized_at: status === 'final' ? new Date().toISOString() : null,
  }
  syncTeamDerivedState(updated)
  return true
}

export function tamperMockItem(itemId: string, tampered = true): boolean {
  const stored = mockState.items.get(itemId)
  if (!stored) {
    return false
  }
  stored.tampered = tampered
  return true
}

export function seedMockActiveSession(email: string, csrfToken = 'mock-csrf-token-001'): Me | null {
  const account = mockState.accounts.get(email.toLowerCase())
  if (!account) {
    return null
  }
  mockState.activeEmail = account.user.email
  mockState.csrfToken = csrfToken
  setBrowserCsrfCookie(csrfToken)
  return { ...account.user, current_policy_version: mockState.policyVersion }
}

function getAuthenticatedRecord(): MockAccountRecord | null {
  if (!mockState.activeEmail) {
    return null
  }
  return mockState.accounts.get(mockState.activeEmail) ?? null
}

function requirePesertaWithConsent(
  record: MockAccountRecord | null,
): { ok: true; record: MockAccountRecord } | { ok: false; response: Response } {
  if (!record) {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif atau sudah kedaluwarsa',
            details: {},
          },
        },
        { status: 401 },
      ),
    }
  }

  if (record.user.role !== 'peserta') {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'forbidden',
            message: 'Endpoint khusus peserta',
            details: {},
          },
        },
        { status: 403 },
      ),
    }
  }

  if (
    !record.user.consent ||
    record.user.consent.policy_version !== mockState.policyVersion
  ) {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'consent_required',
            message: 'Peserta belum menyetujui kebijakan privasi terbaru',
            details: {},
          },
        },
        { status: 403 },
      ),
    }
  }

  return { ok: true, record }
}

/** Gate for the juri and superadmin endpoint families. */
function requireRole(
  role: UserRole,
): { ok: true; record: MockAccountRecord } | { ok: false; response: Response } {
  const record = getAuthenticatedRecord()
  if (!record) {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif atau sudah kedaluwarsa',
            details: {},
          },
        },
        { status: 401 },
      ),
    }
  }
  if (record.user.role !== role) {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'forbidden',
            message: `Endpoint khusus ${role}`,
            details: {},
          },
        },
        { status: 403 },
      ),
    }
  }
  return { ok: true, record }
}

function recordAuditLog(
  actor: MockAccountRecord | null,
  action: AuditAction,
  extra: { item_id?: string | null; subject_user_id?: string | null } = {},
): void {
  mockState.auditLogs.unshift({
    id: String(++mockState.nextAuditId),
    actor_id: actor?.user.id ?? null,
    actor_email: actor?.user.email ?? null,
    actor_role: actor?.user.role ?? null,
    action,
    item_id: extra.item_id ?? null,
    subject_user_id: extra.subject_user_id ?? null,
    created_at: new Date().toISOString(),
  })
}

/** `page` starts at 1; `page_size` defaults to 25 and is capped at 100. */
function paginate<T>(rows: T[], url: URL): { items: T[]; page: number; page_size: number; total: number } {
  const rawPage = Number.parseInt(url.searchParams.get('page') ?? '1', 10)
  const rawSize = Number.parseInt(url.searchParams.get('page_size') ?? '25', 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize = Math.min(Number.isFinite(rawSize) && rawSize > 0 ? rawSize : 25, 100)
  const start = (page - 1) * pageSize
  return {
    items: rows.slice(start, start + pageSize),
    page,
    page_size: pageSize,
    total: rows.length,
  }
}

function teamMemberNames(team: Team): { leaderName: string | null; memberCount: number } {
  const leader = team.members.find((member) => member.is_leader)
  return { leaderName: leader?.full_name ?? null, memberCount: team.members.length }
}

function verifyCsrf(request: Request): Response | null {
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (!mockState.csrfToken || !headerToken || headerToken !== mockState.csrfToken) {
    return HttpResponse.json(
      {
        error: {
          code: 'csrf_failed',
          message: 'Header X-CSRF-TOKEN hilang atau tidak cocok.',
          details: {},
        },
      },
      { status: 403 },
    )
  }
  return null
}

function isRegistrationDeadlinePassed(): boolean {
  const targetMs = Date.parse(mockState.settings.registration_deadline ?? '')
  return !Number.isNaN(targetMs) && Date.now() > targetMs
}

function isSubmissionDeadlinePassed(): boolean {
  const targetMs = Date.parse(mockState.settings.submission_deadline ?? '')
  return !Number.isNaN(targetMs) && Date.now() > targetMs
}

/**
 * Shared gate for the three leader-only submission endpoints: an authenticated
 * `peserta` who leads a team that is still `draft`, before the submission deadline.
 */
function requireSubmissionLeader(request: Request):
  | { ok: true; record: MockAccountRecord; team: Team }
  | { ok: false; response: Response } {
  const rawRecord = getAuthenticatedRecord()
  if (!rawRecord) {
    return {
      ok: false,
      response: HttpResponse.json(
        { error: { code: 'unauthenticated', message: 'Sesi belum aktif', details: {} } },
        { status: 401 },
      ),
    }
  }

  const csrfError = verifyCsrf(request)
  if (csrfError) {
    return { ok: false, response: csrfError }
  }

  const guard = requirePesertaWithConsent(rawRecord)
  if (!guard.ok) {
    return { ok: false, response: guard.response }
  }
  const { record } = guard

  const team = record.teamId ? (mockState.teams.get(record.teamId) ?? null) : null
  if (!team || team.leader_id !== record.user.id) {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'not_leader',
            message: 'Hanya Ketua Tim yang dapat mengubah submission.',
            details: {},
          },
        },
        { status: 403 },
      ),
    }
  }

  if (team.status === 'final') {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'team_locked',
            message: 'Tim sudah difinalisasi sehingga submission tidak dapat diubah.',
            details: {},
          },
        },
        { status: 409 },
      ),
    }
  }

  if (isSubmissionDeadlinePassed()) {
    return {
      ok: false,
      response: HttpResponse.json(
        {
          error: {
            code: 'deadline_passed',
            message: 'Tenggat pengumpulan karya telah terlewat.',
            details: {},
          },
        },
        { status: 409 },
      ),
    }
  }

  return { ok: true, record, team }
}

function issueSessionForEmail(email: string): { user: Me; csrfCookieHeader: string } {
  const record = mockState.accounts.get(email)!
  record.user = {
    ...record.user,
    current_policy_version: mockState.policyVersion,
  }
  const token = `csrf-${++mockState.nextIdCounter}-token`
  mockState.activeEmail = email
  mockState.csrfToken = token
  setBrowserCsrfCookie(token)

  return {
    user: { ...record.user },
    csrfCookieHeader: `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Lax`,
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* -------------------------------------------------------------------------- */
/* Benchmark fixtures                                                         */
/* -------------------------------------------------------------------------- */

const BENCHMARK_SOURCE_VALUES: BenchmarkSource[] = ['controlled', 'live']
const BENCHMARK_OPERATION_VALUES: BenchmarkOperation[] = ['enc', 'dec', 'hmac', 'wrap']

interface MockBenchmarkRun {
  run_id: string
  source: BenchmarkSource
  created_at: string
  env: BenchmarkEnv
  rows: BenchmarkRow[]
}

/**
 * Builds a row the way the API does: durations come from the throughput, and
 * the throughput quartiles are their own spread rather than inverted duration
 * quartiles. `mbPerSecond` is null where throughput is meaningless (`wrap`),
 * and then the duration is a fixed cost independent of payload size.
 */
function benchmarkRow(
  cipher: CipherType,
  operation: BenchmarkOperation,
  sizeBytes: number,
  mbPerSecond: number | null,
  n = 30,
  fixedNs = 9_400,
): BenchmarkRow {
  const medianNs = mbPerSecond === null ? fixedNs : Math.round((sizeBytes * 1_000) / mbPerSecond)
  return {
    cipher,
    operation,
    size_bytes: sizeBytes,
    n,
    median_ns: medianNs,
    q1_ns: Math.round(medianNs * 0.97),
    q3_ns: Math.round(medianNs * 1.05),
    median_mb_s: mbPerSecond,
    q1_mb_s: mbPerSecond === null ? null : Number((mbPerSecond * 0.96).toFixed(1)),
    q3_mb_s: mbPerSecond === null ? null : Number((mbPerSecond * 1.03).toFixed(1)),
    sufficient_samples: n >= 30,
  }
}

/**
 * Throughput at the largest payload, where the timer overhead no longer
 * dominates. Smaller payloads reach a fraction of it.
 */
const CONTROLLED_PEAK_MB_S: Record<CipherType, { enc: number; dec: number; hmac: number }> = {
  aes: { enc: 826.4, dec: 816.9, hmac: 438.6 },
  des: { enc: 54.1, dec: 53.7, hmac: 438.6 },
  rc4: { enc: 267.4, dec: 264.6, hmac: 438.6 },
}

const CONTROLLED_SIZES = [524_288, 2_097_152, 5_242_880]
const SIZE_EFFICIENCY: Record<number, number> = {
  524_288: 0.72,
  2_097_152: 0.91,
  5_242_880: 1,
}

function controlledRows(): BenchmarkRow[] {
  const rows: BenchmarkRow[] = []
  for (const size of CONTROLLED_SIZES) {
    const efficiency = SIZE_EFFICIENCY[size] ?? 1
    for (const cipher of ['aes', 'des', 'rc4'] as CipherType[]) {
      const peak = CONTROLLED_PEAK_MB_S[cipher]
      const scale = (value: number) =>
        size === 5_242_880 ? value : Number((value * efficiency).toFixed(1))
      rows.push(benchmarkRow(cipher, 'enc', size, scale(peak.enc)))
      rows.push(benchmarkRow(cipher, 'dec', size, scale(peak.dec)))
      // One tag per ciphertext on encrypt and one verification on decrypt.
      rows.push(benchmarkRow(cipher, 'hmac', size, scale(peak.hmac), 60))
      // Key wrapping is a fixed cost: no meaningful data throughput.
      rows.push(benchmarkRow(cipher, 'wrap', size, null))
    }
  }
  return rows
}

const MOCK_BENCHMARK_RUNS: MockBenchmarkRun[] = [
  {
    run_id: 'run-controlled-2026-10-26',
    source: 'controlled',
    created_at: '2026-10-26T20:15:00+07:00',
    env: {
      cpu: 'Mock CPU (AES-NI Enabled)',
      aes_ni: true,
      python: '3.12.4',
      pycryptodome: '3.21.0',
      os: 'Windows 11 (10.0.26200)',
      protocol: 'time.perf_counter_ns(), cipher digilir per pengulangan',
      parameters: {
        aes: { key_bits: 256, nonce_bytes: 8, hmac: true },
        des: { key_bits: 56, nonce_bytes: 4, hmac: true },
        rc4: { key_bits: 128, nonce_bytes: 0, hmac: true, drop_bytes: 3072 },
      },
      repeats: 30,
      warmup: 3,
      sizes_bytes: CONTROLLED_SIZES,
    },
    rows: controlledRows(),
  },
  {
    run_id: 'run-controlled-2026-10-19',
    source: 'controlled',
    created_at: '2026-10-19T21:40:00+07:00',
    env: {
      cpu: 'Mock CPU (AES-NI Enabled)',
      aes_ni: true,
      python: '3.12.4',
      pycryptodome: '3.20.0',
      os: 'Windows 11 (10.0.26100)',
      protocol: 'time.perf_counter_ns(), cipher digilir per pengulangan',
      repeats: 30,
      warmup: 3,
      sizes_bytes: [5_242_880],
    },
    rows: [
      benchmarkRow('aes', 'enc', 5_242_880, 790.2),
      benchmarkRow('des', 'enc', 5_242_880, 52.8),
      benchmarkRow('rc4', 'enc', 5_242_880, 255.1),
      benchmarkRow('aes', 'hmac', 5_242_880, 430.5, 60),
    ],
  },
  {
    run_id: 'run-live-2026-10-27',
    source: 'live',
    created_at: '2026-10-27T08:05:00+07:00',
    env: {
      cpu: 'Mock CPU (AES-NI Enabled)',
      aes_ni: null,
      python: '3.12.4',
      pycryptodome: '3.21.0',
      os: 'Windows 11 (10.0.26200)',
      protocol: 'Sampel dari alur simpan/baca item yang benar-benar dijalankan',
      parameters: {
        aes: { key_bits: 256, nonce_bytes: 8, hmac: true },
        des: { key_bits: 56, nonce_bytes: 4, hmac: true },
        rc4: { key_bits: 128, nonce_bytes: 0, hmac: true, drop_bytes: 3072 },
      },
    },
    // Live sampling follows real traffic, so the sample counts differ per
    // cipher and some points have not reached 30 samples yet.
    rows: [
      benchmarkRow('aes', 'enc', 2_097_152, 804.3, 42),
      benchmarkRow('des', 'enc', 2_097_152, 53.2, 31),
      benchmarkRow('rc4', 'enc', 2_097_152, 262.5, 30),
      benchmarkRow('aes', 'dec', 2_097_152, 798.1, 12),
      benchmarkRow('aes', 'hmac', 2_097_152, 433.9, 54),
      benchmarkRow('aes', 'wrap', 2_097_152, null, 42),
    ],
  },
]

export const handlers = [
  http.get('*/api/settings', () => {
    return HttpResponse.json(mockState.settings, { status: 200 })
  }),

  http.get('*/api/policy', () => {
    return HttpResponse.json(
      {
        version: mockState.policyVersion,
        text_markdown: mockState.policyMarkdown,
      },
      { status: 200 },
    )
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown
      password?: unknown
    } | null

    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const rawPassword = typeof body?.password === 'string' ? body.password : ''

    const fields: Record<string, string> = {}
    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      fields.email = 'Format email tidak valid'
    }
    if (rawPassword.length < 10) {
      fields.password = 'Password minimal 10 karakter'
    }

    if (Object.keys(fields).length > 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Data pendaftaran tidak valid',
            details: { fields },
          },
        },
        { status: 400 },
      )
    }

    if (mockState.accounts.has(rawEmail)) {
      return HttpResponse.json(
        {
          error: {
            code: 'email_taken',
            message: 'Email sudah terdaftar',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const newUserId = `00000000-0000-4000-8000-${String(++mockState.nextIdCounter).padStart(12, '0')}`
    const newUser: Me = {
      id: newUserId,
      email: rawEmail,
      role: 'peserta',
      full_name: null,
      verification_status: 'belum_lengkap',
      verification_note: null,
      consent: null,
      current_policy_version: mockState.policyVersion,
      team: null,
    }

    mockState.accounts.set(rawEmail, {
      password: rawPassword,
      user: newUser,
      profile: createEmptyProfile(),
      documents: createEmptyDocuments(),
      teamId: null,
    })

    const { user, csrfCookieHeader } = issueSessionForEmail(rawEmail)
    return HttpResponse.json(
      { user },
      {
        status: 201,
        headers: {
          'Set-Cookie': csrfCookieHeader,
        },
      },
    )
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown
      password?: unknown
    } | null

    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const rawPassword = typeof body?.password === 'string' ? body.password : ''

    const record = mockState.accounts.get(rawEmail)
    if (!record || record.password !== rawPassword) {
      return HttpResponse.json(
        {
          error: {
            code: 'invalid_credentials',
            message: 'Email atau password salah',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const { user, csrfCookieHeader } = issueSessionForEmail(rawEmail)
    return HttpResponse.json(
      { user },
      {
        status: 200,
        headers: {
          'Set-Cookie': csrfCookieHeader,
        },
      },
    )
  }),

  http.post('*/api/auth/logout', ({ request }) => {
    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    mockState.activeEmail = null
    mockState.csrfToken = null
    setBrowserCsrfCookie(null)

    return new HttpResponse(null, {
      status: 204,
      headers: {
        'Set-Cookie': `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`,
      },
    })
  }),

  http.get('*/api/me', () => {
    const record = getAuthenticatedRecord()
    if (!record) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif atau sudah kedaluwarsa',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    return HttpResponse.json(
      {
        ...record.user,
        current_policy_version: mockState.policyVersion,
      },
      { status: 200 },
    )
  }),

  http.post('*/api/consent', async ({ request }) => {
    const record = getAuthenticatedRecord()
    if (!record) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    if (record.user.role !== 'peserta') {
      return HttpResponse.json(
        {
          error: {
            code: 'forbidden',
            message: 'Hanya peserta yang dapat menyetujui kebijakan privasi peserta',
            details: {},
          },
        },
        { status: 403 },
      )
    }

    const body = (await request.json().catch(() => null)) as {
      policy_version?: unknown
    } | null

    if (body?.policy_version !== mockState.policyVersion) {
      return HttpResponse.json(
        {
          error: {
            code: 'policy_outdated',
            message: 'Versi kebijakan privasi sudah usang, silakan muat ulang versi terbaru',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const consent: ConsentInfo = {
      policy_version: mockState.policyVersion,
      agreed_at: new Date().toISOString(),
    }

    record.user = {
      ...record.user,
      consent,
      current_policy_version: mockState.policyVersion,
    }

    return HttpResponse.json(consent, { status: 201 })
  }),

  http.get('*/api/profile', () => {
    const guard = requirePesertaWithConsent(getAuthenticatedRecord())
    if (!guard.ok) {
      return guard.response
    }
    return HttpResponse.json(guard.record.profile, { status: 200 })
  }),

  http.put('*/api/profile', async ({ request }) => {
    const rawRecord = getAuthenticatedRecord()
    if (!rawRecord) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const guard = requirePesertaWithConsent(rawRecord)
    if (!guard.ok) {
      return guard.response
    }
    const { record } = guard

    if (isRegistrationDeadlinePassed()) {
      return HttpResponse.json(
        {
          error: {
            code: 'deadline_passed',
            message: 'Tenggat pendaftaran telah terlewat.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const body = (await request.json().catch(() => null)) as Partial<
      Record<keyof UpdateProfileRequest, unknown>
    > | null

    const candidate: UpdateProfileRequest = {
      full_name: typeof body?.full_name === 'string' ? body.full_name : '',
      nim: typeof body?.nim === 'string' ? body.nim : '',
      study_program: typeof body?.study_program === 'string' ? body.study_program : '',
      institution: typeof body?.institution === 'string' ? body.institution : '',
      birth_date: typeof body?.birth_date === 'string' ? body.birth_date : '',
      domicile: typeof body?.domicile === 'string' ? body.domicile : '',
      phone: typeof body?.phone === 'string' ? body.phone : '',
    }

    const fieldErrors = validateProfileForm(candidate)
    if (Object.keys(fieldErrors).length > 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Data tidak valid',
            details: { fields: fieldErrors },
          },
        },
        { status: 400 },
      )
    }

    const normalized = normalizeProfileInput(candidate)
    const changedSensitive = getChangedReverifyFields(record.profile, normalized)
    const age = computeAgeFromBirthDate(normalized.birth_date)
    const isMinor = age !== null ? age < 18 : null

    let nextStatus = record.profile.verification_status
    let nextNote = record.profile.verification_note ?? null

    if (nextStatus === 'terverifikasi' && changedSensitive.length > 0) {
      nextStatus = 'menunggu'
      nextNote = null
    } else if (
      (nextStatus === 'belum_lengkap' || nextStatus === 'ditolak') &&
      record.documents.documents_complete
    ) {
      nextStatus = 'menunggu'
      nextNote = null
    }

    record.profile = {
      ...normalized,
      age,
      is_minor: isMinor,
      profile_complete: true,
      verification_status: nextStatus,
      verification_note: nextNote,
    }

    record.user = {
      ...record.user,
      full_name: normalized.full_name,
      verification_status: nextStatus,
      verification_note: nextNote,
    }

    if (record.teamId) {
      const existingTeam = mockState.teams.get(record.teamId)
      if (existingTeam) {
        syncTeamDerivedState({
          ...existingTeam,
          members: existingTeam.members.map((m) =>
            m.user_id === record.user.id
              ? { ...m, full_name: normalized.full_name, profile_complete: true }
              : m,
          ),
        })
      }
    }

    return HttpResponse.json(record.profile, { status: 200 })
  }),

  http.get('*/api/documents', () => {
    const guard = requirePesertaWithConsent(getAuthenticatedRecord())
    if (!guard.ok) {
      return guard.response
    }
    return HttpResponse.json(guard.record.documents, { status: 200 })
  }),

  http.post('*/api/documents/:type', async ({ request, params }) => {
    const rawRecord = getAuthenticatedRecord()
    if (!rawRecord) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const docType = String(params.type) as DocumentType
    if (!DOCUMENT_TYPES.includes(docType)) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'Tipe dokumen tidak dikenal',
            details: {},
          },
        },
        { status: 404 },
      )
    }

    const guard = requirePesertaWithConsent(rawRecord)
    if (!guard.ok) {
      return guard.response
    }
    const { record } = guard

    if (isRegistrationDeadlinePassed()) {
      return HttpResponse.json(
        {
          error: {
            code: 'deadline_passed',
            message: 'Tenggat pendaftaran telah terlewat.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const rawBuffer = await request.arrayBuffer()
    const rawBytes = new Uint8Array(rawBuffer)

    if (rawBytes.byteLength > mockState.settings.limits.document_max_bytes) {
      return HttpResponse.json(
        {
          error: {
            code: 'too_large',
            message: 'Ukuran dokumen melebihi batas 5 MB',
            details: {},
          },
        },
        { status: 413 },
      )
    }

    const detectedMime = detectMagicMimeFromBytes(rawBytes)
    if (
      rawBytes.byteLength === 0 ||
      !detectedMime ||
      !(DOCUMENT_ALLOWED_MIMES as readonly string[]).includes(detectedMime)
    ) {
      return HttpResponse.json(
        {
          error: {
            code: 'unsupported_type',
            message: 'Tipe file (dari magic bytes) tidak diizinkan. Gunakan JPG, PNG, atau PDF.',
            details: {},
          },
        },
        { status: 415 },
      )
    }

    const validatedMime = detectedMime as AllowedDocumentMime

    const encodedFilename = request.headers.get('X-Filename') ?? `${docType}.pdf`
    let originalFilename = encodedFilename
    try {
      originalFilename = decodeURIComponent(encodedFilename)
    } catch {
      originalFilename = encodedFilename
    }

    const previousItem = record.documents[docType]
    if (previousItem) {
      mockState.items.delete(previousItem.item_id)
    }

    const newItem: ItemMeta = {
      item_id: `11111111-2222-4333-8444-${String(++mockState.nextIdCounter).padStart(12, '0')}`,
      field: docType,
      content_type: validatedMime,
      size_bytes: rawBytes.byteLength,
      original_filename: originalFilename,
      uploaded_at: new Date().toISOString(),
    }

    mockState.items.set(newItem.item_id, {
      meta: newItem,
      bytes: rawBytes,
      ownerEmail: record.user.email,
      tampered: false,
    })

    record.documents = {
      ...record.documents,
      [docType]: newItem,
    }
    const docsComplete = Boolean(
      record.documents.ktp && record.documents.ktm && record.documents.twibbon,
    )
    record.documents.documents_complete = docsComplete

    if (docsComplete && record.profile.profile_complete) {
      record.profile.verification_status = 'menunggu'
      record.profile.verification_note = null
      record.user.verification_status = 'menunggu'
      record.user.verification_note = null
    }

    if (record.teamId) {
      const existingTeam = mockState.teams.get(record.teamId)
      if (existingTeam) {
        syncTeamDerivedState({
          ...existingTeam,
          members: existingTeam.members.map((m) =>
            m.user_id === record.user.id ? { ...m, documents_complete: docsComplete } : m,
          ),
        })
      }
    }

    return HttpResponse.json(
      {
        ...newItem,
        verification_status: record.profile.verification_status,
      },
      { status: 201 },
    )
  }),

  http.get('*/api/items/:itemId', ({ request, params }) => {
    const record = getAuthenticatedRecord()
    if (!record) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif atau sudah kedaluwarsa',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const itemId = String(params.itemId)
    const stored = mockState.items.get(itemId)

    // Access table from the contract: a peserta opens its own items, a juri opens
    // proposal/video of teams that already submitted final, a superadmin opens all.
    const belongsToFinalizedTeam =
      stored !== undefined &&
      (stored.meta.field === 'proposal' || stored.meta.field === 'video') &&
      Array.from(mockState.teams.values()).some(
        (team) =>
          team.status === 'final' &&
          (team.submission.proposal?.item_id === stored.meta.item_id ||
            team.submission.video?.item_id === stored.meta.item_id),
      )

    const canAccess =
      stored &&
      (record.user.role === 'superadmin' ||
        (record.user.role === 'peserta' && stored.ownerEmail === record.user.email) ||
        (record.user.role === 'juri' && belongsToFinalizedTeam))

    if (!stored || !canAccess) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'File tidak ditemukan atau Anda tidak memiliki hak akses.',
            details: {},
          },
        },
        { status: 404 },
      )
    }

    if (stored.tampered) {
      return HttpResponse.json(
        {
          error: {
            code: 'integrity_error',
            message: 'HMAC atau pencocokan tiga cipher gagal; insiden dicatat.',
            details: {},
          },
        },
        { status: 500 },
      )
    }

    const url = new URL(request.url)
    const isDownload = url.searchParams.get('download') === '1'
    const dispositionType = isDownload ? 'attachment' : 'inline'
    const encodedName = encodeURIComponent(stored.meta.original_filename)

    const payloadBuffer = stored.bytes.buffer.slice(
      stored.bytes.byteOffset,
      stored.bytes.byteOffset + stored.bytes.byteLength,
    ) as ArrayBuffer

    return new HttpResponse(payloadBuffer, {
      status: 200,
      headers: {
        'Content-Type': stored.meta.content_type,
        'Content-Length': String(stored.bytes.byteLength),
        'Content-Disposition': `${dispositionType}; filename*=UTF-8''${encodedName}`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }),

  http.post('*/api/teams', async ({ request }) => {
    const rawRecord = getAuthenticatedRecord()
    if (!rawRecord) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const guard = requirePesertaWithConsent(rawRecord)
    if (!guard.ok) {
      return guard.response
    }
    const { record } = guard

    if (isRegistrationDeadlinePassed()) {
      return HttpResponse.json(
        {
          error: {
            code: 'deadline_passed',
            message: 'Tenggat pendaftaran telah terlewat.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    if (record.teamId !== null) {
      return HttpResponse.json(
        {
          error: {
            code: 'already_in_team',
            message: 'Anda sudah tergabung di dalam sebuah tim.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const body = (await request.json().catch(() => null)) as { name?: unknown } | null
    const rawName = typeof body?.name === 'string' ? body.name : ''
    const nameError = validateTeamName(rawName)
    if (nameError) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Nama tim tidak valid',
            details: { fields: { name: nameError } },
          },
        },
        { status: 400 },
      )
    }

    const counter = ++mockState.nextIdCounter
    const newTeamId = `22222222-3333-4444-8555-${String(counter).padStart(12, '0')}`
    const trimmedName = rawName.trim()

    let inviteCode = generateMockInviteCode(counter)
    const existingCodes = new Set(Array.from(mockState.teams.values(), (t) => t.code))
    let attempt = counter
    while (existingCodes.has(inviteCode)) {
      inviteCode = generateMockInviteCode(++attempt)
    }

    const createdTeam: Team = {
      id: newTeamId,
      name: trimmedName,
      code: inviteCode,
      status: 'draft',
      leader_id: record.user.id,
      created_at: new Date().toISOString(),
      finalized_at: null,
      members: [
        {
          user_id: record.user.id,
          full_name: record.profile.full_name,
          is_leader: true,
          profile_complete: record.profile.profile_complete,
          documents_complete: record.documents.documents_complete,
        },
      ],
      submission: {
        proposal: null,
        video: null,
        repo_url: null,
      },
      finalize_missing: [],
    }

    const synced = syncTeamDerivedState(createdTeam)
    return HttpResponse.json({ team: synced }, { status: 201 })
  }),

  http.post('*/api/teams/join', async ({ request }) => {
    const rawRecord = getAuthenticatedRecord()
    if (!rawRecord) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const guard = requirePesertaWithConsent(rawRecord)
    if (!guard.ok) {
      return guard.response
    }
    const { record } = guard

    if (record.teamId !== null) {
      return HttpResponse.json(
        {
          error: {
            code: 'already_in_team',
            message: 'Anda sudah tergabung di dalam sebuah tim.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const body = (await request.json().catch(() => null)) as { code?: unknown } | null
    const rawCode = typeof body?.code === 'string' ? body.code : ''
    const normalizedCode = normalizeInviteCode(rawCode)

    if (!normalizedCode) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Kode tim wajib diisi.',
            details: { fields: { code: 'Kode undangan wajib diisi.' } },
          },
        },
        { status: 400 },
      )
    }

    const targetTeam = Array.from(mockState.teams.values()).find(
      (t) => t.code.toUpperCase() === normalizedCode,
    )

    if (!targetTeam) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'Kode tim tidak ditemukan. Periksa kembali kode undangan 8 karakter Anda.',
            details: {},
          },
        },
        { status: 404 },
      )
    }

    if (targetTeam.status === 'final') {
      return HttpResponse.json(
        {
          error: {
            code: 'team_locked',
            message: 'Tim sudah berstatus Final dan terkunci dari penambahan anggota baru.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    if (targetTeam.members.length >= mockState.settings.max_team_size) {
      return HttpResponse.json(
        {
          error: {
            code: 'team_full',
            message: `Tim sudah penuh (maksimal ${mockState.settings.max_team_size} anggota).`,
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const updatedTeam = syncTeamDerivedState({
      ...targetTeam,
      members: [
        ...targetTeam.members,
        {
          user_id: record.user.id,
          full_name: record.profile.full_name,
          is_leader: false,
          profile_complete: record.profile.profile_complete,
          documents_complete: record.documents.documents_complete,
        },
      ],
    })

    return HttpResponse.json({ team: updatedTeam }, { status: 200 })
  }),

  http.get('*/api/teams/me', () => {
    const guard = requirePesertaWithConsent(getAuthenticatedRecord())
    if (!guard.ok) {
      return guard.response
    }
    const team = guard.record.teamId ? (mockState.teams.get(guard.record.teamId) ?? null) : null
    return HttpResponse.json({ team }, { status: 200 })
  }),

  http.post('*/api/teams/me/leave', ({ request }) => {
    const rawRecord = getAuthenticatedRecord()
    if (!rawRecord) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const guard = requirePesertaWithConsent(rawRecord)
    if (!guard.ok) {
      return guard.response
    }
    const { record } = guard

    if (!record.teamId) {
      return HttpResponse.json(
        {
          error: {
            code: 'no_team',
            message: 'Anda belum tergabung dalam tim mana pun.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const team = mockState.teams.get(record.teamId)
    if (!team) {
      record.teamId = null
      record.user = { ...record.user, team: null }
      return HttpResponse.json(
        {
          error: {
            code: 'no_team',
            message: 'Tim tidak ditemukan.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    if (team.status === 'final') {
      return HttpResponse.json(
        {
          error: {
            code: 'team_locked',
            message: 'Tim sudah difinalisasi sehingga anggota tidak dapat keluar.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    if (team.leader_id === record.user.id) {
      return HttpResponse.json(
        {
          error: {
            code: 'leader_cannot_leave',
            message: 'Ketua tim tidak dapat keluar dari tim.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    record.teamId = null
    record.user = { ...record.user, team: null }

    syncTeamDerivedState({
      ...team,
      members: team.members.filter((m) => m.user_id !== record.user.id),
    })

    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('*/api/teams/me/members/:userId', ({ request, params }) => {
    const rawRecord = getAuthenticatedRecord()
    if (!rawRecord) {
      return HttpResponse.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'Sesi belum aktif',
            details: {},
          },
        },
        { status: 401 },
      )
    }

    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const guard = requirePesertaWithConsent(rawRecord)
    if (!guard.ok) {
      return guard.response
    }
    const { record } = guard

    const team = record.teamId ? (mockState.teams.get(record.teamId) ?? null) : null
    if (!team) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'Anda belum memiliki tim.',
            details: {},
          },
        },
        { status: 404 },
      )
    }

    if (team.leader_id !== record.user.id) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_leader',
            message: 'Hanya Ketua Tim yang dapat mengeluarkan anggota.',
            details: {},
          },
        },
        { status: 403 },
      )
    }

    if (team.status === 'final') {
      return HttpResponse.json(
        {
          error: {
            code: 'team_locked',
            message: 'Tim sudah berstatus Final sehingga susunan anggota terkunci.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const targetUserId = String(params.userId)
    const memberExists = team.members.some(
      (m) => m.user_id === targetUserId && !m.is_leader,
    )
    if (!memberExists) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'Anggota tidak ditemukan pada tim ini.',
            details: {},
          },
        },
        { status: 404 },
      )
    }

    const kickedAccount = findAccountByUserId(targetUserId)
    if (kickedAccount) {
      kickedAccount.teamId = null
      kickedAccount.user = { ...kickedAccount.user, team: null }
    }

    syncTeamDerivedState({
      ...team,
      members: team.members.filter((m) => m.user_id !== targetUserId),
    })

    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/api/teams/me/proposal', async ({ request }) => {
    const gate = requireSubmissionLeader(request)
    if (!gate.ok) {
      return gate.response
    }
    const { record, team } = gate

    const rawBytes = new Uint8Array(await request.arrayBuffer())

    if (rawBytes.byteLength > mockState.settings.limits.proposal_max_bytes) {
      return HttpResponse.json(
        {
          error: { code: 'too_large', message: 'Ukuran proposal melebihi batas 10 MB', details: {} },
        },
        { status: 413 },
      )
    }

    if (rawBytes.byteLength === 0 || detectMagicMimeFromBytes(rawBytes) !== 'application/pdf') {
      return HttpResponse.json(
        {
          error: {
            code: 'unsupported_type',
            message: 'Proposal harus berupa file PDF.',
            details: {},
          },
        },
        { status: 415 },
      )
    }

    const encodedFilename = request.headers.get('X-Filename') ?? 'proposal.pdf'
    let originalFilename = encodedFilename
    try {
      originalFilename = decodeURIComponent(encodedFilename)
    } catch {
      originalFilename = encodedFilename
    }

    // Re-uploading replaces the previous version.
    const previous = team.submission.proposal
    if (previous) {
      mockState.items.delete(previous.item_id)
    }

    const newItem: ItemMeta = {
      item_id: `33333333-4444-4555-8666-${String(++mockState.nextIdCounter).padStart(12, '0')}`,
      field: 'proposal',
      content_type: 'application/pdf',
      size_bytes: rawBytes.byteLength,
      original_filename: originalFilename,
      uploaded_at: new Date().toISOString(),
    }

    mockState.items.set(newItem.item_id, {
      meta: newItem,
      bytes: rawBytes,
      ownerEmail: record.user.email,
      tampered: false,
    })

    syncTeamDerivedState({
      ...team,
      submission: { ...team.submission, proposal: newItem },
    })

    return HttpResponse.json(newItem, { status: 201 })
  }),

  http.post('*/api/teams/me/video', async ({ request }) => {
    const gate = requireSubmissionLeader(request)
    if (!gate.ok) {
      return gate.response
    }
    const { record, team } = gate

    const rawBytes = new Uint8Array(await request.arrayBuffer())

    if (rawBytes.byteLength > mockState.settings.limits.video_max_bytes) {
      return HttpResponse.json(
        {
          error: { code: 'too_large', message: 'Ukuran video melebihi batas 100 MB', details: {} },
        },
        { status: 413 },
      )
    }

    if (rawBytes.byteLength === 0 || detectMagicMimeFromBytes(rawBytes) !== 'video/mp4') {
      return HttpResponse.json(
        {
          error: {
            code: 'unsupported_type',
            message: 'Video demo harus berupa file MP4.',
            details: {},
          },
        },
        { status: 415 },
      )
    }

    const encodedFilename = request.headers.get('X-Filename') ?? 'demo.mp4'
    let originalFilename = encodedFilename
    try {
      originalFilename = decodeURIComponent(encodedFilename)
    } catch {
      originalFilename = encodedFilename
    }

    // Re-uploading replaces the previous version.
    const previous = team.submission.video
    if (previous) {
      mockState.items.delete(previous.item_id)
    }

    const newItem: ItemMeta = {
      item_id: `44444444-5555-4666-8777-${String(++mockState.nextIdCounter).padStart(12, '0')}`,
      field: 'video',
      content_type: 'video/mp4',
      size_bytes: rawBytes.byteLength,
      original_filename: originalFilename,
      uploaded_at: new Date().toISOString(),
    }

    mockState.items.set(newItem.item_id, {
      meta: newItem,
      bytes: rawBytes,
      ownerEmail: record.user.email,
      tampered: false,
    })

    syncTeamDerivedState({
      ...team,
      submission: { ...team.submission, video: newItem },
    })

    return HttpResponse.json(newItem, { status: 201 })
  }),

  http.put('*/api/teams/me/repo', async ({ request }) => {
    const gate = requireSubmissionLeader(request)
    if (!gate.ok) {
      return gate.response
    }
    const { team } = gate

    const body = (await request.json().catch(() => null)) as { repo_url?: unknown } | null
    const rawUrl = typeof body?.repo_url === 'string' ? body.repo_url : ''
    const urlError = validateRepoUrl(rawUrl)
    if (urlError) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Data tidak valid',
            details: { fields: { repo_url: urlError } },
          },
        },
        { status: 400 },
      )
    }

    const normalizedUrl = normalizeRepoUrl(rawUrl)
    syncTeamDerivedState({
      ...team,
      submission: { ...team.submission, repo_url: normalizedUrl },
    })

    return HttpResponse.json({ repo_url: normalizedUrl }, { status: 200 })
  }),

  http.post('*/api/teams/me/finalize', async ({ request }) => {
    const gate = requireSubmissionLeader(request)
    if (!gate.ok) {
      return gate.response
    }
    const { team } = gate

    const body = (await request.json().catch(() => null)) as { confirm?: unknown } | null
    if (body?.confirm !== true) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Konfirmasi submit final wajib dikirim.',
            details: { fields: { confirm: 'Nilai confirm harus true.' } },
          },
        },
        { status: 400 },
      )
    }

    const missing = computeFinalizeMissing(team, mockState.settings.min_team_size)
    if (missing.length > 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'finalize_requirements',
            message: 'Syarat submit final belum lengkap.',
            details: { missing },
          },
        },
        { status: 409 },
      )
    }

    const finalized = syncTeamDerivedState({
      ...team,
      status: 'final',
      finalized_at: new Date().toISOString(),
    })

    return HttpResponse.json({ team: finalized }, { status: 200 })
  }),

  /* ------------------------------------------------------------------ */
  /* Juri                                                                */
  /* ------------------------------------------------------------------ */

  http.get('*/api/juri/teams', () => {
    const gate = requireRole('juri')
    if (!gate.ok) {
      return gate.response
    }

    const teams: JuriTeamSummary[] = Array.from(mockState.teams.values())
      .filter((team) => team.status === 'final' && team.finalized_at)
      .sort((a, b) => String(b.finalized_at).localeCompare(String(a.finalized_at)))
      .map((team) => ({
        id: team.id,
        name: team.name,
        finalized_at: String(team.finalized_at),
        member_count: team.members.length,
      }))

    return HttpResponse.json({ teams }, { status: 200 })
  }),

  http.get('*/api/juri/teams/:teamId', ({ params }) => {
    const gate = requireRole('juri')
    if (!gate.ok) {
      return gate.response
    }

    const team = mockState.teams.get(String(params.teamId))
    if (!team || team.status !== 'final' || !team.finalized_at) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'Tim tidak ditemukan atau belum submit final.',
            details: {},
          },
        },
        { status: 404 },
      )
    }

    // Opening the detail is logged: it carries member names.
    recordAuditLog(gate.record, 'view_profile', { subject_user_id: team.leader_id })

    return HttpResponse.json(
      {
        team: {
          id: team.id,
          name: team.name,
          finalized_at: team.finalized_at,
          members: team.members.map((member) => ({
            full_name: member.full_name,
            institution:
              mockState.accounts.get(
                Array.from(mockState.accounts.values()).find(
                  (account) => account.user.id === member.user_id,
                )?.user.email ?? '',
              )?.profile.institution ?? null,
            is_leader: member.is_leader,
          })),
          proposal: team.submission.proposal,
          video: team.submission.video,
          repo_url: team.submission.repo_url,
        },
      },
      { status: 200 },
    )
  }),

  /* ------------------------------------------------------------------ */
  /* Superadmin                                                          */
  /* ------------------------------------------------------------------ */

  http.get('*/api/admin/participants', ({ request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status')

    const rows: AdminParticipantListItem[] = Array.from(mockState.accounts.values())
      .filter((account) => account.user.role === 'peserta')
      .filter(
        (account) =>
          !statusFilter || account.profile.verification_status === statusFilter,
      )
      .map((account) => {
        const team = account.teamId ? mockState.teams.get(account.teamId) : null
        return {
          user_id: account.user.id,
          email: account.user.email,
          full_name: account.profile.full_name,
          institution: account.profile.institution,
          age: account.profile.age,
          is_minor: account.profile.is_minor,
          verification_status: account.profile.verification_status,
          documents_complete: account.documents.documents_complete,
          team_name: team?.name ?? null,
        }
      })

    return HttpResponse.json(paginate(rows, url), { status: 200 })
  }),

  http.get('*/api/admin/participants/:userId', ({ params }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const account = Array.from(mockState.accounts.values()).find(
      (candidate) =>
        candidate.user.id === String(params.userId) && candidate.user.role === 'peserta',
    )
    if (!account) {
      return HttpResponse.json(
        {
          error: { code: 'not_found', message: 'Peserta tidak ditemukan.', details: {} },
        },
        { status: 404 },
      )
    }

    recordAuditLog(gate.record, 'view_profile', { subject_user_id: account.user.id })

    const team = account.teamId ? mockState.teams.get(account.teamId) : null

    return HttpResponse.json(
      {
        user_id: account.user.id,
        email: account.user.email,
        profile: account.profile,
        documents: account.documents,
        verification_status: account.profile.verification_status,
        verification_note: account.profile.verification_note,
        team: team ? { id: team.id, name: team.name, status: team.status } : null,
      },
      { status: 200 },
    )
  }),

  http.patch('*/api/admin/participants/:userId', async ({ request, params }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }
    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const account = Array.from(mockState.accounts.values()).find(
      (candidate) =>
        candidate.user.id === String(params.userId) && candidate.user.role === 'peserta',
    )
    if (!account) {
      return HttpResponse.json(
        {
          error: { code: 'not_found', message: 'Peserta tidak ditemukan.', details: {} },
        },
        { status: 404 },
      )
    }

    const body = (await request.json().catch(() => null)) as
      | { verification_status?: unknown; note?: unknown }
      | null
    const decision = body?.verification_status
    const note = typeof body?.note === 'string' ? body.note.trim() : ''

    if (decision !== 'terverifikasi' && decision !== 'ditolak') {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Data tidak valid',
            details: {
              fields: {
                verification_status: 'Nilai harus terverifikasi atau ditolak.',
              },
            },
          },
        },
        { status: 400 },
      )
    }

    if (decision === 'ditolak' && note.length === 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Data tidak valid',
            details: { fields: { note: 'Catatan wajib diisi saat menolak peserta.' } },
          },
        },
        { status: 400 },
      )
    }

    const nextStatus = decision as VerificationStatus
    const nextNote = decision === 'ditolak' ? note : note.length > 0 ? note : null

    account.profile = {
      ...account.profile,
      verification_status: nextStatus,
      verification_note: nextNote,
    }
    account.user = {
      ...account.user,
      verification_status: nextStatus,
      verification_note: nextNote,
    }

    recordAuditLog(gate.record, 'verify_participant', {
      subject_user_id: account.user.id,
    })

    return HttpResponse.json(
      {
        user_id: account.user.id,
        verification_status: nextStatus,
        verification_note: nextNote,
      },
      { status: 200 },
    )
  }),

  http.get('*/api/admin/teams', ({ request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const rows: AdminTeamListItem[] = Array.from(mockState.teams.values()).map((team) => {
      const { leaderName, memberCount } = teamMemberNames(team)
      return {
        id: team.id,
        name: team.name,
        status: team.status,
        member_count: memberCount,
        leader_name: leaderName,
        finalized_at: team.finalized_at,
      }
    })

    return HttpResponse.json(paginate(rows, new URL(request.url)), { status: 200 })
  }),

  http.get('*/api/admin/juri', () => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const juri: AdminJuriAccount[] = Array.from(mockState.accounts.values())
      .filter((account) => account.user.role === 'juri')
      .map((account) => ({
        user_id: account.user.id,
        email: account.user.email,
        created_at:
          mockState.juriCreatedAt.get(account.user.email) ?? DEFAULT_JURI_CREATED_AT,
        team_ids: mockState.juriAssignments.get(account.user.id) ?? [],
      }))

    return HttpResponse.json({ juri }, { status: 200 })
  }),

  http.put('*/api/admin/juri/:juriId/assignments', async ({ params, request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const juriId = String(params.juriId)
    const body = (await request.json()) as { team_ids: string[] }
    const teamIds = Array.from(new Set(body.team_ids))
    mockState.juriAssignments.set(juriId, teamIds)
    recordAuditLog(gate.record, 'assign_juri', { subject_user_id: juriId })

    return HttpResponse.json({ juri_id: juriId, team_ids: teamIds }, { status: 200 })
  }),

  http.post('*/api/admin/juri', async ({ request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }
    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const body = (await request.json().catch(() => null)) as
      | { email?: unknown; password?: unknown }
      | null
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    const fields: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fields.email = 'Format email tidak valid.'
    }
    if (password.length < 8) {
      fields.password = 'Kata sandi minimal 8 karakter.'
    }
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json(
        {
          error: { code: 'validation_error', message: 'Data tidak valid', details: { fields } },
        },
        { status: 400 },
      )
    }

    if (mockState.accounts.has(email)) {
      return HttpResponse.json(
        {
          error: {
            code: 'email_taken',
            message: 'Email sudah terdaftar.',
            details: {},
          },
        },
        { status: 409 },
      )
    }

    const userId = `e4d3c2b1-a098-4765-8432-${String(++mockState.nextIdCounter).padStart(12, '0')}`
    mockState.accounts.set(email, {
      password,
      user: {
        id: userId,
        email,
        role: 'juri',
        full_name: null,
        verification_status: null,
        verification_note: null,
        consent: null,
        current_policy_version: mockState.policyVersion,
        team: null,
      },
      profile: createEmptyProfile(),
      documents: { ktp: null, ktm: null, twibbon: null, documents_complete: false },
      teamId: null,
    })
    mockState.juriCreatedAt.set(email, new Date().toISOString())

    recordAuditLog(gate.record, 'create_juri', { subject_user_id: userId })

    return HttpResponse.json({ user_id: userId, email, role: 'juri' }, { status: 201 })
  }),

  http.put('*/api/admin/settings', async ({ request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }
    const csrfError = verifyCsrf(request)
    if (csrfError) {
      return csrfError
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const registrationDeadline =
      typeof body?.registration_deadline === 'string' ? body.registration_deadline : ''
    const submissionDeadline =
      typeof body?.submission_deadline === 'string' ? body.submission_deadline : ''
    const minTeamSize = Number(body?.min_team_size)
    const maxTeamSize = Number(body?.max_team_size)

    const fields: Record<string, string> = {}
    if (Number.isNaN(Date.parse(registrationDeadline))) {
      fields.registration_deadline = 'Tanggal tenggat tidak valid.'
    }
    if (Number.isNaN(Date.parse(submissionDeadline))) {
      fields.submission_deadline = 'Tanggal tenggat tidak valid.'
    }
    if (!Number.isInteger(minTeamSize) || minTeamSize < 1) {
      fields.min_team_size = 'Jumlah anggota minimum harus bilangan bulat positif.'
    }
    if (!Number.isInteger(maxTeamSize) || maxTeamSize < 1) {
      fields.max_team_size = 'Jumlah anggota maksimum harus bilangan bulat positif.'
    }
    if (!fields.min_team_size && !fields.max_team_size && minTeamSize > maxTeamSize) {
      fields.min_team_size = 'Jumlah anggota minimum tidak boleh melebihi maksimum.'
    }
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json(
        {
          error: { code: 'validation_error', message: 'Data tidak valid', details: { fields } },
        },
        { status: 400 },
      )
    }

    mockState.settings = {
      ...mockState.settings,
      registration_deadline: registrationDeadline,
      submission_deadline: submissionDeadline,
      min_team_size: minTeamSize,
      max_team_size: maxTeamSize,
    }

    recordAuditLog(gate.record, 'update_settings')

    return HttpResponse.json(mockState.settings, { status: 200 })
  }),

  http.get('*/api/admin/audit-logs', ({ request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const url = new URL(request.url)
    const actorId = url.searchParams.get('actor_id')
    const action = url.searchParams.get('action')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const rows = mockState.auditLogs.filter((entry) => {
      if (actorId && entry.actor_id !== actorId) {
        return false
      }
      if (action && entry.action !== action) {
        return false
      }
      if (from && Date.parse(entry.created_at) < Date.parse(from)) {
        return false
      }
      if (to && Date.parse(entry.created_at) > Date.parse(to)) {
        return false
      }
      return true
    })

    return HttpResponse.json(paginate(rows, url), { status: 200 })
  }),

  http.get('*/api/admin/benchmarks', ({ request }) => {
    const gate = requireRole('superadmin')
    if (!gate.ok) {
      return gate.response
    }

    const url = new URL(request.url)
    const operation = url.searchParams.get('operation')
    const source = (url.searchParams.get('source') ?? 'controlled') as BenchmarkSource
    const requestedRunId = url.searchParams.get('run_id')

    if (!BENCHMARK_SOURCE_VALUES.includes(source)) {
      return HttpResponse.json(
        { error: { code: 'validation_error', message: 'Nilai query source tidak valid.' } },
        { status: 400 },
      )
    }
    if (operation && !BENCHMARK_OPERATION_VALUES.includes(operation as BenchmarkOperation)) {
      return HttpResponse.json(
        { error: { code: 'validation_error', message: 'Nilai query operation tidak valid.' } },
        { status: 400 },
      )
    }

    // Newest first, matching the API's own ordering.
    const runs = MOCK_BENCHMARK_RUNS.filter((run) => run.source === source)
    const selected = requestedRunId
      ? runs.find((run) => run.run_id === requestedRunId)
      : runs[0]

    if (requestedRunId && !selected) {
      return HttpResponse.json(
        {
          error: {
            code: 'not_found',
            message: 'Run benchmark tidak ditemukan pada source ini.',
          },
        },
        { status: 404 },
      )
    }

    const body: AdminBenchmarksResponse = {
      run_id: selected?.run_id ?? null,
      source,
      env: selected?.env ?? null,
      runs: runs.map((run) => ({
        run_id: run.run_id,
        created_at: run.created_at,
        sample_count: run.rows.reduce((total, row) => total + row.n, 0),
      })),
      rows: (selected?.rows ?? []).filter((row) => !operation || row.operation === operation),
    }

    return HttpResponse.json(body, { status: 200 })
  }),
]
