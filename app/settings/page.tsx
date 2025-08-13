
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Users,
  Edit,
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Plus,
  UserCheck,
  UserX,
  Crown,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/auth";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  country?: string;
  timezone?: string;
  phone?: string;
  bio?: string;
  joinedAt: string;
  lastActive: string;
  isActive: boolean;
  permissions: string[];
}

interface EmployeeProfile extends UserProfile {
  salary?: number;
  commissionRate?: number;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

const SAMPLE_USER: UserProfile = {
  id: "current_user",
  name: "Usuario Actual",
  email: "usuario@omegastore.com",
  role: "CUSTOMER_SERVICE",
  country: "México",
  timezone: "America/Mexico_City",
  phone: "+52 555 123 4567",
  bio: "Encargado de atención al cliente con 2 años de experiencia en Omega Store",
  joinedAt: "2023-03-15T10:00:00Z",
  lastActive: "2025-08-06T11:30:00Z",
  isActive: true,
  permissions: ["read_orders", "create_orders", "update_orders"]
};

const SAMPLE_EMPLOYEES: EmployeeProfile[] = [
  {
    id: "1",
    name: "Owner Principal",
    email: "owner@omegastore.com",
    role: "OWNER",
    country: "México",
    timezone: "America/Mexico_City",
    joinedAt: "2022-01-01T00:00:00Z",
    lastActive: "2025-08-06T11:45:00Z",
    isActive: true,
    permissions: ["all"]
  },
  {
    id: "2",
    name: "María López",
    email: "maria@omegastore.com",
    role: "CUSTOMER_SERVICE",
    country: "Colombia",
    timezone: "America/Bogota",
    phone: "+57 300 123 4567",
    joinedAt: "2023-02-15T10:00:00Z",
    lastActive: "2025-08-06T11:20:00Z",
    isActive: true,
    permissions: ["read_orders", "create_orders", "update_orders"],
    salary: 450,
    commissionRate: 8
  },
  {
    id: "3",
    name: "Carlos García",
    email: "carlos@omegastore.com",
    role: "DELIVERY_MANAGER",
    country: "Perú",
    timezone: "America/Lima",
    phone: "+51 987 654 321",
    joinedAt: "2023-01-10T10:00:00Z",
    lastActive: "2025-08-06T10:30:00Z",
    isActive: true,
    permissions: ["read_orders", "update_orders", "deliver_orders"],
    salary: 320,
    commissionRate: 6
  },
  {
    id: "4",
    name: "Luis Fernández",
    email: "luis@omegastore.com",
    role: "CHEATER_LEVELS",
    country: "Argentina",
    timezone: "America/Buenos_Aires",
    phone: "+54 911 123 4567",
    joinedAt: "2023-04-20T10:00:00Z",
    lastActive: "2025-08-06T09:15:00Z",
    isActive: true,
    permissions: ["read_cheater_orders", "update_cheater_orders"],
    salary: 380,
    commissionRate: 12
  }
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile>(SAMPLE_USER);
  const [employees, setEmployees] = useState<EmployeeProfile[]>(SAMPLE_EMPLOYEES);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);

