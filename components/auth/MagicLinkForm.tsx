'use client'

import { useActionState } from 'react'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestMagicLink } from '@/app/actions/auth'

export function MagicLinkForm({ errorMessage }: { errorMessage?: string }) {
  const [state, action, pending] = useActionState(requestMagicLink, undefined)

  if (state?.success) {
    return (
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
          <Mail className="h-5 w-5 text-accent-foreground" />
        </div>
        <h2 className="font-semibold">Verifique seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de acesso. Clique nele para entrar.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@exemplo.com"
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      {(state?.error || errorMessage) && (
        <p className="text-sm text-destructive">{state?.error ?? errorMessage}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Enviar link de acesso
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
