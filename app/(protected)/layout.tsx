import { verifySession } from '@/lib/dal'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await verifySession()

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
