import 'server-only'
import { apiFetch } from './client'
import type { BrewMethod, Paginated } from '@/lib/types'

function unwrap<T>(response: T[] | Paginated<T>): T[] {
  if (Array.isArray(response)) return response
  return response.data
}

export async function getBrewMethods(): Promise<BrewMethod[]> {
  const res = await apiFetch<BrewMethod[] | Paginated<BrewMethod>>('/brew-methods')
  return unwrap(res)
}

