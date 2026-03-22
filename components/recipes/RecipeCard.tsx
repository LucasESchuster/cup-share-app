import Link from 'next/link'
import { Clock, Coffee, Droplets } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from './LikeButton'
import type { Recipe } from '@/lib/types'

function formatBrewTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}min ${s}s` : `${m}min`
}

interface RecipeCardProps {
  recipe: Recipe
  currentUserId?: number
  isAuthenticated?: boolean
}

export function RecipeCard({ recipe, currentUserId, isAuthenticated = false }: RecipeCardProps) {
  const isOwner = !!currentUserId && currentUserId === recipe.user?.id
  return (
    <Link href={`/receitas/${recipe.id}`} className="group block h-full">
      <article className="flex h-full flex-col rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 hover:border-border/80">
        {/* Top section */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-heading text-base font-semibold leading-snug group-hover:text-amber transition-colors line-clamp-2">
              {recipe.title}
            </h2>
            {recipe.brew_method && (
              <Badge variant="secondary" className="shrink-0 text-xs mt-0.5">
                {recipe.brew_method.name}
              </Badge>
            )}
          </div>
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg bg-accent/50 px-2 py-2 text-center">
            <Coffee className="h-3.5 w-3.5 shrink-0 text-muted-foreground mb-1" />
            <span className="text-sm font-medium tabular-nums">{recipe.coffee_grams}g</span>
            <span className="text-[10px] text-muted-foreground">café</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-accent/50 px-2 py-2 text-center">
            <Droplets className="h-3.5 w-3.5 shrink-0 text-muted-foreground mb-1" />
            <span className="text-sm font-medium tabular-nums">{recipe.water_ml ?? recipe.yield_ml}ml</span>
            <span className="text-[10px] text-muted-foreground">{recipe.water_ml ? 'água' : 'extração'}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-accent/50 px-2 py-2 text-center">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground mb-1" />
            <span className="text-sm font-medium tabular-nums">{formatBrewTime(recipe.brew_time_seconds)}</span>
            <span className="text-[10px] text-muted-foreground">tempo</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{recipe.user?.name}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs font-mono text-muted-foreground">{recipe.ratio}</span>
          </div>
          <LikeButton
            recipeId={recipe.id}
            initialLikes={recipe.likes_count}
            initialIsLiked={recipe.liked_by_me}
            isAuthenticated={isAuthenticated}
            isOwner={isOwner}
          />
        </div>
      </article>
    </Link>
  )
}
