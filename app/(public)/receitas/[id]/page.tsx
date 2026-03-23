import { notFound } from 'next/navigation'
import { getRecipe } from '@/lib/api/recipes'
import { getMe } from '@/lib/api/users'
import { getOptionalToken } from '@/lib/dal'
import { LikeButton } from '@/components/recipes/LikeButton'
import { RecipeSteps } from '@/components/recipes/RecipeSteps'
import { DeleteRecipeButton } from '@/components/recipes/DeleteRecipeButton'
import { LinkButton } from '@/components/ui/link-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Coffee, Droplets, Flame, Snowflake, User, Calendar, Pencil, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import { ApiError } from '@/lib/api/client'
import { categoryLabels } from '@/lib/types'
import type { BrewMethodCategory } from '@/lib/types'

const categoryIcons: Record<BrewMethodCategory, React.ElementType> = {
  filter: Coffee,
  espresso: Zap,
  pressure: Flame,
  cold_brew: Snowflake,
}

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

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null
    if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v')
    } else if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1)
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
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
  const isLiked = recipe.liked_by_me

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.brew_method && <Badge variant="secondary">{recipe.brew_method.name}</Badge>}
          {recipe.brew_method?.category && (() => {
            const cat = recipe.brew_method.category as BrewMethodCategory
            const Icon = categoryIcons[cat]
            return (
              <Badge variant="outline" className="gap-1">
                <Icon className="h-3 w-3" />
                {categoryLabels[cat]}
              </Badge>
            )
          })()}
        </div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight leading-tight">{recipe.title}</h1>
        {recipe.description && (
          <p className="mt-3 text-muted-foreground leading-relaxed text-base">{recipe.description}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
              initialIsLiked={isLiked}
              isAuthenticated={isAuthenticated}
              isOwner={isOwner}
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

      <Separator className="my-7" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-10">
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <Coffee className="h-4 w-4 mx-auto mb-2 text-amber" />
          <p className="text-xl font-semibold tabular-nums">{recipe.coffee_grams}g</p>
          <p className="text-xs text-muted-foreground mt-0.5">Café</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <Droplets className="h-4 w-4 mx-auto mb-2 text-amber" />
          <p className="text-xl font-semibold tabular-nums">{recipe.water_ml ?? recipe.yield_ml}ml</p>
          <p className="text-xs text-muted-foreground mt-0.5">{recipe.water_ml ? 'Água' : 'Extração'}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <Clock className="h-4 w-4 mx-auto mb-2 text-amber" />
          <p className="text-xl font-semibold tabular-nums">{formatBrewTime(recipe.brew_time_seconds)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tempo</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="text-xl font-semibold font-mono tabular-nums">{recipe.ratio}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Proporção</p>
        </div>
      </div>

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <section className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-5">Passo a passo</h2>
          <RecipeSteps steps={recipe.steps} />
        </section>
      )}

      {/* Equipment */}
      {recipe.equipment.length > 0 && (
        <section className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-4">Equipamentos</h2>
          <ul className="space-y-2">
            {recipe.equipment.map((eq) => (
              <li key={eq.id} className="flex items-center justify-between text-sm rounded-xl border border-border/50 bg-card px-4 py-3">
                <div>
                  <span className="font-medium">{eq.equipment?.name ?? eq.custom_name}</span>
                  {eq.equipment?.brand && <span className="text-muted-foreground"> · {eq.equipment.brand}</span>}
                  {eq.equipment?.model && <span className="text-muted-foreground"> {eq.equipment.model}</span>}
                </div>
                {eq.grinder_clicks && (
                  <span className="text-muted-foreground text-xs font-mono">{eq.grinder_clicks} cliques</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Video */}
      {recipe.video_url && (() => {
        const embedUrl = getYouTubeEmbedUrl(recipe.video_url!)
        return embedUrl ? (
          <section>
            <h2 className="font-heading text-xl font-semibold mb-4">Vídeo</h2>
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full rounded-xl"
              />
            </div>
          </section>
        ) : null
      })()}
    </div>
  )
}
