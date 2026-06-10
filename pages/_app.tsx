import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '../context/CartContext'
import { SessionProvider } from 'next-auth/react'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={(pageProps as any).session}>
      <CartProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </SessionProvider>
  )
}
