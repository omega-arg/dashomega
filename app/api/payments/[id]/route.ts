import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo roles de pago pueden revisar confirmaciones
    const paymentRoles = ['OWNER', 'ADMIN_GENERAL', 'ENCARGADO_PAGO_MEXICO', 'ENCARGADO_PAGO_PERU', 'ENCARGADO_PAGO_COLOMBIA', 'ENCARGADO_PAGO_ZELLE'];
    if (!paymentRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos para revisar pagos' }, { status: 403 });
    }

    const data = await request.json();
    
    const paymentConfirmation = await prisma.paymentConfirmation.findUnique({
      where: { id: params.id }
    });

    if (!paymentConfirmation) {
      return NextResponse.json({ error: 'Confirmación de pago no encontrada' }, { status: 404 });
    }

    const updatedPaymentConfirmation = await prisma.paymentConfirmation.update({
      where: { id: params.id },
      data: {
        status: data.status,
        reviewNotes: data.reviewNotes || null,
        reviewedAt: new Date()
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

    // Si se confirma el pago, actualizar el estado de la orden/venta
    if (data.status === 'CONFIRMED') {
      if (paymentConfirmation.orderId) {
        await prisma.order.update({
          where: { id: paymentConfirmation.orderId },
          data: { status: 'PROCESSING' }
        });
      }
      
      if (paymentConfirmation.saleId) {
        await prisma.sale.update({
          where: { id: paymentConfirmation.saleId },
          data: { status: 'PROCESSING' }
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentConfirmation: updatedPaymentConfirmation,
      message: 'Confirmación de pago actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error updating payment confirmation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo roles de pago pueden eliminar confirmaciones
    const paymentRoles = ['OWNER', 'ADMIN_GENERAL', 'ENCARGADO_PAGO_MEXICO', 'ENCARGADO_PAGO_PERU', 'ENCARGADO_PAGO_COLOMBIA', 'ENCARGADO_PAGO_ZELLE'];
    if (!paymentRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos para eliminar pagos' }, { status: 403 });
    }

    const paymentConfirmation = await prisma.paymentConfirmation.findUnique({
      where: { id: params.id }
    });

    if (!paymentConfirmation) {
      return NextResponse.json({ error: 'Confirmación de pago no encontrada' }, { status: 404 });
    }

    // Solo se pueden eliminar pagos rechazados
    if (paymentConfirmation.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Solo se pueden eliminar pagos rechazados' }, { status: 400 });
    }

    await prisma.paymentConfirmation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmación de pago eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting payment confirmation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
