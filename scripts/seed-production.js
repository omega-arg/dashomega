const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de producción...')
  
  // Verificar si ya existe el usuario owner
  const existingOwner = await prisma.user.findUnique({
    where: { email: 'deltaarg1@gmail.com' }
  })

  if (existingOwner) {
    console.log('✅ Usuario owner ya existe. Seed completado.')
    return
  }

  // Crear usuario owner principal
  const hashedPassword = await bcrypt.hash('Maico2005', 10)
  
  const owner = await prisma.user.create({
    data: {
      email: 'deltaarg1@gmail.com',
      name: 'Owner Principal',
      role: 'OWNER',
      password: hashedPassword,
      isActive: true,
      country: '🇺🇸 Estados Unidos',
      salary: 0,
      weeklyTarget: 40,
      totalHoursToday: 0,
      isWorking: false,
      joinedAt: new Date(),
      lastActiveAt: new Date()
    }
  })

  console.log('✅ Usuario owner creado:', {
    email: owner.email,
    name: owner.name,
    role: owner.role
  })

  console.log('🎉 Seed de producción completado!')
  console.log('📝 Credenciales de acceso:')
  console.log('   Email: deltaarg1@gmail.com')
  console.log('   Password: Maico2005')
  console.log('⚠️  IMPORTANTE: Estas son las credenciales definitivas del owner!')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
