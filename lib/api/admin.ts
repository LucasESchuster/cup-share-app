import 'server-only'
import { apiFetch } from './client'
import type {
  AdminUser,
  BrewMethod,
  BrewMethodInput,
  Equipment,
  EquipmentInput,
  MagicLink,
  MagicLinkFilters,
  Paginated,
} from '@/lib/types'

function unwrapOne<T>(response: T | { data: T }): T {
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
    const candidate = (response as { data: T }).data
    if (candidate && typeof candidate === 'object') return candidate
  }
  return response as T
}

// ─── Brew Methods ─────────────────────────────────────────────────────────────

export async function adminCreateBrewMethod(data: BrewMethodInput): Promise<BrewMethod> {
  const res = await apiFetch<BrewMethod | { data: BrewMethod }>('/admin/brew-methods', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return unwrapOne(res)
}

export async function adminUpdateBrewMethod(id: number, data: Partial<BrewMethodInput>): Promise<BrewMethod> {
  const res = await apiFetch<BrewMethod | { data: BrewMethod }>(`/admin/brew-methods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return unwrapOne(res)
}

export function adminDeleteBrewMethod(id: number): Promise<void> {
  return apiFetch(`/admin/brew-methods/${id}`, { method: 'DELETE' })
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export async function adminCreateEquipment(data: EquipmentInput): Promise<Equipment> {
  const res = await apiFetch<Equipment | { data: Equipment }>('/admin/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return unwrapOne(res)
}

export async function adminUpdateEquipment(id: number, data: Partial<EquipmentInput>): Promise<Equipment> {
  const res = await apiFetch<Equipment | { data: Equipment }>(`/admin/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return unwrapOne(res)
}

export function adminDeleteEquipment(id: number): Promise<void> {
  return apiFetch(`/admin/equipment/${id}`, { method: 'DELETE' })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function adminGetUsers(page = 1): Promise<Paginated<AdminUser>> {
  const params = page > 1 ? `?page=${page}` : ''
  return apiFetch<Paginated<AdminUser>>(`/admin/users${params}`)
}

export function adminBanUser(id: number, reason: string): Promise<void> {
  return apiFetch(`/admin/users/${id}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function adminUnbanUser(id: number): Promise<void> {
  return apiFetch(`/admin/users/${id}/ban`, { method: 'DELETE' })
}

// ─── Magic Links ──────────────────────────────────────────────────────────────

export async function adminGetMagicLinks(filters: MagicLinkFilters = {}): Promise<Paginated<MagicLink>> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.page && filters.page > 1) params.set('page', String(filters.page))
  const query = params.toString()
  return apiFetch<Paginated<MagicLink>>(`/admin/magic-links${query ? `?${query}` : ''}`)
}
