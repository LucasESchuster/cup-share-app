'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Coffee, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RecipeStep } from '@/lib/types'

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function RecipeSteps({ steps }: { steps: RecipeStep[] }) {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const [isStarted, setIsStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [checkedAt, setCheckedAt] = useState<Map<number, number>>(new Map())
  const [now, setNow] = useState<number>(0)

  const totalSteps = steps.length
  const completedCount = checkedAt.size
  const allComplete = isStarted && totalSteps > 0 && completedCount === totalSteps
  const elapsedMs = startTime ? Math.max(0, now - startTime) : 0
  const progressPct = totalSteps ? (completedCount / totalSteps) * 100 : 0

  useEffect(() => {
    const observers = itemRefs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => new Set([...prev, i]))
            obs.disconnect()
          }
        },
        { threshold: 0.2 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((obs) => obs?.disconnect())
  }, [steps.length])

  useEffect(() => {
    if (!isStarted || allComplete) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isStarted, allComplete])

  function handleStart() {
    const t = Date.now()
    setStartTime(t)
    setNow(t)
    setCheckedAt(new Map())
    setIsStarted(true)
  }

  function handleReset() {
    setIsStarted(false)
    setStartTime(null)
    setCheckedAt(new Map())
    setNow(0)
  }

  function toggleStep(order: number) {
    if (!isStarted || !startTime) return
    setCheckedAt((prev) => {
      const next = new Map(prev)
      if (next.has(order)) {
        next.delete(order)
      } else {
        next.set(order, Date.now() - startTime)
      }
      return next
    })
  }

  return (
    <div className="space-y-5">
      {!isStarted ? (
        <Button
          type="button"
          size="lg"
          onClick={handleStart}
          className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Play className="size-4" />
          Iniciar receita
        </Button>
      ) : (
        <ControlPanel
          elapsedMs={elapsedMs}
          progressPct={progressPct}
          completedCount={completedCount}
          totalSteps={totalSteps}
          onReset={handleReset}
        />
      )}

      <ol>
        {steps.map((step, i) => {
          const isVisible = visibleSteps.has(i)
          const checkedMs = checkedAt.get(step.order)
          const isChecked = checkedMs !== undefined
          const isInteractive = isStarted

          const rowContent = (
            <>
              <StepMarker
                order={step.order}
                isVisible={isVisible}
                isChecked={isChecked}
                isInteractive={isInteractive}
              />
              <div
                className={cn(
                  'flex-1 rounded-xl border px-4 py-3 transition-[opacity,colors,background-color,border-color,box-shadow] duration-300',
                  isChecked
                    ? 'border-primary/30 bg-card opacity-70'
                    : isInteractive
                      ? 'border-border/50 bg-card group-hover:border-amber/60 group-hover:bg-amber/[0.04] group-hover:shadow-sm group-active:scale-[0.99]'
                      : 'border-border/50 bg-card group-hover:border-border/80'
                )}
              >
                <p
                  className={cn(
                    'text-sm leading-relaxed transition-[color,text-decoration-color] duration-300',
                    isChecked && 'line-through text-muted-foreground decoration-muted-foreground/60'
                  )}
                >
                  {step.description}
                </p>
                {isChecked && (
                  <span
                    key={checkedMs}
                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary tabular-nums animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <Check className="size-3" />
                    Marcado em {formatTime(checkedMs!)}
                  </span>
                )}
                {isInteractive && !isChecked && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Toque para marcar
                  </span>
                )}
              </div>
            </>
          )

          return (
            <li
              key={step.order}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className="group relative pb-5 last:pb-0 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
              style={{ animationDelay: `${i * 75}ms`, animationDuration: '350ms' }}
            >
              {/* Linha conectora */}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute left-3.5 top-7 bottom-0 w-px transition-colors duration-700',
                    isChecked
                      ? 'bg-primary/40'
                      : isVisible
                        ? 'bg-amber/50'
                        : 'bg-border/70',
                    'group-hover:bg-amber/70'
                  )}
                />
              )}

              {isInteractive ? (
                <button
                  type="button"
                  onClick={() => toggleStep(step.order)}
                  aria-pressed={isChecked}
                  aria-label={
                    isChecked
                      ? `Desmarcar passo ${step.order}`
                      : `Marcar passo ${step.order} como feito`
                  }
                  className="flex w-full gap-4 text-left cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {rowContent}
                </button>
              ) : (
                <div className="flex gap-4">{rowContent}</div>
              )}
            </li>
          )
        })}
      </ol>

      {allComplete && <Celebration totalMs={elapsedMs} onReset={handleReset} />}
    </div>
  )
}

function StepMarker({
  order,
  isVisible,
  isChecked,
  isInteractive,
}: {
  order: number
  isVisible: boolean
  isChecked: boolean
  isInteractive: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-background transition-[background-color,color,transform] duration-300',
        isChecked
          ? 'bg-primary text-primary-foreground'
          : 'bg-amber text-amber-foreground',
        isInteractive && !isChecked && 'group-hover:scale-110 group-active:scale-95'
      )}
    >
      {isVisible && !isChecked && !isInteractive && (
        <span
          className="absolute inset-0 rounded-full bg-amber animate-ping"
          style={{ animationIterationCount: 2, animationFillMode: 'forwards' }}
        />
      )}
      {isChecked ? (
        <Check key="check" className="size-3.5 animate-in zoom-in-50 fade-in duration-300" />
      ) : (
        <span key="num" className="animate-in fade-in duration-200">
          {order}
        </span>
      )}
    </span>
  )
}

function ControlPanel({
  elapsedMs,
  progressPct,
  completedCount,
  totalSteps,
  onReset,
}: {
  elapsedMs: number
  progressPct: number
  completedCount: number
  totalSteps: number
  onReset: () => void
}) {
  return (
    <div
      key="control-panel"
      className="rounded-xl border border-border/70 bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Tempo total
          </p>
          <p className="font-mono tabular-nums text-2xl font-semibold leading-tight">
            {formatTime(elapsedMs)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Reiniciar
        </Button>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-amber transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {completedCount} de {totalSteps} {totalSteps === 1 ? 'passo' : 'passos'}
        </p>
      </div>
    </div>
  )
}

function Celebration({
  totalMs,
  onReset,
}: {
  totalMs: number
  onReset: () => void
}) {
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-xl border border-amber/40 bg-amber/5 px-6 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative">
        <span
          className="absolute -left-3 top-1 size-2 rounded-full bg-amber animate-ping"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="absolute -right-3 top-2 size-2 rounded-full bg-amber animate-ping"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="absolute left-1/2 -bottom-2 -translate-x-1/2 size-2 rounded-full bg-amber animate-ping"
          style={{ animationDelay: '300ms' }}
        />
        <Coffee className="size-10 text-amber animate-bounce" />
      </div>
      <div>
        <p className="font-heading text-2xl font-semibold">Café pronto!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tempo total:{' '}
          <span className="font-mono tabular-nums text-foreground">
            {formatTime(totalMs)}
          </span>
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReset}
        className="mt-1"
      >
        <RotateCcw className="size-4" />
        Reiniciar
      </Button>
    </div>
  )
}
