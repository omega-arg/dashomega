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

    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    console.log('Creating task with data:', data);
    
    // Validar campos requeridos
    if (!data.title || !data.assignedToId) {
      return NextResponse.json(
        { error: 'Título y empleado asignado son requeridos' },
        { status: 400 }
      );
    }

    // Usar transacción para garantizar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Verificar que el empleado asignado existe
      const assignedEmployee = await tx.user.findUnique({
        where: { id: data.assignedToId }
      });

      if (!assignedEmployee) {
        throw new Error('El empleado asignado no existe');
      }

      // Crear la tarea
      const task = await tx.task.create({
        data: {
          title: data.title,
          description: data.description || null,
          status: data.status || 'TODO',
          priority: data.priority || 'MEDIUM',
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          attachments: data.attachments || '',
          assignedToId: data.assignedToId,
          createdById: session.user.id
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return task;
    });

    console.log('Task created successfully:', result);

    return NextResponse.json({
      success: true,
      task: result,
      message: 'Tarea creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: errorMessage === 'El empleado asignado no existe' ? 400 : 500 });
  }
}
