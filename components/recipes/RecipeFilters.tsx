'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, Coffee, Zap, Flame, Snowflake, ArrowUpDown, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { BrewMethod, BrewMethodCategory } from '@/lib/types'

const CATEGORY_OPTIONS: {
  value: BrewMethodCategory
  label: string
  icon: React.ElementType
}[] = [
  { value: 'filter',    label: 'Filtrado',  icon: Coffee },
  { value: 'espresso',  label: 'Espresso',  icon: Zap },
  { value: 'pressure',  label: 'Pressão',   icon: Flame },
  { value: 'cold_brew', label: 'Cold Brew', icon: Snowflake },
]

const SORT_OPTIONS = [
  { value: 'created_at:desc',  label: 'Mais recentes' },
  { value: 'created_at:asc',   label: 'Mais antigas' },
  { value: 'likes_count:desc', label: 'Mais curtidas' },
  { value: 'likes_count:asc',  label: 'Menos curtidas' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

const SENTINEL = '__all__'

interface RecipeFiltersProps {
  brewMethods: BrewMethod[]
}

export function RecipeFilters({ brewMethods }: RecipeFiltersProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const currentTitle        = searchParams.get('title') ?? ''
  const currentCategory     = (searchParams.get('category') as BrewMethodCategory) ?? ''
  const currentBrewMethodId = searchParams.get('brew_method_id') ?? ''
  const currentSortBy       = searchParams.get('sort_by') ?? ''
  const currentSortDir      = searchParams.get('sort_dir') ?? ''
  const currentSort: SortValue | typeof SENTINEL =
    currentSortBy && currentSortDir
      ? (`${currentSortBy}:${currentSortDir}` as SortValue)
      : SENTINEL

  const [titleInput, setTitleInput] = useState(currentTitle)
  const [isOpen, setIsOpen]         = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitleInput(searchParams.get('title') ?? '')
  }, [searchParams])

  const buildParams = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      for (const [key, value] of Object.entries(overrides)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      return params
    },
    [searchParams]
  )

  const navigate = useCallback(
    (overrides: Record<string, string>) => {
      router.push(`${pathname}?${buildParams(overrides).toString()}`)
    },
    [router, pathname, buildParams]
  )

  function handleTitleChange(value: string) {
    setTitleInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => navigate({ title: value }), 400)
  }

  function handleCategoryChange(value: BrewMethodCategory | '') {
    const methodStillValid =
      !value ||
      !currentBrewMethodId ||
      brewMethods.find((m) => m.id.toString() === currentBrewMethodId)?.category === value
    navigate({ category: value, brew_method_id: methodStillValid ? currentBrewMethodId : '' })
  }

  function handleBrewMethodChange(value: string | null) {
    const brew_method_id = !value || value === SENTINEL ? '' : value
    const category = brew_method_id
      ? (brewMethods.find((m) => m.id.toString() === brew_method_id)?.category ?? '')
      : currentCategory
    navigate({ brew_method_id, category })
  }

  function handleSortChange(value: string | null) {
    if (!value || value === SENTINEL) { navigate({ sort_by: '', sort_dir: '' }); return }
    const [sort_by, sort_dir] = value.split(':')
    navigate({ sort_by: sort_by ?? '', sort_dir: sort_dir ?? '' })
  }

  function handleClear() {
    setTitleInput('')
    router.push(pathname)
  }

  const activeFilterCount  = [currentTitle, currentCategory, currentBrewMethodId].filter(Boolean).length
  const hasAnyFilter       = activeFilterCount > 0 || (currentSortBy && currentSortDir)
  const selectedBrewMethod = brewMethods.find((m) => m.id.toString() === currentBrewMethodId)
  const selectedSort       = SORT_OPTIONS.find((o) => o.value === currentSort)
  const visibleBrewMethods = currentCategory
    ? brewMethods.filter((m) => m.category === currentCategory)
    : brewMethods

  return (
    <div className="mb-8">

      {/* ── Header / toggle ──────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group/toggle mb-3 flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          Filtros
          {!isOpen && activeFilterCount > 0 && (
            <span className="flex items-center gap-1">
              {[currentCategory, currentBrewMethodId].filter(Boolean).map((v) => {
                const cat    = CATEGORY_OPTIONS.find((o) => o.value === v)
                const method = brewMethods.find((m) => m.id.toString() === v)
                const Icon   = cat?.icon
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber"
                  >
                    {Icon && <Icon className="size-3" />}
                    {cat?.label ?? method?.name}
                  </span>
                )
              })}
              {currentTitle && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">
                  <Search className="size-3" />
                  {currentTitle.length > 16 ? `${currentTitle.slice(0, 16)}…` : currentTitle}
                </span>
              )}
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          'size-4 text-muted-foreground/60 transition-transform duration-300',
          isOpen ? 'rotate-180' : 'rotate-0'
        )} />
      </button>

      {/* ── Collapsible content ──────────────────────────────────── */}
      <div className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}>
        <div className="overflow-hidden">
          <div className="space-y-3 pb-1">

            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors duration-200 group-focus-within:text-amber pointer-events-none" />
              <Input
                type="search"
                placeholder="Buscar receitas..."
                value={titleInput}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-10 pl-9 pr-4 text-sm bg-card border-border/60 rounded-xl shadow-sm focus-visible:border-amber/50 focus-visible:ring-amber/20 transition-all duration-200 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => {
                const isActive = currentCategory === value
                return (
                  <button
                    key={value}
                    onClick={() => handleCategoryChange(isActive ? '' : value)}
                    className={cn(
                      'group/chip inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95',
                      isActive
                        ? 'border-amber/40 bg-amber/10 text-amber shadow-sm shadow-amber/10'
                        : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className={cn(
                      'size-3.5 transition-transform duration-200',
                      isActive ? 'scale-110' : 'group-hover/chip:scale-110'
                    )} />
                    {label}
                    {isActive && <X className="size-3 ml-0.5 opacity-60" />}
                  </button>
                )
              })}
            </div>

            {/* Method + Sort + Clear */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Método */}
              <div className="flex-1 min-w-36">
                <Select value={currentBrewMethodId || SENTINEL} onValueChange={handleBrewMethodChange}>
                  <SelectTrigger className="w-full h-9 rounded-xl border-border/60 bg-card text-sm shadow-sm">
                    <SelectValue>
                      <span className={cn(
                        'transition-colors duration-150',
                        selectedBrewMethod ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {selectedBrewMethod?.name ?? 'Método'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value={SENTINEL}>Todos os métodos</SelectItem>
                    {visibleBrewMethods.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex-1 min-w-40">
                <Select value={currentSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full h-9 rounded-xl border-border/60 bg-card text-sm shadow-sm">
                    <SelectValue>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ArrowUpDown className="size-3.5 shrink-0" />
                        {selectedSort?.label ?? 'Mais recentes'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              {hasAnyFilter && (
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-all duration-200 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive active:scale-95"
                >
                  <X className="size-3" />
                  Limpar
                  {activeFilterCount > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-semibold tabular-nums">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
