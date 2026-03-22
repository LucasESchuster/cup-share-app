import 'server-only'
import { getToken } from '@/lib/session'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiValidationError extends ApiError {
  constructor(
    public errors: Record<string, string[]>,
    message: string
  ) {
    super(422, message)
    this.name = 'ApiValidationError'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()

  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  })

  if (res.status === 204) return undefined as T

  if (!res.ok) {
    const body = await res.text()
    if (res.status === 422) {
      try {
        const parsed = JSON.parse(body)
        throw new ApiValidationError(parsed.errors ?? {}, parsed.message ?? 'Validation failed')
      } catch (e) {
        if (e instanceof ApiValidationError) throw e
      }
    }
    throw new ApiError(res.status, body)
  }

  return res.json()
}
