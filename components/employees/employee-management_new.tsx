"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Clock,
  MapPin,
  Mail,
  Calendar,
  Activity,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Award,
  Target,
  Zap,
  Crown,
  Globe,
  PhoneCall,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/auth";
import { Role } from "@prisma/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  country?: string | null;
  isActive: boolean;
  isWorking: boolean;
  totalHoursToday: number;
  joinedAt: string;
  lastActiveAt: string;
  image?: string | null;
  performance?: number;
  tasksCompleted?: number;
  rating?: number;
}

interface EmployeeManagementProps {
  userRole: Role;
}

const ROLE_CONFIG = {
  OWNER: { 
    label: "Propietario", 
    icon: Crown, 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    gradientFrom: "from-yellow-500",
    gradientTo: "to-orange-500",
    bgGradient: "bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
  },
  ADMIN_GENERAL: { 
    label: "Admin General", 
    icon: Shield, 
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    gradientFrom: "from-red-500",
    gradientTo: "to-pink-500",
    bgGradient: "bg-gradient-to-r from-red-500/10 to-pink-500/10"
  },
  ENCARGADO_ENTREGAS: { 
    label: "Encargado Entregas", 
    icon: Target, 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-500",
    bgGradient: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
  },
  AT_CLIENTE: { 
    label: "Atención Cliente", 
    icon: PhoneCall, 
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-500",
    bgGradient: "bg-gradient-to-r from-green-500/10 to-emerald-500/10"
  },
  SOPORTE: { 
    label: "Soporte", 
    icon: Settings, 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    gradientFrom: "from-purple-500",
    gradientTo: "to-indigo-500",
    bgGradient: "bg-gradient-to-r from-purple-500/10 to-indigo-500/10"
  },
  RECLUTADOR: { 
    label: "Reclutador", 
    icon: UserPlus, 
    color: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    gradientFrom: "from-teal-500",
    gradientTo: "to-cyan-500",
    bgGradient: "bg-gradient-to-r from-teal-500/10 to-cyan-500/10"
  },
  MARKETING: { 
    label: "Marketing", 
    icon: TrendingUp, 
    color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    gradientFrom: "from-rose-500",
    gradientTo: "to-pink-500",
    bgGradient: "bg-gradient-to-r from-rose-500/10 to-pink-500/10"
  },
  CHETADORES: { 
    label: "Chetadores", 
    icon: Zap, 
    color: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    gradientFrom: "from-lime-500",
    gradientTo: "to-green-500",
    bgGradient: "bg-gradient-to-r from-lime-500/10 to-green-500/10"
  }
};

