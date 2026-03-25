import type { Metadata } from 'next'
import { getBrewMethods } from '@/lib/api/reference'
import { BrewMethodsManager } from '@/components/admin/BrewMethodsManager'

export const metadata: Metadata = { title: 'Admin — Métodos de preparo' }

export default async function BrewMethodsPage() {
  const brewMethods = await getBrewMethods()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Métodos de preparo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os métodos disponíveis para as receitas.
        </p>
      </div>
      <BrewMethodsManager initialBrewMethods={brewMethods} />
    </div>
  )
}
