import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Iniciando limpieza rápida...');
  
  try {
    // Limpiar mensajes de chat
    const messages = await prisma.chatMessage.deleteMany({});
    console.log(`✅ Eliminados ${messages.count} mensajes de chat`);
    
    // Limpiar eventos de calendario
    const events = await prisma.calendarEvent.deleteMany({});
    console.log(`✅ Eliminados ${events.count} eventos de calendario`);
    
    // Limpiar tareas
    const tasks = await prisma.task.deleteMany({});
    console.log(`✅ Eliminadas ${tasks.count} tareas`);
    
    // Limpiar confirmaciones de pago
    const payments = await prisma.paymentConfirmation.deleteMany({});
    console.log(`✅ Eliminadas ${payments.count} confirmaciones de pago`);
    
    // Limpiar entradas de tiempo
    const timeEntries = await prisma.timeEntry.deleteMany({});
    console.log(`✅ Eliminadas ${timeEntries.count} entradas de tiempo`);
    
    console.log('\n🎉 Limpieza completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();
