import { Coffee } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 py-6">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Coffee className="h-3.5 w-3.5" />
          <span>Cup Share</span>
        </div>
        <p>Compartilhe o que você prova.</p>
      </div>
    </footer>
  )
}
