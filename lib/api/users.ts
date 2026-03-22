import 'server-only'
import { apiFetch } from './client'
import type { User, Recipe, Equipment, Paginated } from '@/lib/types'

function unwrap<T>(response: T[] | Paginated<T>): T[] {
  if (Array.isArray(response)) return response
  return response.data
}

function unwrapOne<T>(response: T | { data: T }): T {
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
    const candidate = (response as { data: T }).data
    if (candidate && typeof candidate === 'object') return candidate
  }
  return response as T
}

export async function getMe(): Promise<User> {
  const res = await apiFetch<User | { data: User }>('/users/me')
  return unwrapOne(res)
}

export function updateMe(data: { name: string }): Promise<User> {
  return apiFetch('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteMe(): Promise<void> {
  return apiFetch('/users/me', { method: 'DELETE' })
}

export async function getMyRecipes(): Promise<Recipe[]> {
  const res = await apiFetch<Recipe[] | Paginated<Recipe>>('/users/me/recipes')
  return unwrap(res)
}

export async function getMyEquipment(): Promise<Equipment[]> {
  const res = await apiFetch<Equipment[] | Paginated<Equipment>>('/users/me/equipment')
  return unwrap(res)
}
