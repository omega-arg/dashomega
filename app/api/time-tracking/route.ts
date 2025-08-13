import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener entradas de tiempo del usuario
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)) // Desde el inicio del día
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isWorking: true,
        startWorkTime: true,
        totalHoursToday: true,
        weeklyTarget: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calcular horas totales del día
    let totalHours = 0;
    timeEntries.forEach(entry => {
      if (entry.duration) {
        totalHours += entry.duration;
      }
    });

    // Si está trabajando actualmente, agregar tiempo actual
    let currentSessionHours = 0;
    if (user.isWorking && user.startWorkTime) {
      const now = new Date();
      currentSessionHours = (now.getTime() - user.startWorkTime.getTime()) / (1000 * 60 * 60);
    }

    const response = {
      success: true,
      timeEntries: timeEntries,
      totalHoursToday: totalHours + currentSessionHours,
      currentSessionHours: currentSessionHours,
      isWorking: user.isWorking,
      startWorkTime: user.startWorkTime,
      weeklyTarget: user.weeklyTarget,
      completedEntries: timeEntries.filter(e => !e.isActive).length,
      activeEntry: timeEntries.find(e => e.isActive) || null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
