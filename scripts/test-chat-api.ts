import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChatAPI() {
  console.log('🔍 Probando la API de chat...\n');
  
  try {
    // Verificar mensajes existentes
    const messages = await prisma.chatMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`💬 Mensajes en la base de datos: ${messages.length}`);
    
    messages.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.group.name}] ${msg.sender.name}: "${msg.content}"`);
      console.log(`      - ID: ${msg.id}`);
      console.log(`      - Fecha: ${msg.createdAt}`);
      console.log(`      - Grupo ID: ${msg.groupId}`);
      console.log('');
    });

    // Verificar grupos existentes
    const groups = await prisma.chatGroup.findMany();
    console.log(`📁 Grupos de chat: ${groups.length}`);
    
    groups.forEach((group, index) => {
      console.log(`   ${index + 1}. ${group.name} (${group.description})`);
      console.log(`      - ID: ${group.id}`);
      console.log(`      - Es general: ${group.isGeneral}`);
      console.log('');
    });

    // Probar la estructura de respuesta que espera el frontend
    console.log('📋 Estructura de datos para el frontend:');
    console.log('');
    
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      sender: msg.sender,
      group: msg.group,
      createdAt: msg.createdAt
    }));

    console.log(JSON.stringify(formattedMessages, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatAPI();