export default function EmployeeManagement({ userRole }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const { toast } = useToast();

  // Datos de ejemplo más ricos
  const sampleEmployees: Employee[] = [
    {
      id: "1",
      name: "María González",
      email: "maria.gonzalez@omegastore.com",
      role: "ADMIN_GENERAL",
      country: "México",
      isActive: true,
      isWorking: true,
      totalHoursToday: 6.5,
      joinedAt: "2025-01-15T10:00:00Z",
      lastActiveAt: "2025-08-07T14:30:00Z",
      image: null,
      performance: 95,
      tasksCompleted: 127,
      rating: 4.8
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@omegastore.com",
      role: "ENCARGADO_ENTREGAS",
      country: "Colombia",
      isActive: true,
      isWorking: false,
      totalHoursToday: 8.2,
      joinedAt: "2025-02-01T09:00:00Z",
      lastActiveAt: "2025-08-07T16:00:00Z",
      image: null,
      performance: 88,
      tasksCompleted: 89,
      rating: 4.6
    },
    {
      id: "3",
      name: "Ana Silva",
      email: "ana.silva@omegastore.com",
      role: "AT_CLIENTE",
      country: "Perú",
      isActive: true,
      isWorking: true,
      totalHoursToday: 5.1,
      joinedAt: "2025-03-10T11:00:00Z",
      lastActiveAt: "2025-08-07T15:45:00Z",
      image: null,
      performance: 92,
      tasksCompleted: 156,
      rating: 4.9
    },
    {
      id: "4",
      name: "Luis Martínez",
      email: "luis.martinez@omegastore.com",
      role: "CHETADORES",
      country: "México",
      isActive: true,
      isWorking: true,
      totalHoursToday: 7.8,
      joinedAt: "2025-01-25T08:00:00Z",
      lastActiveAt: "2025-08-07T15:20:00Z",
      image: null,
      performance: 97,
      tasksCompleted: 203,
      rating: 5.0
    },
    {
      id: "5",
      name: "Sofia López",
      email: "sofia.lopez@omegastore.com",
      role: "MARKETING",
      country: "Argentina",
      isActive: false,
      isWorking: false,
      totalHoursToday: 0,
      joinedAt: "2025-04-05T10:00:00Z",
      lastActiveAt: "2025-08-06T18:00:00Z",
      image: null,
      performance: 76,
      tasksCompleted: 45,
      rating: 4.2
    },
    {
      id: "6",
      name: "Diego Torres",
      email: "diego.torres@omegastore.com",
      role: "RECLUTADOR",
      country: "Chile",
      isActive: true,
      isWorking: false,
      totalHoursToday: 4.3,
      joinedAt: "2025-05-12T09:30:00Z",
      lastActiveAt: "2025-08-07T13:15:00Z",
      image: null,
      performance: 85,
      tasksCompleted: 72,
      rating: 4.4
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setEmployees(sampleEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedRole, selectedStatus]);

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((employee) => employee.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus === "active") {
      filtered = filtered.filter((employee) => employee.isActive);
    } else if (selectedStatus === "inactive") {
      filtered = filtered.filter((employee) => !employee.isActive);
    } else if (selectedStatus === "working") {
      filtered = filtered.filter((employee) => employee.isWorking);
    }

    setFilteredEmployees(filtered);
  };

  const getRoleConfig = (role: Role) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || {
      label: ROLE_LABELS[role] || role,
      icon: Users,
      color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      gradientFrom: "from-gray-500",
      gradientTo: "to-slate-500",
      bgGradient: "bg-gradient-to-r from-gray-500/10 to-slate-500/10"
    };
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return "text-green-400";
    if (performance >= 85) return "text-blue-400";
    if (performance >= 75) return "text-yellow-400";
    return "text-red-400";
  };

  const uniqueRoles = Array.from(new Set(employees.map(emp => emp.role)));
  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const workingNow = employees.filter(emp => emp.isWorking).length;
  const avgPerformance = employees.reduce((acc, emp) => acc + (emp.performance || 0), 0) / employees.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Mejorado */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-3xl blur-xl" />
          <Card className="relative bg-gradient-to-r from-purple-950/50 to-pink-950/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    Gestión de Empleados
                  </h1>
                  <p className="text-gray-300 text-lg">Administra el equipo de Omega Store ({employees.length} empleados total)</p>
                </div>

                {/* Botón Nuevo Empleado */}
                <div className="flex items-center gap-4">
                  <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl shadow-purple-500/30 text-lg px-6 py-3 h-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Empleado
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">Agregar Nuevo Empleado</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-white">Nombre Completo</Label>
                            <Input id="name" className="bg-slate-800/50 border-purple-600/30 text-white" placeholder="Nombre del empleado" />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input id="email" type="email" className="bg-slate-800/50 border-purple-600/30 text-white" placeholder="email@omegastore.com" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="role" className="text-white">Rol</Label>
                            <Select>
                              <SelectTrigger className="bg-slate-800/50 border-purple-600/30 text-white">
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-purple-600/30">
                                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="country" className="text-white">País</Label>
                            <Select>
                              <SelectTrigger className="bg-slate-800/50 border-purple-600/30 text-white">
                                <SelectValue placeholder="Seleccionar país" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-purple-600/30">
                                <SelectItem value="mexico">México</SelectItem>
                                <SelectItem value="colombia">Colombia</SelectItem>
                                <SelectItem value="peru">Perú</SelectItem>
                                <SelectItem value="argentina">Argentina</SelectItem>
                                <SelectItem value="chile">Chile</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-white">Notas Adicionales</Label>
                          <Textarea id="notes" className="bg-slate-800/50 border-purple-600/30 text-white" placeholder="Información adicional sobre el empleado..." />
                        </div>

                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Crear Empleado
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/20 backdrop-blur-sm hover:border-green-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium mb-1">Empleados Activos</p>
                    <p className="text-3xl font-bold text-white">{activeEmployees}</p>
                    <p className="text-green-300 text-xs">de {employees.length} totales</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium mb-1">Trabajando Ahora</p>
                    <p className="text-3xl font-bold text-white">{workingNow}</p>
                    <p className="text-blue-300 text-xs">en tiempo real</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium mb-1">Roles Únicos</p>
                    <p className="text-3xl font-bold text-white">{uniqueRoles.length}</p>
                    <p className="text-purple-300 text-xs">departamentos</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Filter className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium mb-1">Rendimiento Promedio</p>
                    <p className="text-3xl font-bold text-white">{avgPerformance.toFixed(1)}%</p>
                    <p className="text-yellow-300 text-xs">del equipo</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Controles y Filtros */}
        <Card className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar empleados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-purple-600/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-3">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48 bg-slate-800/50 border-purple-600/30 text-white focus:border-purple-500">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-600/30">
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleConfig(role).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-purple-600/30 text-white focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-600/30">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                    <SelectItem value="working">Trabajando</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-slate-800/50 border border-purple-600/30 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    Lista
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Cards */}
        <motion.div
          className={cn(
            "gap-6",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {filteredEmployees.map((employee, index) => {
            const roleConfig = getRoleConfig(employee.role);
            const RoleIcon = roleConfig.icon;
            
            return (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={cn(
                  "group cursor-pointer transition-all duration-300 border-0 relative overflow-hidden backdrop-blur-sm",
                  "hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20",
                  roleConfig.bgGradient,
                  employee.isWorking && "ring-2 ring-green-500/50"
                )}>
                  {/* Borde animado en hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Indicador de estado lateral */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    employee.isWorking && "bg-gradient-to-b from-green-500 to-emerald-500",
                    employee.isActive && !employee.isWorking && "bg-gradient-to-b from-blue-500 to-cyan-500",
                    !employee.isActive && "bg-gradient-to-b from-gray-500 to-slate-500"
                  )} />

                  <CardContent className="p-6 relative z-10" onClick={() => setSelectedEmployee(employee)}>
                    <div className="space-y-4">
                      {/* Header del empleado */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 ring-2 ring-white/20">
                              <AvatarImage src={employee.image || ""} />
                              <AvatarFallback className={cn("text-white font-bold", roleConfig.bgGradient)}>
                                {employee.name?.slice(0, 2).toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            {employee.isWorking && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse">
                                <div className="w-full h-full bg-green-400 rounded-full animate-ping" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate">
                              {employee.name || "Sin nombre"}
                            </h3>
                            <p className="text-gray-300 text-sm truncate">{employee.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={cn("p-1 rounded", roleConfig.color)}>
                                <RoleIcon className="w-3 h-3" />
                              </div>
                              <Badge className={roleConfig.color} variant="outline">
                                {roleConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Estado y acciones */}
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={employee.isActive ? "default" : "secondary"} className="text-xs">
                            {employee.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span>{employee.country || "No especificado"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>{employee.totalHoursToday.toFixed(1)}h hoy</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Target className="w-4 h-4 text-green-400" />
                            <span>{employee.tasksCompleted || 0} tareas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">{employee.rating?.toFixed(1) || "N/A"} rating</span>
                          </div>
                        </div>
                      </div>

                      {/* Rendimiento */}
                      {employee.performance && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Rendimiento</span>
                            <span className={cn("text-sm font-bold", getPerformanceColor(employee.performance))}>
                              {employee.performance}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                employee.performance >= 95 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                                employee.performance >= 85 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                                employee.performance >= 75 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                                "bg-gradient-to-r from-red-500 to-pink-500"
                              )}
                              style={{ width: `${employee.performance}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Estado actual */}
                      {employee.isWorking && (
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <p className="text-green-300 text-sm font-medium">
                              Trabajando actualmente
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredEmployees.length === 0 && (
          <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <Users className="w-24 h-24 mx-auto text-purple-400/30" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No se encontraron empleados</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                  ? "Intenta ajustar los filtros de búsqueda" 
                  : "No hay empleados registrados en el sistema"}
              </p>
              {userRole === "OWNER" && (
                <Button 
                  onClick={() => setIsNewEmployeeOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Empleado
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de detalle de empleado */}
        {selectedEmployee && (
          <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedEmployee.image || ""} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {selectedEmployee.name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  {selectedEmployee.name || "Empleado"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-purple-400 font-medium mb-2">Información Personal</h3>
                    <div className="space-y-2">
                      <p className="text-white"><span className="text-gray-400">Email:</span> {selectedEmployee.email}</p>
                      <p className="text-white"><span className="text-gray-400">País:</span> {selectedEmployee.country || "No especificado"}</p>
                      <p className="text-white">
                        <span className="text-gray-400">Fecha de ingreso:</span> {" "}
                        {new Date(selectedEmployee.joinedAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-purple-400 font-medium mb-2">Estadísticas</h3>
                    <div className="space-y-2">
                      <p className="text-white"><span className="text-gray-400">Horas hoy:</span> {selectedEmployee.totalHoursToday.toFixed(1)}h</p>
                      <p className="text-white"><span className="text-gray-400">Tareas completadas:</span> {selectedEmployee.tasksCompleted || 0}</p>
                      <p className="text-white"><span className="text-gray-400">Rating:</span> {selectedEmployee.rating?.toFixed(1) || "N/A"} ⭐</p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t border-purple-800/30">
                  <Button variant="outline" className="flex-1 border-purple-600 text-purple-300 hover:bg-purple-900/30">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" className="flex-1 border-blue-600 text-blue-300 hover:bg-blue-900/30">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mensaje
                  </Button>
                  <Button variant="outline" className="flex-1 text-red-400 border-red-600/50 hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
