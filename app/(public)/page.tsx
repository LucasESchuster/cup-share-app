import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { getRecipes } from '@/lib/api/recipes'
import { getMe } from '@/lib/api/users'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { Skeleton } from '@/components/ui/skeleton'

async function RecipesFeed() {
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get('cup_share_token')?.value

  const [recipes, currentUser] = await Promise.all([
    getRecipes(),
    isAuthenticated ? getMe().catch(() => null) : Promise.resolve(null),
  ])

  return (
    <RecipeGrid
      recipes={recipes}
      currentUserId={currentUser?.id}
      isAuthenticated={isAuthenticated}
    />
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

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-semibold tracking-tight leading-tight">
          Receitas
        </h1>
        <p className="mt-2 text-muted-foreground max-w-md leading-relaxed">
          Descubra receitas de café compartilhadas pela comunidade.
        </p>
      </div>

      <Suspense fallback={<RecipesFeedSkeleton />}>
        <RecipesFeed />
      </Suspense>
    </div>
  )
}
