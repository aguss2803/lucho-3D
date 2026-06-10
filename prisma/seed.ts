import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Owner',
      password,
      role: 'OWNER',
    },
  })

  const userPass = await bcrypt.hash('user123', 10)
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Cliente',
      password: userPass,
      role: 'USER',
    },
  })

  await prisma.product.createMany({
    data: [
      {
        title: 'Miniatura 3D - Dragon',
        description: 'Figura detallada impresa en resina',
        price: 29.99,
        previousPrice: 39.99,
        category: 'Figuras',
        stock: 10,
        image: '/images/dragon.jpg',
        isOnOffer: true,
      },
      {
        title: 'Soporte para Teléfono - Geométrico',
        description: 'Diseño moderno para escritorio',
        price: 15.5,
        category: 'Accesorios',
        stock: 25,
        image: '/images/soporte.jpg',
        isOnOffer: false,
      },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