  const userRole = session?.user?.role;
  const isOwnerOrAdmin = ["OWNER", "GENERAL_ADMIN"].includes(userRole || "");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'OWNER': 'bg-red-500/20 text-red-300 border-red-500/30',
      'GENERAL_ADMIN': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'CUSTOMER_SERVICE': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'DELIVERY_MANAGER': 'bg-green-500/20 text-green-300 border-green-500/30',
      'TECHNICAL_SUPPORT': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'CHEATER_LEVELS': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'CHEATER_ACCOUNTS': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'FINANCE_MANAGER': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };
    return roleColors[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const toggleEmployeeStatus = (employeeId: string) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, isActive: !emp.isActive }
          : emp
      )
    );
  };

  const saveProfile = () => {
    // Here you would save the profile to the backend
    setIsEditing(false);
  };

  const EmployeeCard = ({ employee }: { employee: EmployeeProfile }) => (
    <Card 
      className="omega-card cursor-pointer hover:scale-102 transition-all duration-200"
      onClick={() => setSelectedEmployee(employee)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={cn(
                  "text-sm font-medium",
                  employee.role === "OWNER" ? "bg-red-900 text-red-300" : "bg-purple-900 text-purple-300"
                )}>
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-purple-950",
                employee.isActive ? "bg-green-500" : "bg-gray-500"
              )}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate">{employee.name}</h3>
                {employee.role === "OWNER" && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
              <p className="text-sm text-gray-400 truncate">{employee.email}</p>
            </div>
          </div>
          
          <Badge className={getRoleColor(employee.role)} variant="outline">
            {ROLE_LABELS[employee.role as keyof typeof ROLE_LABELS] || employee.role}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">País:</span>
            <span className="text-white">{employee.country || "No especificado"}</span>
          </div>
          
          {employee.salary && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Salario:</span>
              <span className="text-green-400 font-medium">${employee.salary}</span>
            </div>
          )}
          
          {employee.commissionRate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Comisión:</span>
              <span className="text-purple-400 font-medium">{employee.commissionRate}%</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Estado:</span>
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                employee.isActive ? "bg-green-500" : "bg-gray-500"
              )}></div>
              <span className={cn(
                "text-sm",
                employee.isActive ? "text-green-400" : "text-gray-400"
              )}>
                {employee.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {isOwnerOrAdmin && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-purple-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEmployee(employee);
              }}
              className="text-purple-400 hover:text-purple-300"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleEmployeeStatus(employee.id);
              }}
              className={cn(
                "text-sm",
                employee.isActive 
                  ? "text-red-400 hover:text-red-300" 
                  : "text-green-400 hover:text-green-300"
              )}
            >
              {employee.isActive ? (
                <>
                  <UserX className="w-3 h-3 mr-1" />
                  Suspender
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 mr-1" />
                  Activar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-primary">Configuración</h1>
          <p className="text-gray-400 mt-1">Gestión de perfil, empleados y configuraciones del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-purple-900/30 border border-purple-800">
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
            Mi Perfil
          </TabsTrigger>
          {isOwnerOrAdmin && (
            <TabsTrigger value="employees" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              Empleados
            </TabsTrigger>
          )}
          <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
            Preferencias
          </TabsTrigger>
          {isOwnerOrAdmin && (
            <TabsTrigger value="system" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              Sistema
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="omega-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
                <Button
                  onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
                  className="omega-button"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-purple-900 text-purple-300 text-2xl">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                      variant="secondary"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                    <Badge className={getRoleColor(userProfile.role)}>
                      {ROLE_LABELS[userProfile.role as keyof typeof ROLE_LABELS] || userProfile.role}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{userProfile.email}</p>
                  <p className="text-sm text-purple-400 mt-1">
                    Miembro desde {formatDate(userProfile.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="omega-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="omega-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Teléfono</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone || ""}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="omega-input"
                      placeholder="+52 555 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="country" className="text-white">País</Label>
                    <Select
                      value={userProfile.country || ""}
                      onValueChange={(value) => setUserProfile(prev => ({ ...prev, country: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="omega-input">
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mexico">México</SelectItem>
                        <SelectItem value="colombia">Colombia</SelectItem>
                        <SelectItem value="peru">Perú</SelectItem>
                        <SelectItem value="argentina">Argentina</SelectItem>
                        <SelectItem value="chile">Chile</SelectItem>
                        <SelectItem value="venezuela">Venezuela</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone" className="text-white">Zona Horaria</Label>
                    <Select
                      value={userProfile.timezone || ""}
                      onValueChange={(value) => setUserProfile(prev => ({ ...prev, timezone: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="omega-input">
                        <SelectValue placeholder="Seleccionar zona horaria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                        <SelectItem value="America/Bogota">Colombia (GMT-5)</SelectItem>
                        <SelectItem value="America/Lima">Perú (GMT-5)</SelectItem>
                        <SelectItem value="America/Buenos_Aires">Argentina (GMT-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        disabled={!isEditing}
                        className="omega-input pr-10"
                        placeholder="Dejar en blanco para mantener actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-purple-400 hover:text-purple-300"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!isEditing}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">Biografía</Label>
                <Textarea
                  id="bio"
                  value={userProfile.bio || ""}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  className="omega-input"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        {isOwnerOrAdmin && (
          <TabsContent value="employees" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Gestión de Empleados</h2>
                <p className="text-gray-400">Administra los miembros del equipo</p>
              </div>

              <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button className="omega-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Empleado
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-purple-950/95 border-purple-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Agregar Nuevo Empleado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newName" className="text-white">Nombre Completo</Label>
                        <Input id="newName" className="omega-input" placeholder="Nombre del empleado" />
                      </div>
                      <div>
                        <Label htmlFor="newEmail" className="text-white">Email</Label>
                        <Input id="newEmail" type="email" className="omega-input" placeholder="email@omegastore.com" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newRole" className="text-white">Rol</Label>
                        <Select>
                          <SelectTrigger className="omega-input">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER_SERVICE">Atención al Cliente</SelectItem>
                            <SelectItem value="DELIVERY_MANAGER">Encargado de Entregas</SelectItem>
                            <SelectItem value="TECHNICAL_SUPPORT">Soporte Técnico</SelectItem>
                            <SelectItem value="CHEATER_LEVELS">Chetador Niveles</SelectItem>
                            <SelectItem value="CHEATER_ACCOUNTS">Chetador Cuentas</SelectItem>
                            <SelectItem value="FINANCE_MANAGER">Encargado de Finanzas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newCountry" className="text-white">País</Label>
                        <Select>
                          <SelectTrigger className="omega-input">
                            <SelectValue placeholder="Seleccionar país" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mexico">México</SelectItem>
                            <SelectItem value="Colombia">Colombia</SelectItem>
                            <SelectItem value="Peru">Perú</SelectItem>
                            <SelectItem value="Argentina">Argentina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newSalary" className="text-white">Salario Base</Label>
                        <Input id="newSalary" type="number" className="omega-input" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="newCommission" className="text-white">Tasa de Comisión (%)</Label>
                        <Input id="newCommission" type="number" className="omega-input" placeholder="0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPhone" className="text-white">Teléfono</Label>
                      <Input id="newPhone" className="omega-input" placeholder="+52 555 123 4567" />
                    </div>

                    <Button className="omega-button w-full">Crear Empleado</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          </TabsContent>
        )}

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="omega-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Notificaciones Push</h3>
                  <p className="text-gray-400 text-sm">Recibir notificaciones en tiempo real</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Notificaciones por Email</h3>
                  <p className="text-gray-400 text-sm">Resúmenes diarios por correo</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Sonido de Mensajes</h3>
                  <p className="text-gray-400 text-sm">Sonido al recibir mensajes en el chat</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white">Tema</Label>
                <Select defaultValue="dark">
                  <SelectTrigger className="omega-input mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Oscuro (Recomendado)</SelectItem>
                    <SelectItem value="light" disabled>Claro (Próximamente)</SelectItem>
                    <SelectItem value="auto" disabled>Automático (Próximamente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Color de Acento</Label>
                <div className="grid grid-cols-6 gap-3 mt-2">
                  {[
                    { name: "Morado", value: "purple", class: "bg-purple-600" },
                    { name: "Azul", value: "blue", class: "bg-blue-600" },
                    { name: "Verde", value: "green", class: "bg-green-600" },
                    { name: "Rojo", value: "red", class: "bg-red-600" },
                    { name: "Naranja", value: "orange", class: "bg-orange-600" },
                    { name: "Rosa", value: "pink", class: "bg-pink-600" }
                  ].map((color) => (
                    <button
                      key={color.value}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 transition-all",
                        color.class,
                        color.value === "purple" 
                          ? "border-purple-400 ring-2 ring-purple-400 ring-offset-2 ring-offset-purple-950" 
                          : "border-transparent hover:border-white"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        {isOwnerOrAdmin && (
          <TabsContent value="system" className="space-y-6">
            <Card className="omega-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Modo de Mantenimiento</h3>
                    <p className="text-gray-400 text-sm">Activar para realizar actualizaciones del sistema</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Registro de Actividad</h3>
                    <p className="text-gray-400 text-sm">Guardar logs detallados de todas las acciones</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Autenticación de Dos Factores</h3>
                    <p className="text-gray-400 text-sm">Requerir 2FA para todos los usuarios</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="omega-card border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zona de Peligro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Exportar Datos</h3>
                    <p className="text-gray-400 text-sm">Descargar todos los datos del sistema</p>
                  </div>
                  <Button variant="outline" className="text-yellow-400 border-yellow-600 hover:bg-yellow-900/20">
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Resetear Configuración</h3>
                    <p className="text-gray-400 text-sm">Restaurar todas las configuraciones por defecto</p>
                  </div>
                  <Button variant="outline" className="text-orange-400 border-orange-600 hover:bg-orange-900/20">
                    Resetear
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Eliminar Todos los Datos</h3>
                    <p className="text-gray-400 text-sm">⚠️ Esta acción no se puede deshacer</p>
                  </div>
                  <Button variant="outline" className="text-red-400 border-red-600 hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="bg-purple-950/95 border-purple-800 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedEmployee.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className={cn(
                    "text-lg font-medium",
                    selectedEmployee.role === "OWNER" ? "bg-red-900 text-red-300" : "bg-purple-900 text-purple-300"
                  )}>
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-white">{selectedEmployee.name}</h2>
                    {selectedEmployee.role === "OWNER" && <Crown className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <p className="text-gray-400">{selectedEmployee.email}</p>
                  <Badge className={getRoleColor(selectedEmployee.role)}>
                    {ROLE_LABELS[selectedEmployee.role as keyof typeof ROLE_LABELS] || selectedEmployee.role}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                    selectedEmployee.isActive 
                      ? "bg-green-500/20 text-green-300" 
                      : "bg-gray-500/20 text-gray-300"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedEmployee.isActive ? "bg-green-500" : "bg-gray-500"
                    )}></div>
                    {selectedEmployee.isActive ? "Activo" : "Inactivo"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-purple-400 font-medium mb-3">Información Personal</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">País:</span>
                      <span className="text-white">{selectedEmployee.country || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zona horaria:</span>
                      <span className="text-white">{selectedEmployee.timezone || "No especificada"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="text-white">{selectedEmployee.phone || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Se unió:</span>
                      <span className="text-white">{formatDate(selectedEmployee.joinedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Última actividad:</span>
                      <span className="text-white">{formatDate(selectedEmployee.lastActive)}</span>
                    </div>
                  </div>
                </div>

                {(selectedEmployee.salary || selectedEmployee.commissionRate) && (
                  <div>
                    <h3 className="text-purple-400 font-medium mb-3">Información Financiera</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEmployee.salary && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Salario base:</span>
                          <span className="text-green-400 font-medium">${selectedEmployee.salary}</span>
                        </div>
                      )}
                      {selectedEmployee.commissionRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Comisión:</span>
                          <span className="text-purple-400 font-medium">{selectedEmployee.commissionRate}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-purple-400 font-medium mb-3">Permisos</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-purple-300 border-purple-600">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              {isOwnerOrAdmin && selectedEmployee.role !== "OWNER" && (
                <div className="flex gap-3 pt-4 border-t border-purple-800">
                  <Button variant="outline" className="flex-1 omega-button-secondary">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleEmployeeStatus(selectedEmployee.id)}
                    className={cn(
                      "flex-1",
                      selectedEmployee.isActive 
                        ? "text-red-400 border-red-600 hover:bg-red-900/20" 
                        : "text-green-400 border-green-600 hover:bg-green-900/20"
                    )}
                  >
                    {selectedEmployee.isActive ? (
                      <>
                        <UserX className="w-4 h-4 mr-2" />
                        Suspender
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Reactivar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
