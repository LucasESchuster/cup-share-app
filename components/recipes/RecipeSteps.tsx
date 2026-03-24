'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { RecipeStep } from '@/lib/types'

export function RecipeSteps({ steps }: { steps: RecipeStep[] }) {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

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

  return (
    <ol>
      {steps.map((step, i) => {
        const isVisible = visibleSteps.has(i)
        return (
          <li
            key={step.order}
            ref={(el) => { itemRefs.current[i] = el }}
            className="group relative flex gap-4 pb-5 last:pb-0 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
            style={{ animationDelay: `${i * 75}ms`, animationDuration: '350ms' }}
          >
            {/* Linha conectora */}
            {i < steps.length - 1 && (
              <div className={cn(
                'absolute left-3.5 top-7 bottom-0 w-px transition-colors duration-700',
                isVisible ? 'bg-amber/50' : 'bg-border/70',
                'group-hover:bg-amber/70'
              )} />
            )}

            {/* Número do passo */}
            <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber text-amber-foreground text-xs font-semibold ring-4 ring-background">
              {isVisible && (
                <span
                  className="absolute inset-0 rounded-full bg-amber animate-ping"
                  style={{ animationIterationCount: 2, animationFillMode: 'forwards' }}
                />
              )}
              {step.order}
            </span>

            {/* Conteúdo */}
            <div className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3 transition-colors duration-200 group-hover:border-border/80">
              <p className="text-sm leading-relaxed">{step.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
