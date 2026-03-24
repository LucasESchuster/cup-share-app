'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { likeRecipeAction, unlikeRecipeAction } from '@/app/actions/likes'
import { toast } from 'sonner'

interface LikeButtonProps {
  recipeId: number
  initialLikes: number
  initialIsLiked: boolean
  isAuthenticated: boolean
  isOwner?: boolean
}

export function LikeButton({ recipeId, initialLikes, initialIsLiked, isAuthenticated, isOwner = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const displayLikes = initialLikes + 1
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(displayLikes)
  const [isPending, startTransition] = useTransition()

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.info('Faça login para curtir receitas')
      return
    }

    if (isLiked) {
      setIsLiked(false)
      startTransition(async () => {
        setOptimisticLikes((prev) => Math.max(1, prev - 1))
        try {
          await unlikeRecipeAction(recipeId)
        } catch {
          setIsLiked(true)
          setOptimisticLikes(displayLikes)
        }
      })
    } else {
      setIsLiked(true)
      startTransition(async () => {
        setOptimisticLikes((prev) => prev + 1)
        try {
          await likeRecipeAction(recipeId)
        } catch {
          setIsLiked(false)
          setOptimisticLikes(displayLikes)
        }
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      disabled={isPending || isOwner}
      onClick={handleToggle}
      title={isOwner ? 'Você não pode curtir sua própria receita' : undefined}
      aria-label={`${optimisticLikes} curtidas`}
    >
      <Heart className={`h-4 w-4 ${isLiked || isOwner ? 'fill-current text-red-500' : ''}`} />
      <span className="tabular-nums">{optimisticLikes}</span>
    </Button>
  )
}
