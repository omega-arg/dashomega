import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Testing database operations...');

  try {
    // Probar creación de un empleado
    console.log('\n1. Testing employee creation...');
    const testEmployee = await prisma.user.create({
      data: {
        name: 'Test Employee',
        email: `test-${Date.now()}@test.com`,
        role: 'SOPORTE',
        country: 'Test Country',
        isActive: true,
        isWorking: false,
        totalHoursToday: 0,
        weeklyTarget: 40
      }
    });
    console.log('✅ Employee created:', testEmployee.id);

    // Probar creación de una venta
    console.log('\n2. Testing sale creation...');
    const testSale = await prisma.sale.create({
      data: {
        cliente: 'Test Customer',
        telefono: '+1 234 567 8900',
        email: 'customer@test.com',
        producto: 'Test Product',
        descripcion: 'Test description',
        cantidad: 1,
        precioVenta: 100,
        costoCheto: 20,
        descuento: 0,
        impuestos: 0,
        comisionPago: 10,
        pagoEmpleado: 20,
        canalVenta: 'Test',
        metodoPago: 'Test',
        ganunciaNeta: 50,
        status: 'PENDING',
        folio: `TEST-${Date.now()}`,
        atClientId: testEmployee.id
      }
    });
    console.log('✅ Sale created:', testSale.id);

    // Probar creación de una tarea
    console.log('\n3. Testing task creation...');
    const testTask = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'Test task description',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToId: testEmployee.id,
        createdById: testEmployee.id
      }
    });
    console.log('✅ Task created:', testTask.id);

    // Verificar que los datos persisten
    console.log('\n4. Verifying data persistence...');
    
    const employeeCount = await prisma.user.count();
    console.log(`👥 Total employees: ${employeeCount}`);
    
    const salesCount = await prisma.sale.count();
    console.log(`💰 Total sales: ${salesCount}`);
    
    const tasksCount = await prisma.task.count();
    console.log(`📋 Total tasks: ${tasksCount}`);

    // Limpiar datos de prueba
    console.log('\n5. Cleaning up test data...');
    await prisma.task.delete({ where: { id: testTask.id } });
    await prisma.sale.delete({ where: { id: testSale.id } });
    await prisma.user.delete({ where: { id: testEmployee.id } });
    console.log('🧹 Test data cleaned up');

    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
