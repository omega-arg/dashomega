
import { PrismaClient, Role, TaskStatus, TaskPriority, PaymentStatus, OrderStatus, TransactionType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatGroup.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await       data: {
        content: '¡Bienvenidos al sistema Omega Store! 🚀',
        groupId: chatGroups[0].id,
        userId: owner.idma.paymentConfirmation.deleteMany();
  await prisma.order.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Owner/Admin user (required test account)
  const ownerPassword = await hash('admin123', 12);
  const owner = await prisma.user.create({
    data: {
      name: 'Administrador Omega',
      email: 'admin@omegastore.com',
      password: ownerPassword,
      role: 'OWNER',
      country: 'México',
      isActive: true,
      salary: 5000,
      weeklyTarget: 50,
    },
  });

  // Required test account
  const testPassword = await hash('johndoe123', 12);
  const testUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@doe.com',
      password: testPassword,
      role: 'OWNER',
      country: 'Estados Unidos',
      isActive: true,
      salary: 5000,
      weeklyTarget: 50,
    },
  });

  // Create sample employees with all roles
  const employees = [
    {
      name: 'Ana García',
      email: 'ana.garcia@omegastore.com',
      password: await hash('password123', 12),
      role: Role.ADMIN_GENERAL,
      country: 'México',
      salary: 3500,
      isWorking: true,
      totalHoursToday: 4.5,
    },
    {
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@omegastore.com',
      password: await hash('password123', 12),
      role: Role.ENCARGADO_ENTREGAS,
      country: 'Colombia',
      salary: 2800,
      totalHoursToday: 6.2,
    },
    {
      name: 'María López',
      email: 'maria.lopez@omegastore.com',
      password: await hash('password123', 12),
      role: Role.AT_CLIENTE,
      country: 'Perú',
      salary: 2500,
      isWorking: true,
      totalHoursToday: 3.8,
    },
    {
      name: 'Luis Martín',
      email: 'luis.martin@omegastore.com',
      password: await hash('password123', 12),
      role: Role.SOPORTE,
      country: 'México',
      salary: 2300,
      totalHoursToday: 5.1,
    },
    {
      name: 'Sofia Herrera',
      email: 'sofia.herrera@omegastore.com',
      password: await hash('password123', 12),
      role: Role.ENCARGADO_PAGO_MEXICO,
      country: 'México',
      salary: 2600,
      isWorking: true,
      totalHoursToday: 2.7,
    },
    {
      name: 'Diego Torres',
      email: 'diego.torres@omegastore.com',
      password: await hash('password123', 12),
      role: Role.ENCARGADO_PAGO_PERU,
      country: 'Perú',
      salary: 2600,
      totalHoursToday: 4.3,
    },
    {
      name: 'Isabella Rojas',
      email: 'isabella.rojas@omegastore.com',
      password: await hash('password123', 12),
      role: Role.ENCARGADO_PAGO_COLOMBIA,
      country: 'Colombia',
      salary: 2600,
      totalHoursToday: 3.9,
    },
    {
      name: 'Roberto Silva',
      email: 'roberto.silva@omegastore.com',
      password: await hash('password123', 12),
      role: Role.ENCARGADO_PAGO_ZELLE,
      country: 'Venezuela',
      salary: 2600,
      isWorking: true,
      totalHoursToday: 5.5,
    },
    {
      name: 'Gabriela Mendez',
      email: 'gabriela.mendez@omegastore.com',
      password: await hash('password123', 12),
      role: Role.RECLUTADOR,
      country: 'Argentina',
      salary: 2400,
      totalHoursToday: 4.7,
    },
    {
      name: 'Fernando Castro',
      email: 'fernando.castro@omegastore.com',
      password: await hash('password123', 12),
      role: Role.MARKETING,
      country: 'Chile',
      salary: 2700,
      totalHoursToday: 6.0,
    },
    {
      name: 'Valentina Jiménez',
      email: 'valentina.jimenez@omegastore.com',
      password: await hash('password123', 12),
      role: Role.DISEÑADOR,
      country: 'Uruguay',
      salary: 2900,
      isWorking: true,
      totalHoursToday: 3.2,
    },
    {
      name: 'Alejandro Vargas',
      email: 'alejandro.vargas@omegastore.com',
      password: await hash('password123', 12),
      role: Role.GESTOR_CONTENIDO,
      country: 'Ecuador',
      salary: 2500,
      totalHoursToday: 7.1,
    },
    {
      name: 'Carmen Delgado',
      email: 'carmen.delgado@omegastore.com',
      password: await hash('password123', 12),
      role: Role.FINANZAS,
      country: 'España',
      salary: 3200,
      totalHoursToday: 4.8,
    },
    {
      name: 'Miguel Ángel Sánchez',
      email: 'miguel.sanchez@omegastore.com',
      password: await hash('password123', 12),
      role: Role.CHETADORES,
      country: 'México',
      salary: 3000,
      isWorking: true,
      totalHoursToday: 5.3,
    },
    {
      name: 'Lucía Morales',
      email: 'lucia.morales@omegastore.com',
      password: await hash('password123', 12),
      role: Role.CHETADORES,
      country: 'Colombia',
      salary: 3000,
      totalHoursToday: 6.5,
    },
  ];

  const createdEmployees = [];
  for (const employee of employees) {
    const user = await prisma.user.create({
      data: {
        ...employee,
        isActive: true,
        weeklyTarget: 40,
        startWorkTime: employee.isWorking ? new Date(Date.now() - employee.totalHoursToday * 60 * 60 * 1000) : null,
      },
    });
    createdEmployees.push(user);
  }

  console.log('✅ Usuarios creados:', createdEmployees.length + 2);

  // Create sample tasks
  const tasks = [
    {
      title: 'Configurar sistema de pagos México',
      description: 'Implementar y probar el nuevo sistema de confirmación de pagos para clientes mexicanos',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedToId: createdEmployees.find(e => e.role === 'ENCARGADO_PAGO_MEXICO')?.id || owner.id,
      createdById: owner.id,
    },
    {
      title: 'Actualizar base de datos de productos',
      description: 'Revisar y actualizar toda la información de productos disponibles',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assignedToId: createdEmployees.find(e => e.role === 'ADMIN_GENERAL')?.id || owner.id,
      createdById: owner.id,
    },
    {
      title: 'Diseñar nueva campaña promocional',
      description: 'Crear diseños para la campaña de Black Friday 2024',
      status: TaskStatus.REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedToId: createdEmployees.find(e => e.role === 'DISEÑADOR')?.id || owner.id,
      createdById: owner.id,
    },
    {
      title: 'Optimizar proceso de entrega',
      description: 'Mejorar los tiempos de entrega para productos digitales',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      assignedToId: createdEmployees.find(e => e.role === 'ENCARGADO_ENTREGAS')?.id || owner.id,
      createdById: owner.id,
    },
    {
      title: 'Capacitación equipo soporte',
      description: 'Organizar sesión de capacitación para nuevos procedimientos',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assignedToId: createdEmployees.find(e => e.role === 'SOPORTE')?.id || owner.id,
      createdById: owner.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Tareas creadas:', tasks.length);

  // Create financial records
  const financialRecords = [
    // Income records
    {
      type: TransactionType.INCOME,
      amount: 15000,
      description: 'Ventas de productos gaming - Enero',
      category: 'Productos Gaming',
      date: new Date('2024-01-15'),
      userId: null,
    },
    {
      type: TransactionType.INCOME,
      amount: 22000,
      description: 'Ventas de productos gaming - Febrero',
      category: 'Productos Gaming',
      date: new Date('2024-02-15'),
      userId: null,
    },
    {
      type: TransactionType.INCOME,
      amount: 18500,
      description: 'Ventas de productos gaming - Marzo',
      category: 'Productos Gaming',
      date: new Date('2024-03-15'),
      userId: null,
    },
    // Expense records
    {
      type: TransactionType.EXPENSE,
      amount: 8000,
      description: 'Salarios equipo - Enero',
      category: 'Salarios',
      date: new Date('2024-01-31'),
      userId: null,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 8500,
      description: 'Salarios equipo - Febrero',
      category: 'Salarios',
      date: new Date('2024-02-28'),
      userId: null,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 9000,
      description: 'Salarios equipo - Marzo',
      category: 'Salarios',
      date: new Date('2024-03-31'),
      userId: null,
    },
    // Commission records
    {
      type: TransactionType.COMMISSION,
      amount: 1500,
      description: 'Comisiones equipo ventas - Enero',
      category: 'Comisiones',
      date: new Date('2024-01-31'),
      userId: createdEmployees.find(e => e.role === 'AT_CLIENTE')?.id,
    },
  ];

  for (const record of financialRecords) {
    await prisma.financialRecord.create({ data: record });
  }

  console.log('✅ Registros financieros creados:', financialRecords.length);

  // Create sample orders
  const orders = [
    {
      productName: 'Fortnite V-Bucks Pack Premium',
      platform: 'Epic Games',
      price: 50.00,
      cost: 35.00,
      profit: 15.00,
      status: OrderStatus.COMPLETED,
      atClientId: createdEmployees.find(e => e.role === 'AT_CLIENTE')?.id,
    },
    {
      productName: 'Call of Duty Points',
      platform: 'Battle.net',
      price: 25.00,
      cost: 18.00,
      profit: 7.00,
      status: OrderStatus.PROCESSING,
      atClientId: createdEmployees.find(e => e.role === 'AT_CLIENTE')?.id,
    },
    {
      productName: 'Minecraft Java Edition',
      platform: 'Minecraft.net',
      price: 30.00,
      cost: 22.00,
      profit: 8.00,
      status: OrderStatus.PENDING,
      atClientId: createdEmployees.find(e => e.role === 'AT_CLIENTE')?.id,
    },
  ];

  const createdOrders = [];
  for (const order of orders) {
    const createdOrder = await prisma.order.create({ data: order });
    createdOrders.push(createdOrder);
  }

  console.log('✅ Órdenes creadas:', orders.length);

  // Create payment confirmations for some orders
  if (createdOrders.length > 0) {
    await prisma.paymentConfirmation.create({
      data: {
        orderId: createdOrders[0].id,
        proofImage: 'https://imgs.search.brave.com/azvx7Pcojdv2NrnM8PVT89aSUvPqskpspci3aSXyhAU/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9zdXBw/b3J0LnVkZW15LmNv/bS9oYy9hcnRpY2xl/X2F0dGFjaG1lbnRz/LzQ0MDQyOTI4NjI0/ODc',
        amount: createdOrders[0].price,
        paymentMethod: 'OXXO',
        status: PaymentStatus.CONFIRMED,
        uploadedById: createdEmployees.find(e => e.role === 'AT_CLIENTE')?.id || owner.id,
        reviewedAt: new Date(),
        reviewNotes: 'Pago verificado correctamente',
      },
    });

    await prisma.paymentConfirmation.create({
      data: {
        orderId: createdOrders[1].id,
        proofImage: 'https://imgs.search.brave.com/KqyuKWQsb07LJLqv-KRO7lLpMV5m3inpF1sqnPD9ifU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9lYWFz/c2V0cy1hLmFrYW1h/aWhkLm5ldC93d2Nl/LWhjLWFlbS1kaXNw/YXRjaGVyL2VhaGVs/cC9hcnRpY2xlcy9h/Y2NvdW50L3Byb3Zp/ZGUtcHJvb2YtcHVy/Y2hhc2UtYXBwbGUu/Z2lm.jpeg',
        amount: createdOrders[1].price,
        paymentMethod: 'Banco Azteca',
        status: PaymentStatus.PENDING,
        uploadedById: createdEmployees.find(e => e.role === 'AT_CLIENTE')?.id || owner.id,
        notes: 'Pendiente de verificación',
      },
    });
  }

  // Create chat groups
  const chatGroups = [
    {
      name: 'General',
      description: 'Chat general para todo el equipo',
      isGeneral: true,
      allowedRoles: ""
    },
    {
      name: 'Soporte',
      description: 'Chat para el equipo de soporte',
      isGeneral: false,
      allowedRoles: ""
    },
    {
      name: 'Chetadores',
      description: 'Chat para chetadores y administración',
      isGeneral: false,
      allowedRoles: ""
    },
    {
      name: 'Marketing',
      description: 'Chat para el equipo de marketing y contenido',
      isGeneral: false,
      allowedRoles: ""
    },
  ];

  console.log('✅ Chat groups y mensajes creados');
  console.log('✅ Seed completado exitosamente!');  // Create sample chat messages
  if (chatGroups.length > 0) {
    await prisma.chatMessage.create({
      data: {
        content: '¡Bienvenidos al sistema Omega Store! 🚀',
        groupId: createdGroups[0].id,
        senderId: owner.id,
      },
    });

    await prisma.chatMessage.create({
      data: {
        content: 'Todo listo para empezar a trabajar',
        groupId: createdGroups[0].id,
        senderId: createdEmployees.find(e => e.role === 'ADMIN_GENERAL')?.id || owner.id,
      },
    });
  }

  // Create calendar events
  await prisma.calendarEvent.create({
    data: {
      title: 'Reunión semanal de equipo',
      description: 'Revisión de metas y progreso semanal',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      eventType: 'meeting',
      createdById: owner.id,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      title: 'Fecha límite - Campaña Black Friday',
      description: 'Entrega final de materiales promocionales',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      allDay: true,
      eventType: 'deadline',
      createdById: owner.id,
    },
  });

  // Create commissions
  const chetadoresEmployee = createdEmployees.find(e => e.role === 'CHETADORES');
  const atClienteEmployee = createdEmployees.find(e => e.role === 'AT_CLIENTE');

  if (chetadoresEmployee) {
    await prisma.commission.create({
      data: {
        userId: chetadoresEmployee.id,
        amount: 150,
        percentage: 5,
        baseAmount: 3000,
        description: 'Comisión por ventas de febrero',
        month: 2,
        year: 2024,
        isPaid: true,
      },
    });
  }

  if (atClienteEmployee) {
    await prisma.commission.create({
      data: {
        userId: atClienteEmployee.id,
        amount: 200,
        percentage: 4,
        baseAmount: 5000,
        description: 'Comisión por gestión de clientes febrero',
        month: 2,
        year: 2024,
        isPaid: false,
      },
    });
  }

  // Create time entries for employees
  for (const employee of createdEmployees) {
    if (employee.isWorking) {
      await prisma.timeEntry.create({
        data: {
          userId: employee.id,
          startTime: new Date(Date.now() - employee.totalHoursToday * 60 * 60 * 1000),
          endTime: null,
          duration: null,
          isActive: true,
          notes: 'Sesión de trabajo en curso',
        },
      });
    } else {
      // Create completed session for today
      const startTime = new Date(Date.now() - (employee.totalHoursToday + 1) * 60 * 60 * 1000);
      const endTime = new Date(Date.now() - 60 * 60 * 1000);
      
      await prisma.timeEntry.create({
        data: {
          userId: employee.id,
          startTime,
          endTime,
          duration: employee.totalHoursToday,
          isActive: false,
          notes: 'Sesión de trabajo completada',
        },
      });
    }
  }

  console.log('✅ Base de datos poblada exitosamente!');
  console.log('🔑 Credenciales de acceso:');
  console.log('   📧 admin@omegastore.com / admin123 (Owner)');
  console.log('   📧 john@doe.com / johndoe123 (Test Account)');
  console.log('   📧 [cualquier empleado]@omegastore.com / password123');
  console.log('📊 Datos creados:');
  console.log(`   👥 Usuarios: ${createdEmployees.length + 2}`);
  console.log(`   📋 Tareas: ${tasks.length}`);
  console.log(`   💰 Registros financieros: ${financialRecords.length}`);
  console.log(`   📦 Órdenes: ${orders.length}`);
  console.log(`   💬 Grupos de chat: ${chatGroups.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
