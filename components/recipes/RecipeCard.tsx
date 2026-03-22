import Link from 'next/link'
import { Clock, Heart, Coffee, Droplets } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Recipe } from '@/lib/types'

function formatBrewTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}min ${s}s` : `${m}min`
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/receitas/${recipe.id}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {recipe.title}
            </h2>
            {recipe.brew_method && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {recipe.brew_method.name}
              </Badge>
            )}
          </div>
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {recipe.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Coffee className="h-3 w-3 shrink-0" />
              <span>{recipe.coffee_grams}g</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 shrink-0" />
              <span>{recipe.water_ml ?? recipe.yield_ml}ml</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{formatBrewTime(recipe.brew_time_seconds)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-mono text-muted-foreground">
            Proporção {recipe.ratio}
          </p>
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{recipe.user?.name}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span>{recipe.likes_count}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
