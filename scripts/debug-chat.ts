import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugChatSystem() {
  console.log('🔧 Sistema de Debug para Chat...\n');
  
  try {
    // 1. Verificar estado de la base de datos
    console.log('1. 📊 Estado de la base de datos:');
    
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true }
    });
    console.log(`   👤 Usuarios: ${users.length}`);
    users.forEach(user => {
      console.log(`      - ${user.name} (${user.role}) - ID: ${user.id}`);
    });

    const groups = await prisma.chatGroup.findMany();
    console.log(`   📁 Grupos: ${groups.length}`);
    groups.forEach(group => {
      console.log(`      - ${group.name} - ID: ${group.id}`);
    });

    const messages = await prisma.chatMessage.findMany({
      include: {
        sender: { select: { name: true } },
        group: { select: { name: true } }
      }
    });
    console.log(`   💬 Mensajes: ${messages.length}`);
    messages.forEach((msg, i) => {
      console.log(`      ${i+1}. [${msg.group.name}] ${msg.sender.name}: "${msg.content.substring(0, 50)}..."`);
    });

    console.log('\n2. 🧪 Creando mensaje de prueba adicional...');
    
    const ownerUser = users.find(u => u.role === 'OWNER');
    if (!ownerUser) {
      console.log('❌ No se encontró usuario OWNER');
      return;
    }

    let generalGroup = groups.find(g => g.name === 'general');
    if (!generalGroup) {
      generalGroup = await prisma.chatGroup.create({
        data: {
          name: 'general',
          description: 'Canal general',
          isGeneral: true,
          allowedRoles: ''
        }
      });
      console.log('   📁 Grupo general creado');
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        content: `Mensaje de debug creado a las ${new Date().toLocaleTimeString()} 🔧`,
        groupId: generalGroup.id,
        senderId: ownerUser.id
      },
      include: {
        sender: { select: { name: true } },
        group: { select: { name: true } }
      }
    });

    console.log(`   ✅ Nuevo mensaje creado: "${newMessage.content}"`);
    console.log(`   📅 Fecha: ${newMessage.createdAt}`);
    console.log(`   🆔 ID: ${newMessage.id}`);

    console.log('\n3. 📋 Estructura completa para el frontend:');
    
    const allMessages = await prisma.chatMessage.findMany({
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

    console.log('   JSON que debería recibir el frontend:');
    console.log(JSON.stringify(allMessages, null, 2));

    console.log('\n✅ Debug completado. Total de mensajes en DB:', allMessages.length);

  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugChatSystem();
