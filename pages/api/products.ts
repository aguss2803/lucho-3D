import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { min, max, offer, category } = req.query
      const where: any = {}
      if (offer === 'true' || offer === '1') where.isOnOffer = true
      if (category && category !== 'Todas') where.category = String(category)
      if (min) where.price = { ...(where.price || {}), gte: Number(min) }
      if (max) where.price = { ...(where.price || {}), lte: Number(max) }
      const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } })
      res.json(products)
      return
    }

    res.status(405).end()
  } catch (error: any) {
    console.error('Products GET error:', error)
    res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
