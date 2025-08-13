import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simplificado de la base de datos...');

  // Verificar si ya existen usuarios
  const existingUsers = await prisma.user.count();
  
  if (existingUsers > 0) {
    console.log('✅ Base de datos ya contiene usuarios. Saltando seed.');
    return;
  }

  // Crear usuario owner/admin
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

  // Crear empleados de prueba
  const employees = [
    {
      name: 'Alex Rodriguez',
      email: 'alex@omegastore.com',
      role: 'CHETADORES' as Role,
      country: 'México',
      salary: 2300,
      isWorking: true,
      totalHoursToday: 6.5
    },
    {
      name: 'Mario Silva',
      email: 'mario@omegastore.com',
      role: 'AT_CLIENTE' as Role,
      country: 'Colombia',
      salary: 1200,
      isWorking: false,
      totalHoursToday: 8
    },
    {
      name: 'Sofia Martinez',
      email: 'sofia@omegastore.com',
      role: 'SOPORTE' as Role,
      country: 'Perú',
      salary: 800,
      isWorking: true,
      totalHoursToday: 4
    },
    {
      name: 'Carlos Mendez',
      email: 'carlos@omegastore.com',
      role: 'MARKETING' as Role,
      country: 'México',
      salary: 1500,
      isWorking: false,
      totalHoursToday: 7
    },
    {
      name: 'Ana Gutierrez',
      email: 'ana@omegastore.com',
      role: 'ENCARGADO_ENTREGAS' as Role,
      country: 'Colombia',
      salary: 1100,
      isWorking: true,
      totalHoursToday: 5.5
    }
  ];

  const createdEmployees = [];
  for (const emp of employees) {
    const password = await hash('password123', 12);
    const employee = await prisma.user.create({
      data: {
        ...emp,
        password,
        isActive: true
      }
    });
    createdEmployees.push(employee);
  }

  console.log('✅ Seed completado exitosamente!');
  console.log('🔑 Credenciales de acceso:');
  console.log('   📧 admin@omegastore.com / admin123 (Owner)');
  console.log('📊 Datos creados:');
  console.log(`   👥 Usuarios: ${createdEmployees.length + 1}`);
  // console.log(`   💰 Ventas: ${sales.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
