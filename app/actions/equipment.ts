'use server'

import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { createEquipment, updateEquipment, deleteEquipment } from '@/lib/api/equipment'
import { EquipmentFormSchema } from '@/lib/types'

type ActionState = {
  errors?: Record<string, string[]>
  error?: string
} | undefined

export async function createEquipmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession()

  const raw = Object.fromEntries(formData)
  const parsed = EquipmentFormSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await createEquipment(parsed.data)
    revalidatePath('/perfil')
    revalidatePath('/equipamentos')
    return undefined
  } catch {
    return { error: 'Erro ao criar equipamento. Tente novamente.' }
  }
}

export async function updateEquipmentAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession()

  const raw = Object.fromEntries(formData)
  const parsed = EquipmentFormSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateEquipment(id, parsed.data)
    revalidatePath('/perfil')
    revalidatePath('/equipamentos')
    return undefined
  } catch {
    return { error: 'Erro ao atualizar equipamento. Tente novamente.' }
  }
}

export async function deleteEquipmentAction(id: number): Promise<void> {
  await verifySession()
  await deleteEquipment(id)
  revalidatePath('/perfil')
  revalidatePath('/equipamentos')
}
