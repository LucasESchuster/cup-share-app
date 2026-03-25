import type { Metadata } from 'next'
import { adminGetUsers } from '@/lib/api/admin'
import { verifyAdmin } from '@/lib/dal'
import { UsersManager } from '@/components/admin/UsersManager'

export const metadata: Metadata = { title: 'Admin — Usuários' }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1

  const [{ user }, result] = await Promise.all([verifyAdmin(), adminGetUsers(page)])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie o acesso dos usuários à plataforma.
        </p>
      </div>
      <UsersManager data={result} currentPage={page} currentUserId={user.id} />
    </div>
  )
}
