import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const paymentConfirmations = await prisma.paymentConfirmation.findMany({
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        order: {
          select: {
            id: true,
            productName: true,
            platform: true,
            customerInfo: true,
            price: true
          }
        },
        sale: {
          select: {
            id: true,
            cliente: true,
            producto: true,
            precioVenta: true,
            folio: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(paymentConfirmations);
  } catch (error) {
    console.error('Error fetching payment confirmations:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Datos recibidos en API:', data);
    
    // Validar campos requeridos
    if (!data.proofImage || !data.amount || !data.paymentMethod) {
      return NextResponse.json(
        { error: 'Imagen de comprobante, cantidad y método de pago son requeridos' },
        { status: 400 }
      );
    }

    // Validar nuevos campos requeridos
    if (!data.clientName || !data.productName || data.managerPercentage === undefined) {
      console.log('Faltan campos requeridos:', {
        clientName: data.clientName,
        productName: data.productName,
        managerPercentage: data.managerPercentage
      });
      return NextResponse.json(
        { error: 'Nombre del cliente, producto y porcentaje del encargado son requeridos' },
        { status: 400 }
      );
    }

    // Para pagos que no están asociados a orderId o saleId, permitimos crear el registro
    // if (!data.orderId && !data.saleId) {
    //   return NextResponse.json(
    //     { error: 'Debe estar asociado a una orden o venta' },
    //     { status: 400 }
    //   );
    // }

    // Verificar que la orden o venta existe
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId }
      });
      if (!order) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
      }
    }

    if (data.saleId) {
      const sale = await prisma.sale.findUnique({
        where: { id: data.saleId }
      });
      if (!sale) {
        return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
      }
    }

    console.log('Creando registro de pago con datos:', {
      amount: parseFloat(data.amount),
      paymentMethod: data.paymentMethod,
      managerPercentage: data.managerPercentage ? parseFloat(data.managerPercentage) : null,
      clientName: data.clientName || null,
      productName: data.productName || null,
      communicationMethod: data.communicationMethod || null
    });

    const paymentConfirmation = await prisma.paymentConfirmation.create({
      data: {
        proofImage: data.proofImage,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        status: 'PENDING',
        orderId: data.orderId || null,
        saleId: data.saleId || null,
        uploadedById: session.user.id,
        // Nuevos campos
        communicationMethod: data.communicationMethod || null,
        managerPercentage: data.managerPercentage ? parseFloat(data.managerPercentage) : null,
        clientName: data.clientName || null,
        productName: data.productName || null
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        order: {
          select: {
            id: true,
            productName: true,
            platform: true,
            customerInfo: true,
            price: true
          }
        },
        sale: {
          select: {
            id: true,
            cliente: true,
            producto: true,
            precioVenta: true,
            folio: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      paymentConfirmation: paymentConfirmation,
      message: 'Confirmación de pago creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating payment confirmation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
