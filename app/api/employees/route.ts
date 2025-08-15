
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session or fallback to database lookup
    let userId = session.user.id;
    
    if (!userId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      userId = user.id;
    }

    const employees = await prisma.user.findMany({
      where: {
        isActive: true  // Solo mostrar empleados activos
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        isActive: true,
        isWorking: true,
        startWorkTime: true,
        totalHoursToday: true,
        weeklyTarget: true,
        salary: true,
        joinedAt: true,
        lastActiveAt: true,
        image: true,
        _count: {
          select: {
            assignedTasks: true,
            timeEntries: true,
            sales: true
          }
        }
      },
      orderBy: [
        { isWorking: "desc" },
        { isActive: "desc" },
        { lastActiveAt: "desc" },
      ],
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Check permissions
    const allowedRoles = ["OWNER", "ADMIN_GENERAL", "RECLUTADOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    console.log('Creating employee with data:', data);
    const { name, email, role, country, salary, weeklyTarget } = data;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Nombre, email y rol son requeridos' }, { status: 400 });
    }

    // Usar transacción para garantizar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Verificar si el email ya existe
      const existingUser = await tx.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Crear el empleado
      const newEmployee = await tx.user.create({
        data: {
          name,
          email,
          role,
          country: country || null,
          salary: salary ? parseFloat(salary) : null,
          weeklyTarget: weeklyTarget ? parseInt(weeklyTarget) : 40,
          isActive: true,
          isWorking: false,
          totalHoursToday: 0
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          country: true,
          isActive: true,
          isWorking: true,
          salary: true,
          weeklyTarget: true,
          totalHoursToday: true,
          joinedAt: true,
          _count: {
            select: {
              assignedTasks: true,
              timeEntries: true,
              sales: true
            }
          }
        }
      });

      return newEmployee;
    });

    console.log('Employee created successfully:', result);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: errorMessage === 'El email ya está registrado' ? 400 : 500 });
  }
}
