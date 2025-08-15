import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createOwnerUser() {
  try {
    console.log('🔍 Conectando a Neon PostgreSQL...');
    console.log('Database URL:', process.env.DATABASE_URL?.slice(0, 50) + '...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Conexión a Neon exitosa!');
    
    // Verificar si ya existe el usuario OWNER
    const existingUser = await prisma.user.findUnique({
      where: { email: 'deltaarg1@gmail.com' }
    });
    
    if (existingUser) {
      console.log('✅ Usuario OWNER ya existe:', existingUser.email);
      console.log('   - Rol:', existingUser.role);
      console.log('   - ID:', existingUser.id);
      console.log('   - Activo:', existingUser.isActive);
      return;
    }
    
    // Crear usuario OWNER
    console.log('🔄 Creando usuario OWNER...');
    const hashedPassword = await hash('Maico2005', 12);
    
    const newUser = await prisma.user.create({
      data: {
        email: 'deltaarg1@gmail.com',
        name: 'Owner Principal',
        password: hashedPassword,
        role: 'OWNER',
        isActive: true,
        isWorking: true,
        country: 'Global',
        lastActiveAt: new Date()
      }
    });
    
    console.log('✅ Usuario OWNER creado exitosamente en Neon:');
    console.log('   - Email:', newUser.email);
    console.log('   - Rol:', newUser.role);
    console.log('   - ID:', newUser.id);
    
    // Verificar tabla AccountDelivery
    const deliveryCount = await prisma.accountDelivery.count();
    console.log(`📦 Registros en AccountDelivery: ${deliveryCount}`);
    
    // Verificar otros usuarios
    const totalUsers = await prisma.user.count();
    console.log(`👥 Total de usuarios en Neon: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error conectando a Neon:', error);
    if (error instanceof Error) {
      console.error('Detalles:', error.message);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de Neon');
  }
}

createOwnerUser();
