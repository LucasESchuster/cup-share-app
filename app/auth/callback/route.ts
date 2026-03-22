import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/entrar?erro=sem-token', request.url))
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/magic-link/${token}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.redirect(new URL('/entrar?erro=link-invalido', request.url))
    }

    const data: { token: string } = await res.json()
    await createSession(data.token)

    return NextResponse.redirect(new URL('/', request.url))
  } catch {
    return NextResponse.redirect(new URL('/entrar?erro=link-invalido', request.url))
  }
}
