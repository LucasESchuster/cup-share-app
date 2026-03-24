import { Coffee } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 py-8">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Coffee className="h-3.5 w-3.5 text-amber" />
          <span className="font-heading text-sm font-medium text-foreground/70">Cup Share</span>
          <span className="text-border/70">·</span>
          <span className="text-xs text-muted-foreground">Lucas Eduardo Schuster · {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-muted-foreground italic">Feito com carinho por quem ama café.</p>
      </div>
    </footer>
  )
}
