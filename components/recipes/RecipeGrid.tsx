import { RecipeCard } from './RecipeCard'
import type { Recipe } from '@/lib/types'

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-lg">Nenhuma receita encontrada.</p>
        <p className="text-sm mt-1">Seja o primeiro a compartilhar!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
