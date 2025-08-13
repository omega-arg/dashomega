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

    // Obtener todos los mensajes de chat con sus grupos
    const messages = await prisma.chatMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { content, channelId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'El contenido del mensaje es requerido' }, { status: 400 });
    }

    if (!channelId) {
      return NextResponse.json({ error: 'El canal es requerido' }, { status: 400 });
    }

    // Buscar o crear el grupo de chat para el canal
    let group = await prisma.chatGroup.findFirst({
      where: { name: channelId }
    });

    if (!group) {
      // Crear el grupo si no existe
      group = await prisma.chatGroup.create({
        data: {
          name: channelId,
          description: `Canal ${channelId}`,
          isGeneral: channelId === 'general',
          allowedRoles: ''
        }
      });
    }

    // Crear el mensaje
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        groupId: group.id,
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
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo el OWNER puede eliminar mensajes
    if ((session.user as any).role !== 'OWNER') {
      return NextResponse.json({ error: 'Solo el propietario puede eliminar mensajes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'ID del mensaje es requerido' }, { status: 400 });
    }

    // Verificar que el mensaje existe
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        sender: { select: { name: true } },
        group: { select: { name: true } }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 });
    }

    // Eliminar el mensaje
    await prisma.chatMessage.delete({
      where: { id: messageId }
    });

    console.log(`🗑️ Mensaje eliminado por ${session.user.name}: "${message.content}" en canal ${message.group.name}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje eliminado exitosamente',
      deletedMessage: {
        id: message.id,
        content: message.content,
        author: message.sender.name,
        channel: message.group.name
      }
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
