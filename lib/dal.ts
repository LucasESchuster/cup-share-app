import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('cup_share_token')?.value
  if (!token) redirect('/entrar')
  return { token }
})

export const getOptionalToken = cache(async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get('cup_share_token')?.value
})
