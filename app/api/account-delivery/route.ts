import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// Helper: Check if user has access
function hasAccountDeliveryAccess(role: string) {
  return [
    'OWNER',
    'ADMIN_GENERAL',
    'AT_CLIENTE',
  ].includes(role);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccountDeliveryAccess(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    let deliveries;
    if (session.user.role === 'AT_CLIENTE') {
      deliveries = await prisma.$queryRaw`
        SELECT * FROM AccountDelivery 
        WHERE createdById = ${session.user.id}
        ORDER BY createdAt DESC
      `;
    } else {
      deliveries = await prisma.$queryRaw`
        SELECT * FROM AccountDelivery 
        ORDER BY createdAt DESC
      `;
    }
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccountDeliveryAccess(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  
  try {
    const data = await req.json();
    const now = new Date().toISOString();
    
    const delivery = await prisma.$executeRaw`
      INSERT INTO AccountDelivery (
        id, clientName, clientUser, clientContact, productType, 
        productDetails, price, paymentMethod, purchaseDate,
        deliveryUser, deliveryPass, deliveryEmail, deliveryInstructions,
        createdAt, updatedAt, createdById
      ) VALUES (
        ${crypto.randomUUID()}, ${data.clientName}, ${data.clientUser}, ${data.clientContact}, 
        ${data.productType}, ${data.productDetails}, ${data.price}, ${data.paymentMethod}, 
        ${data.purchaseDate || now}, ${data.deliveryUser || ""}, ${data.deliveryPass || ""}, 
        ${data.deliveryEmail || ""}, ${data.deliveryInstructions || ""}, 
        ${now}, ${now}, ${session.user.id}
      )
    `;
    
    return NextResponse.json({ success: true, id: delivery });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccountDeliveryAccess(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  
  try {
    const data = await req.json();
    console.log("PUT request data:", data);
    
    // Convert deliveredAt to Date if it comes as string
    let deliveredAt = null;
    if (data.deliveredAt) {
      deliveredAt = typeof data.deliveredAt === 'string' ? data.deliveredAt : data.deliveredAt.toISOString();
    }
    
    const now = new Date().toISOString();
    
    await prisma.$executeRaw`
      UPDATE AccountDelivery 
      SET 
        clientName = ${data.clientName || ""},
        clientUser = ${data.clientUser || ""},
        clientContact = ${data.clientContact || ""},
        productType = ${data.productType || ""},
        productDetails = ${data.productDetails || ""},
        price = ${data.price || 0},
        paymentMethod = ${data.paymentMethod || ""},
        deliveryUser = ${data.deliveryUser || ""},
        deliveryPass = ${data.deliveryPass || ""},
        deliveryEmail = ${data.deliveryEmail || ""},
        deliveryInstructions = ${data.deliveryInstructions || ""},
        deliveredAt = ${deliveredAt},
        updatedAt = ${now}
      WHERE id = ${data.id}
    `;
    
    console.log("Updated delivery successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasAccountDeliveryAccess(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  
  try {
    const { id } = await req.json();
    await prisma.$executeRaw`DELETE FROM AccountDelivery WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
