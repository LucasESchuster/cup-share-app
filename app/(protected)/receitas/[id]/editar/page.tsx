import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/api/recipes'
import { getBrewMethods, getRecipeTypes, getIngredients } from '@/lib/api/reference'
import { getEquipment } from '@/lib/api/equipment'
import { verifySession } from '@/lib/dal'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import { ApiError } from '@/lib/api/client'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const recipe = await getRecipe(id)
    return { title: `Editar — ${recipe.title}` }
  } catch {
    return { title: 'Editar receita' }
  }
}

export default async function EditarReceitaPage({ params }: PageProps) {
  const { id } = await params
  await verifySession()

  let recipe
  try {
    recipe = await getRecipe(id)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const [brewMethods, recipeTypes, ingredients, equipment] = await Promise.all([
    getBrewMethods(),
    getRecipeTypes(),
    getIngredients(),
    getEquipment(),
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Editar receita</h1>
        <p className="mt-1 text-sm text-muted-foreground">{recipe.title}</p>
      </div>

      <RecipeForm
        brewMethods={brewMethods}
        recipeTypes={recipeTypes}
        ingredients={ingredients}
        equipment={equipment}
        recipe={recipe}
      />
    </div>
  )
}
