import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || (token as any).role !== 'OWNER') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      const orders = await prisma.order.findMany({
        where: { status: 'AWAITING_APPROVAL' },
        orderBy: { createdAt: 'asc' },
        include: { items: true },
      })
      return res.status(200).json(orders)
    }

    if (req.method === 'POST') {
      const { id, action, message, deliveryEstimate } = req.body
      if (!id || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid request' })
      }

      const update = {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        paid: action === 'approve',
        paidAt: action === 'approve' ? new Date() : null,
        adminMessage: message || null,
        deliveryEstimate: deliveryEstimate || null,
      }

      const order = await prisma.order.update({
        where: { id: Number(id) },
        data: update,
        include: { items: true },
      })

      return res.status(200).json(order)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Admin payments API error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
