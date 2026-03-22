import { Suspense } from 'react'
import { getRecipes } from '@/lib/api/recipes'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { Skeleton } from '@/components/ui/skeleton'

async function RecipesFeed() {
  const recipes = await getRecipes()
  return <RecipeGrid recipes={recipes} />
}

function RecipesFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-5 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Receitas</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Descubra receitas de café compartilhadas pela comunidade.
        </p>
      </div>

      <Suspense fallback={<RecipesFeedSkeleton />}>
        <RecipesFeed />
      </Suspense>
    </div>
  )
}
