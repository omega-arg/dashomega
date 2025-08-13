import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChatPersistence() {
  console.log('🧪 Probando persistencia del chat...\n');
  
  try {
    // Verificar si existe el usuario OWNER
    const ownerUser = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    });

    if (!ownerUser) {
      console.log('❌ No se encontró usuario OWNER');
      return;
    }

    console.log(`👤 Usuario encontrado: ${ownerUser.name}`);

    // Crear grupo de chat general si no existe
    let generalGroup = await prisma.chatGroup.findFirst({
      where: { name: 'general' }
    });

    if (!generalGroup) {
      generalGroup = await prisma.chatGroup.create({
        data: {
          name: 'general',
          description: 'Canal general para toda la empresa',
          isGeneral: true,
          allowedRoles: ''
        }
      });
      console.log('📁 Grupo general creado');
    } else {
      console.log('📁 Grupo general ya existe');
    }

    // Crear mensaje de prueba
    const testMessage = await prisma.chatMessage.create({
      data: {
        content: '¡Hola! Este es un mensaje de prueba para verificar que la persistencia funciona correctamente. 🎉',
        groupId: generalGroup.id,
        senderId: ownerUser.id
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true
          }
        },
        group: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`💬 Mensaje de prueba creado:`);
    console.log(`   - ID: ${testMessage.id}`);
    console.log(`   - Contenido: ${testMessage.content}`);
    console.log(`   - Canal: ${testMessage.group.name}`);
    console.log(`   - Autor: ${testMessage.sender.name} (${testMessage.sender.role})`);
    console.log(`   - Fecha: ${testMessage.createdAt}`);

    // Verificar que se puede leer
    const allMessages = await prisma.chatMessage.findMany({
      include: {
        sender: { select: { name: true, role: true } },
        group: { select: { name: true } }
      }
    });

    console.log(`\n📊 Total de mensajes en la base de datos: ${allMessages.length}`);

    console.log('\n✅ ¡La persistencia del chat funciona correctamente!');
    console.log('   - Los mensajes se guardan en la base de datos');
    console.log('   - Se pueden leer correctamente');
    console.log('   - La relación con usuarios y grupos funciona');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatPersistence();
