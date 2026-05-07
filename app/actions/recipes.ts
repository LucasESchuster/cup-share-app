'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { verifySession } from '@/lib/dal'
import { createRecipe, updateRecipe, deleteRecipe, updateRecipeVisibility } from '@/lib/api/recipes'
import { RecipeFormSchema } from '@/lib/types'
import type { RecipeVisibility } from '@/lib/types'

type ActionState = {
  errors?: Record<string, string[]>
  error?: string
} | undefined

export async function createRecipeAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession()

  const turnstileToken = formData.get('cf-turnstile-response')?.toString()
  if (!turnstileToken) {
    return { error: 'Complete a verificação anti-bot e tente novamente.' }
  }

  const raw = Object.fromEntries(formData)
  const parsed = RecipeFormSchema.safeParse({
    ...raw,
    coffee_grams: Number(raw.coffee_grams),
    water_ml: raw.water_ml ? Number(raw.water_ml) : null,
    yield_ml: raw.yield_ml ? Number(raw.yield_ml) : null,
    brew_time_seconds: Number(raw.brew_time_seconds),
    brew_method_id: Number(raw.brew_method_id),
    water_temperature_celsius: raw.water_temperature_celsius ? Number(raw.water_temperature_celsius) : null,
    coffee_description: (raw.coffee_description as string) || null,
    video_url: (raw.video_url as string) || null,
    steps: JSON.parse(raw.steps as string),
    equipment: JSON.parse((raw.equipment as string) || '[]'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const recipe = await createRecipe(parsed.data, turnstileToken)
    revalidatePath('/')
    redirect(`/receitas/${recipe.id}`)
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err
    if (err && typeof err === 'object' && 'errors' in err) {
      const apiErrors = (err as { errors: Record<string, string[]> }).errors
      const turnstileError = apiErrors.cf_turnstile_response?.[0]
      if (turnstileError) return { error: turnstileError }
      return { errors: apiErrors }
    }
    return { error: 'Erro ao criar receita. Tente novamente.' }
  }
}

export async function updateRecipeAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession()

  const turnstileToken = formData.get('cf-turnstile-response')?.toString()
  if (!turnstileToken) {
    return { error: 'Complete a verificação anti-bot e tente novamente.' }
  }

  const raw = Object.fromEntries(formData)
  const parsed = RecipeFormSchema.safeParse({
    ...raw,
    coffee_grams: Number(raw.coffee_grams),
    water_ml: raw.water_ml ? Number(raw.water_ml) : null,
    yield_ml: raw.yield_ml ? Number(raw.yield_ml) : null,
    brew_time_seconds: Number(raw.brew_time_seconds),
    brew_method_id: Number(raw.brew_method_id),
    water_temperature_celsius: raw.water_temperature_celsius ? Number(raw.water_temperature_celsius) : null,
    coffee_description: (raw.coffee_description as string) || null,
    video_url: (raw.video_url as string) || null,
    steps: JSON.parse(raw.steps as string),
    equipment: JSON.parse((raw.equipment as string) || '[]'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateRecipe(id, parsed.data, turnstileToken)
    revalidatePath(`/receitas/${id}`)
    revalidatePath('/')
    redirect(`/receitas/${id}`)
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err
    if (err && typeof err === 'object' && 'errors' in err) {
      const apiErrors = (err as { errors: Record<string, string[]> }).errors
      const turnstileError = apiErrors.cf_turnstile_response?.[0]
      if (turnstileError) return { error: turnstileError }
      return { errors: apiErrors }
    }
    return { error: 'Erro ao atualizar receita. Tente novamente.' }
  }
}

export async function deleteRecipeAction(id: number): Promise<void> {
  await verifySession()
  await deleteRecipe(id)
  revalidatePath('/')
  redirect('/')
}

export async function toggleVisibilityAction(
  id: number,
  visibility: RecipeVisibility
): Promise<void> {
  await verifySession()
  await updateRecipeVisibility(id, visibility)
  revalidatePath(`/receitas/${id}`)
  revalidatePath('/perfil')
}
