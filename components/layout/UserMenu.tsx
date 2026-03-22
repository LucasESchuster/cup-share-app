'use client'

import Link from 'next/link'
import { User, BookOpen, Wrench, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/entrar'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Menu do usuário" />}>
        <User className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href="/perfil" />}>
          <User className="h-3.5 w-3.5" />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/receitas/nova" />}>
          <BookOpen className="h-3.5 w-3.5" />
          Nova receita
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/equipamentos" />}>
          <Wrench className="h-3.5 w-3.5" />
          Equipamentos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
