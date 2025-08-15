import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Session user ID:', session.user.id);
    console.log('Full session object:', JSON.stringify(session, null, 2));

    const { isWorking } = await request.json();
    
    // Get user ID from session or fallback to database lookup
    let userId = session.user.id;
    
    if (!userId) {
      console.log('User ID not in session, searching in database by email...');
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      userId = user.id;
      console.log('Found user ID in database:', userId);
    }

    console.log('Toggle work status for user:', userId, 'isWorking:', isWorking);

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
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
        where: { id: userId },
        data: {
          isWorking: true,
          startWorkTime: startTime,
          lastActiveAt: startTime
        }
      });

      // Crear entrada de tiempo
      timeEntry = await prisma.timeEntry.create({
        data: {
          userId: userId,
          startTime: startTime,
          isActive: true,
          date: startTime
        }
      });

      console.log('Work started for user:', userId, 'at:', startTime);

    } else if (!isWorking && currentUser.isWorking && currentUser.startWorkTime) {
      // Finalizar trabajo
      const endTime = new Date();
      const startTime = currentUser.startWorkTime;
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // horas

      updatedUser = await prisma.user.update({
        where: { id: userId },
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
          userId: userId,
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

      console.log('Work ended for user:', userId, 'duration:', duration);

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
