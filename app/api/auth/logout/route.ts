import { NextResponse } from 'next/server'
import { deleteSession, getToken } from '@/lib/session'

export async function POST() {
  const token = await getToken()

  if (token) {
    try {
      await fetch(`${process.env.API_BASE_URL}/auth/logout`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Ignore backend errors — delete the session regardless
    }
  }

  await deleteSession()
  return new NextResponse(null, { status: 200 })
}
