import Link from 'next/link'
import { cookies } from 'next/headers'
import { Coffee } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { LinkButton } from '@/components/ui/link-button'
import { getOptionalToken } from '@/lib/dal'
import { getMe } from '@/lib/api/users'

export async function Header() {
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get('cup_share_token')?.value

  let isAdmin = false
  if (isAuthenticated) {
    try {
      const token = await getOptionalToken()
      if (token) {
        const user = await getMe()
        isAdmin = user.is_admin ?? false
      }
    } catch {
      // non-critical — swallow errors
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
          <Coffee className="h-4 w-4 text-amber" />
          <span className="font-heading text-xl font-semibold tracking-tight leading-none">Cup Share</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/60 sm:block"
          >
            Receitas
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <UserMenu isAdmin={isAdmin} />
          ) : (
            <LinkButton href="/entrar" size="sm" className="ml-1.5">
              Entrar
            </LinkButton>
          )}
        </nav>
      </div>
    </header>
  )
}
