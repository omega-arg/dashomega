import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isWorking } = await request.json();
    console.log('Toggle work status for user:', session.user.id, 'isWorking:', isWorking);

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isWorking: true,
        startWorkTime: true,
        totalHoursToday: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedUser;
    let timeEntry = null;

    if (isWorking && !currentUser.isWorking) {
      // Iniciar trabajo
      const startTime = new Date();
      
      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isWorking: true,
          startWorkTime: startTime,
          lastActiveAt: startTime
        }
      });

      // Crear entrada de tiempo
      timeEntry = await prisma.timeEntry.create({
        data: {
          userId: session.user.id,
          startTime: startTime,
          isActive: true,
          date: startTime
        }
      });

      console.log('Work started for user:', session.user.id, 'at:', startTime);

    } else if (!isWorking && currentUser.isWorking && currentUser.startWorkTime) {
      // Finalizar trabajo
      const endTime = new Date();
      const startTime = currentUser.startWorkTime;
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // horas

      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isWorking: false,
          startWorkTime: null,
          totalHoursToday: currentUser.totalHoursToday + duration,
          lastActiveAt: endTime
        }
      });

      // Actualizar entrada de tiempo activa
      const activeTimeEntry = await prisma.timeEntry.findFirst({
        where: {
          userId: session.user.id,
          isActive: true
        }
      });

      if (activeTimeEntry) {
        timeEntry = await prisma.timeEntry.update({
          where: { id: activeTimeEntry.id },
          data: {
            endTime: endTime,
            duration: duration,
            isActive: false
          }
        });
      }

      console.log('Work ended for user:', session.user.id, 'duration:', duration);

    } else {
      // No hay cambio de estado
      updatedUser = currentUser;
    }

    const response = {
      success: true,
      isWorking: updatedUser.isWorking,
      startWorkTime: updatedUser.startWorkTime?.toISOString() || null,
      totalHoursToday: updatedUser.totalHoursToday,
      timeEntry: timeEntry,
      message: updatedUser.isWorking ? 'Trabajo iniciado exitosamente' : 'Trabajo finalizado exitosamente'
    };

    console.log('Sending response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error toggling work status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
