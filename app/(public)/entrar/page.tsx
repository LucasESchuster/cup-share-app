import { Coffee } from 'lucide-react'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
}

interface PageProps {
  searchParams: Promise<{ erro?: string }>
}

const errorMessages: Record<string, string> = {
  'link-invalido': 'O link expirou ou já foi usado. Solicite um novo.',
  'sem-token': 'Link inválido. Solicite um novo.',
}

export default async function EntrarPage({ searchParams }: PageProps) {
  const { erro } = await searchParams
  const errorMessage = erro ? errorMessages[erro] : undefined

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Coffee className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Cup Share</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com seu e-mail para acessar sua conta.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <MagicLinkForm errorMessage={errorMessage} />
        </div>
      </div>
    </div>
  )
}
