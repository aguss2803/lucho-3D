import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

function CartCountBadge() {
  const { items } = useCart()
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
  if (!totalQty) return null
  return <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 text-xs text-white px-1">{totalQty}</span>
}

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!session) return

    const loadMessages = async () => {
      const response = await fetch('/api/user/messages/count', { credentials: 'include' })
      if (!response.ok) {
        setUnreadMessages(0)
        return
      }
      const data = await response.json()
      setUnreadMessages(data.count || 0)
    }

    loadMessages()
  }, [session])

  return (
    <header className="bg-gradient-to-r from-teal-100 to-sky-100 text-slate-800 shadow-sm">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <button onClick={() => router.push(session ? '/home' : '/')} className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"> 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" ><path d="M12 2L15 8l6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z"/></svg>
          AL<br></br>alforge3dstudio
        </button>
        <nav className="flex items-center gap-4">
          <Link href="/offers" className="hover:underline flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 12h-16M12 4v16"/></svg> Ofertas</Link>
          <Link href="/about" className="hover:underline flex items-center gap-1">Historia</Link>
          {session && (
            <Link href="/orders" className="relative btn-ghost flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Mensajes
              {unreadMessages > 0 && <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 text-xs text-white px-1">{unreadMessages}</span>}
            </Link>
          )}
          <Link href="/cart" className="relative btn-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg> Carrito
            <CartCountBadge />
          </Link>
          {!session && (
            <Link href="/login" className="btn-ghost flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Entrar</Link>
          )}

          {session && (
            <div className="relative">
              <button onClick={() => setOpen((s) => !s)} className="btn-ghost flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>{(session.user as any)?.name ?? (session.user as any)?.email}</span>
              </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md text-slate-800 z-50">
                      {/* Only show admin panel if user is OWNER */}
                      {((session?.user as any)?.role === 'OWNER') ? (
                        <Link href="/admin" className="block px-3 py-2 hover:bg-slate-100" onClick={() => setOpen(false)}>Panel</Link>
                      ) : (
                        <Link href="/account" className="block px-3 py-2 hover:bg-slate-100" onClick={() => setOpen(false)}>Mi cuenta</Link>
                      )}
                      <button type="button" onClick={() => {setOpen(false); signOut()}} className="w-full text-left px-3 py-2 hover:bg-slate-100">Cerrar sesión</button>
                    </div>
                  )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
