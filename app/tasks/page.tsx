"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Calendar, 
  CalendarDays, 
  Plus, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Paperclip,
  Flag,
  Zap,
  Timer,
  Circle,
  PlayCircle,
  PauseCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  dueDate: string;
  createdAt: string;
  tags: string[];
  attachments?: number;
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  comments?: number;
  isBlocked?: boolean;
  blockedReason?: string;
}

// Lista de empleados disponibles para asignar tareas
const AVAILABLE_EMPLOYEES = [
  { id: "1", name: "Carlos García", role: "Encargado de Cuentas" },
  { id: "2", name: "María López", role: "AT Cliente" },
  { id: "3", name: "Ana Martínez", role: "Encargado de Finanzas" },
  { id: "4", name: "Pedro Rodríguez", role: "Encargado de Entregas" },
  { id: "5", name: "Luis Fernández", role: "Desarrollador" },
  { id: "6", name: "Sofía Castro", role: "Marketing" },
  { id: "7", name: "Diego Ramírez", role: "Soporte" },
  { id: "8", name: "Carmen Herrera", role: "Diseñador" },
  { id: "9", name: "Roberto Silva", role: "Reclutador" },
  { id: "10", name: "Patricia Morales", role: "Gestor de Contenido" }
];

const SAMPLE_TASKS: Task[] = [
  {
    id: "1",
    title: "🔄 Actualizar base de datos de cuentas",
    description: "Revisar y actualizar todas las cuentas disponibles para entrega del sistema principal",
    status: "pending",
    priority: "high",
    assignee: {
      id: "1",
      name: "Carlos García",
      role: "Encargado de Cuentas",
      avatar: "/avatars/carlos.jpg"
    },
    dueDate: "2025-08-10",
    createdAt: "2025-08-06",
    tags: ["cuentas", "base-datos", "urgente"],
    attachments: 2,
    progress: 0,
    estimatedHours: 8,
    actualHours: 0,
    comments: 3
  },
  {
    id: "2",
    title: "📋 Procesar pedidos pendientes",
    description: "Revisar y procesar todos los pedidos pendientes del día anterior para evitar retrasos",
    status: "in_progress",
    priority: "urgent",
    assignee: {
      id: "2",
      name: "María López",
      role: "AT Cliente",
      avatar: "/avatars/maria.jpg"
    },
    dueDate: "2025-08-07",
    createdAt: "2025-08-05",
    tags: ["pedidos", "urgente", "cliente"],
    attachments: 1,
    progress: 65,
    estimatedHours: 6,
    actualHours: 4,
    comments: 8
  },
  {
    id: "3",
    title: "📊 Generar reporte financiero mensual",
    description: "Crear el reporte financiero completo del mes anterior con análisis de ingresos y gastos",
    status: "review",
    priority: "medium",
    assignee: {
      id: "3",
      name: "Ana Martínez",
      role: "Encargado de Finanzas",
      avatar: "/avatars/ana.jpg"
    },
    dueDate: "2025-08-08",
    createdAt: "2025-08-01",
    tags: ["finanzas", "reporte", "mensual"],
    attachments: 3,
    progress: 90,
    estimatedHours: 12,
    actualHours: 10,
    comments: 5
  },
  {
    id: "4",
    title: "🚚 Coordinar entregas de la semana",
    description: "Organizar y coordinar todas las entregas programadas para esta semana",
    status: "done",
    priority: "high",
    assignee: {
      id: "4",
      name: "Pedro Rodríguez",
      role: "Encargado de Entregas",
      avatar: "/avatars/pedro.jpg"
    },
    dueDate: "2025-08-06",
    createdAt: "2025-08-02",
    tags: ["entregas", "logística", "semanal"],
    attachments: 0,
    progress: 100,
    estimatedHours: 8,
    actualHours: 7,
    comments: 12
  },
  {
    id: "5",
    title: "💻 Actualizar sistema de gestión",
    description: "Implementar las nuevas funcionalidades solicitadas en el sistema de gestión interno",
    status: "pending",
    priority: "low",
    assignee: {
      id: "5",
      name: "Luis Fernández",
      role: "Desarrollador",
      avatar: "/avatars/luis.jpg"
    },
    dueDate: "2025-08-15",
    createdAt: "2025-08-04",
    tags: ["desarrollo", "sistema", "mejoras"],
    attachments: 5,
    progress: 0,
    estimatedHours: 20,
    actualHours: 0,
    comments: 2
  }
];

