import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.chatMessage.deleteMany();
  await prisma.chatGroup.deleteMany();
  await prisma.paymentConfirmation.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('123456', 12);

  const owner = await prisma.user.create({
    data: {
      name: 'Admin Principal',
      email: 'admin@omega.com',
      password: hashedPassword,
      role: 'OWNER',
      country: 'México',
      isActive: true,
      isWorking: false,
      totalHoursToday: 0,
      weeklyTarget: 40,
      salary: 50000
    }
  });

  const adminGeneral = await prisma.user.create({
    data: {
      name: 'Administrador General',
      email: 'admin.general@omega.com',
      password: hashedPassword,
      role: 'ADMIN_GENERAL',
      country: 'México',
      isActive: true,
      isWorking: true,
      startWorkTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      totalHoursToday: 2.5,
      weeklyTarget: 45,
      salary: 35000
    }
  });

  const atCliente1 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria.garcia@omega.com',
      password: hashedPassword,
      role: 'AT_CLIENTE',
      country: 'Colombia',
      isActive: true,
      isWorking: true,
      startWorkTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      totalHoursToday: 4.2,
      weeklyTarget: 40,
      salary: 25000
    }
  });

  const atCliente2 = await prisma.user.create({
    data: {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@omega.com',
      password: hashedPassword,
      role: 'AT_CLIENTE',
      country: 'Perú',
      isActive: true,
      isWorking: false,
      totalHoursToday: 6.8,
      weeklyTarget: 40,
      salary: 25000
    }
  });

  const soporte = await prisma.user.create({
    data: {
      name: 'Ana López',
      email: 'ana.lopez@omega.com',
      password: hashedPassword,
      role: 'SOPORTE',
      country: 'México',
      isActive: true,
      isWorking: false,
      totalHoursToday: 3.5,
      weeklyTarget: 35,
      salary: 20000
    }
  });

  const chetador = await prisma.user.create({
    data: {
      name: 'Luis Ramírez',
      email: 'luis.ramirez@omega.com',
      password: hashedPassword,
      role: 'CHETADORES',
      country: 'Colombia',
      isActive: true,
      isWorking: true,
      startWorkTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      totalHoursToday: 5.1,
      weeklyTarget: 40,
      salary: 22000
    }
  });

  console.log('✅ Users created');

  // Crear grupos de chat
  const generalGroup = await prisma.chatGroup.create({
    data: {
      name: 'General',
      description: 'Chat general de la empresa',
      isGeneral: true,
      allowedRoles: ''
    }
  });

  const adminGroup = await prisma.chatGroup.create({
    data: {
      name: 'Administradores',
      description: 'Chat solo para administradores',
      isGeneral: false,
      allowedRoles: 'OWNER,ADMIN_GENERAL'
    }
  });

  const atGroup = await prisma.chatGroup.create({
    data: {
      name: 'Atención al Cliente',
      description: 'Chat para el equipo de AT',
      isGeneral: false,
      allowedRoles: 'OWNER,ADMIN_GENERAL,AT_CLIENTE'
    }
  });

  console.log('✅ Chat groups created');

  // Crear mensajes de ejemplo
  await prisma.chatMessage.createMany({
    data: [
      {
        content: '¡Bienvenidos al sistema Omega Store! 🎉',
        groupId: generalGroup.id,
        senderId: owner.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        content: 'Hola a todos, ¿cómo van las ventas hoy?',
        groupId: generalGroup.id,
        senderId: adminGeneral.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        content: 'Muy bien, ya tengo 3 ventas confirmadas 💰',
        groupId: generalGroup.id,
        senderId: atCliente1.id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        content: 'Excelente trabajo María! 👏',
        groupId: generalGroup.id,
        senderId: owner.id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]
  });

  console.log('✅ Chat messages created');

  // Crear ventas de ejemplo
  const sales = await prisma.sale.createMany({
    data: [
      {
        cliente: 'Juan Pérez',
        telefono: '+52 555 123 4567',
        email: 'juan.perez@gmail.com',
        producto: 'Cuenta Netflix Premium',
        descripcion: 'Cuenta Netflix Premium por 1 mes',
        cantidad: 1,
        precioVenta: 150,
        costoCheto: 30,
        descuento: 0,
        impuestos: 0,
        comisionPago: 15,
        pagoEmpleado: 35,
        canalVenta: 'Instagram',
        metodoPago: 'Transferencia',
        ganunciaNeta: 70,
        status: 'COMPLETED',
        folio: 'VTA-001',
        atClientId: atCliente1.id,
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        cliente: 'María González',
        telefono: '+57 300 456 7890',
        email: 'maria.gonzalez@hotmail.com',
        producto: 'Spotify Premium Familiar',
        descripcion: 'Plan familiar Spotify por 1 mes',
        cantidad: 1,
        precioVenta: 200,
        costoCheto: 45,
        descuento: 20,
        impuestos: 0,
        comisionPago: 20,
        pagoEmpleado: 40,
        canalVenta: 'Discord',
        metodoPago: 'Zelle',
        ganunciaNeta: 75,
        status: 'PROCESSING',
        folio: 'VTA-002',
        atClientId: atCliente1.id,
        fecha: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        cliente: 'Carlos Silva',
        telefono: '+51 987 654 321',
        email: 'carlos.silva@yahoo.com',
        producto: 'Disney+ Anual',
        descripcion: 'Suscripción Disney+ por 1 año',
        cantidad: 1,
        precioVenta: 800,
        costoCheto: 150,
        descuento: 50,
        impuestos: 0,
        comisionPago: 80,
        pagoEmpleado: 120,
        canalVenta: 'Web',
        metodoPago: 'PayPal',
        ganunciaNeta: 400,
        status: 'COMPLETED',
        folio: 'VTA-003',
        atClientId: atCliente2.id,
        fecha: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('✅ Sales created');

  // Crear registros financieros
  await prisma.financialRecord.createMany({
    data: [
      {
        type: 'INCOME',
        amount: 70,
        description: 'Venta: Cuenta Netflix Premium - Cliente: Juan Pérez',
        category: 'Ventas',
        userId: owner.id,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: 'INCOME',
        amount: 75,
        description: 'Venta: Spotify Premium Familiar - Cliente: María González',
        category: 'Ventas',
        userId: owner.id,
        date: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        type: 'INCOME',
        amount: 400,
        description: 'Venta: Disney+ Anual - Cliente: Carlos Silva',
        category: 'Ventas',
        userId: owner.id,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        type: 'EXPENSE',
        amount: 2000,
        description: 'Pago de nómina semanal',
        category: 'Nómina',
        userId: owner.id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('✅ Financial records created');

  // Crear tareas
  await prisma.task.createMany({
    data: [
      {
        title: 'Actualizar precios de productos',
        description: 'Revisar y actualizar los precios de todos los productos según la nueva lista',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        assignedToId: adminGeneral.id,
        createdById: owner.id
      },
      {
        title: 'Contactar clientes morosos',
        description: 'Llamar a clientes con pagos pendientes de más de 7 días',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        assignedToId: atCliente1.id,
        createdById: adminGeneral.id
      },
      {
        title: 'Revisar cuentas de streaming',
        description: 'Verificar que todas las cuentas estén funcionando correctamente',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignedToId: chetador.id,
        createdById: owner.id
      },
      {
        title: 'Capacitación nuevo personal',
        description: 'Preparar material de capacitación para nuevos empleados',
        status: 'COMPLETED',
        priority: 'LOW',
        assignedToId: adminGeneral.id,
        createdById: owner.id
      }
    ]
  });

  console.log('✅ Tasks created');

  // Crear entradas de tiempo
  await prisma.timeEntry.createMany({
    data: [
      {
        userId: adminGeneral.id,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: null,
        isActive: true,
        date: new Date()
      },
      {
        userId: atCliente1.id,
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endTime: null,
        isActive: true,
        date: new Date()
      },
      {
        userId: chetador.id,
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        endTime: null,
        isActive: true,
        date: new Date()
      },
      {
        userId: atCliente2.id,
        startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        duration: 7,
        isActive: false,
        date: new Date()
      },
      {
        userId: soporte.id,
        startTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        duration: 3.5,
        isActive: false,
        date: new Date()
      }
    ]
  });

  console.log('✅ Time entries created');

  // Crear eventos de calendario
  await prisma.calendarEvent.createMany({
    data: [
      {
        title: 'Reunión semanal de equipo',
        description: 'Reunión para revisar objetivos y métricas de la semana',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        eventType: 'meeting',
        createdById: owner.id
      },
      {
        title: 'Mantenimiento del servidor',
        description: 'Mantenimiento programado de los servidores',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        eventType: 'maintenance',
        createdById: adminGeneral.id
      },
      {
        title: 'Día de pago',
        description: 'Procesamiento de nómina quincenal',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        allDay: true,
        eventType: 'payment',
        createdById: owner.id
      }
    ]
  });

  console.log('✅ Calendar events created');

  console.log('🎉 Database seeded successfully!');
  
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Sales: ${await prisma.sale.count()}`);
  console.log(`- Tasks: ${await prisma.task.count()}`);
  console.log(`- Chat Groups: ${await prisma.chatGroup.count()}`);
  console.log(`- Messages: ${await prisma.chatMessage.count()}`);
  console.log(`- Time Entries: ${await prisma.timeEntry.count()}`);
  console.log(`- Calendar Events: ${await prisma.calendarEvent.count()}`);
  console.log(`- Financial Records: ${await prisma.financialRecord.count()}`);

  console.log('\n👤 Test Users:');
  console.log('- admin@omega.com (OWNER) - Password: 123456');
  console.log('- admin.general@omega.com (ADMIN_GENERAL) - Password: 123456');
  console.log('- maria.garcia@omega.com (AT_CLIENTE) - Password: 123456');
  console.log('- carlos.mendoza@omega.com (AT_CLIENTE) - Password: 123456');
  console.log('- ana.lopez@omega.com (SOPORTE) - Password: 123456');
  console.log('- luis.ramirez@omega.com (CHETADORES) - Password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
