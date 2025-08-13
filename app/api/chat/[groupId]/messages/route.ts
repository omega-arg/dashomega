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
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Verificar que el usuario tiene acceso al grupo
    const chatGroup = await prisma.chatGroup.findUnique({
      where: { id: params.groupId }
    });

    if (!chatGroup) {
      return NextResponse.json(
        { error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos de acceso
    const userRole = session.user.role;
    const hasAccess = chatGroup.isGeneral || 
                     chatGroup.allowedRoles.length === 0 || 
                     chatGroup.allowedRoles.includes(userRole);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Sin acceso a este grupo' },
        { status: 403 }
      );
    }

    // Obtener mensajes del grupo
    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: {
          groupId: params.groupId
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
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
      }),
      prisma.chatMessage.count({
        where: {
          groupId: params.groupId
        }
      })
    ]);

    // Invertir el orden para mostrar mensajes más recientes al final
    const reversedMessages = messages.reverse();

    return NextResponse.json({
      messages: reversedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { content, attachments } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'El contenido del mensaje es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el grupo existe y el usuario tiene acceso
    const chatGroup = await prisma.chatGroup.findUnique({
      where: { id: params.groupId }
    });

    if (!chatGroup) {
      return NextResponse.json(
        { error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos de acceso
    const userRole = session.user.role;
    const hasAccess = chatGroup.isGeneral || 
                     chatGroup.allowedRoles.length === 0 || 
                     chatGroup.allowedRoles.includes(userRole);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Sin acceso a este grupo' },
        { status: 403 }
      );
    }

    // Crear el mensaje
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        attachments: attachments || [],
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
      message,
      messageText: 'Mensaje enviado exitosamente'
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
