import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { cookies } from 'next/headers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  axes: ['opsz'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cup-share.lucaseduardoschuster.com'),
  title: {
    default: 'Cup Share',
    template: '%s | Cup Share',
  },
  description: 'Compartilhe e descubra receitas de café excepcionais.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://cup-share.lucaseduardoschuster.com',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://cup-share.lucaseduardoschuster.com',
    siteName: 'Cup Share',
    title: 'Cup Share',
    description: 'Compartilhe e descubra receitas de café excepcionais.',
  },
  twitter: {
    card: 'summary',
    title: 'Cup Share',
    description: 'Compartilhe e descubra receitas de café excepcionais.',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value === 'dark' ? 'dark' : ''

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased ${theme}`.trim()}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
