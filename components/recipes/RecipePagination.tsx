'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedMeta } from '@/lib/types'

interface RecipePaginationProps {
  meta: PaginatedMeta
}

export function RecipePagination({ meta }: RecipePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (meta.last_page <= 1) return null

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  const { current_page, last_page, total, per_page } = meta
  const from = (current_page - 1) * per_page + 1
  const to = Math.min(current_page * per_page, total)

  // Build page numbers to show: always first, last, current ±1, with ellipsis
  const pages: (number | 'ellipsis')[] = []
  const range = new Set([1, last_page, current_page - 1, current_page, current_page + 1].filter((p) => p >= 1 && p <= last_page))
  const sorted = Array.from(range).sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('ellipsis')
    pages.push(sorted[i])
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        {from}–{to} de {total} receitas
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(current_page - 1)}
          disabled={current_page === 1}
          className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="flex size-8 items-center justify-center text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`flex size-8 items-center justify-center rounded-lg text-sm transition-colors ${
                p === current_page
                  ? 'bg-foreground text-background font-medium'
                  : 'border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-current={p === current_page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(current_page + 1)}
          disabled={current_page === last_page}
          className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
