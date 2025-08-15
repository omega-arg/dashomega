import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  console.log('🔍 DEBUG SESSION INFO (NEON):');
  console.log('Session status:', !!session);
  console.log('Session data:', JSON.stringify(session, null, 2));
  
  let dbUsers: any[] = [];
  let dbError: string | null = null;
  let deliveryCount = 0;
  let connectionTest = false;
  
  try {
    // Test de conexión
    await prisma.$connect();
    connectionTest = true;
    console.log('✅ Conexión a Neon exitosa');
    
    // Verificar usuarios en Neon
    dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastActiveAt: true,
        isActive: true
      }
    });
    
    // Verificar tabla AccountDelivery
    deliveryCount = await prisma.accountDelivery.count();
    
    console.log('✅ Neon queries exitosas');
    
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Unknown error';
    console.log('❌ Neon error:', dbError);
  } finally {
    await prisma.$disconnect();
  }
  
  const debugInfo = {
    database: {
      type: 'Neon PostgreSQL',
      connectionTest,
      error: dbError,
      users: dbUsers,
      usersCount: dbUsers.length,
      ownersCount: dbUsers.filter(u => u.role === 'OWNER').length,
      deliveryCount,
      hasOwnerUser: dbUsers.some(u => u.email === 'deltaarg1@gmail.com' && u.role === 'OWNER')
    },
    session: {
      exists: !!session,
      user: session?.user || null,
      userRole: session?.user?.role || null,
    },
    accountDeliveryAccess: {
      allowedRoles: ['OWNER', 'ADMIN_GENERAL', 'AT_CLIENTE'],
      currentUserHasAccess: session?.user?.role ? ['OWNER', 'ADMIN_GENERAL', 'AT_CLIENTE'].includes(session.user.role) : false
    }
  };
  
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
  
  return NextResponse.json(debugInfo);
}