const STATUS_CONFIG = {
  pending: { 
    label: "Pendiente", 
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    icon: "⏳"
  },
  in_progress: { 
    label: "En Progreso", 
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: "⚡"
  },
  review: { 
    label: "En Revisión", 
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    icon: "👀"
  },
  done: { 
    label: "Completada", 
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: "✅"
  }
};

const PRIORITY_CONFIG = {
  low: { 
    label: "Baja", 
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    icon: "🟢"
  },
  medium: { 
    label: "Media", 
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: "🟡"
  },
  high: { 
    label: "Alta", 
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    icon: "🟠"
  },
  urgent: { 
    label: "Urgente", 
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: "🔴"
  }
};

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Estados para el formulario de nueva tarea
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
    assignedTo: ""
  });

  // Cargar tareas desde la API
  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        toast.error("Error al cargar las tareas");
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error("Error de conexión al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Estados para el formulario de edición
  const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
    status: ""
  });

  const resetForm = () => {
    setNewTaskForm({
      title: "",
      description: "",
      priority: "",
      dueDate: "",
      assignedTo: ""
    });
  };

  const handleCreateTask = async () => {
    if (!newTaskForm.title || !newTaskForm.assignedTo) {
      toast.error("Por favor completa al menos el título y asigna la tarea a un empleado");
      return;
    }

    try {
      const taskData = {
        title: newTaskForm.title,
        description: newTaskForm.description || "",
        priority: newTaskForm.priority || "medium",
        assignedToId: newTaskForm.assignedTo,
        dueDate: newTaskForm.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: 4
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        toast.success("Tarea creada exitosamente");
        setIsNewTaskOpen(false);
        resetForm();
        // Recargar tareas
        await loadTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al crear tarea");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Error de conexión al crear tarea");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignee.id,
      status: task.status
    });
    setIsEditMode(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask || !editTaskForm.title || !editTaskForm.assignedTo) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const assignedEmployee = AVAILABLE_EMPLOYEES.find(emp => emp.id === editTaskForm.assignedTo);
    if (!assignedEmployee) return;

    const updatedTask: Task = {
      ...selectedTask,
      title: editTaskForm.title,
      description: editTaskForm.description,
      priority: editTaskForm.priority as Task["priority"],
      status: editTaskForm.status as Task["status"],
      dueDate: editTaskForm.dueDate,
      assignee: {
        id: assignedEmployee.id,
        name: assignedEmployee.name,
        role: assignedEmployee.role,
        avatar: `/avatars/${assignedEmployee.name.toLowerCase().replace(' ', '')}.jpg`
      }
    };

    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id ? updatedTask : task
    ));
    
    setSelectedTask(updatedTask);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditTaskForm({
      title: "",
      description: "",
      priority: "",
      dueDate: "",
      assignedTo: "",
      status: ""
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTask(null);
      setIsEditMode(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const groupedTasks = {
    pending: filteredTasks.filter(task => task.status === "pending"),
    in_progress: filteredTasks.filter(task => task.status === "in_progress"),
    review: filteredTasks.filter(task => task.status === "review"),
    done: filteredTasks.filter(task => task.status === "done")
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case "urgent": return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "high": return <Flag className="w-5 h-5 text-orange-400" />;
      case "medium": return <Circle className="w-5 h-5 text-blue-400" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Componente TaskCard
  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      className="omega-card hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={() => setSelectedTask(task)}
    >
      {/* Indicador de prioridad en el borde */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        task.priority === "urgent" && "from-red-500 to-pink-500",
        task.priority === "high" && "from-orange-500 to-yellow-500",
        task.priority === "medium" && "from-blue-500 to-cyan-500",
        task.priority === "low" && "from-gray-500 to-slate-500"
      )} />

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1 pr-2">
              {task.title}
            </h3>
            <div className="flex items-center gap-2">
              {task.status === "done" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task.id);
                  }}
                  className="p-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Eliminar tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {getPriorityIcon(task.priority)}
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-400 text-xs line-clamp-2">
            {task.description}
          </p>

          {/* Progreso */}
          {task.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-400">Progreso</span>
                <span className="text-xs font-bold text-white">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2 bg-gray-800" />
            </div>
          )}

          {/* Asignado */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-purple-900 text-purple-300">
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-400 truncate">
              {task.assignee.name}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              {task.attachments && task.attachments > 0 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  <Paperclip className="w-3 h-3 mr-1" />
                  {task.attachments}
                </Badge>
              )}
              {task.comments && task.comments > 0 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {task.comments}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Componente StatusColumn
  const StatusColumn = ({ status, tasks: columnTasks }: { status: string, tasks: Task[] }) => (
    <div className="flex-1 min-w-[300px]">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("w-3 h-3 rounded-full", STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].bgColor)} />
          <h3 className="font-semibold text-white">
            {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {columnTasks.length}
          </Badge>
        </div>
        <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {columnTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay tareas</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              ✅ Gestión de Tareas
            </h1>
            <p className="text-gray-400">Organiza y supervisa el progreso del equipo</p>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
              <DialogTrigger asChild>
                <Button className="omega-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="omega-card bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-400 font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-white">{groupedTasks.pending.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400 font-medium">En Progreso</p>
                  <p className="text-3xl font-bold text-white">{groupedTasks.in_progress.length}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-400 font-medium">En Revisión</p>
                  <p className="text-3xl font-bold text-white">{groupedTasks.review.length}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="omega-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400 font-medium">Completadas</p>
                  <p className="text-3xl font-bold text-white">{groupedTasks.done.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
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
                    placeholder="🔍 Buscar tareas por título, descripción o asignado..."
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
                    <SelectItem value="all">📋 Todos los estados</SelectItem>
                    <SelectItem value="pending">⏳ Pendientes</SelectItem>
                    <SelectItem value="in_progress">⚡ En Progreso</SelectItem>
                    <SelectItem value="review">👀 En Revisión</SelectItem>
                    <SelectItem value="done">✅ Completadas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-48 omega-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🎯 Todas las prioridades</SelectItem>
                    <SelectItem value="urgent">🔴 Urgente</SelectItem>
                    <SelectItem value="high">🟠 Alta</SelectItem>
                    <SelectItem value="medium">🟡 Media</SelectItem>
                    <SelectItem value="low">🟢 Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nueva Tarea Modal */}
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogContent className="bg-purple-950/95 border-purple-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">📝 Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Título de la tarea</Label>
                <Input 
                  id="title"
                  className="omega-input" 
                  placeholder="Título de la tarea..."
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Descripción</Label>
                <Textarea 
                  id="description"
                  className="omega-input min-h-[100px]" 
                  placeholder="Describe los detalles de la tarea..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="assignedTo" className="text-white">Asignar a</Label>
                <Select 
                  value={newTaskForm.assignedTo} 
                  onValueChange={(value) => setNewTaskForm(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger className="omega-input">
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_EMPLOYEES.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-white">Prioridad</Label>
                  <Select 
                    value={newTaskForm.priority} 
                    onValueChange={(value) => setNewTaskForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="omega-input">
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baja</SelectItem>
                      <SelectItem value="medium">🟡 Media</SelectItem>
                      <SelectItem value="high">🟠 Alta</SelectItem>
                      <SelectItem value="urgent">🔴 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-white">Fecha límite</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    className="omega-input"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => {
                    setIsNewTaskOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="omega-button flex-1"
                  onClick={handleCreateTask}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Tarea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          <StatusColumn status="pending" tasks={groupedTasks.pending} />
          <StatusColumn status="in_progress" tasks={groupedTasks.in_progress} />
          <StatusColumn status="review" tasks={groupedTasks.review} />
          <StatusColumn status="done" tasks={groupedTasks.done} />
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => {setSelectedTask(null); setIsEditMode(false);}}>
            <DialogContent className="bg-purple-950/95 border-purple-800 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-3">
                  {getPriorityIcon(selectedTask.priority)}
                  <span className="flex-1">{selectedTask.title}</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => handleEditTask(selectedTask)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {selectedTask.status === "done" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={() => handleDeleteTask(selectedTask.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {isEditMode ? (
                  /* Formulario de Edición */
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title" className="text-white">Título de la tarea</Label>
                      <Input 
                        id="edit-title"
                        className="omega-input" 
                        placeholder="Título de la tarea..."
                        value={editTaskForm.title}
                        onChange={(e) => setEditTaskForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description" className="text-white">Descripción</Label>
                      <Textarea 
                        id="edit-description"
                        className="omega-input min-h-[100px]" 
                        placeholder="Describe los detalles de la tarea..."
                        value={editTaskForm.description}
                        onChange={(e) => setEditTaskForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-assignedTo" className="text-white">Asignar a</Label>
                      <Select 
                        value={editTaskForm.assignedTo} 
                        onValueChange={(value) => setEditTaskForm(prev => ({ ...prev, assignedTo: value }))}
                      >
                        <SelectTrigger className="omega-input">
                          <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_EMPLOYEES.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-status" className="text-white">Estado</Label>
                        <Select 
                          value={editTaskForm.status} 
                          onValueChange={(value) => setEditTaskForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="omega-input">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">⏳ Pendiente</SelectItem>
                            <SelectItem value="in_progress">⚡ En Progreso</SelectItem>
                            <SelectItem value="review">👀 En Revisión</SelectItem>
                            <SelectItem value="done">✅ Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-priority" className="text-white">Prioridad</Label>
                        <Select 
                          value={editTaskForm.priority} 
                          onValueChange={(value) => setEditTaskForm(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="omega-input">
                            <SelectValue placeholder="Seleccionar prioridad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Baja</SelectItem>
                            <SelectItem value="medium">🟡 Media</SelectItem>
                            <SelectItem value="high">🟠 Alta</SelectItem>
                            <SelectItem value="urgent">🔴 Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-dueDate" className="text-white">Fecha límite</Label>
                        <Input 
                          id="edit-dueDate" 
                          type="date" 
                          className="omega-input"
                          value={editTaskForm.dueDate}
                          onChange={(e) => setEditTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="omega-button flex-1"
                        onClick={handleUpdateTask}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Vista de Detalles */
                  <>
                    {/* Estado y prioridad */}
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge className={cn("text-sm px-3 py-1", STATUS_CONFIG[selectedTask.status].color)}>
                        <span className="ml-2">{STATUS_CONFIG[selectedTask.status].label}</span>
                      </Badge>
                      <Badge variant="outline" className={cn("text-sm px-3 py-1", PRIORITY_CONFIG[selectedTask.priority].color)}>
                        <span className="mr-2">{PRIORITY_CONFIG[selectedTask.priority].icon}</span>
                        {PRIORITY_CONFIG[selectedTask.priority].label}
                      </Badge>
                      {selectedTask.isBlocked && (
                        <Badge className="text-sm px-3 py-1 bg-orange-500/20 text-orange-300 border-orange-500/30">
                          <PauseCircle className="w-4 h-4 mr-2" />
                          Bloqueada
                        </Badge>
                      )}
                    </div>

                    {/* Progreso */}
                    {selectedTask.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-purple-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Progreso del Proyecto
                          </Label>
                          <span className="text-2xl font-bold text-white">{selectedTask.progress}%</span>
                        </div>
                        <Progress value={selectedTask.progress} className="h-3 bg-gray-800" />
                      </div>
                    )}

                    {/* Descripción */}
                    <div>
                      <Label className="text-purple-400 flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4" />
                        Descripción
                      </Label>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 leading-relaxed">
                          {selectedTask.description}
                        </p>
                      </div>
                    </div>

                    {/* Información de tiempo */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-purple-400 flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4" />
                          Tiempo Estimado
                        </Label>
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <p className="text-2xl font-bold text-blue-400">{selectedTask.estimatedHours}h</p>
                          <p className="text-blue-300 text-sm">Estimación inicial</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-purple-400 flex items-center gap-2 mb-3">
                          <Timer className="w-4 h-4" />
                          Tiempo Real
                        </Label>
                        <div className="bg-green-900/30 p-4 rounded-lg border border-green-700/50">
                          <p className="text-2xl font-bold text-green-400">{selectedTask.actualHours}h</p>
                          <p className="text-green-300 text-sm">Tiempo registrado</p>
                        </div>
                      </div>
                    </div>

                    {/* Fechas importantes */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-purple-400 flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4" />
                          Fecha de Creación
                        </Label>
                        <p className="text-white bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                          {new Date(selectedTask.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-purple-400 flex items-center gap-2 mb-3">
                          <CalendarDays className="w-4 h-4" />
                          Fecha Límite
                        </Label>
                        <p className="text-white bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                          {new Date(selectedTask.dueDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    {/* Información del asignado */}
                    <div>
                      <Label className="text-purple-400 flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4" />
                        Asignado a
                      </Label>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-purple-600">
                          <AvatarFallback className="bg-purple-900 text-purple-300">
                            {selectedTask.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{selectedTask.assignee.name}</p>
                          <p className="text-purple-400 text-sm">{selectedTask.assignee.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Etiquetas */}
                    <div>
                      <Label className="text-purple-400 flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4" />
                        Etiquetas
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-900/50 text-purple-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
