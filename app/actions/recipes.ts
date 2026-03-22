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

  const raw = Object.fromEntries(formData)
  const parsed = RecipeFormSchema.safeParse({
    ...raw,
    coffee_grams: Number(raw.coffee_grams),
    water_ml: raw.water_ml ? Number(raw.water_ml) : null,
    yield_ml: raw.yield_ml ? Number(raw.yield_ml) : null,
    brew_time_seconds: Number(raw.brew_time_seconds),
    brew_method_id: Number(raw.brew_method_id),
    recipe_type_id: Number(raw.recipe_type_id),
    steps: JSON.parse(raw.steps as string),
    ingredients: JSON.parse(raw.ingredients as string),
    equipment: JSON.parse((raw.equipment as string) || '[]'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const recipe = await createRecipe(parsed.data)
    revalidatePath('/')
    redirect(`/receitas/${recipe.id}`)
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err
    if (err && typeof err === 'object' && 'errors' in err) {
      return { errors: (err as { errors: Record<string, string[]> }).errors }
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

  const raw = Object.fromEntries(formData)
  const parsed = RecipeFormSchema.safeParse({
    ...raw,
    coffee_grams: Number(raw.coffee_grams),
    water_ml: raw.water_ml ? Number(raw.water_ml) : null,
    yield_ml: raw.yield_ml ? Number(raw.yield_ml) : null,
    brew_time_seconds: Number(raw.brew_time_seconds),
    brew_method_id: Number(raw.brew_method_id),
    recipe_type_id: Number(raw.recipe_type_id),
    steps: JSON.parse(raw.steps as string),
    ingredients: JSON.parse(raw.ingredients as string),
    equipment: JSON.parse((raw.equipment as string) || '[]'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await updateRecipe(id, parsed.data)
    revalidatePath(`/receitas/${id}`)
    revalidatePath('/')
    redirect(`/receitas/${id}`)
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err
    if (err && typeof err === 'object' && 'errors' in err) {
      return { errors: (err as { errors: Record<string, string[]> }).errors }
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
