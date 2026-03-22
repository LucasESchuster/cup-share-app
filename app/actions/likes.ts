'use server'

import { verifySession } from '@/lib/dal'
import { likeRecipe, unlikeRecipe } from '@/lib/api/recipes'
import { revalidatePath } from 'next/cache'

export async function likeRecipeAction(recipeId: number): Promise<void> {
  await verifySession()
  await likeRecipe(recipeId)
  revalidatePath(`/receitas/${recipeId}`)
}

export async function unlikeRecipeAction(recipeId: number): Promise<void> {
  await verifySession()
  await unlikeRecipe(recipeId)
  revalidatePath(`/receitas/${recipeId}`)
}
