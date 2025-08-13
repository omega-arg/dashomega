// Seed para grupos de chat iniciales
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedChatGroups() {
  try {
    console.log('🌱 Creando grupos de chat iniciales...');

    // Grupo general para toda la empresa
    const generalGroup = await prisma.chatGroup.upsert({
      where: { id: 'general-group' },
      update: {},
      create: {
        id: 'general-group',
        name: 'general',
        description: 'Canal general para toda la empresa',
        isGeneral: true,
        allowedRoles: '[]'
      }
    });

    // Grupo de soporte
    const soporteGroup = await prisma.chatGroup.upsert({
      where: { id: 'soporte-group' },
      update: {},
      create: {
        id: 'soporte-group',
        name: 'soporte',
        description: 'Canal para el equipo de soporte',
        isGeneral: false,
        allowedRoles: JSON.stringify(['OWNER', 'ADMIN_GENERAL', 'SOPORTE'])
      }
    });

    // Grupo de chetadores
    const chetadoresGroup = await prisma.chatGroup.upsert({
      where: { id: 'chetadores-group' },
      update: {},
      create: {
        id: 'chetadores-group',
        name: 'chetadores',
        description: 'Canal para el equipo de chetadores',
        isGeneral: false,
        allowedRoles: JSON.stringify(['OWNER', 'ADMIN_GENERAL', 'CHETADORES'])
      }
    });

    // Grupo de marketing
    const marketingGroup = await prisma.chatGroup.upsert({
      where: { id: 'marketing-group' },
      update: {},
      create: {
        id: 'marketing-group',
        name: 'marketing',
        description: 'Canal para el equipo de marketing',
        isGeneral: false,
        allowedRoles: JSON.stringify(['OWNER', 'ADMIN_GENERAL', 'MARKETING', 'DISEÑADOR', 'GESTOR_CONTENIDO'])
      }
    });

    // Grupo de finanzas
    const finanzasGroup = await prisma.chatGroup.upsert({
      where: { id: 'finanzas-group' },
      update: {},
      create: {
        id: 'finanzas-group',
        name: 'finanzas',
        description: 'Canal para el equipo de finanzas',
        isGeneral: false,
        allowedRoles: JSON.stringify(['OWNER', 'ADMIN_GENERAL', 'FINANZAS'])
      }
    });

    // Grupo de entregas
    const entregasGroup = await prisma.chatGroup.upsert({
      where: { id: 'entregas-group' },
      update: {},
      create: {
        id: 'entregas-group',
        name: 'entregas',
        description: 'Canal para el equipo de entregas',
        isGeneral: false,
        allowedRoles: JSON.stringify(['OWNER', 'ADMIN_GENERAL', 'ENCARGADO_ENTREGAS', 'AT_CLIENTE'])
      }
    });

    // Mensajes de bienvenida
    const adminUser = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    });

    if (adminUser) {
      // Mensaje de bienvenida en el canal general
      await prisma.chatMessage.upsert({
        where: { id: 'welcome-message-general' },
        update: {},
        create: {
          id: 'welcome-message-general',
          content: '¡Buenos días equipo! Recordatorio de que hoy tenemos la reunión semanal a las 10:00 AM 🚀',
          groupId: generalGroup.id,
          senderId: adminUser.id
        }
      });

      // Mensaje en el canal de marketing
      await prisma.chatMessage.upsert({
        where: { id: 'welcome-message-marketing' },
        update: {},
        create: {
          id: 'welcome-message-marketing',
          content: 'Perfecto, ahí estaremos. Tengo algunas métricas nuevas para compartir 📊',
          groupId: generalGroup.id,
          senderId: adminUser.id
        }
      });
    }

    console.log('✅ Grupos de chat creados exitosamente');
    return {
      generalGroup,
      soporteGroup,
      chetadoresGroup,
      marketingGroup,
      finanzasGroup,
      entregasGroup
    };

  } catch (error) {
    console.error('❌ Error al crear grupos de chat:', error);
    throw error;
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedChatGroups()
    .then(() => {
      console.log('✅ Semilla de chat completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la semilla de chat:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
