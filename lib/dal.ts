import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('cup_share_token')?.value
  if (!token) redirect('/entrar')
  const { getMe } = await import('@/lib/api/users')
  const user = await getMe()
  return { token, user }
})

export const getOptionalToken = cache(async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get('cup_share_token')?.value
})

export const verifyAdmin = cache(async () => {
  const { user } = await verifySession()
  if (!user.is_admin) redirect('/')
  return { user }
})
