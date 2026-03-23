import { Coffee } from 'lucide-react'
import { RecipeCard } from './RecipeCard'
import type { Recipe } from '@/lib/types'

interface RecipeGridProps {
  recipes: Recipe[]
  currentUserId?: number
  isAuthenticated?: boolean
}

export function RecipeGrid({ recipes, currentUserId, isAuthenticated }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="py-24 text-center">
        <Coffee className="mx-auto h-12 w-12 text-amber opacity-40 mb-4" />
        <p className="text-lg font-medium">Nenhuma receita por aqui ainda.</p>
        <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a compartilhar a sua!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          currentUserId={currentUserId}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
