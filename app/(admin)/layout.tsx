import { verifyAdmin } from '@/lib/dal'
import { AdminNav } from '@/components/admin/AdminNav'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import Link from 'next/link'
import { Coffee } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verifyAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
              <Coffee className="h-4 w-4 text-amber" />
              <span className="font-heading text-xl font-semibold tracking-tight leading-none">Cup Share</span>
            </Link>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
        <aside className="w-48 shrink-0">
          <AdminNav />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <Footer />
    </div>
  )
}
