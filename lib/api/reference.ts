import 'server-only'
import { apiFetch } from './client'
import type { BrewMethod, RecipeType, Ingredient, Paginated } from '@/lib/types'

function unwrap<T>(response: T[] | Paginated<T>): T[] {
  if (Array.isArray(response)) return response
  return response.data
}

export async function getBrewMethods(): Promise<BrewMethod[]> {
  const res = await apiFetch<BrewMethod[] | Paginated<BrewMethod>>('/brew-methods')
  return unwrap(res)
}

export async function getRecipeTypes(): Promise<RecipeType[]> {
  const res = await apiFetch<RecipeType[] | Paginated<RecipeType>>('/recipe-types')
  return unwrap(res)
}

export async function getIngredients(): Promise<Ingredient[]> {
  const res = await apiFetch<Ingredient[] | Paginated<Ingredient>>('/ingredients')
  return unwrap(res)
}
