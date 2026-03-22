'use client'

import { Clock } from 'lucide-react'
import type { RecipeStep } from '@/lib/types'

function formatBrewTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}min ${s}s` : `${m}min`
}

export function RecipeSteps({ steps }: { steps: RecipeStep[] }) {
  return (
    <ol>
      {steps.map((step, i) => (
        <li
          key={step.order}
          className="relative flex gap-4 pb-5 last:pb-0 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
          style={{ animationDelay: `${i * 75}ms`, animationDuration: '350ms' }}
        >
          {/* Linha conectora */}
          {i < steps.length - 1 && (
            <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border/70" />
          )}

          {/* Número do passo */}
          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber text-amber-foreground text-xs font-semibold ring-4 ring-background">
            {step.order}
          </span>

          {/* Conteúdo */}
          <div className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3">
            <p className="text-sm leading-relaxed">{step.description}</p>
            {step.duration_seconds && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">
                  {formatBrewTime(step.duration_seconds)}
                </span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
