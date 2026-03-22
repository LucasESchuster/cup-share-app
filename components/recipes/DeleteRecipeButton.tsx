'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteRecipeAction } from '@/app/actions/recipes'

export function DeleteRecipeButton({ id, title }: { id: number; title: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    toast(`Excluir "${title}"?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Excluir',
        onClick: () => startTransition(() => deleteRecipeAction(id)),
      },
      cancel: { label: 'Cancelar', onClick: () => {} },
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4 mr-1.5" />
      {isPending ? 'Excluindo...' : 'Excluir'}
    </Button>
  )
}
