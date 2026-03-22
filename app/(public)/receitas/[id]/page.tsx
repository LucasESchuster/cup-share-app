import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/api/recipes'
import { getMe } from '@/lib/api/users'
import { getOptionalToken } from '@/lib/dal'
import { LikeButton } from '@/components/recipes/LikeButton'
import { DeleteRecipeButton } from '@/components/recipes/DeleteRecipeButton'
import { LinkButton } from '@/components/ui/link-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Coffee, Droplets, User, Calendar, Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import { ApiError } from '@/lib/api/client'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const recipe = await getRecipe(id)
    return {
      title: recipe.title,
      description: recipe.description ?? `Receita de ${recipe.brew_method.name} por ${recipe.user.name}`,
    }
  } catch {
    return { title: 'Receita' }
  }
}

function formatBrewTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}min ${s}s` : `${m}min`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params

  let recipe
  try {
    recipe = await getRecipe(id)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const token = await getOptionalToken()
  const isAuthenticated = !!token

  const currentUser = isAuthenticated ? await getMe().catch(() => null) : null
  const isOwner = !!currentUser && currentUser.id === recipe.user.id

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.brew_method && <Badge variant="secondary">{recipe.brew_method.name}</Badge>}
          {recipe.recipe_type && <Badge variant="outline">{recipe.recipe_type.name}</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
        {recipe.description && (
          <p className="mt-2 text-muted-foreground">{recipe.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{recipe.user?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(recipe.created_at)}</span>
            </div>
            <LikeButton
              recipeId={recipe.id}
              initialLikes={recipe.likes_count}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {isOwner && (
            <div className="flex items-center gap-1">
              <LinkButton
                href={`/receitas/${recipe.id}/editar`}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Editar
              </LinkButton>
              <DeleteRecipeButton id={recipe.id} title={recipe.title} />
            </div>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
          <Coffee className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{recipe.coffee_grams}g</p>
          <p className="text-xs text-muted-foreground">Café</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
          <Droplets className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{recipe.water_ml ?? recipe.yield_ml}ml</p>
          <p className="text-xs text-muted-foreground">{recipe.water_ml ? 'Água' : 'Extração'}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-semibold">{formatBrewTime(recipe.brew_time_seconds)}</p>
          <p className="text-xs text-muted-foreground">Tempo</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
          <p className="text-lg font-semibold font-mono">{recipe.ratio}</p>
          <p className="text-xs text-muted-foreground">Proporção</p>
        </div>
      </div>

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Ingredientes</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex items-center justify-between text-sm rounded-md border border-border/60 bg-card px-4 py-2.5">
                <span>{ing.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {ing.pivot.quantity} {ing.pivot.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Passo a passo</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step) => (
              <li key={step.order} className="flex gap-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {step.order}
                </span>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm">{step.description}</p>
                  {step.duration_seconds && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBrewTime(step.duration_seconds)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Equipment */}
      {recipe.equipment.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Equipamentos</h2>
          <ul className="space-y-2">
            {recipe.equipment.map((eq) => (
              <li key={eq.id} className="flex items-center justify-between text-sm rounded-md border border-border/60 bg-card px-4 py-2.5">
                <div>
                  <span className="font-medium">{eq.name}</span>
                  {eq.brand && <span className="text-muted-foreground"> · {eq.brand}</span>}
                  {eq.model && <span className="text-muted-foreground"> {eq.model}</span>}
                </div>
                {eq.pivot.grinder_clicks && (
                  <span className="text-muted-foreground text-xs">{eq.pivot.grinder_clicks} cliques</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
