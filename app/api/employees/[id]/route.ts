import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
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
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        timeEntries: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            duration: true,
            date: true
          },
          orderBy: { date: 'desc' },
          take: 10
        },
        sales: {
          select: {
            id: true,
            cliente: true,
            producto: true,
            precioVenta: true,
            fecha: true
          },
          orderBy: { fecha: 'desc' },
          take: 10
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const { name, email, role, country, salary, weeklyTarget, isActive } = data;

    // Verificar si el empleado existe
    const existingEmployee = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Si se está cambiando el email, verificar que no exista
    if (email && email !== existingEmployee.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
      }
    }

    const updatedEmployee = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(country !== undefined && { country }),
        ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null }),
        ...(weeklyTarget !== undefined && { weeklyTarget: parseInt(weeklyTarget) }),
        ...(isActive !== undefined && { isActive }),
        lastActiveAt: new Date()
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
        lastActiveAt: true
      }
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Session user ID:', session.user.id);
    console.log('Session user role:', session.user.role);

    // Get user ID from session or fallback to database lookup
    let userId = session.user.id;
    
    if (!userId) {
      console.log('User ID not in session, searching in database by email...');
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true, role: true }
      });
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      userId = user.id;
      console.log('Found user ID in database:', userId);
    }

    // Check permissions (solo OWNER puede eliminar)
    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // No permitir que se elimine a sí mismo
    if (params.id === userId) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    const employee = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // En lugar de eliminar, desactivar el empleado
    await prisma.user.update({
      where: { id: params.id },
      data: {
        isActive: false,
        isWorking: false,
        startWorkTime: null
      }
    });

    return NextResponse.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
