'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Coffee, Wrench, Mail, Users } from 'lucide-react'

const links = [
  { href: '/admin/brew-methods', label: 'Métodos de preparo', icon: Coffee },
  { href: '/admin/equipamentos', label: 'Equipamentos', icon: Wrench },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/magic-links', label: 'Magic Links', icon: Mail },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
        Administração
      </p>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
