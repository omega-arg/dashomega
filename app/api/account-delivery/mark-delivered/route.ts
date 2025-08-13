import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// Helper: Check if user has access
function hasAccountDeliveryAccess(role: string) {
  return [
    'OWNER',
    'ADMIN_GENERAL',
    'AT_CLIENTE',
  ].includes(role);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccountDeliveryAccess(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  
  try {
    const { id } = await req.json();
    console.log("Marking delivery as delivered:", id);
    
    // Use raw SQL to avoid the Prisma client model issue
    const now = new Date().toISOString();
    
    // First check if delivery exists and is not already delivered
    const existingDelivery = await prisma.$queryRaw`
      SELECT * FROM AccountDelivery WHERE id = ${id}
    `;
    
    if (!existingDelivery || (Array.isArray(existingDelivery) && existingDelivery.length === 0)) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 });
    }
    
    const delivery = Array.isArray(existingDelivery) ? existingDelivery[0] : existingDelivery;
    if (delivery.deliveredAt) {
      return NextResponse.json({ error: 'Esta entrega ya está marcada como entregada' }, { status: 400 });
    }
    
    // Update delivery with delivered timestamp using raw SQL
    await prisma.$executeRaw`
      UPDATE AccountDelivery 
      SET deliveredAt = ${now}, updatedAt = ${now}
      WHERE id = ${id}
    `;
    
    // Get the updated delivery
    const updatedDelivery = await prisma.$queryRaw`
      SELECT * FROM AccountDelivery WHERE id = ${id}
    `;
    
    console.log("Successfully marked as delivered");
    return NextResponse.json({ success: true, delivery: updatedDelivery });
  } catch (error) {
    console.error("Error marking delivery as delivered:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
