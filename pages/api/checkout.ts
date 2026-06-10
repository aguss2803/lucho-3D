import type { NextApiRequest, NextApiResponse } from 'next'
import PDFDocument from 'pdfkit'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const userId = Number((token as any).sub || token.id)
  const { items, total } = req.body

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      items: {
        create: items.map((it: any) => ({ productId: it.id, qty: it.qty, price: it.price })),
      },
    },
    include: { items: true },
  })
  // Fetch product details for nicer invoice
  const productIds = order.items.map((it) => it.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const prodMap: Record<number, any> = {}
  products.forEach((p) => (prodMap[p.id] = p))

  // Generate PDF invoice and stream
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`)

  // Header
  doc.rect(0, 0, 595.28, 100).fill('#0ea5a4')
  doc.fillColor('white').fontSize(20).text('Lucho 3D', 60, 30)
  doc.fontSize(10).text('Factura', 480, 30)
  doc.fontSize(9).text(`Orden #${order.id}`, 480, 45)
  doc.fontSize(9).text(`Fecha: ${new Date(order.createdAt).toLocaleString()}`, 480, 60)

  doc.moveDown(4)
  doc.fillColor('black')

  // Customer / Company
  doc.fontSize(10).text('Lucho 3D - RUC: 00000000', 50, 120)
  doc.fontSize(9).text('Contacto: contacto@lucho3d.example', 50, 135)

  // Table header
  const tableTop = 170
  doc.fontSize(10).text('Producto', 50, tableTop)
  doc.text('Cantidad', 320, tableTop)
  doc.text('Precio', 400, tableTop, { width: 90, align: 'right' })
  doc.text('Total', 0, tableTop, { align: 'right' })

  let position = tableTop + 20
  let subtotal = 0
  order.items.forEach((it) => {
    const p = prodMap[it.productId]
    const title = p ? p.title : `ID ${it.productId}`
    const lineTotal = it.price * it.qty
    subtotal += lineTotal
    doc.fontSize(9).text(title, 50, position)
    doc.text(String(it.qty), 320, position)
    doc.text(`$${it.price.toFixed(2)}`, 400, position, { width: 90, align: 'right' })
    doc.text(`$${lineTotal.toFixed(2)}`, 0, position, { align: 'right' })
    position += 20
  })

  const tax = subtotal * 0.12
  const totalCalc = subtotal + tax

  position += 10
  doc.text('Subtotal', 400, position, { width: 90, align: 'right' })
  doc.text(`$${subtotal.toFixed(2)}`, 0, position, { align: 'right' })
  position += 15
  doc.text('Impuesto (12%)', 400, position, { width: 90, align: 'right' })
  doc.text(`$${tax.toFixed(2)}`, 0, position, { align: 'right' })
  position += 15
  doc.fontSize(12).text('Total', 400, position, { width: 90, align: 'right' })
  doc.fontSize(12).text(`$${totalCalc.toFixed(2)}`, 0, position, { align: 'right' })

  // Footer
  doc.fontSize(9).fillColor('gray').text('Gracias por su compra. Contacto: contacto@lucho3d.example', 50, 760, { align: 'center', width: 500 })

  doc.end()
  doc.pipe(res as any)
}
