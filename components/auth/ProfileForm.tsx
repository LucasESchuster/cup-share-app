'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction } from '@/app/actions/user'
import { toast } from 'sonner'
import type { User } from '@/lib/types'
import { useEffect } from 'react'

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined)

  useEffect(() => {
    if (state === undefined && !pending) return
    if (!state?.error && !pending) {
      toast.success('Perfil atualizado!')
    }
  }, [state, pending])

  return (
    <form action={action} className="space-y-4">
      <h2 className="font-semibold">Informações da conta</h2>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
        {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-display">E-mail</Label>
        <Input id="email-display" value={user.email} disabled className="bg-muted" />
      </div>

      <Button type="submit" disabled={pending} size="sm">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar
      </Button>
    </form>
  )
}
