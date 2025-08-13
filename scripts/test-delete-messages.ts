import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDeleteFunctionality() {
  console.log('🧪 Probando funcionalidad de eliminación de mensajes...\n');
  
  try {
    // Verificar usuario OWNER
    const ownerUser = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    });

    if (!ownerUser) {
      console.log('❌ No se encontró usuario OWNER');
      return;
    }

    console.log(`👤 Usuario OWNER: ${ownerUser.name} (${ownerUser.role})`);

    // Verificar mensajes existentes
    const existingMessages = await prisma.chatMessage.findMany({
      include: {
        sender: { select: { name: true, role: true } },
        group: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`\n💬 Mensajes existentes: ${existingMessages.length}`);
    existingMessages.forEach((msg, i) => {
      console.log(`   ${i+1}. [${msg.group.name}] ${msg.sender.name}: "${msg.content.substring(0, 50)}..."`);
      console.log(`      - ID: ${msg.id}`);
    });

    // Crear un mensaje de prueba adicional para eliminar
    let generalGroup = await prisma.chatGroup.findFirst({
      where: { name: 'general' }
    });

    if (!generalGroup) {
      generalGroup = await prisma.chatGroup.create({
        data: {
          name: 'general',
          description: 'Canal general',
          isGeneral: true,
          allowedRoles: ''
        }
      });
    }

    const testMessage = await prisma.chatMessage.create({
      data: {
        content: `Mensaje de prueba para eliminar - ${new Date().toLocaleTimeString()} 🗑️`,
        groupId: generalGroup.id,
        senderId: ownerUser.id
      },
      include: {
        sender: { select: { name: true } },
        group: { select: { name: true } }
      }
    });

    console.log(`\n✅ Mensaje de prueba creado para eliminación:`);
    console.log(`   - ID: ${testMessage.id}`);
    console.log(`   - Contenido: "${testMessage.content}"`);
    console.log(`   - Canal: ${testMessage.group.name}`);

    console.log(`\n🔧 Para probar la eliminación:`);
    console.log(`   1. Ve al chat: http://localhost:3001/chat`);
    console.log(`   2. Busca el mensaje que acabas de crear`);
    console.log(`   3. Haz hover sobre el mensaje`);
    console.log(`   4. Deberías ver un botón de basura (🗑️) en rojo`);
    console.log(`   5. Haz clic para eliminar`);
    console.log(`   6. El mensaje se eliminará permanentemente`);

    console.log(`\n⚠️ IMPORTANTE:`);
    console.log(`   - Solo el usuario OWNER puede ver y usar el botón de eliminar`);
    console.log(`   - El botón solo aparece al hacer hover sobre el mensaje`);
    console.log(`   - Se pedirá confirmación antes de eliminar`);
    console.log(`   - La eliminación es permanente e irreversible`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteFunctionality();
