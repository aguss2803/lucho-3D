import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import FloatingCart from './FloatingCart'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const hideFooter = router.pathname === '/' || router.pathname === '/login'
  const hideHeader = router.pathname === '/' || router.pathname === '/login'

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1 relative">
        {children}
        {!hideHeader && <FloatingCart />}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
