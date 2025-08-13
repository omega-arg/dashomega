"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Clock, 
  Timer, 
  BarChart3, 
  TrendingUp, 
  Download,
  Activity,
  Coffee,
  Calendar,
  Search,
  Users,
  Zap,
  Target,
  PlayCircle,
  PauseCircle,
  Filter,
  Star,
  Award,
  Loader2,
  Flame,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isWorking: boolean;
  currentSessionStart?: string;
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  weeklyTarget: number;
  productivity: number;
  streak: number;
  status: "working" | "break" | "offline";
  country?: string;
}

export default function HoursPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  // Fetch real employee data
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform employee data to match our interface
      const transformedEmployees: Employee[] = data.map((emp: any) => ({
        id: emp.id,
        name: emp.name || 'Sin nombre',
        role: emp.role || 'SOPORTE',
        avatar: emp.image || '',
        isWorking: emp.isWorking || false,
        currentSessionStart: emp.startWorkTime || null,
        todayMinutes: Math.floor(emp.totalHoursToday * 60) || 0,
        weekMinutes: Math.floor((emp.totalHoursToday * 60) * 7) || 0, // Approximation
        monthMinutes: Math.floor((emp.totalHoursToday * 60) * 30) || 0, // Approximation
        weeklyTarget: emp.weeklyTarget || 40,
        productivity: Math.floor(Math.random() * 20) + 80, // Random for now, you can implement real calculation
        streak: Math.floor(Math.random() * 15) + 1, // Random for now
        status: emp.isWorking ? "working" : "offline",
        country: emp.country || '🌍 No especificado'
      }));
      
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchEmployees();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  const calculateCurrentSessionDuration = (startTime: string): number => {
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  };

  const toggleWorkStatus = async (employeeId: string) => {
    try {
      // Add loading state for this employee
      setLoadingActions(prev => new Set(prev).add(employeeId));
      
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      if (employee.isWorking) {
        // Stop work
        const response = await fetch('/api/time-tracking', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'stop',
            userId: employeeId
          }),
        });

        if (response.ok) {
          // Update local state
          setEmployees(prevEmployees =>
            prevEmployees.map(emp => {
              if (emp.id === employeeId) {
                const sessionDuration = emp.currentSessionStart ? 
                  calculateCurrentSessionDuration(emp.currentSessionStart) : 0;
                return {
                  ...emp,
                  isWorking: false,
                  currentSessionStart: undefined,
                  todayMinutes: emp.todayMinutes + sessionDuration,
                  status: "offline" as const
                };
              }
              return emp;
            })
          );
        } else {
          console.error('Error stopping work:', await response.text());
        }
      } else {
        // Start work
        const response = await fetch('/api/time-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'start',
            userId: employeeId
          }),
        });

        if (response.ok) {
          // Update local state
          setEmployees(prevEmployees =>
            prevEmployees.map(emp => {
              if (emp.id === employeeId) {
                return {
                  ...emp,
                  isWorking: true,
                  currentSessionStart: new Date().toISOString(),
                  status: "working" as const
                };
              }
              return emp;
            })
          );
        } else {
          console.error('Error starting work:', await response.text());
        }
      }
    } catch (error) {
      console.error('Error toggling work status:', error);
    } finally {
      // Remove loading state for this employee
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case "working":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          borderColor: "border-green-500/30",
          icon: PlayCircle,
          label: "Trabajando",
          pulse: true
        };
      case "break":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20", 
          borderColor: "border-yellow-500/30",
          icon: Coffee,
          label: "En Descanso",
          pulse: false
        };
      default:
        return {
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-500/30", 
          icon: PauseCircle,
          label: "Desconectado",
          pulse: false
        };
    }
  };

  const getTotalHoursToday = () => {
    return employees.reduce((total, emp) => {
      let minutes = emp.todayMinutes;
      if (emp.isWorking && emp.currentSessionStart) {
        minutes += calculateCurrentSessionDuration(emp.currentSessionStart);
      }
      return total + minutes;
    }, 0);
  };

  const getActiveEmployeesCount = () => {
    return employees.filter(emp => emp.status === "working").length;
  };

  const getAverageProductivity = () => {
    return Math.round(employees.reduce((total, emp) => total + emp.productivity, 0) / employees.length);
  };

  const getWeeklyProgress = () => {
    const totalTarget = employees.reduce((total, emp) => total + emp.weeklyTarget, 0) * 60;
    const totalWorked = employees.reduce((total, emp) => total + emp.weekMinutes, 0);
    return Math.round((totalWorked / totalTarget) * 100);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const StatusIndicator = ({ employee }: { employee: Employee }) => {
    const config = getStatusConfig(employee.status);
    const IconComponent = config.icon;
    
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full", config.bgColor, config.borderColor, "border")}>
        <IconComponent className={cn("w-4 h-4", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
        {config.pulse && <div className={cn("w-2 h-2 rounded-full animate-pulse", "bg-green-400")} />}
      </div>
    );
  };

  const ProductivityBadge = ({ score }: { score: number }) => {
    const getProductivityConfig = (score: number) => {
      if (score >= 95) return { color: "text-green-400", bg: "bg-green-500/20", icon: "🔥", label: "Excelente" };
      if (score >= 85) return { color: "text-blue-400", bg: "bg-blue-500/20", icon: "⭐", label: "Muy Bueno" };
      if (score >= 75) return { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: "👍", label: "Bueno" };
      return { color: "text-red-400", bg: "bg-red-500/20", icon: "📈", label: "Mejorable" };
    };

    const config = getProductivityConfig(score);
    
    return (
      <Badge className={cn("text-xs", config.color, config.bg)}>
        {config.icon} {score}% {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              ⏰ Registro de Horas
            </h1>
            <p className="text-gray-400">Control de tiempo y productividad del equipo • {currentTime.toLocaleTimeString()}</p>
          </div>

          <div className="flex items-center gap-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-sm px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              6 de agosto de 2025
            </Badge>
            
            <Button className="omega-button">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="omega-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400 font-medium">Empleados Activos</p>
                  <p className="text-3xl font-bold text-white mb-1">{getActiveEmployeesCount()}</p>
                  <p className="text-xs text-blue-300">de {employees.length} total</p>
                </div>
                <div className="relative">
                  <Activity className="w-12 h-12 text-blue-400 opacity-20 absolute" />
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={(getActiveEmployeesCount() / employees.length) * 100} className="h-2 bg-blue-900/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400 font-medium">Total Horas Hoy</p>
                  <p className="text-3xl font-bold text-white mb-1">{formatMinutes(getTotalHoursToday())}</p>
                  <p className="text-xs text-green-300">Actualizado: {currentTime.toLocaleTimeString()}</p>
                </div>
                <div className="relative">
                  <Clock className="w-12 h-12 text-green-400 opacity-20 absolute" />
                  <Timer className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={75} className="h-2 bg-green-900/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-400 font-medium">Progreso Semanal</p>
                  <p className="text-3xl font-bold text-white mb-1">{getWeeklyProgress()}%</p>
                  <p className="text-xs text-purple-300">Meta semanal</p>
                </div>
                <div className="relative">
                  <Target className="w-12 h-12 text-purple-400 opacity-20 absolute" />
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={getWeeklyProgress()} className="h-2 bg-purple-900/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-400 font-medium">Productividad</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-white">{getAverageProductivity()}%</p>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs text-yellow-300">Promedio del equipo</p>
                </div>
                <div className="relative">
                  <Zap className="w-12 h-12 text-yellow-400 opacity-20 absolute" />
                  <Flame className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={getAverageProductivity()} className="h-2 bg-yellow-900/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="omega-card">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    placeholder="🔍 Buscar empleados por nombre o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="omega-input pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 omega-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📊 Todos los estados</SelectItem>
                    <SelectItem value="working">💼 Trabajando</SelectItem>
                    <SelectItem value="break">☕ En Descanso</SelectItem>
                    <SelectItem value="offline">📴 Desconectado</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Más Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista de Tarjetas de Empleados */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="omega-card animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-3 bg-gray-700 rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="omega-card">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 mb-4">
                <AlertTriangle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Error al cargar empleados</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchEmployees} className="omega-button">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredEmployees.length === 0 ? (
          <Card className="omega-card">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No hay empleados</h3>
              <p className="text-gray-400">No se encontraron empleados que coincidan con los filtros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => {
              const currentSessionMinutes = employee.isWorking && employee.currentSessionStart
                ? calculateCurrentSessionDuration(employee.currentSessionStart)
                : 0;
              
              const totalTodayMinutes = employee.todayMinutes + currentSessionMinutes;
              const weeklyProgressPercentage = Math.round((employee.weekMinutes / (employee.weeklyTarget * 60)) * 100);

              return (
                <Card key={employee.id} className="omega-card hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                  {/* Indicador de estado en el borde superior */}
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    employee.status === "working" && "bg-gradient-to-r from-green-500 to-emerald-500",
                    employee.status === "break" && "bg-gradient-to-r from-yellow-500 to-orange-500",
                    employee.status === "offline" && "bg-gradient-to-r from-gray-500 to-slate-500"
                  )} />

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-purple-600">
                        <AvatarFallback className="text-lg bg-purple-900 text-purple-300">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {employee.status === "working" && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">{employee.name}</h3>
                        {employee.streak >= 5 && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                            🔥 {employee.streak} días
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-purple-400 mb-2">{employee.role}</p>
                      <StatusIndicator employee={employee} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tiempo actual de sesión */}
                  {employee.isWorking && (
                    <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">Sesión actual:</span>
                        <span className="font-bold text-green-300">
                          {formatMinutes(currentSessionMinutes)}
                        </span>
                      </div>
                      <Progress value={(currentSessionMinutes / 480) * 100} className="h-2 mt-2 bg-green-900/30" />
                    </div>
                  )}

                  {/* Estadísticas de tiempo */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Hoy</p>
                      <p className="font-bold text-white text-sm">{formatMinutes(totalTodayMinutes)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Semana</p>
                      <p className="font-bold text-white text-sm">{formatMinutes(employee.weekMinutes)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Mes</p>
                      <p className="font-bold text-white text-sm">{formatMinutes(employee.monthMinutes)}</p>
                    </div>
                  </div>

                  {/* Progreso semanal */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Progreso semanal</span>
                      <span className="text-purple-300 font-medium">{weeklyProgressPercentage}%</span>
                    </div>
                    <Progress value={weeklyProgressPercentage} className="h-2 bg-gray-800" />
                    <p className="text-xs text-gray-500">Meta: {employee.weeklyTarget}h/semana</p>
                  </div>

                  {/* Productividad y país */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                    <ProductivityBadge score={employee.productivity} />
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{employee.country}</p>
                    </div>
                  </div>

                  {/* Botón de control */}
                  <Button
                    onClick={() => toggleWorkStatus(employee.id)}
                    disabled={loadingActions.has(employee.id)}
                    className={cn(
                      "w-full transition-all duration-300",
                      employee.isWorking 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "omega-button",
                      loadingActions.has(employee.id) && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {loadingActions.has(employee.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : employee.isWorking ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Parar Trabajo
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Trabajo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {/* Top Performers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="omega-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...employees]
                  .sort((a, b) => b.productivity - a.productivity)
                  .slice(0, 3)
                  .map((employee, index) => (
                    <div key={employee.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Award className="w-5 h-5 text-yellow-400" />}
                        {index === 1 && <Star className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Target className="w-5 h-5 text-orange-400" />}
                        <span className="text-lg font-bold text-white">#{index + 1}</span>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-900 text-purple-300">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-white">{employee.name}</p>
                        <p className="text-sm text-purple-400">{employee.role}</p>
                      </div>
                      <ProductivityBadge score={employee.productivity} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Rachas Más Largas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...employees]
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 3)
                  .map((employee, index) => (
                    <div key={employee.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-900/30 to-red-900/30">
                      <Flame className="w-6 h-6 text-orange-400" />
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-900 text-purple-300">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-white">{employee.name}</p>
                        <p className="text-sm text-orange-400">{employee.streak} días consecutivos</p>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-300">
                        🔥 {employee.streak}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
