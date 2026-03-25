'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { MagicLink, MagicLinkStatus, Paginated } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<MagicLinkStatus, string> = {
  pending: 'Pendente',
  used: 'Usado',
  expired: 'Expirado',
}

const STATUS_STYLES: Record<MagicLinkStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  used: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-muted text-muted-foreground',
}

function StatusBadge({ status }: { status: MagicLinkStatus }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ─── Status Filter ────────────────────────────────────────────────────────────

function StatusFilter({ current }: { current?: MagicLinkStatus }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setStatus(status?: MagicLinkStatus) {
    const params = new URLSearchParams(searchParams.toString())
    if (status) params.set('status', status)
    else params.delete('status')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const options: { value?: MagicLinkStatus; label: string }[] = [
    { value: undefined, label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'used', label: 'Usados' },
    { value: 'expired', label: 'Expirados' },
  ]

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map(({ value, label }) => (
        <button
          key={label}
          onClick={() => setStatus(value)}
          className={cn(
            'text-xs px-3 py-1 rounded-full border transition-colors',
            current === value
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'
          )}
        >
          {label}
        </button>
      ))}
    </div>
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
      <span>{total} registros</span>
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

// ─── Main Table ───────────────────────────────────────────────────────────────

export function MagicLinksTable({
  data,
  currentStatus,
  currentPage,
}: {
  data: Paginated<MagicLink>
  currentStatus?: MagicLinkStatus
  currentPage: number
}) {
  const meta = data.meta
  const links = data.data

  return (
    <div className="space-y-4">
      <StatusFilter current={currentStatus} />

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum magic link encontrado.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Usuário</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground hidden sm:table-cell">Criado em</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground hidden md:table-cell">Expira em</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{link.user.name}</div>
                    <div className="text-xs text-muted-foreground">{link.user.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                    {formatDate(link.created_at)}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                    {formatDate(link.expires_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={link.status} />
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
