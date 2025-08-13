import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener todos los grupos de chat donde el usuario tiene acceso según su rol
    const userRole = session.user.role;
    
    const chatGroups = await prisma.chatGroup.findMany({
      where: {
        OR: [
          { isGeneral: true }, // Grupos generales accesibles para todos
          { allowedRoles: { contains: userRole } }, // Grupos específicos para el rol del usuario
          { allowedRoles: "" } // Grupos sin restricciones de rol
        ]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ chatGroups });

  } catch (error) {
    console.error('Error al obtener grupos de chat:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
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

    // Solo los administradores pueden crear grupos
    if (!['OWNER', 'ADMIN_GENERAL'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para crear grupos' },
        { status: 403 }
      );
    }

    const { name, description, isGeneral, allowedRoles } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del grupo es requerido' },
        { status: 400 }
      );
    }

    const chatGroup = await prisma.chatGroup.create({
      data: {
        name,
        description: description || '',
        isGeneral: isGeneral || false,
        allowedRoles: allowedRoles || []
      }
    });

    return NextResponse.json({ 
      success: true, 
      chatGroup,
      message: 'Grupo creado exitosamente' 
    });

  } catch (error) {
    console.error('Error al crear grupo de chat:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
