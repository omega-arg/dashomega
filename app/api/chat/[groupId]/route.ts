import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Verificar acceso al grupo
    const group = await prisma.chatGroup.findUnique({
      where: { id: params.groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    if (!group.isGeneral && group.allowedRoles) {
      const allowedRoles = group.allowedRoles.split(',').map(r => r.trim());
      if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Sin acceso a este grupo' }, { status: 403 });
      }
    }

    // Obtener mensajes del grupo
    const messages = await prisma.chatMessage.findMany({
      where: {
        groupId: params.groupId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: skip,
      take: limit
    });

    // Contar total de mensajes
    const totalMessages = await prisma.chatMessage.count({
      where: {
        groupId: params.groupId
      }
    });

    return NextResponse.json({
      messages: messages.reverse(), // Invertir para mostrar cronológicamente
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      },
      group: {
        id: group.id,
        name: group.name,
        description: group.description
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.content || data.content.trim() === '') {
      return NextResponse.json({ error: 'El contenido del mensaje es requerido' }, { status: 400 });
    }

    // Verificar acceso al grupo
    const group = await prisma.chatGroup.findUnique({
      where: { id: params.groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    if (!group.isGeneral && group.allowedRoles) {
      const allowedRoles = group.allowedRoles.split(',').map(r => r.trim());
      if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Sin acceso a este grupo' }, { status: 403 });
      }
    }

    // Crear mensaje
    const message = await prisma.chatMessage.create({
      data: {
        content: data.content.trim(),
        attachments: data.attachments || '',
        groupId: params.groupId,
        senderId: session.user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
