import type { Metadata } from 'next'
import { getEquipment } from '@/lib/api/equipment'
import { EquipmentManager } from '@/components/admin/EquipmentManager'

export const metadata: Metadata = { title: 'Admin — Equipamentos' }

export default async function EquipamentosPage() {
  const equipment = await getEquipment()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Equipamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os equipamentos globais disponíveis para as receitas.
        </p>
      </div>
      <EquipmentManager initialEquipment={equipment} />
    </div>
  )
}
