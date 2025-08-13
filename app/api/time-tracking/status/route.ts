
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isWorking: true,
        startWorkTime: true,
        totalHoursToday: true,
        weeklyTarget: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isWorking: user.isWorking,
      startTime: user.startWorkTime?.toISOString() || null,
      totalHoursToday: user.totalHoursToday || 0,
      weeklyTarget: user.weeklyTarget || 40,
    });
  } catch (error) {
    console.error("Error fetching work status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
