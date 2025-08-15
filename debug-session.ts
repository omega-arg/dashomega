import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSession() {
  try {
    console.log('🔍 Debuggeando sesión y usuarios...\n');
    
    // 1. Verificar usuarios en la DB
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastActiveAt: true
      }
    });
    
    console.log('👥 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Rol: ${user.role} - ID: ${user.id}`);
      console.log(`    Último activo: ${user.lastActiveAt || 'Nunca'}\n`);
    });
    
    // 2. Buscar usuarios OWNER específicamente
    const owners = users.filter(user => user.role === 'OWNER');
    console.log('👑 Usuarios con rol OWNER:');
    if (owners.length === 0) {
      console.log('  ❌ No se encontraron usuarios con rol OWNER en la base de datos');
    } else {
      owners.forEach(owner => {
        console.log(`  ✅ ${owner.email} (${owner.name})`);
      });
    }
    
    // 3. Verificar si existe el usuario hardcodeado
    const hardcodedUser = users.find(user => user.email === 'deltaarg1@gmail.com');
    console.log('\n🔑 Usuario hardcodeado (deltaarg1@gmail.com):');
    if (hardcodedUser) {
      console.log(`  ✅ Encontrado en DB - Rol: ${hardcodedUser.role}`);
    } else {
      console.log('  ⚠️ No encontrado en DB (usará credenciales hardcodeadas)');
    }
    
    // 4. Verificar tabla AccountDelivery
    const deliveryCount = await prisma.accountDelivery.count();
    console.log(`\n📦 Registros en AccountDelivery: ${deliveryCount}`);
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    console.log('\n📝 Esto significa que se usará la autenticación hardcodeada:');
    console.log('  Email: deltaarg1@gmail.com');
    console.log('  Password: Maico2005');
    console.log('  Rol: OWNER');
  } finally {
    await prisma.$disconnect();
  }
}

debugSession();
