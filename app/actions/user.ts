'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { updateMe, deleteMe } from '@/lib/api/users'
import { deleteSession } from '@/lib/session'

type ActionState = { error?: string } | undefined

export async function updateProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession()

  const name = formData.get('name')?.toString().trim()
  if (!name) return { error: 'Nome é obrigatório' }

  try {
    await updateMe({ name })
    revalidatePath('/perfil')
    return undefined
  } catch {
    return { error: 'Erro ao atualizar perfil. Tente novamente.' }
  }
}

export async function deleteAccountAction(): Promise<void> {
  await verifySession()
  await deleteMe()
  await deleteSession()
  redirect('/entrar')
}
