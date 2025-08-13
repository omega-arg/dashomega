"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarIcon,
  Plus,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Video,
  Coffee,
  Briefcase,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Bell,
  Star,
  Calendar as CalendarDays,
  Clock as ClockIcon,
  Target,
  Zap,
  TrendingUp,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, addDays, isToday, isPast, isFuture } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: "meeting" | "delivery" | "vacation" | "training" | "deadline" | "recruitment";
  location?: string;
  attendees: string[];
  createdBy: string;
  isAllDay: boolean;
  color: string;
  status: "scheduled" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
}

const EVENT_TYPES = {
  meeting: { 
    label: "Reunión", 
    icon: Users, 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-500",
    bgGradient: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
  },
  delivery: { 
    label: "Entrega", 
    icon: CheckCircle, 
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-500",
    bgGradient: "bg-gradient-to-r from-green-500/10 to-emerald-500/10"
  },
  vacation: { 
    label: "Vacaciones", 
    icon: Coffee, 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-500",
    bgGradient: "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
  },
  training: { 
    label: "Capacitación", 
    icon: Briefcase, 
    color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    gradientFrom: "from-orange-500",
    gradientTo: "to-yellow-500",
    bgGradient: "bg-gradient-to-r from-orange-500/10 to-yellow-500/10"
  },
  deadline: { 
    label: "Fecha Límite", 
    icon: AlertCircle, 
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    gradientFrom: "from-red-500",
    gradientTo: "to-pink-500",
    bgGradient: "bg-gradient-to-r from-red-500/10 to-pink-500/10"
  },
  recruitment: { 
    label: "Reclutamiento", 
    icon: UserPlus, 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-500",
    bgGradient: "bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
  }
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", color: "bg-red-500/20 text-red-300 border-red-500", icon: Zap },
  high: { label: "Alta", color: "bg-orange-500/20 text-orange-300 border-orange-500", icon: AlertCircle },
  medium: { label: "Media", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500", icon: Target },
  low: { label: "Baja", color: "bg-gray-500/20 text-gray-300 border-gray-500", icon: ClockIcon }
};

const SAMPLE_EVENTS: CalendarEvent[] = [];

export default function CalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const userRole = session?.user?.role;
  const canCreateEvents = userRole === "OWNER" || userRole === "ADMIN_GENERAL";

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
      
      return (
        (isSameDay(eventStart, date) || 
         isSameDay(eventEnd, date) ||
         (eventStart <= date && eventEnd >= date)) &&
        (filterType === "all" || event.type === filterType) &&
        (filterPriority === "all" || event.priority === filterPriority) &&
        (searchTerm === "" || event.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  };

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(selectedDate));
    const end = endOfWeek(endOfMonth(selectedDate));
    return eachDayOfInterval({ start, end });
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return "Todo el día";
    
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    
    if (end && !isSameDay(start, end)) {
      return `${format(start, "d MMM HH:mm", { locale: es })} - ${format(end, "d MMM HH:mm", { locale: es })}`;
    }
    
    return end ? 
      `${format(start, "HH:mm", { locale: es })} - ${format(end, "HH:mm", { locale: es })}` :
      format(start, "HH:mm", { locale: es });
  };

  const EventCard = ({ event, isCompact = false }: { event: CalendarEvent, isCompact?: boolean }) => {
    const eventType = EVENT_TYPES[event.type];
    const EventIcon = eventType.icon;
    const priorityConfig = PRIORITY_CONFIG[event.priority];
    const PriorityIcon = priorityConfig.icon;

    if (isCompact) {
      return (
        <div 
          className={cn(
            "p-2 rounded-lg border cursor-pointer hover:scale-[1.02] transition-all duration-200",
            eventType.bgGradient,
            eventType.color,
            "group relative overflow-hidden"
          )}
          onClick={() => setSelectedEvent(event)}
        >
          {/* Indicador de prioridad */}
          <div className={cn(
            "absolute top-0 left-0 w-full h-0.5",
            event.priority === "urgent" && "bg-red-500",
            event.priority === "high" && "bg-orange-500",
            event.priority === "medium" && "bg-yellow-500",
            event.priority === "low" && "bg-gray-500"
          )} />
          
          <div className="flex items-center gap-1 mb-1">
            <EventIcon className="w-3 h-3 shrink-0" />
            <span className="text-xs font-medium truncate">{event.title}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">{formatEventTime(event)}</span>
            {event.priority === "urgent" && (
              <PriorityIcon className="w-3 h-3 text-red-400" />
            )}
          </div>
        </div>
      );
    }

    return (
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-300 border-0 relative overflow-hidden",
          "hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20",
          eventType.bgGradient,
          "backdrop-blur-sm"
        )}
        onClick={() => setSelectedEvent(event)}
      >
        {/* Borde animado en hover */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Indicador de prioridad lateral */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          event.priority === "urgent" && "bg-gradient-to-b from-red-500 to-pink-500",
          event.priority === "high" && "bg-gradient-to-b from-orange-500 to-yellow-500",
          event.priority === "medium" && "bg-gradient-to-b from-yellow-500 to-orange-400",
          event.priority === "low" && "bg-gradient-to-b from-gray-500 to-slate-500"
        )} />

        <CardContent className="p-4 relative z-10">
          <div className="space-y-3">
            {/* Header con iconos */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={cn("p-2 rounded-lg", eventType.color)}>
                  <EventIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={eventType.color} variant="outline">
                      {eventType.label}
                    </Badge>
                    {event.priority !== "low" && (
                      <Badge className={priorityConfig.color} variant="outline">
                        <PriorityIcon className="w-3 h-3 mr-1" />
                        {priorityConfig.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Estado */}
              <div className="shrink-0 ml-2">
                {event.status === "completed" && (
                  <div className="p-1 rounded-full bg-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                )}
                {event.status === "cancelled" && (
                  <div className="p-1 rounded-full bg-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                )}
                {event.status === "scheduled" && isPast(new Date(event.startDate)) && (
                  <div className="p-1 rounded-full bg-yellow-500/20">
                    <Clock className="w-4 h-4 text-yellow-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            {event.description && (
              <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}

            {/* Información adicional */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatEventTime(event)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300">{event.attendees.length} participantes</span>
                </div>
                
                {event.priority === "urgent" && (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <Zap className="w-3 h-3" />
                    <span>Urgente</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CalendarDay = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    const today = isToday(date);
    const isCurrentMonth = isSameMonth(date, selectedDate);
    const pastDay = isPast(date) && !today;

    return (
      <div 
        className={cn(
          "min-h-32 p-3 border transition-all duration-200 cursor-pointer group relative",
          "hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-pink-900/20",
          !isCurrentMonth && "text-gray-500 bg-slate-900/30 opacity-60",
          today && "bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400/50 shadow-lg shadow-purple-500/20",
          pastDay && "bg-slate-900/20",
          isCurrentMonth && !today && "border-purple-800/20 bg-slate-800/10",
          "hover:border-purple-500/30 hover:shadow-md hover:shadow-purple-500/10"
        )}
        onClick={() => setSelectedDate(date)}
      >
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-semibold transition-colors",
              today ? "text-purple-200 text-base" : "text-white",
              !isCurrentMonth && "text-gray-500",
              pastDay && "text-gray-400"
            )}>
              {format(date, "d")}
            </span>
            
            <div className="flex items-center gap-1">
              {today && (
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              )}
              {dayEvents.length > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-1.5 py-0.5 border transition-colors",
                    today ? "bg-purple-500/30 text-purple-200 border-purple-400" : "bg-purple-900/50 text-purple-300 border-purple-600/50"
                  )}
                >
                  {dayEvents.length}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-transparent">
            {dayEvents.slice(0, 2).map(event => (
              <EventCard key={event.id} event={event} isCompact />
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-purple-400 cursor-pointer hover:text-purple-300 transition-colors p-1 rounded bg-purple-900/30">
                +{dayEvents.length - 2} eventos más
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startDate) >= now && event.status === "scheduled")
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  };

  const getEventStats = () => {
    const now = new Date();
    const total = events.length;
    const completed = events.filter(e => e.status === "completed").length;
    const upcoming = events.filter(e => new Date(e.startDate) >= now && e.status === "scheduled").length;
    const urgent = events.filter(e => e.priority === "urgent" && e.status === "scheduled").length;
    
    return { total, completed, upcoming, urgent };
  };

  const stats = getEventStats();
  const upcomingEvents = getUpcomingEvents();
  const todayEvents = getEventsForDate(selectedDate);

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
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">
                    Calendario Omega
                  </h1>
                  <p className="text-gray-300 text-lg">Gestión inteligente de eventos y reuniones</p>
                </div>

                {/* Botón Nuevo Evento prominente */}
                <div className="flex items-center gap-4">
                  <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl shadow-purple-500/30 text-lg px-6 py-3 h-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">Crear Nuevo Evento</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div>
                          <Label htmlFor="title" className="text-white">Título</Label>
                          <Input id="title" className="bg-slate-800/50 border-purple-600/30 text-white" placeholder="Nombre del evento" />
                        </div>
                        
                        <div>
                          <Label htmlFor="description" className="text-white">Descripción</Label>
                          <Textarea id="description" className="bg-slate-800/50 border-purple-600/30 text-white" placeholder="Descripción del evento..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type" className="text-white">Tipo</Label>
                            <Select>
                              <SelectTrigger className="bg-slate-800/50 border-purple-600/30 text-white">
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-purple-600/30">
                                {Object.entries(EVENT_TYPES).map(([key, type]) => (
                                  <SelectItem key={key} value={key}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority" className="text-white">Prioridad</Label>
                            <Select>
                              <SelectTrigger className="bg-slate-800/50 border-purple-600/30 text-white">
                                <SelectValue placeholder="Seleccionar prioridad" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-purple-600/30">
                                {Object.entries(PRIORITY_CONFIG).map(([key, priority]) => (
                                  <SelectItem key={key} value={key}>{priority.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="location" className="text-white">Ubicación</Label>
                          <Input id="location" className="bg-slate-800/50 border-purple-600/30 text-white" placeholder="Ubicación o enlace" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate" className="text-white">Fecha de Inicio</Label>
                            <Input id="startDate" type="datetime-local" className="bg-slate-800/50 border-purple-600/30 text-white" />
                          </div>
                          <div>
                            <Label htmlFor="endDate" className="text-white">Fecha de Fin</Label>
                            <Input id="endDate" type="datetime-local" className="bg-slate-800/50 border-purple-600/30 text-white" />
                          </div>
                        </div>

                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full">
                          Crear Evento
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Stats rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-purple-300">Total</span>
                    </div>
                    <div className="text-xl font-bold text-white">{stats.total}</div>
                  </div>
                  
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-300">Completados</span>
                    </div>
                    <div className="text-xl font-bold text-white">{stats.completed}</div>
                  </div>
                  
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-blue-300">Próximos</span>
                    </div>
                    <div className="text-xl font-bold text-white">{stats.upcoming}</div>
                  </div>
                  
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-300">Urgentes</span>
                    </div>
                    <div className="text-xl font-bold text-white">{stats.urgent}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles y Filtros */}
        <Card className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-purple-600/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-purple-600/30 text-white focus:border-purple-500">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-600/30">
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {Object.entries(EVENT_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-purple-600/30 text-white focus:border-purple-500">
                    <Target className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-600/30">
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    {Object.entries(PRIORITY_CONFIG).map(([key, priority]) => (
                      <SelectItem key={key} value={key}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentView} onValueChange={(value: 'month' | 'week' | 'day') => setCurrentView(value)}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-purple-600/30 text-white focus:border-purple-500">
                    <Eye className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-600/30">
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="day">Día</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar izquierdo */}
          <div className="xl:col-span-1 space-y-6">
            {/* Mini calendario de navegación */}
            <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    {format(selectedDate, "MMMM yyyy", { locale: es })}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 w-8 h-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 text-xs px-2"
                    >
                      Hoy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 w-8 h-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="text-white"
                />
              </CardContent>
            </Card>

            {/* Próximos eventos */}
            <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-gradient-to-r from-slate-800/50 to-purple-800/30 border border-purple-600/20 cursor-pointer hover:border-purple-500/40 transition-all"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("p-1 rounded", EVENT_TYPES[event.type].color)}>
                          {(() => {
                            const EventIcon = EVENT_TYPES[event.type].icon;
                            return <EventIcon className="w-3 h-3" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">{event.title}</h4>
                          <p className="text-gray-400 text-xs">
                            {format(new Date(event.startDate), "d MMM, HH:mm", { locale: es })}
                          </p>
                          {event.priority === "urgent" && (
                            <div className="flex items-center gap-1 mt-1">
                              <Zap className="w-3 h-3 text-red-400" />
                              <span className="text-xs text-red-400">Urgente</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No hay eventos próximos</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendario principal */}
          <div className="xl:col-span-3">
            <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">
                    {currentView === 'month' && `${format(selectedDate, "MMMM yyyy", { locale: es })}`}
                    {currentView === 'week' && `Semana del ${format(startOfWeek(selectedDate), "d MMM", { locale: es })}`}
                    {currentView === 'day' && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                  </CardTitle>
                  
                  {/* Leyenda de tipos de eventos */}
                  <div className="hidden lg:flex items-center gap-4">
                    {Object.entries(EVENT_TYPES).map(([key, type]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded", type.color)}></div>
                        <span className="text-xs text-gray-400">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {currentView === 'month' && (
                  <div className="grid grid-cols-7 gap-0 border border-purple-800/30 rounded-xl overflow-hidden shadow-lg">
                    {/* Header de días */}
                    {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                      <div key={day} className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 text-center text-sm font-semibold text-purple-200 border-r border-b border-purple-800/30 last:border-r-0">
                        {day}
                      </div>
                    ))}
                    
                    {/* Días del calendario */}
                    {getCalendarDays().map(day => (
                      <CalendarDay key={day.toISOString()} date={day} />
                    ))}
                  </div>
                )}

                {currentView === 'day' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </h2>
                      <p className="text-gray-400">
                        {todayEvents.length} {todayEvents.length === 1 ? 'evento programado' : 'eventos programados'}
                      </p>
                    </div>
                    
                    {todayEvents.length > 0 ? (
                      <div className="space-y-4">
                        {todayEvents.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="mb-6">
                          <CalendarIcon className="w-24 h-24 mx-auto text-purple-400/30" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Sin eventos programados</h3>
                        <p className="text-gray-400 mb-6">No hay eventos para este día.</p>
                        <Button 
                          onClick={() => setIsNewEventOpen(true)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Evento
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de detalle de evento */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-3 text-xl">
                  {(() => {
                    const EventIcon = EVENT_TYPES[selectedEvent.type].icon;
                    return (
                      <div className={cn("p-2 rounded-lg", EVENT_TYPES[selectedEvent.type].color)}>
                        <EventIcon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Badges de estado y tipo */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={EVENT_TYPES[selectedEvent.type].color} variant="outline">
                    {EVENT_TYPES[selectedEvent.type].label}
                  </Badge>
                  <Badge className={PRIORITY_CONFIG[selectedEvent.priority].color} variant="outline">
                    {(() => {
                      const PriorityIcon = PRIORITY_CONFIG[selectedEvent.priority].icon;
                      return <PriorityIcon className="w-3 h-3 mr-1" />;
                    })()}
                    {PRIORITY_CONFIG[selectedEvent.priority].label}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    selectedEvent.status === "completed" ? "text-green-400 border-green-400" :
                    selectedEvent.status === "cancelled" ? "text-red-400 border-red-400" :
                    "text-yellow-400 border-yellow-400"
                  )}>
                    {selectedEvent.status === "completed" ? "Completado" :
                     selectedEvent.status === "cancelled" ? "Cancelado" :
                     "Programado"}
                  </Badge>
                </div>

                {/* Descripción */}
                {selectedEvent.description && (
                  <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/30 rounded-lg p-4 border border-purple-600/20">
                    <h3 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Descripción
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Información detallada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/30 rounded-lg p-4 border border-purple-600/20">
                    <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Fecha y Hora
                    </h3>
                    <div className="space-y-2">
                      <p className="text-white">
                        <span className="text-gray-400">Inicio:</span> {format(new Date(selectedEvent.startDate), "PPpp", { locale: es })}
                      </p>
                      {selectedEvent.endDate && (
                        <p className="text-white">
                          <span className="text-gray-400">Fin:</span> {format(new Date(selectedEvent.endDate), "PPpp", { locale: es })}
                        </p>
                      )}
                      {selectedEvent.isAllDay && (
                        <Badge variant="outline" className="text-xs text-purple-400 border-purple-400">
                          Todo el día
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/30 rounded-lg p-4 border border-purple-600/20">
                      <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Ubicación
                      </h3>
                      <p className="text-white">{selectedEvent.location}</p>
                    </div>
                  )}
                </div>

                {/* Participantes */}
                <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/30 rounded-lg p-4 border border-purple-600/20">
                  <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participantes ({selectedEvent.attendees.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <Badge key={index} variant="outline" className="text-purple-300 border-purple-600/50 bg-purple-900/30">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t border-purple-800/30">
                  <Button variant="outline" className="flex-1 border-purple-600 text-purple-300 hover:bg-purple-900/30">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
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
