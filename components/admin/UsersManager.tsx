'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { banUserAction, unbanUserAction } from '@/app/actions/admin'
import type { AdminUser, Paginated } from '@/lib/types'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

// ─── Ban Dialog ───────────────────────────────────────────────────────────────

function BanDialog({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!reason.trim()) {
      setError('Informe o motivo do ban.')
      return
    }
    startTransition(async () => {
      const result = await banUserAction(user.id, reason.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setReason('')
        setError(undefined)
        toast.success(`${user.name} foi banido.`)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setReason(''); setError(undefined) } }}>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Banir
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banir {user.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Motivo</label>
            <Input
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(undefined) }}
              placeholder="ex: Violação dos termos de uso."
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <p className="text-xs text-muted-foreground">
            O usuário perderá acesso imediatamente.
          </p>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Banindo...' : 'Confirmar ban'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Unban Button ─────────────────────────────────────────────────────────────

function UnbanButton({ user }: { user: AdminUser }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    toast(`Desbanir "${user.name}"?`, {
      action: {
        label: 'Desbanir',
        onClick: () =>
          startTransition(async () => {
            const result = await unbanUserAction(user.id)
            if (result.error) toast.error(result.error)
            else toast.success(`${user.name} foi desbloqueado.`)
          }),
      },
      cancel: { label: 'Cancelar', onClick: () => {} },
    })
  }

  return (
    <Button variant="outline" size="sm" className="text-xs" onClick={handleClick} disabled={isPending}>
      {isPending ? '...' : 'Desbanir'}
    </Button>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, lastPage, total }: { currentPage: number; lastPage: number; total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) params.delete('page')
    else params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{total} usuários</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => goTo(currentPage - 1)}>
          Anterior
        </Button>
        <span>{currentPage} / {lastPage}</span>
        <Button variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => goTo(currentPage + 1)}>
          Próxima
        </Button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UsersManager({ data, currentPage, currentUserId }: { data: Paginated<AdminUser>; currentPage: number; currentUserId: number }) {
  const users = data.data
  const meta = data.meta

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum usuário encontrado.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Usuário</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground hidden sm:table-cell">Desde</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    {user.ban_reason && (
                      <div className="text-xs text-destructive/80 mt-0.5">Motivo: {user.ban_reason}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    {user.banned_at !== null ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        Banido
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {user.id !== currentUserId && !user.is_admin && (
                      user.banned_at !== null
                        ? <UnbanButton user={user} />
                        : <BanDialog user={user} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} total={meta.total} />
      )}
    </div>
  )
}
