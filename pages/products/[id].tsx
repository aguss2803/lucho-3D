import Image from 'next/image'
import { GetServerSideProps } from 'next'
import { prisma } from '../../lib/prisma'

type Product = { id: number; title: string; description?: string; price: number; image?: string }

export default function ProductPage({ product }: { product: Product | null }) {
  if (!product) return <div className="container p-6">Producto no encontrado</div>
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      {product.image && <Image src={product.image} alt={product.title} width={256} height={256} className="w-64 h-64 object-cover mb-4" />}
      <div className="mb-4">{product.description}</div>
      <div className="text-xl font-bold">${product.price.toFixed(2)}</div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id)
  if (!id) return { props: { product: null } }
  try {
    const p = await prisma.product.findUnique({ where: { id } })
    if (!p) return { props: { product: null } }
    return { props: { product: { id: p.id, title: p.title, description: p.description || null, price: p.price, image: p.image || null } } }
  } catch (e) {
    return { props: { product: null } }
  }
}
