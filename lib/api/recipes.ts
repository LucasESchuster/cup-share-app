import 'server-only'
import { apiFetch } from './client'
import type { Recipe, LikesCount, Paginated, RecipeFormValues, RecipeVisibility } from '@/lib/types'

function unwrap<T>(response: T[] | Paginated<T>): T[] {
  if (Array.isArray(response)) return response
  return response.data
}

function unwrapOne<T>(response: T | { data: T }): T {
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
    const candidate = (response as { data: T }).data
    if (candidate && typeof candidate === 'object') return candidate
  }
  return response as T
}

export async function getRecipes(): Promise<Recipe[]> {
  const res = await apiFetch<Recipe[] | Paginated<Recipe>>('/recipes')
  return unwrap(res)
}

export async function getRecipe(id: number | string): Promise<Recipe> {
  const res = await apiFetch<Recipe | { data: Recipe }>(`/recipes/${id}`)
  return unwrapOne(res)
}

export function getRecipeLikes(id: number | string): Promise<LikesCount> {
  return apiFetch(`/recipes/${id}/likes`)
}

export async function createRecipe(data: RecipeFormValues): Promise<Recipe> {
  const res = await apiFetch<Recipe | { data: Recipe }>('/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return unwrapOne(res)
}

export async function updateRecipe(id: number | string, data: RecipeFormValues): Promise<Recipe> {
  const res = await apiFetch<Recipe | { data: Recipe }>(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return unwrapOne(res)
}

export function deleteRecipe(id: number | string): Promise<void> {
  return apiFetch(`/recipes/${id}`, { method: 'DELETE' })
}

export function updateRecipeVisibility(
  id: number | string,
  visibility: RecipeVisibility
): Promise<Recipe> {
  return apiFetch(`/recipes/${id}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ visibility }),
  })
}

export function likeRecipe(id: number | string): Promise<void> {
  return apiFetch(`/recipes/${id}/likes`, { method: 'POST' })
}

export function unlikeRecipe(id: number | string): Promise<void> {
  return apiFetch(`/recipes/${id}/likes`, { method: 'DELETE' })
}
