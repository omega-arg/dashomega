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

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Estadísticas de empleados
    const totalEmployees = await prisma.user.count({
      where: { isActive: true }
    });

    const workingEmployees = await prisma.user.count({
      where: { 
        isActive: true,
        isWorking: true 
      }
    });

    // Estadísticas de ventas del día
    const todaySales = await prisma.sale.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.ganunciaNeta, 0);
    const todayTotalSales = todaySales.reduce((sum, sale) => sum + sale.precioVenta, 0);

    // Estadísticas de la semana
    const weekSales = await prisma.sale.findMany({
      where: {
        fecha: {
          gte: startOfWeek
        }
      }
    });

    const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.ganunciaNeta, 0);

    // Estadísticas del mes
    const monthSales = await prisma.sale.findMany({
      where: {
        fecha: {
          gte: startOfMonth
        }
      }
    });

    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.ganunciaNeta, 0);

    // Tareas pendientes
    const pendingTasks = await prisma.task.count({
      where: {
        status: {
          in: ['TODO', 'IN_PROGRESS']
        }
      }
    });

    const urgentTasks = await prisma.task.count({
      where: {
        priority: 'URGENT',
        status: {
          not: 'COMPLETED'
        }
      }
    });

    // Pagos pendientes
    const pendingPayments = await prisma.paymentConfirmation.count({
      where: {
        status: 'PENDING'
      }
    });

    // Horas trabajadas hoy
    const todayHours = await prisma.timeEntry.aggregate({
      _sum: {
        duration: true
      },
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Mensajes de chat hoy
    const todayMessages = await prisma.chatMessage.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Eventos del calendario próximos (próximos 7 días)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingEvents = await prisma.calendarEvent.count({
      where: {
        startDate: {
          gte: new Date(),
          lte: nextWeek
        }
      }
    });

    // Top productos vendidos este mes
    const topProducts = await prisma.sale.groupBy({
      by: ['producto'],
      _count: {
        producto: true
      },
      _sum: {
        ganunciaNeta: true,
        precioVenta: true
      },
      where: {
        fecha: {
          gte: startOfMonth
        }
      },
      orderBy: {
        _sum: {
          ganunciaNeta: 'desc'
        }
      },
      take: 5
    });

    // Empleados más productivos (por ventas)
    const topEmployees = await prisma.sale.groupBy({
      by: ['atClientId'],
      _count: {
        atClientId: true
      },
      _sum: {
        ganunciaNeta: true
      },
      where: {
        fecha: {
          gte: startOfMonth
        },
        atClientId: {
          not: null
        }
      },
      orderBy: {
        _sum: {
          ganunciaNeta: 'desc'
        }
      },
      take: 5
    });

    // Obtener detalles de los empleados top
    const topEmployeesDetails = await Promise.all(
      topEmployees.map(async (emp) => {
        const user = await prisma.user.findUnique({
          where: { id: emp.atClientId! },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
        return {
          ...user,
          salesCount: emp._count.atClientId,
          totalRevenue: emp._sum.ganunciaNeta || 0
        };
      })
    );

    const stats = {
      employees: {
        total: totalEmployees,
        working: workingEmployees,
        available: totalEmployees - workingEmployees
      },
      sales: {
        today: {
          count: todaySales.length,
          revenue: todayRevenue,
          total: todayTotalSales
        },
        week: {
          count: weekSales.length,
          revenue: weekRevenue
        },
        month: {
          count: monthSales.length,
          revenue: monthRevenue
        }
      },
      tasks: {
        pending: pendingTasks,
        urgent: urgentTasks
      },
      payments: {
        pending: pendingPayments
      },
      hours: {
        today: todayHours._sum.duration || 0
      },
      communication: {
        messages: todayMessages,
        upcomingEvents: upcomingEvents
      },
      topProducts: topProducts.map(product => ({
        name: product.producto,
        salesCount: product._count.producto,
        revenue: product._sum.ganunciaNeta || 0,
        totalSales: product._sum.precioVenta || 0
      })),
      topEmployees: topEmployeesDetails.filter(emp => emp.id)
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
