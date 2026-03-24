import 'server-only'
import { apiFetch } from './client'
import type { Recipe, LikesCount, Paginated, RecipeFilters, RecipeFormValues, RecipeVisibility } from '@/lib/types'

function unwrapOne<T>(response: T | { data: T }): T {
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
    const candidate = (response as { data: T }).data
    if (candidate && typeof candidate === 'object') return candidate
  }
  return response as T
}

export async function getRecipes(filters: RecipeFilters = {}): Promise<Paginated<Recipe>> {
  const params = new URLSearchParams()

  if (filters.title)                        params.set('title', filters.title)
  if (filters.brew_method_id)               params.set('brew_method_id', String(filters.brew_method_id))
  if (filters.category)                     params.set('category', filters.category)
  if (filters.user_id)                      params.set('user_id', String(filters.user_id))
  if (filters.published_from)               params.set('published_from', filters.published_from)
  if (filters.published_to)                 params.set('published_to', filters.published_to)
  if (filters.sort_by)                      params.set('sort_by', filters.sort_by)
  if (filters.sort_dir)                     params.set('sort_dir', filters.sort_dir)
  if (filters.page && filters.page > 1)     params.set('page', String(filters.page))

  const qs = params.toString()
  const res = await apiFetch<Paginated<Recipe>>(`/recipes${qs ? `?${qs}` : ''}`)

  if (Array.isArray(res)) {
    return { data: res }
  }
  return res
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
