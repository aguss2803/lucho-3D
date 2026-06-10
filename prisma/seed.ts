import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Hashear contraseñas
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  // 2. Crear o actualizar Administrador
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword }, // Fuerza la contraseña correcta si ya existe
    create: {
      email: 'admin@example.com',
      name: 'Owner',
      password: adminPassword,
      role: 'OWNER',
    },
  })

  // 3. Crear o actualizar Cliente estándar
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { password: userPassword }, // Fuerza la contraseña correcta si ya existe
    create: {
      email: 'user@example.com',
      name: 'Cliente',
      password: userPassword,
      role: 'USER',
    },
  })

  // 4. Limpiar productos viejos para evitar duplicados / errores de ID
  // (Esto borra los productos antes de sembrar los nuevos, asegurando un estado limpio)
  await prisma.product.deleteMany({})

  // 5. Cargar productos iniciales
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

  console.log('🌱 Base de datos sembrada con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })