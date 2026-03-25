import type { Metadata } from 'next'
import { ShieldOff } from 'lucide-react'
import { LogoutButton } from '@/components/auth/LogoutButton'

export const metadata: Metadata = { title: 'Conta suspensa' }

interface PageProps {
  searchParams: Promise<{ banned_at?: string; reason?: string }>
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default async function SuspensaPage({ searchParams }: PageProps) {
  const { banned_at, reason } = await searchParams

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldOff className="h-7 w-7 text-destructive" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Conta suspensa</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta foi suspensa.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 text-left space-y-3">
          {banned_at && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data do ban</p>
              <p className="text-sm mt-0.5">{formatDate(banned_at)}</p>
            </div>
          )}
          {reason && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Motivo</p>
              <p className="text-sm mt-0.5">{reason}</p>
            </div>
          )}
          {!banned_at && !reason && (
            <p className="text-sm text-muted-foreground">Nenhum detalhe disponível.</p>
          )}
        </div>

        <LogoutButton />
      </div>
    </div>
  )
}
