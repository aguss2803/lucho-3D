import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const userId = Number((token as any).sub || (token as any).id)
  if (!userId || Number.isNaN(userId)) {
    return res.status(401).json({ error: 'Invalid user token' })
  }

  const { items, total, paymentProof, shippingRequested, shippingCost } = req.body
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid items' })
  }
  if (!paymentProof || typeof paymentProof !== 'string') {
    return res.status(400).json({ error: 'Payment proof is required' })
  }

  const orderItems = items.map((it: any, index: number) => {
    const productId = Number(it.id)
    const qty = Number(it.qty)
    const price = Number(it.price)
    if (!productId || Number.isNaN(productId) || qty <= 0 || Number.isNaN(qty) || price < 0 || Number.isNaN(price)) {
      throw new Error(`Invalid item at index ${index}`)
    }
    return { productId, qty, price }
  })

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        total: Number(total),
        paymentProof,
        shippingRequested: Boolean(shippingRequested),
        shippingCost: shippingRequested ? Number(shippingCost) : undefined,
        status: 'APPROVED',
        paid: true,
        paidAt: new Date(),
        items: { create: orderItems },
      },
      include: { items: true },
    })
    return res.json({ orderId: order.id })
  } catch (e) {
    console.error('failed creating order', {
      userId,
      total,
      paymentProof,
      shippingRequested,
      shippingCost,
      orderItems,
      error: e,
    })
    return res.status(500).json({ error: 'Failed creating order', details: String(e) })
  }
}
