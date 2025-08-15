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
    
    // Use Prisma client methods instead of raw SQL
    const now = new Date();
    
    // First check if delivery exists and is not already delivered
    const existingDelivery = await prisma.accountDelivery.findUnique({
      where: { id }
    });
    
    if (!existingDelivery) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 });
    }
    
    if (existingDelivery.deliveredAt) {
      return NextResponse.json({ error: 'Esta entrega ya está marcada como entregada' }, { status: 400 });
    }
    
    // Update delivery with delivered timestamp
    const updatedDelivery = await prisma.accountDelivery.update({
      where: { id },
      data: {
        deliveredAt: now,
        updatedAt: now
      }
    });
    
    console.log("Successfully marked as delivered");
    return NextResponse.json({ success: true, delivery: updatedDelivery });
  } catch (error) {
    console.error("Error marking delivery as delivered:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
