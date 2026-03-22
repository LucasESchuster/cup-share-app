'use client'

import { useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { likeRecipeAction, unlikeRecipeAction } from '@/app/actions/likes'
import { toast } from 'sonner'

interface LikeButtonProps {
  recipeId: number
  initialLikes: number
  isAuthenticated: boolean
}

export function LikeButton({ recipeId, initialLikes, isAuthenticated }: LikeButtonProps) {
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(initialLikes)
  const [isPending, startTransition] = useTransition()

  async function handleClick() {
    if (!isAuthenticated) {
      toast.info('Faça login para curtir receitas')
      return
    }

    startTransition(async () => {
      setOptimisticLikes((prev) => prev + 1)
      try {
        await likeRecipeAction(recipeId)
      } catch {
        setOptimisticLikes(initialLikes)
      }
    })
  }

  async function handleUnlike() {
    startTransition(async () => {
      setOptimisticLikes((prev) => Math.max(0, prev - 1))
      try {
        await unlikeRecipeAction(recipeId)
      } catch {
        setOptimisticLikes(initialLikes)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      disabled={isPending}
      onClick={isAuthenticated ? handleUnlike : handleClick}
      aria-label={`${optimisticLikes} curtidas`}
    >
      <Heart className={`h-4 w-4 ${isAuthenticated ? 'fill-current' : ''}`} />
      <span className="tabular-nums">{optimisticLikes}</span>
    </Button>
  )
}
