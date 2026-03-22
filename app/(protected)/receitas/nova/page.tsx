import { getBrewMethods, getIngredients } from '@/lib/api/reference'
import { getEquipment } from '@/lib/api/equipment'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nova receita',
}

export default async function NovaReceitaPage() {
  const [brewMethods, ingredients, equipment] = await Promise.all([
    getBrewMethods(),
    getIngredients(),
    getEquipment(),
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Nova receita</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compartilhe sua receita com a comunidade.
        </p>
      </div>

      <RecipeForm
        brewMethods={brewMethods}
        ingredients={ingredients}
        equipment={equipment}
      />
    </div>
  )
}
