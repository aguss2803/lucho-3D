import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // NOTE: This route should be protected (check session / owner role) in production.
    if (req.method === 'POST') {
      const { title, description, price, previousPrice, category, stock, image, isOnOffer } = req.body
      if (!title || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      const product = await prisma.product.create({ data: { title, description, price: Number(price), previousPrice: previousPrice ? Number(previousPrice) : undefined, category: category || null, stock: Number(stock), image, isOnOffer: Boolean(isOnOffer) } })
      res.json(product)
      return
    }

    if (req.method === 'PUT') {
      const { id, price, previousPrice, category, stock, isOnOffer } = req.body
      const product = await prisma.product.update({ where: { id: Number(id) }, data: { price: price ? Number(price) : undefined, previousPrice: previousPrice ? Number(previousPrice) : undefined, category: category || undefined, stock: stock ? Number(stock) : undefined, isOnOffer: isOnOffer !== undefined ? Boolean(isOnOffer) : undefined } })
      res.json(product)
      return
    }

    if (req.method === 'PATCH') {
      const { id, isOnOffer, offerPrice } = req.body
      const prod = await prisma.product.findUnique({ where: { id: Number(id) } })
      if (!prod) return res.status(404).json({ error: 'Product not found' })
      if (isOnOffer) {
        if (offerPrice === undefined || Number(offerPrice) <= 0) {
          return res.status(400).json({ error: 'Invalid offer price' })
        }
        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: {
            isOnOffer: true,
            previousPrice: prod.price,
            price: Number(offerPrice),
          },
        })
        res.json(product)
        return
      }
      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          isOnOffer: false,
          price: prod.previousPrice ?? prod.price,
          previousPrice: null,
        },
      })
      res.json(product)
      return
    }

    if (req.method === 'DELETE') {
      const { id } = req.body
      await prisma.product.delete({ where: { id: Number(id) } })
      res.json({ ok: true })
      return
    }

    res.status(405).end()
  } catch (error: any) {
    console.error('Products API error:', error)
    res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
