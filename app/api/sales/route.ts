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

    const sales = await prisma.sale.findMany({
      include: {
        atClient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        empleadoPago: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        paymentConfirmation: {
          select: {
            id: true,
            status: true,
            proofImage: true,
            reviewedAt: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Creating sale with data:', data);
    
    // Validar campos requeridos
    if (!data.cliente || !data.producto || !data.precioVenta) {
      return NextResponse.json(
        { error: 'Cliente, producto y precio de venta son requeridos' },
        { status: 400 }
      );
    }

    // Calcular ganancia neta automáticamente
    const precioVenta = parseFloat(data.precioVenta) || 0;
    const costoCheto = parseFloat(data.costoCheto) || 0;
    const descuento = parseFloat(data.descuento) || 0;
    const impuestos = parseFloat(data.impuestos) || 0;
    const comisionPago = parseFloat(data.comisionPago) || 0;
    const pagoEmpleado = parseFloat(data.pagoEmpleado) || 0;
    
    const gananciaNeta = precioVenta - costoCheto - descuento - impuestos - comisionPago - pagoEmpleado;

    // Generar un folio único
    const folio = `VTA-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          cliente: data.cliente,
          telefono: data.telefono || null,
          email: data.email || null,
          producto: data.producto,
          descripcion: data.descripcion || null,
          cantidad: parseInt(data.cantidad) || 1,
          precioVenta: precioVenta,
          costoCheto: costoCheto,
          descuento: descuento,
          impuestos: impuestos,
          comisionPago: comisionPago,
          pagoEmpleado: pagoEmpleado,
          canalVenta: data.canalVenta || '',
          metodoPago: data.metodoPago || '',
          ganunciaNeta: gananciaNeta,
          notasVenta: data.notasVenta || null,
          fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : null,
          folio: folio,
          status: 'PENDING',
          atClientId: data.atClientId || null,
          empleadoPagoId: data.empleadoPagoId || null
        },
        include: {
          atClient: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          empleadoPago: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Automáticamente crear una entrega de cuenta
      try {
        await tx.accountDelivery.create({
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
        console.log('Account delivery created automatically for sale:', sale.id);
      } catch (deliveryError) {
        console.error('Error creating automatic delivery:', deliveryError);
        // No fallar la venta si la entrega falla
      }

      return sale;
    });

    console.log('Sale created successfully:', result);

    return NextResponse.json({
      success: true,
      sale: result,
      message: 'Venta registrada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
