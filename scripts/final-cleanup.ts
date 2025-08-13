import { prisma } from '../lib/db';

async function cleanFictionalData() {
  try {
    console.log('🧹 Limpiando datos ficticios restantes de la base de datos...\n');
    
    // Limpiar mensajes de chat ficticios
    console.log('💬 Limpiando mensajes de chat...');
    const deletedMessages = await prisma.chatMessage.deleteMany({});
    console.log(`   ✅ Eliminados ${deletedMessages.count} mensajes de chat`);
    
    // Limpiar eventos de calendario ficticios
    console.log('📅 Limpiando eventos de calendario...');
    const deletedEvents = await prisma.calendarEvent.deleteMany({});
    console.log(`   ✅ Eliminados ${deletedEvents.count} eventos de calendario`);
    
    // Limpiar tareas ficticias
    console.log('📋 Limpiando tareas...');
    const deletedTasks = await prisma.task.deleteMany({});
    console.log(`   ✅ Eliminadas ${deletedTasks.count} tareas`);
    
    // Limpiar confirmaciones de pago ficticias
    console.log('💳 Limpiando confirmaciones de pago...');
    const deletedPayments = await prisma.paymentConfirmation.deleteMany({});
    console.log(`   ✅ Eliminadas ${deletedPayments.count} confirmaciones de pago`);
    
    // Limpiar entradas de tiempo ficticias (excepto las del usuario owner actual)
    console.log('⏰ Limpiando entradas de tiempo...');
    const ownerUser = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    });
    
    if (ownerUser) {
      const deletedTimeEntries = await prisma.timeEntry.deleteMany({
        where: {
          userId: { not: ownerUser.id }
        }
      });
      console.log(`   ✅ Eliminadas ${deletedTimeEntries.count} entradas de tiempo de usuarios ficticios`);
    }
    
    // Verificar que solo existe el usuario OWNER
    console.log('\n👤 Verificando usuarios...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });
    
    console.log(`📊 Total de usuarios: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Activo' : 'Inactivo'}`);
    });
    
    if (allUsers.length === 1 && allUsers[0].role === 'OWNER') {
      console.log('\n✅ ¡Perfecto! Solo existe el usuario OWNER.');
    } else {
      console.log('\n⚠️ Hay usuarios adicionales. Considerando eliminar usuarios ficticios...');
      
      // Opcional: Eliminar usuarios que no sean OWNER
      const nonOwnerUsers = allUsers.filter(user => user.role !== 'OWNER');
      if (nonOwnerUsers.length > 0) {
        console.log(`\n🗑️ Eliminando ${nonOwnerUsers.length} usuarios ficticios...`);
        for (const user of nonOwnerUsers) {
          await prisma.user.delete({
            where: { id: user.id }
          });
          console.log(`   ✅ Eliminado: ${user.name} (${user.email})`);
        }
      }
    }
    
    console.log('\n🎉 Limpieza completa! La base de datos está lista para datos reales.');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanFictionalData();
