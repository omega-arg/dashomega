import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  console.log('📊 Verificando estado de la base de datos...\n');
  
  try {
    // Verificar usuarios
    const users = await prisma.user.findMany();
    console.log(`👤 Usuarios: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Verificar mensajes de chat
    const chatMessages = await prisma.chatMessage.count();
    console.log(`💬 Mensajes de chat: ${chatMessages}`);
    
    // Verificar eventos de calendario  
    const calendarEvents = await prisma.calendarEvent.count();
    console.log(`📅 Eventos de calendario: ${calendarEvents}`);
    
    // Verificar tareas
    const tasks = await prisma.task.count();
    console.log(`📋 Tareas: ${tasks}`);
    
    // Verificar confirmaciones de pago
    const paymentConfirmations = await prisma.paymentConfirmation.count();
    console.log(`💳 Confirmaciones de pago: ${paymentConfirmations}`);
    
    // Verificar entradas de tiempo
    const timeEntries = await prisma.timeEntry.count();
    console.log(`⏰ Entradas de tiempo: ${timeEntries}`);
    
    // Verificar ventas
    const sales = await prisma.sale.count();
    console.log(`💰 Ventas: ${sales}`);
    
    console.log('\n✨ Estado de la base de datos verificado!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();
