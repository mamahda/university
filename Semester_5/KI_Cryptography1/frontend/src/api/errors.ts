/**
 * Typed API error codes and error envelope contract.
 * Source of truth: Dokumentasi API (Format error, pages 3-4).
 */

export const SERVER_API_ERROR_CODES = [
  // 400
  'validation_error',
  // 401
  'unauthenticated',
  'invalid_credentials',
  // 403
  'forbidden',
  'csrf_failed',
  'consent_required',
  'not_leader',
  // 404
  'not_found',
  // 409
  'email_taken',
  'conflict',
  'already_in_team',
  'no_team',
  'team_full',
  'team_locked',
  'leader_cannot_leave',
  'deadline_passed',
  'policy_outdated',
  'finalize_requirements',
  // 413
  'too_large',
  // 415
  'unsupported_type',
  // 429
  'rate_limited',
  // 500
  'integrity_error',
  'internal_error',
] as const

export type ServerApiErrorCode = (typeof SERVER_API_ERROR_CODES)[number]

export const CLIENT_TRANSPORT_ERROR_CODES = [
  'network_error',
  'parse_error',
  'aborted',
  'unknown_error',
] as const

export type ClientTransportErrorCode = (typeof CLIENT_TRANSPORT_ERROR_CODES)[number]

export const API_ERROR_CODES = [
  ...SERVER_API_ERROR_CODES,
  ...CLIENT_TRANSPORT_ERROR_CODES,
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

export type FinalizeMissingReason =
  | 'proposal'
  | 'video'
  | 'repo_url'
  | 'min_members'
  | 'members_incomplete'

export interface ApiErrorDetails {
  fields?: Record<string, string>
  missing?: FinalizeMissingReason[]
  [key: string]: unknown
}

export interface ApiErrorPayload {
  code: ApiErrorCode
  message: string
  details?: ApiErrorDetails | null
}

export interface ApiErrorEnvelope {
  error: ApiErrorPayload
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details: ApiErrorDetails | null

  constructor(params: {
    status: number
    code: ApiErrorCode
    message: string
    details?: ApiErrorDetails | null
  }) {
    super(params.message)
    this.name = 'ApiClientError'
    this.status = params.status
    this.code = params.code
    this.details = params.details ?? null
    Object.setPrototypeOf(this, new.target.prototype)
  }

  get fieldErrors(): Record<string, string> {
    if (this.details && typeof this.details.fields === 'object' && this.details.fields !== null) {
      return this.details.fields
    }
    return {}
  }

  get missingRequirements(): FinalizeMissingReason[] {
    if (this.details && Array.isArray(this.details.missing)) {
      return this.details.missing
    }
    return []
  }

  isUnauthenticated(): boolean {
    return this.status === 401 && this.code === 'unauthenticated'
  }

  isConsentRequired(): boolean {
    return this.status === 403 && this.code === 'consent_required'
  }

  isCsrfFailed(): boolean {
    return this.status === 403 && this.code === 'csrf_failed'
  }

  isValidationError(): boolean {
    return this.status === 400 && this.code === 'validation_error'
  }

  isIntegrityError(): boolean {
    return this.status === 500 && this.code === 'integrity_error'
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}
