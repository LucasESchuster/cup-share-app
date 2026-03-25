'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/entrar'
    })
  }

  return (
    <Button variant="outline" className="w-full gap-2" onClick={handleLogout} disabled={isPending}>
      <LogOut className="h-4 w-4" />
      {isPending ? 'Saindo...' : 'Sair da conta'}
    </Button>
  )
}
