'use server'

import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifyAdmin } from '@/lib/dal'
import {
  adminCreateBrewMethod,
  adminUpdateBrewMethod,
  adminDeleteBrewMethod,
  adminCreateEquipment,
  adminUpdateEquipment,
  adminDeleteEquipment,
  adminBanUser,
  adminUnbanUser,
} from '@/lib/api/admin'
import { ApiValidationError } from '@/lib/api/client'
import type { BrewMethodCategory, EquipmentType } from '@/lib/types'

type ActionState = {
  errors?: Record<string, string[]>
  error?: string
} | undefined

// ─── Brew Methods ─────────────────────────────────────────────────────────────

export async function createBrewMethodAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const category = formData.get('category') as BrewMethodCategory

  if (!name?.trim()) return { errors: { name: ['O nome é obrigatório.'] } }
  if (!category) return { errors: { category: ['A categoria é obrigatória.'] } }

  try {
    await adminCreateBrewMethod({ name: name.trim(), description, category })
    revalidatePath('/admin/brew-methods')
    return undefined
  } catch (err) {
    if (isRedirectError(err)) throw err
    if (err instanceof ApiValidationError) return { errors: err.errors }
    return { error: 'Erro ao criar método de preparo.' }
  }
}

export async function updateBrewMethodAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const category = formData.get('category') as BrewMethodCategory

  if (!name?.trim()) return { errors: { name: ['O nome é obrigatório.'] } }

  try {
    await adminUpdateBrewMethod(id, { name: name.trim(), description, category })
    revalidatePath('/admin/brew-methods')
    return undefined
  } catch (err) {
    if (isRedirectError(err)) throw err
    if (err instanceof ApiValidationError) return { errors: err.errors }
    return { error: 'Erro ao atualizar método de preparo.' }
  }
}

export async function deleteBrewMethodAction(id: number): Promise<void> {
  await verifyAdmin()
  await adminDeleteBrewMethod(id)
  revalidatePath('/admin/brew-methods')
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export async function createEquipmentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const brand = (formData.get('brand') as string) || null
  const model = (formData.get('model') as string) || null
  const type = formData.get('type') as EquipmentType

  if (!name?.trim()) return { errors: { name: ['O nome é obrigatório.'] } }
  if (!type) return { errors: { type: ['O tipo é obrigatório.'] } }

  try {
    await adminCreateEquipment({ name: name.trim(), brand, model, type })
    revalidatePath('/admin/equipamentos')
    return undefined
  } catch (err) {
    if (isRedirectError(err)) throw err
    if (err instanceof ApiValidationError) return { errors: err.errors }
    return { error: 'Erro ao criar equipamento.' }
  }
}

export async function updateEquipmentAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const brand = (formData.get('brand') as string) || null
  const model = (formData.get('model') as string) || null
  const type = formData.get('type') as EquipmentType

  if (!name?.trim()) return { errors: { name: ['O nome é obrigatório.'] } }

  try {
    await adminUpdateEquipment(id, { name: name.trim(), brand, model, type })
    revalidatePath('/admin/equipamentos')
    return undefined
  } catch (err) {
    if (isRedirectError(err)) throw err
    if (err instanceof ApiValidationError) return { errors: err.errors }
    return { error: 'Erro ao atualizar equipamento.' }
  }
}

export async function deleteEquipmentAction(id: number): Promise<void> {
  await verifyAdmin()
  await adminDeleteEquipment(id)
  revalidatePath('/admin/equipamentos')
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function banUserAction(id: number, reason: string): Promise<{ error?: string }> {
  await verifyAdmin()
  try {
    await adminBanUser(id, reason)
    revalidatePath('/admin/usuarios')
    return {}
  } catch (err) {
    if (isRedirectError(err)) throw err
    return { error: 'Não foi possível banir o usuário.' }
  }
}

export async function unbanUserAction(id: number): Promise<{ error?: string }> {
  await verifyAdmin()
  try {
    await adminUnbanUser(id)
    revalidatePath('/admin/usuarios')
    return {}
  } catch (err) {
    if (isRedirectError(err)) throw err
    return { error: 'Não foi possível desbanir o usuário.' }
  }
}
