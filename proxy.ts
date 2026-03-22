import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/perfil', '/receitas/nova', '/receitas/', '/equipamentos']
const authOnlyPaths = ['/entrar']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('cup_share_token')?.value

  // Edit paths under /receitas/[id]/editar are protected
  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) &&
    // /receitas/[id] (detail) is public; only /receitas/nova and /receitas/[id]/editar are protected
    (pathname === '/receitas/nova' || pathname.endsWith('/editar') || pathname.startsWith('/perfil') || pathname.startsWith('/equipamentos'))

  if (isProtected && !token) {
    const loginUrl = new URL('/entrar', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (authOnlyPaths.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.svg$).*)'],
}
