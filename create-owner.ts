import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createOwnerUser() {
  console.log('🚀 Creando nuevo usuario owner...');
  
  const email = 'deltaarg1@gmail.com';
  const password = 'Maico2005';
  const name = 'Maico Owner';
  
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('⚠️ El usuario ya existe. Actualizando...');
      
      const hashedPassword = await hash(password, 12);
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role: 'OWNER',
          isActive: true,
          country: 'Argentina',
          salary: 50000,
          weeklyTarget: 40,
          isWorking: false,
          totalHoursToday: 0
        }
      });
      
      console.log('✅ Usuario actualizado exitosamente!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Nombre:', updatedUser.name);
      console.log('🔑 Role:', updatedUser.role);
      
    } else {
      console.log('➕ Creando nuevo usuario...');
      
      const hashedPassword = await hash(password, 12);
      
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
          country: 'Argentina',
          isActive: true,
          salary: 50000,
          weeklyTarget: 40,
          isWorking: false,
          totalHoursToday: 0
        }
      });
      
      console.log('✅ Usuario creado exitosamente!');
      console.log('📧 Email:', newUser.email);
      console.log('👤 Nombre:', newUser.name);
      console.log('🔑 Role:', newUser.role);
    }
    
    console.log('\n🔐 Credenciales de acceso:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Password: ${password}`);
    console.log('🎯 Role: OWNER (acceso completo)');
    
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOwnerUser();
