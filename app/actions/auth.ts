'use server'

export async function requestMagicLink(
  prevState: { success: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')?.toString().trim()

  if (!email) {
    return { success: false, error: 'Informe seu e-mail' }
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }),
    })

    if (!res.ok && res.status !== 202) {
      return { success: false, error: 'Não foi possível enviar o link. Tente novamente.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro de conexão. Verifique sua internet.' }
  }
}
