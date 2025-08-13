import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Iniciando limpieza completa de la base de datos...');
  
  try {
    // Eliminar todos los datos de ejemplo manteniendo solo el usuario owner
    console.log('🗑️ Eliminando datos de ejemplo...');
    
    // Eliminar en orden correcto para respetar las relaciones
    await prisma.chatMessage.deleteMany();
    console.log('✅ Mensajes de chat eliminados');
    
    await prisma.chatGroup.deleteMany();
    console.log('✅ Grupos de chat eliminados');
    
    await prisma.paymentConfirmation.deleteMany();
    console.log('✅ Confirmaciones de pago eliminadas');
    
    await prisma.timeEntry.deleteMany();
    console.log('✅ Registros de tiempo eliminados');
    
    await prisma.task.deleteMany();
    console.log('✅ Tareas eliminadas');
    
    await prisma.calendarEvent.deleteMany();
    console.log('✅ Eventos de calendario eliminados');
    
    await prisma.financialRecord.deleteMany();
    console.log('✅ Registros financieros eliminados');
    
    await prisma.commission.deleteMany();
    console.log('✅ Comisiones eliminadas');
    
    await prisma.sale.deleteMany();
    console.log('✅ Ventas eliminadas');
    
    await prisma.order.deleteMany();
    console.log('✅ Órdenes eliminadas');
    
    await prisma.session.deleteMany();
    console.log('✅ Sesiones eliminadas');
    
    await prisma.account.deleteMany();
    console.log('✅ Cuentas eliminadas');
    
    // Eliminar todos los usuarios excepto el owner personalizado
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'deltaarg1@gmail.com'
        }
      }
    });
    console.log('✅ Usuarios de ejemplo eliminados (manteniendo deltaarg1@gmail.com)');
    
    // Verificar que el usuario owner esté activo
    const ownerUser = await prisma.user.findUnique({
      where: { email: 'deltaarg1@gmail.com' }
    });
    
    if (!ownerUser) {
      console.log('⚠️ Usuario owner no encontrado, creando...');
      const hashedPassword = await hash('Maico2005', 12);
      
      await prisma.user.create({
        data: {
          name: 'Maico Owner',
          email: 'deltaarg1@gmail.com',
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
      console.log('✅ Usuario owner creado');
    } else {
      console.log('✅ Usuario owner confirmado:', ownerUser.email);
    }
    
    // Mostrar estadísticas finales
    const stats = {
      users: await prisma.user.count(),
      tasks: await prisma.task.count(),
      sales: await prisma.sale.count(),
      timeEntries: await prisma.timeEntry.count(),
      chatMessages: await prisma.chatMessage.count(),
      events: await prisma.calendarEvent.count(),
      payments: await prisma.paymentConfirmation.count()
    };
    
    console.log('\n📊 Estado final de la base de datos:');
    console.log(`👥 Usuarios: ${stats.users}`);
    console.log(`📋 Tareas: ${stats.tasks}`);
    console.log(`💰 Ventas: ${stats.sales}`);
    console.log(`⏰ Registros de tiempo: ${stats.timeEntries}`);
    console.log(`💬 Mensajes de chat: ${stats.chatMessages}`);
    console.log(`📅 Eventos de calendario: ${stats.events}`);
    console.log(`💳 Confirmaciones de pago: ${stats.payments}`);
    
    console.log('\n🎉 Limpieza completada exitosamente!');
    console.log('🔐 Credenciales de acceso:');
    console.log('📧 Email: deltaarg1@gmail.com');
    console.log('🔒 Password: Maico2005');
    console.log('🎯 Role: OWNER');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
