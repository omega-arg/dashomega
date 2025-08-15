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
  console.log("🔍 Account Delivery API (Real) - GET called");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in GET:", session?.user?.role);
    
    if (!session || !hasAccountDeliveryAccess(session.user.role)) {
      console.log("Access denied for role:", session?.user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    let deliveries;
    if (session.user.role === 'AT_CLIENTE') {
      deliveries = await prisma.accountDelivery.findMany({
        where: {
          createdById: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      deliveries = await prisma.accountDelivery.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
    
    console.log("Found deliveries:", deliveries.length);
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("🔍 Account Delivery API (Real) - POST called");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST:", session?.user?.role);
    console.log("Session user ID:", session?.user?.id);
    console.log("Full session object:", JSON.stringify(session, null, 2));
    
    if (!session || !hasAccountDeliveryAccess(session.user.role)) {
      console.log("Access denied for role:", session?.user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const data = await req.json();
    console.log("POST data:", data);
    
    // Validaciones
    if (!data.clientName || !data.productType) {
      return NextResponse.json({ error: 'Nombre del cliente y tipo de producto son requeridos' }, { status: 400 });
    }
    
    // Si no tenemos el ID en la sesión, lo buscamos en la base de datos
    let userId = session.user.id;
    if (!userId) {
      console.log("User ID not in session, searching in database by email...");
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      });
      
      if (!user) {
        console.log("Could not find user in database");
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      
      userId = user.id;
      console.log("Found user ID in database:", userId);
    }

    const delivery = await prisma.accountDelivery.create({
      data: {
        clientName: data.clientName,
        clientUser: data.clientUser || "",
        clientContact: data.clientContact || "",
        productType: data.productType,
        productDetails: data.productDetails || "",
        price: parseFloat(data.price) || 0,
        paymentMethod: data.paymentMethod || "",
        purchaseDate: data.purchaseDate || new Date(),
        deliveryUser: data.deliveryUser || "",
        deliveryPass: data.deliveryPass || "",
        deliveryEmail: data.deliveryEmail || "",
        deliveryInstructions: data.deliveryInstructions || "",
        createdById: userId
      }
    });
    
    console.log("Created delivery:", delivery);
    return NextResponse.json({ success: true, id: delivery.id, delivery });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  console.log("🔍 Account Delivery API (Real) - PUT called");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in PUT:", session?.user?.role);
    
    if (!session || !hasAccountDeliveryAccess(session.user.role)) {
      console.log("Access denied for role:", session?.user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const data = await req.json();
    console.log("PUT data:", data);
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const updatedDelivery = await prisma.accountDelivery.update({
      where: { id: data.id },
      data: {
        clientName: data.clientName,
        clientUser: data.clientUser || "",
        clientContact: data.clientContact || "",
        productType: data.productType,
        productDetails: data.productDetails || "",
        price: parseFloat(data.price) || 0,
        paymentMethod: data.paymentMethod || "",
        deliveryUser: data.deliveryUser || "",
        deliveryPass: data.deliveryPass || "",
        deliveryEmail: data.deliveryEmail || "",
        deliveryInstructions: data.deliveryInstructions || "",
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
        updatedAt: new Date()
      }
    });
    
    console.log("Updated delivery:", updatedDelivery);
    return NextResponse.json({ success: true, delivery: updatedDelivery });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log("🔍 Account Delivery API (Real) - DELETE called");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in DELETE:", session?.user?.role);
    
    if (!session || !hasAccountDeliveryAccess(session.user.role)) {
      console.log("Access denied for role:", session?.user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const data = await req.json();
    console.log("DELETE data:", data);
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const deletedDelivery = await prisma.accountDelivery.delete({
      where: { id: data.id }
    });
    
    console.log("Deleted delivery:", deletedDelivery);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
