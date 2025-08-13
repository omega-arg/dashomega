import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// Endpoint para crear automáticamente una entrega cuando se hace una venta
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { saleId } = await req.json();
    
    // Obtener los datos de la venta
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { atClient: true }
    });

    if (!sale) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }

    // Verificar si ya existe una entrega para esta venta
    const existingDelivery = await prisma.accountDelivery.findFirst({
      where: { 
        clientName: sale.cliente,
        productType: sale.producto,
        purchaseDate: sale.fecha
      }
    });

    if (existingDelivery) {
      return NextResponse.json({ 
        message: 'Ya existe una entrega para esta venta',
        delivery: existingDelivery 
      });
    }

    // Crear automáticamente la entrega
    const delivery = await prisma.accountDelivery.create({
      data: {
        clientName: sale.cliente,
        clientUser: sale.email || sale.telefono || 'No especificado',
        clientContact: sale.telefono || sale.email || 'No especificado',
        productType: sale.producto,
        productDetails: sale.descripcion || `${sale.producto} - ${sale.cantidad} unidad(es)`,
        price: sale.precioVenta,
        paymentMethod: sale.metodoPago,
        purchaseDate: sale.fecha,
        createdById: session.user.id,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Entrega creada automáticamente',
      delivery 
    });

  } catch (error) {
    console.error('Error creating automatic delivery:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
