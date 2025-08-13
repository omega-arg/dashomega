import { prisma } from '../lib/db';

async function checkCurrentUsers() {
  try {
    console.log('🔍 Verificando usuarios actuales en la base de datos...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        joinedAt: true
      },
      orderBy: { joinedAt: 'asc' }
    });

    console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name || 'Sin nombre'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Rol: ${user.role}`);
      console.log(`   ✅ Activo: ${user.isActive ? 'Sí' : 'No'}`);
      console.log(`   📅 Creado: ${user.joinedAt.toLocaleString()}`);
      console.log('');
    });

    // Verificar si solo existe el owner
    const ownerUsers = users.filter(user => user.role === 'OWNER');
    const otherUsers = users.filter(user => user.role !== 'OWNER');
    
    console.log(`👑 Usuarios OWNER: ${ownerUsers.length}`);
    console.log(`👥 Otros usuarios: ${otherUsers.length}`);
    
    if (ownerUsers.length === 1 && otherUsers.length === 0) {
      console.log('✅ ¡Perfecto! Solo existe el usuario OWNER como se esperaba.');
    } else if (otherUsers.length > 0) {
      console.log('⚠️ Hay usuarios adicionales que podrían ser datos ficticios:');
      otherUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUsers();
