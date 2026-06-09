import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const userId = Number((token as any).sub || token.id)
    const count = await prisma.order.count({
      where: {
        userId,
        adminMessage: { not: null },
      },
    })

    return res.status(200).json({ count })
  } catch (error: any) {
    console.error('Message count API error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
