'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Clock,
  DollarSign,
  Settings,
  CheckSquare,
  Building2,
  Play,
  Pause,
  Shield,
  Gamepad2
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [hoursWorked, setHoursWorked] = useState('0:00:00');
  const [isToggling, setIsToggling] = useState(false);
  const [stats, setStats] = useState({
    employees: { total: 0, working: 0, available: 0 },
    sales: { today: { count: 0, revenue: 0, total: 0 } },
    tasks: { pending: 0, urgent: 0 },
    payments: { pending: 0 },
    hours: { today: 0 }
  });

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    if (session) {
      loadStats();
      // Actualizar estadísticas cada 30 segundos
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    const savedWorkState = localStorage.getItem('workState');
    if (savedWorkState) {
      try {
        const { isWorking: savedIsWorking, startTime } = JSON.parse(savedWorkState);
        if (savedIsWorking && startTime) {
          setIsWorking(true);
          setWorkStartTime(new Date(startTime));
          console.log('Restored work state from localStorage:', { savedIsWorking, startTime });
        }
      } catch (error) {
        console.error('Error parsing saved work state:', error);
        localStorage.removeItem('workState');
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    const workState = {
      isWorking,
      startTime: workStartTime?.toISOString() || null
    };
    localStorage.setItem('workState', JSON.stringify(workState));
    console.log('Saved work state to localStorage:', workState);
  }, [isWorking, workStartTime]);

  // Actualizar contador de horas cada segundo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    console.log('Counter useEffect triggered', { isWorking, workStartTime });
    
    if (isWorking && workStartTime) {
      console.log('Setting up interval for time tracking');
      
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - workStartTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const newTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        console.log('Updating time:', newTime);
        setHoursWorked(newTime);
      }, 1000);
    } else {
      console.log('No interval needed', { isWorking, workStartTime });
    }

    return () => {
      if (interval) {
        console.log('Clearing interval');
        clearInterval(interval);
      }
    };
  }, [isWorking, workStartTime]);

  const toggleWorkStatus = async () => {
    setIsToggling(true);
    console.log('Toggling work status, current state:', isWorking);
    
    try {
      const response = await fetch('/api/time-tracking/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isWorking: !isWorking }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          const newIsWorking = !isWorking;
          setIsWorking(newIsWorking);
          
          if (newIsWorking) {
            // Empezando a trabajar
            const startTime = new Date();
            setWorkStartTime(startTime);
            setHoursWorked('0:00:00');
            console.log('Started working at:', startTime);
            console.log('WorkStartTime set to:', startTime);
          } else {
            // Terminando trabajo
            setWorkStartTime(null);
            console.log('Stopped working');
            // Limpiar localStorage cuando se termine de trabajar
            localStorage.removeItem('workState');
          }
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert('Error al cambiar estado de trabajo: ' + (errorData.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Error de conexión. Revisa la consola para más detalles.');
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  // Determinar roles permitidos para Entrega de Cuentas
  const allowedRoles = ['OWNER', 'ADMIN_GENERAL', 'AT_CLIENTE'];
  const userRole = session?.user?.role || '';
  const hasDeliveryAccess = allowedRoles.includes(userRole);

  const quickActions = [
    { 
      title: 'Empleados', 
      description: 'Gestionar empleados y roles',
      icon: Users,
      href: '/employees',
      color: 'bg-blue-500'
    },
    { 
      title: 'Tareas', 
      description: 'Ver y asignar tareas',
      icon: CheckSquare,
      href: '/tasks',
      color: 'bg-green-500'
    },
    { 
      title: 'Horarios', 
      description: 'Control de tiempo',
      icon: Clock,
      href: '/hours',
      color: 'bg-orange-500'
    },
    { 
      title: 'Finanzas', 
      description: 'Reportes financieros',
      icon: DollarSign,
      href: '/finances',
      color: 'bg-emerald-500'
    },
    { 
      title: 'Chat', 
      description: 'Comunicación interna',
      icon: MessageSquare,
      href: '/chat',
      color: 'bg-purple-500'
    },
    { 
      title: 'Calendario', 
      description: 'Eventos y fechas importantes',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-red-500'
    },
    { 
      title: 'Pagos', 
      description: 'Confirmaciones de pago',
      icon: Building2,
      href: '/payments',
      color: 'bg-indigo-500'
    },
    { 
      title: 'Chetadores', 
      description: 'Gestión de chetadores',
      icon: Gamepad2,
      href: '/cheaters',
      color: 'bg-yellow-500'
    },
    { 
      title: 'Configuración', 
      description: 'Ajustes del sistema',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    },
    // Nueva acción rápida: Entrega de Cuentas
    ...(hasDeliveryAccess
      ? [{
          title: 'Entrega de Cuentas',
          description: 'Gestión y entrega de cuentas vendidas',
          icon: Shield,
          href: '/account-delivery',
          color: 'bg-cyan-600'
        }]
      : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Dashboard Omega Store
              </h1>
              <p className="text-purple-200">
                Bienvenido de vuelta, {session.user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Work Status Toggle */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {isWorking ? (
                      <Pause className="w-4 h-4 text-green-400" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm text-white">
                      {isWorking ? 'Trabajando' : 'Descanso'}
                    </span>
                  </div>
                  <Switch
                    checked={isWorking}
                    onCheckedChange={toggleWorkStatus}
                    disabled={isToggling}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
                {isWorking && (
                  <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-mono text-green-400">
                      {hoursWorked}
                    </span>
                    <span className="text-xs text-green-300">
                      (persistente)
                    </span>
                  </div>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className={`${isWorking ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isWorking ? 'Trabajando' : 'Disponible'}
                </Badge>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">
                Total Empleados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.employees.total}</div>
              <p className="text-xs text-purple-200">
                {stats.employees.working > 0 ? `${stats.employees.working} trabajando ahora` : 'Sistema conectado'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">
                Horas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{hoursWorked}</div>
              <p className="text-xs text-purple-200">
                {isWorking ? 'Trabajando ahora' : 'Total del día'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">
                Ingresos Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${stats.sales.today.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-purple-200">
                {stats.sales.today.count} ventas hoy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">
                Tareas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.tasks.pending}</div>
              <p className="text-xs text-purple-200">
                {stats.tasks.urgent > 0 ? `${stats.tasks.urgent} urgentes` : 'Todo bajo control'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card 
                  key={index}
                  className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-colors cursor-pointer group"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`${action.color} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-medium text-white text-sm">
                        {action.title}
                      </h3>
                      <p className="text-xs text-purple-200 opacity-80">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <Card className="bg-white/5 backdrop-blur border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">
                Panel Administrativo - Omega Store
              </span>
              <span className="text-purple-200">
                Versión 1.0.0
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
