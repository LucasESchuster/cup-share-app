import type { Metadata } from 'next'
import { adminGetMagicLinks } from '@/lib/api/admin'
import { MagicLinksTable } from '@/components/admin/MagicLinksTable'
import type { MagicLinkStatus } from '@/lib/types'

export const metadata: Metadata = { title: 'Admin — Magic Links' }

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function MagicLinksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = (['pending', 'used', 'expired'].includes(params.status ?? '')
    ? params.status
    : undefined) as MagicLinkStatus | undefined
  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1

  const result = await adminGetMagicLinks({ status, page })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Magic Links</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitore os links de acesso enviados por e-mail.
        </p>
      </div>
      <MagicLinksTable data={result} currentStatus={status} currentPage={page} />
    </div>
  )
}
