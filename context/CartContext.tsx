import React, { createContext, useContext, useEffect, useState } from 'react'

type CartItem = { id: number; title: string; price: number; qty: number }

type CartContextType = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: number) => void
  clear: () => void
  total: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart')
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (e) {}
  }, [items])

  const add = (item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + item.qty } : p))
      return [...prev, item]
    })
  }

  const remove = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id))
  const clear = () => setItems([])
  const total = () => items.reduce((s, i) => s + i.price * i.qty, 0)

  return <CartContext.Provider value={{ items, add, remove, clear, total }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export type { CartItem }
