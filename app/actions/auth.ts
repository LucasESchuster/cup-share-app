'use server'

export async function requestMagicLink(
  prevState: { success: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')?.toString().trim()
  const turnstileToken = formData.get('cf-turnstile-response')?.toString()

  if (!email) {
    return { success: false, error: 'Informe seu e-mail' }
  }

  if (!turnstileToken) {
    return { success: false, error: 'Complete a verificação anti-bot e tente novamente.' }
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
        callback_url: `${process.env.APP_URL}/auth/callback`,
        cf_turnstile_response: turnstileToken,
      }),
    })

    if (res.status === 422) {
      const body = (await res.json().catch(() => null)) as
        | { errors?: Record<string, string[]>; message?: string }
        | null
      const turnstileError = body?.errors?.cf_turnstile_response?.[0]
      if (turnstileError) return { success: false, error: turnstileError }
      const emailError = body?.errors?.email?.[0]
      if (emailError) return { success: false, error: emailError }
      return { success: false, error: body?.message ?? 'Não foi possível enviar o link.' }
    }

    if (!res.ok && res.status !== 202) {
      return { success: false, error: 'Não foi possível enviar o link. Tente novamente.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Erro de conexão. Verifique sua internet.' }
  }
}
