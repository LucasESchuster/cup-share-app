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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-7">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Cup Share</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Entre com seu e-mail para acessar sua conta.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-7 shadow-sm shadow-foreground/5">
          <MagicLinkForm errorMessage={errorMessage} />
        </div>
      </div>
    </div>
  )
}
