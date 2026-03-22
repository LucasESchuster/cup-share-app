import Link from 'next/link'
import { Coffee } from 'lucide-react'
import { cookies } from 'next/headers'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { LinkButton } from '@/components/ui/link-button'

export async function Header() {
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get('cup_share_token')?.value

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <Coffee className="h-5 w-5 text-primary" />
          <span>Cup Share</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors px-2 sm:block">
            Receitas
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <LinkButton href="/entrar" size="sm" className="ml-1">
              Entrar
            </LinkButton>
          )}
        </nav>
      </div>
    </header>
  )
}
