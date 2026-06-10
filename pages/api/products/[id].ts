import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (req.method === 'GET') {
    const p = await prisma.product.findUnique({ where: { id } })
    if (!p) return res.status(404).json({ error: 'Not found' })
    return res.json(p)
  }
  res.status(405).end()
}
