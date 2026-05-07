'use client'

import { useRef, useSyncExternalStore } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

type Theme = 'light' | 'dark'

function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

interface TurnstileWidgetProps {
  onToken: (token: string | undefined) => void
}

export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const ref = useRef<TurnstileInstance>(undefined)
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    readTheme,
    () => 'light'
  )
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) {
    return (
      <p className="text-xs text-destructive">
        Turnstile não configurado. Defina NEXT_PUBLIC_TURNSTILE_SITE_KEY.
      </p>
    )
  }

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      options={{ theme, language: 'pt-BR' }}
      onSuccess={(token) => onToken(token)}
      onExpire={() => {
        onToken(undefined)
        ref.current?.reset()
      }}
      onError={() => onToken(undefined)}
    />
  )
}
