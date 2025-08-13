import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testCredentials() {
  console.log('🔍 Verificando usuarios en la base de datos...');
  
  // Obtener todos los usuarios
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });
  
  console.log('📋 Usuarios encontrados:', users.length);
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - Activo: ${user.isActive}`);
  });
  
  // Verificar credenciales específicas
  const testEmail = 'deltaarg1@gmail.com';
  const testPassword = 'Maico2005';
  
  console.log(`\n🔐 Probando credenciales: ${testEmail} / ${testPassword}`);
  
  const user = await prisma.user.findUnique({
    where: { email: testEmail }
  });
  
  if (!user) {
    console.log('❌ Usuario no encontrado');
    return;
  }
  
  console.log('✅ Usuario encontrado:', user.name);
  console.log('📧 Email:', user.email);
  console.log('🔑 Role:', user.role);
  console.log('✅ Activo:', user.isActive);
  
  // Verificar password
  if (user.password) {
    const isValidPassword = await compare(testPassword, user.password);
    console.log('🔒 Password válida:', isValidPassword);
  } else {
    console.log('❌ Usuario no tiene password configurada');
  }
  
  await prisma.$disconnect();
}

testCredentials().catch(console.error);
