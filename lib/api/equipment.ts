import 'server-only'
import { apiFetch } from './client'
import type { Equipment, Paginated } from '@/lib/types'

function unwrap<T>(response: T[] | Paginated<T>): T[] {
  if (Array.isArray(response)) return response
  return response.data
}

export async function getEquipment(): Promise<Equipment[]> {
  const res = await apiFetch<Equipment[] | Paginated<Equipment>>('/equipment')
  return unwrap(res)
}
