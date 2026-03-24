import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { getRecipes } from '@/lib/api/recipes'
import { getBrewMethods } from '@/lib/api/reference'
import { getMe } from '@/lib/api/users'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { RecipeFilters } from '@/components/recipes/RecipeFilters'
import { RecipePagination } from '@/components/recipes/RecipePagination'
import { LinkButton } from '@/components/ui/link-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import type { RecipeFilters as RecipeFiltersType, BrewMethodCategory } from '@/lib/types'

const VALID_CATEGORIES = new Set<BrewMethodCategory>(['filter', 'espresso', 'pressure', 'cold_brew'])
const VALID_SORT_BY = new Set(['created_at', 'likes_count'])
const VALID_SORT_DIR = new Set(['asc', 'desc'])

function parseFilters(sp: Record<string, string | string[] | undefined>): RecipeFiltersType {
  const str = (key: string) => {
    const v = sp[key]
    return typeof v === 'string' && v ? v : undefined
  }

  const title = str('title')
  const rawCategory = str('category')
  const category = rawCategory && VALID_CATEGORIES.has(rawCategory as BrewMethodCategory)
    ? (rawCategory as BrewMethodCategory)
    : undefined
  const rawBrewMethodId = str('brew_method_id')
  const brew_method_id = rawBrewMethodId ? Number(rawBrewMethodId) || undefined : undefined
  const rawSortBy = str('sort_by')
  const sort_by = rawSortBy && VALID_SORT_BY.has(rawSortBy)
    ? (rawSortBy as 'created_at' | 'likes_count')
    : undefined
  const rawSortDir = str('sort_dir')
  const sort_dir = rawSortDir && VALID_SORT_DIR.has(rawSortDir)
    ? (rawSortDir as 'asc' | 'desc')
    : undefined
  const rawPage = str('page')
  const page = rawPage ? Math.max(1, Number(rawPage) || 1) : undefined

  return { title, category, brew_method_id, sort_by, sort_dir, page }
}

async function RecipesFeed({
  filters,
  isAuthenticated,
}: {
  filters: RecipeFiltersType
  isAuthenticated: boolean
}) {
  const [paginatedRecipes, currentUser] = await Promise.all([
    getRecipes(filters),
    isAuthenticated ? getMe().catch(() => null) : Promise.resolve(null),
  ])

  const { data: recipes, meta } = paginatedRecipes

  return (
    <>
      <RecipeGrid
        recipes={recipes}
        currentUserId={currentUser?.id}
        isAuthenticated={isAuthenticated}
      />
      {meta && <RecipePagination meta={meta} />}
    </>
  )
}

function RecipesFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [cookieStore, sp, brewMethods] = await Promise.all([
    cookies(),
    searchParams,
    getBrewMethods(),
  ])

  const isAuthenticated = !!cookieStore.get('cup_share_token')?.value
  const filters = parseFilters(sp)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight leading-tight">
            Receitas
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md leading-relaxed">
            Descubra e compartilhe receitas de café feitas pela comunidade.
          </p>
        </div>

        {isAuthenticated && (
          <LinkButton href="/receitas/nova" className="shrink-0 gap-1.5">
            <Plus className="h-4 w-4" />
            Nova receita
          </LinkButton>
        )}
      </div>

      <Suspense fallback={<div className="mb-8 h-[116px]" />}>
        <RecipeFilters brewMethods={brewMethods} />
      </Suspense>

      <Suspense fallback={<RecipesFeedSkeleton />}>
        <RecipesFeed filters={filters} isAuthenticated={isAuthenticated} />
      </Suspense>
    </div>
  )
}
