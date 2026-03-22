import 'server-only'
import { apiFetch } from './client'
import type { Equipment, EquipmentFormValues, Paginated } from '@/lib/types'

function unwrap<T>(response: T[] | Paginated<T>): T[] {
  if (Array.isArray(response)) return response
  return response.data
}

export async function getEquipment(): Promise<Equipment[]> {
  const res = await apiFetch<Equipment[] | Paginated<Equipment>>('/equipment')
  return unwrap(res)
}

export function getEquipmentById(id: number | string): Promise<Equipment> {
  return apiFetch(`/equipment/${id}`)
}

export function createEquipment(data: EquipmentFormValues & { is_personal?: boolean }): Promise<Equipment> {
  return apiFetch('/equipment', {
    method: 'POST',
    body: JSON.stringify({ ...data, is_personal: true }),
  })
}

export function updateEquipment(id: number | string, data: EquipmentFormValues): Promise<Equipment> {
  return apiFetch(`/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteEquipment(id: number | string): Promise<void> {
  return apiFetch(`/equipment/${id}`, { method: 'DELETE' })
}
