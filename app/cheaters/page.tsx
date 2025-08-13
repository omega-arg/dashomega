"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2,
  Plus,
  Search,
  Clock,
  Play,
  CheckCircle,
  Trophy,
  User,
  Calendar,
  Target,
  Zap,
  DollarSign,
  Copy,
  Eye,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CheatOrder {
  id: string;
  product: string;
  platform: "PC" | "PlayStation" | "Xbox" | "Mobile";
  platformVariant?: "legacy" | "enhanced" | "ps4" | "ps5" | "one" | "series";
  account: {
    username?: string;
    password: string;
    email?: string;
    currentBalance?: string;
    currentLevel?: number;
    // Específico para PlayStation
    codes?: string[]; // Array de 10 códigos para PlayStation
  };
  targetAmount?: string;
  targetLevel?: number;
  cost: number;
  earnings: number;
  status: "not_started" | "in_progress" | "completed" | "delivered";
  assignedTo?: string;
  assignedCheater?: {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
  };
  createdAt: string;
  completedAt?: string;
  estimatedTime: string;
  priority: "low" | "medium" | "high" | "urgent";
  clientNotes?: string;
  progress?: number;
  gtaStyle?: "FC" | "C+C"; // Para Millones GTA Online
}

// Datos de configuración de estados
const STATUS_CONFIG = {
  not_started: { 
    label: "Sin Empezar", 
    color: "from-amber-500 to-orange-500", 
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/50",
    icon: Clock,
    count: 0,
    amount: 0
  },
  in_progress: { 
    label: "En Proceso", 
    color: "from-blue-500 to-cyan-500", 
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    icon: Play,
    count: 0,
    amount: 0
  },
  completed: { 
    label: "Completados", 
    color: "from-green-500 to-emerald-500", 
    badge: "bg-green-500/20 text-green-300 border-green-500/50",
    icon: CheckCircle,
    count: 0,
    amount: 0
  },
  delivered: { 
    label: "Entregados", 
    color: "from-purple-500 to-violet-500", 
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    icon: Trophy,
    count: 0,
    amount: 0
  }
};

const PRIORITY_CONFIG = {
  low: { label: "Baja", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  medium: { label: "Media", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  high: { label: "Alta", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  urgent: { label: "Urgente", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" }
};

const PLATFORM_CONFIG = {
  PC: { color: "bg-blue-500/20 text-blue-300 border-blue-500/50", icon: "🖥️" },
  PlayStation: { color: "bg-blue-700/20 text-blue-300 border-blue-700/50", icon: "🎮" },
  Xbox: { color: "bg-green-600/20 text-green-300 border-green-600/50", icon: "🎮" },
  Mobile: { color: "bg-purple-500/20 text-purple-300 border-purple-500/50", icon: "📱" }
};

export default function CheatersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<CheatOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CheatOrder | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  
  // Form states
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedPlatformVariant, setSelectedPlatformVariant] = useState<string>("");
  const [selectedGtaStyle, setSelectedGtaStyle] = useState<string>("");
  const [formData, setFormData] = useState({
    targetAmount: "",
    earnings: "",
    priority: "medium",
    estimatedTime: "",
    clientNotes: "",
    username: "",
    password: "",
    email: "",
    codes: Array(10).fill("")
  });

  const userRole = session?.user?.role;
  const isCheater = userRole?.startsWith("CHEATER_");
  const canManageOrders = ["OWNER", "ADMIN"].includes(userRole || "");

  // Simulate initial loading - replace with real API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.account.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesPlatform = filterPlatform === "all" || order.platform === filterPlatform;
    
    // Si es chetador, solo ver sus órdenes asignadas
    if (isCheater) {
      const isAssigned = order.assignedTo === session?.user?.id;
      return matchesSearch && matchesPlatform && isAssigned;
    }
    
    return matchesSearch && matchesPlatform;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const updateOrderStatus = (orderId: string, newStatus: CheatOrder['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: newStatus
          };
          
          if (newStatus === "completed") {
            updatedOrder.completedAt = new Date().toISOString();
            updatedOrder.progress = 100;
          }
          
          return updatedOrder;
        }
        return order;
      })
    );
    setSelectedOrder(null);
  };

  const getOrdersByStatus = (status: CheatOrder['status']) => {
    return filteredOrders.filter(order => order.status === status);
  };

  const getTotalByStatus = (status: CheatOrder['status']) => {
    return getOrdersByStatus(status).reduce((sum, order) => sum + order.earnings, 0);
  };

  const copyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de que se copió
    }
  };

  const resetForm = () => {
    setSelectedProduct("");
    setSelectedPlatform("");
    setSelectedPlatformVariant("");
    setSelectedGtaStyle("");
    setFormData({
      targetAmount: "",
      earnings: "",
      priority: "medium",
      estimatedTime: "",
      clientNotes: "",
      username: "",
      password: "",
      email: "",
      codes: Array(10).fill("")
    });
  };

  const createNewOrder = () => {
    // Validar campos requeridos
    if (!selectedProduct || !selectedPlatform || !formData.earnings) {
      alert('Por favor, completa todos los campos requeridos (Producto, Plataforma, Precio Chetador)');
      return;
    }

    // Obtener datos de la cuenta según la plataforma
    const getAccountData = () => {
      const baseAccount = {
        password: formData.password,
      };

      if (selectedPlatform === "PlayStation") {
        return {
          ...baseAccount,
          email: formData.email,
          codes: formData.codes.filter(code => code.trim() !== "")
        };
      } else if (selectedPlatform === "Xbox") {
        return {
          ...baseAccount,
          email: formData.email,
        };
      } else {
        // PC/Mobile
        return {
          ...baseAccount,
          username: formData.username,
          email: formData.email,
        };
      }
    };

    // Crear nueva orden
    const newOrder: CheatOrder = {
      id: `CHT-${String(orders.length + 1).padStart(3, '0')}`,
      product: selectedProduct === "gta_money" ? "Millones GTA Online" : 
               selectedProduct === "cod_levels" ? "Boost Niveles COD" :
               selectedProduct === "fortnite_levels" ? "Niveles Fortnite" :
               selectedProduct === "valorant_accounts" ? "Cuentas Valorant" : selectedProduct,
      platform: selectedPlatform as "PC" | "PlayStation" | "Xbox" | "Mobile",
      platformVariant: selectedPlatformVariant as any,
      account: getAccountData(),
      targetAmount: formData.targetAmount || undefined,
      cost: 0, // Valor por defecto, no visible para chetadores
      earnings: parseFloat(formData.earnings),
      status: "not_started",
      createdAt: new Date().toISOString(),
      estimatedTime: formData.estimatedTime || "2-4 horas",
      priority: formData.priority as "low" | "medium" | "high" | "urgent",
      clientNotes: formData.clientNotes || undefined,
      progress: 0,
      gtaStyle: selectedProduct === "gta_money" ? (selectedGtaStyle as "FC" | "C+C") : undefined
    };

    // Agregar la orden a la lista
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // Cerrar modal y resetear formulario
    setIsNewOrderOpen(false);
    resetForm();

    // Mostrar mensaje de éxito
    alert(`Orden ${newOrder.id} creada exitosamente!`);
  };

  const handleModalChange = (open: boolean) => {
    setIsNewOrderOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const OrderCard = ({ order }: { order: CheatOrder }) => {
    const statusConfig = STATUS_CONFIG[order.status];
    const priorityConfig = PRIORITY_CONFIG[order.priority];
    const platformConfig = PLATFORM_CONFIG[order.platform];

    const getPriorityBorder = () => {
      switch (order.priority) {
        case "urgent": return "border-l-red-500";
        case "high": return "border-l-orange-500";
        case "medium": return "border-l-blue-500";
        case "low": return "border-l-green-500";
        default: return "border-l-gray-500";
      }
    };

    return (
      <Card 
        className={cn(
          "group relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 border-l-4",
          getPriorityBorder()
        )}
        onClick={() => setSelectedOrder(order)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
                  {order.id}
                </h3>
                <p className="text-xs text-gray-400">{order.product}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={cn("text-xs", platformConfig.color)} variant="outline">
                {platformConfig.icon} {order.platform}
                {order.platformVariant && (
                  <span className="ml-1 text-xs opacity-75">
                    ({order.platformVariant.toUpperCase()})
                  </span>
                )}
              </Badge>
              <Badge className={cn("text-xs", priorityConfig.color, priorityConfig.bg)} variant="outline">
                {priorityConfig.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* GTA Style Badge - Solo para Millones GTA */}
            {order.product === "Millones GTA Online" && order.gtaStyle && (
              <div className="flex items-center justify-center">
                <Badge className={cn(
                  "text-xs font-medium",
                  order.gtaStyle === "FC" 
                    ? "bg-green-500/20 text-green-300 border-green-500/50" 
                    : "bg-blue-500/20 text-blue-300 border-blue-500/50"
                )} variant="outline">
                  {order.gtaStyle === "FC" ? "🚀 FC (Full Cash)" : "🎯 C+C (Cash and Cars)"}
                </Badge>
              </div>
            )}

            {/* Cantidad del Pedido */}
            {order.targetAmount && (
              <div className="flex items-center justify-center p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold">📦</span>
                  <span className="text-yellow-300 font-semibold text-sm">
                    Cantidad: {order.targetAmount}
                  </span>
                </div>
              </div>
            )}

            {/* Earnings */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Ganancia:</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {formatCurrency(order.earnings)}
              </span>
            </div>

            {/* Assigned Cheater */}
            {order.assignedCheater && (
              <div className="flex items-center space-x-2 p-2 bg-slate-800/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">
                    {order.assignedCheater.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{order.assignedCheater.name}</p>
                  <p className="text-xs text-purple-400 truncate">{order.assignedCheater.specialty}</p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {order.progress !== undefined && order.status === "in_progress" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Progreso</span>
                  <span className="text-xs text-purple-300 font-bold">{order.progress}%</span>
                </div>
                <Progress value={order.progress} className="h-2 bg-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                    style={{ width: `${order.progress}%` }}
                  />
                </Progress>
              </div>
            )}

            {/* Estimated Time & Date */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{order.estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(order.createdAt), "dd/MM HH:mm")}</span>
              </div>
            </div>

            {/* Client Notes Indicator */}
            {order.clientNotes && (
              <div className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">Instrucciones especiales</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatusColumn = ({ status, title }: { status: keyof typeof STATUS_CONFIG, title: string }) => {
    const config = STATUS_CONFIG[status];
    const ordersInStatus = getOrdersByStatus(status);
    const totalAmount = getTotalByStatus(status);
    const StatusIcon = config.icon;

    return (
      <div className="flex-1 min-w-80">
        {/* Column Header */}
        <div className={cn(
          "mb-4 p-4 rounded-lg bg-gradient-to-r",
          config.color,
          "shadow-lg"
        )}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-5 h-5" />
              <h3 className="font-semibold">{title}</h3>
              <Badge className="bg-white/20 text-white border-white/30">
                {ordersInStatus.length}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3 min-h-96">
          {ordersInStatus.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          
          {ordersInStatus.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <StatusIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay órdenes en este estado</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Panel de Chetadores
            </h1>
            <p className="text-gray-400">Gestión de pedidos y servicios de gaming</p>
          </div>

          {canManageOrders && (
            <Dialog open={isNewOrderOpen} onOpenChange={handleModalChange}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center space-x-2">
                    <Gamepad2 className="w-5 h-5" />
                    <span>Crear Nueva Orden</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product" className="text-white">Producto</Label>
                      <Select onValueChange={(value) => {
                        setSelectedProduct(value);
                        if (value !== "gta_money") {
                          setSelectedGtaStyle("");
                        }
                      }}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="gta_money" className="text-white hover:bg-slate-700">Millones GTA Online</SelectItem>
                          <SelectItem value="cod_levels" className="text-white hover:bg-slate-700">Boost Niveles COD</SelectItem>
                          <SelectItem value="fortnite_levels" className="text-white hover:bg-slate-700">Niveles Fortnite</SelectItem>
                          <SelectItem value="valorant_account" className="text-white hover:bg-slate-700">Cuentas Valorant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="platform" className="text-white">Plataforma</Label>
                      <Select onValueChange={(value) => {
                        setSelectedPlatform(value);
                        setSelectedPlatformVariant(""); // Reset variant when platform changes
                      }}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                          <SelectValue placeholder="Seleccionar plataforma" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="PC" className="text-white hover:bg-slate-700">🖥️ PC</SelectItem>
                          <SelectItem value="PlayStation" className="text-white hover:bg-slate-700">🎮 PlayStation</SelectItem>
                          <SelectItem value="Xbox" className="text-white hover:bg-slate-700">🎮 Xbox</SelectItem>
                          <SelectItem value="Mobile" className="text-white hover:bg-slate-700">📱 Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Variante de Plataforma - Condicional según la plataforma seleccionada */}
                    {selectedPlatform && selectedPlatform !== "Mobile" && (
                      <div>
                        <Label htmlFor="platformVariant" className="text-white">
                          {selectedPlatform === "PC" ? "Versión de PC" : 
                           selectedPlatform === "PlayStation" ? "Consola PlayStation" : 
                           selectedPlatform === "Xbox" ? "Consola Xbox" : "Variante"}
                        </Label>
                        <Select onValueChange={setSelectedPlatformVariant}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                            <SelectValue placeholder={`Seleccionar ${selectedPlatform === "PC" ? "versión" : "consola"}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {selectedPlatform === "PC" && (
                              <>
                                <SelectItem value="legacy" className="text-white hover:bg-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-blue-400">Legacy</span>
                                    <span className="text-xs text-gray-400">Versión clásica</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="enhanced" className="text-white hover:bg-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-green-400">Enhanced</span>
                                    <span className="text-xs text-gray-400">Versión mejorada</span>
                                  </div>
                                </SelectItem>
                              </>
                            )}
                            {selectedPlatform === "PlayStation" && (
                              <>
                                <SelectItem value="ps4" className="text-white hover:bg-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-blue-400">PlayStation 4</span>
                                    <span className="text-xs text-gray-400">PS4</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="ps5" className="text-white hover:bg-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-green-400">PlayStation 5</span>
                                    <span className="text-xs text-gray-400">PS5</span>
                                  </div>
                                </SelectItem>
                              </>
                            )}
                            {selectedPlatform === "Xbox" && (
                              <>
                                <SelectItem value="one" className="text-white hover:bg-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-blue-400">Xbox One</span>
                                    <span className="text-xs text-gray-400">Generación anterior</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="series" className="text-white hover:bg-slate-700">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-green-400">Xbox Series X/S</span>
                                    <span className="text-xs text-gray-400">Nueva generación</span>
                                  </div>
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Estilo GTA - Solo visible cuando se selecciona Millones GTA Online */}
                  {selectedProduct === "gta_money" && (
                    <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Estilo de Millones GTA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <Label htmlFor="gtaStyle" className="text-white mb-2 block">Tipo de Servicio</Label>
                          <Select onValueChange={setSelectedGtaStyle}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-green-500">
                              <SelectValue placeholder="Seleccionar estilo de millones" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="FC" className="text-white hover:bg-slate-700">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-green-400">FC (Full Cash)</span>
                                  <span className="text-xs text-gray-400">Método rápido y eficiente</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="C+C" className="text-white hover:bg-slate-700">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-blue-400">C+C (Cash and Cars)</span>
                                  <span className="text-xs text-gray-400">Método tradicional y seguro</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedGtaStyle && (
                          <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                            {selectedGtaStyle === "FC" ? (
                              <div>
                                <h4 className="text-green-400 font-medium mb-1">FC (Full Cash)</h4>
                                <p className="text-gray-300 text-sm">
                                  • Método más rápido<br/>
                                  • Requiere tener Facility<br/>
                                  • Tiempo estimado: 1-2 horas<br/>
                                  • Mayor riesgo pero más eficiente
                                </p>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-blue-400 font-medium mb-1">C+C (Cash and Cars)</h4>
                                <p className="text-gray-300 text-sm">
                                  • Método tradicional<br/>
                                  • Más seguro y confiable<br/>
                                  • Tiempo estimado: 2-4 horas<br/>
                                  • Menor riesgo de detección
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-purple-400 text-sm">Datos de la Cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedPlatform === "PlayStation" ? (
                        // Formulario específico para PlayStation
                        <>
                          <div>
                            <Label htmlFor="email" className="text-white">Correo</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                              placeholder="correo@ejemplo.com" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="password" className="text-white">Contraseña</Label>
                            <Input 
                              id="password" 
                              type="text" 
                              value={formData.password}
                              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                              placeholder="Contraseña" 
                            />
                          </div>
                          
                          {/* 10 campos de código */}
                          <div className="space-y-2">
                            <Label className="text-white">Códigos</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {Array.from({ length: 10 }, (_, index) => (
                                <div key={index}>
                                  <Input 
                                    id={`code-${index + 1}`}
                                    value={formData.codes[index]}
                                    onChange={(e) => {
                                      const newCodes = [...formData.codes];
                                      newCodes[index] = e.target.value;
                                      setFormData(prev => ({ ...prev, codes: newCodes }));
                                    }}
                                    className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                                    placeholder={`Código ${index + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : selectedPlatform === "Xbox" ? (
                        // Formulario específico para Xbox
                        <>
                          <div>
                            <Label htmlFor="email" className="text-white">Correo</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                              placeholder="correo@ejemplo.com" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="password" className="text-white">Contraseña</Label>
                            <Input 
                              id="password" 
                              type="text" 
                              value={formData.password}
                              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                              placeholder="Contraseña" 
                            />
                          </div>
                        </>
                      ) : (
                        // Formulario estándar para otras plataformas (PC, Mobile)
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="username" className="text-white">Usuario</Label>
                              <Input 
                                id="username" 
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                                placeholder="Nombre de usuario" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="password" className="text-white">Contraseña</Label>
                              <Input 
                                id="password" 
                                type="text" 
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                                placeholder="Contraseña" 
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-white">Email (opcional)</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                              placeholder="email@ejemplo.com" 
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Campo para cantidad del pedido */}
                  <div>
                    <Label htmlFor="targetAmount" className="text-white">Cantidad del Pedido</Label>
                    <Input 
                      id="targetAmount" 
                      type="text" 
                      value={formData.targetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                      placeholder="Ej: 100m, 250m, 500m..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Especifica la cantidad solicitada (ej: 100m para 100 millones)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="earnings" className="text-white">Precio Chetador (USD)</Label>
                    <Input 
                      id="earnings" 
                      type="number" 
                      value={formData.earnings}
                      onChange={(e) => setFormData(prev => ({ ...prev, earnings: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                      placeholder="0" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="text-white">Prioridad</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="low" className="text-white hover:bg-slate-700">Baja</SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-slate-700">Media</SelectItem>
                          <SelectItem value="high" className="text-white hover:bg-slate-700">Alta</SelectItem>
                          <SelectItem value="urgent" className="text-white hover:bg-slate-700">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedTime" className="text-white">Tiempo Estimado</Label>
                      <Input 
                        id="estimatedTime" 
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                        placeholder="2-3 horas" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="clientNotes" className="text-white">Notas del Cliente</Label>
                    <Textarea 
                      id="clientNotes" 
                      value={formData.clientNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientNotes: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500" 
                      placeholder="Instrucciones especiales..." 
                      rows={3}
                    />
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={createNewOrder}
                  >
                    Crear Orden
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters and Search */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    placeholder="Buscar por ID, producto, plataforma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                  <SelectValue placeholder="Filtrar por plataforma" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">Todas las plataformas</SelectItem>
                  <SelectItem value="PC" className="text-white hover:bg-slate-700">🖥️ PC</SelectItem>
                  <SelectItem value="PlayStation" className="text-white hover:bg-slate-700">🎮 PlayStation</SelectItem>
                  <SelectItem value="Xbox" className="text-white hover:bg-slate-700">🎮 Xbox</SelectItem>
                  <SelectItem value="Mobile" className="text-white hover:bg-slate-700">📱 Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="min-w-80 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-slate-700 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-700 rounded w-16 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((cardIndex) => (
                    <div key={cardIndex} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-20 bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            <StatusColumn status="not_started" title="Sin Empezar" />
            <StatusColumn status="in_progress" title="En Proceso" />
            <StatusColumn status="completed" title="Completados" />
            <StatusColumn status="delivered" title="Entregados" />
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                  <span>{selectedOrder.id} - {selectedOrder.product}</span>
                  <Badge className={STATUS_CONFIG[selectedOrder.status].badge}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{selectedOrder.product}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className={PLATFORM_CONFIG[selectedOrder.platform].color}>
                            {PLATFORM_CONFIG[selectedOrder.platform].icon} {selectedOrder.platform}
                            {selectedOrder.platformVariant && (
                              <span className="ml-1 text-xs opacity-75">
                                ({selectedOrder.platformVariant.toUpperCase()})
                              </span>
                            )}
                          </Badge>
                          <Badge className={cn(
                            PRIORITY_CONFIG[selectedOrder.priority].color,
                            PRIORITY_CONFIG[selectedOrder.priority].bg
                          )}>
                            {PRIORITY_CONFIG[selectedOrder.priority].label}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {formatCurrency(selectedOrder.earnings)}
                        </p>
                        <p className="text-gray-400 text-sm">Ganancia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Account Information */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-purple-400 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Datos de la Cuenta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedOrder.platform === "PlayStation" ? (
                        // Vista específica para PlayStation
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Correo</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                  {selectedOrder.account.email}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyToClipboard(selectedOrder.account.email)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Contraseña</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                  {selectedOrder.account.password}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyToClipboard(selectedOrder.account.password)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Códigos de PlayStation */}
                          {selectedOrder.account.codes && (
                            <div>
                              <p className="text-gray-400 text-sm mb-3">Códigos</p>
                              <div className="grid grid-cols-2 gap-3">
                                {selectedOrder.account.codes.map((code, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                      {code}
                                    </code>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => copyToClipboard(code)}
                                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : selectedOrder.platform === "Xbox" ? (
                        // Vista específica para Xbox
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Correo</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                  {selectedOrder.account.email}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyToClipboard(selectedOrder.account.email)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Contraseña</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                  {selectedOrder.account.password}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyToClipboard(selectedOrder.account.password)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Vista estándar para otras plataformas (PC, Mobile)
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedOrder.account.username && (
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Usuario</p>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                    {selectedOrder.account.username}
                                  </code>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => copyToClipboard(selectedOrder.account.username)}
                                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Contraseña</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-white bg-slate-900/50 px-3 py-2 rounded border text-sm">
                                  {selectedOrder.account.password}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyToClipboard(selectedOrder.account.password)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {selectedOrder.account.email && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Email</p>
                              <code className="text-white bg-slate-900/50 px-3 py-2 rounded border text-sm block">
                                {selectedOrder.account.email}
                              </code>
                            </div>
                          )}
                        </>
                      )}

                      {selectedOrder.account.currentBalance && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Balance Actual</p>
                          <p className="text-green-400 font-bold text-lg">{selectedOrder.account.currentBalance}</p>
                          {selectedOrder.targetAmount && (
                            <p className="text-purple-300 text-sm">Meta: {selectedOrder.targetAmount}</p>
                          )}
                        </div>
                      )}

                      {selectedOrder.account.currentLevel && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Nivel Actual</p>
                          <p className="text-blue-400 font-bold text-lg">Nivel {selectedOrder.account.currentLevel}</p>
                          {selectedOrder.targetLevel && (
                            <p className="text-purple-300 text-sm">Meta: Nivel {selectedOrder.targetLevel}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Order Details */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-purple-400 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Detalles del Pedido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Estilo GTA - Solo para Millones GTA */}
                      {selectedOrder.product === "Millones GTA Online" && selectedOrder.gtaStyle && (
                        <Card className={cn(
                          "p-3 border",
                          selectedOrder.gtaStyle === "FC" 
                            ? "bg-green-500/10 border-green-500/30" 
                            : "bg-blue-500/10 border-blue-500/30"
                        )}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {selectedOrder.gtaStyle === "FC" ? "🚀" : "🎯"}
                            </span>
                            <Badge className={cn(
                              "text-sm font-medium",
                              selectedOrder.gtaStyle === "FC" 
                                ? "bg-green-500/20 text-green-300 border-green-500/50" 
                                : "bg-blue-500/20 text-blue-300 border-blue-500/50"
                            )} variant="outline">
                              {selectedOrder.gtaStyle === "FC" ? "FC (Full Cash)" : "C+C (Cash and Cars)"}
                            </Badge>
                          </div>
                          <p className={cn(
                            "text-sm",
                            selectedOrder.gtaStyle === "FC" ? "text-green-300" : "text-blue-300"
                          )}>
                            {selectedOrder.gtaStyle === "FC" 
                              ? "Método rápido y eficiente - Requiere Facility" 
                              : "Método tradicional y seguro - Mayor confiabilidad"
                            }
                          </p>
                        </Card>
                      )}

                      <div>
                        <div>
                          <p className="text-gray-400 text-sm">Ganancia</p>
                          <p className="text-green-400 font-bold text-lg">{formatCurrency(selectedOrder.earnings)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Tiempo estimado</p>
                        <p className="text-white font-medium">{selectedOrder.estimatedTime}</p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">Creado</p>
                        <p className="text-white font-medium">
                          {format(new Date(selectedOrder.createdAt), "PPpp", { locale: es })}
                        </p>
                      </div>

                      {selectedOrder.completedAt && (
                        <div>
                          <p className="text-gray-400 text-sm">Completado</p>
                          <p className="text-green-400 font-medium">
                            {format(new Date(selectedOrder.completedAt), "PPpp", { locale: es })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Assigned Cheater */}
                {selectedOrder.assignedCheater && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-purple-400 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Chetador Asignado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {selectedOrder.assignedCheater.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedOrder.assignedCheater.name}</h3>
                          <p className="text-purple-400">{selectedOrder.assignedCheater.specialty}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress */}
                {selectedOrder.progress !== undefined && selectedOrder.status === "in_progress" && (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-purple-400 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Progreso del Trabajo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">Completado</span>
                          <span className="text-purple-300 font-bold text-2xl">{selectedOrder.progress}%</span>
                        </div>
                        <Progress value={selectedOrder.progress} className="h-4 bg-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                            style={{ width: `${selectedOrder.progress}%` }}
                          />
                        </Progress>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Client Notes */}
                {selectedOrder.clientNotes && (
                  <Card className="bg-amber-500/5 border-amber-500/30">
                    <CardHeader>
                      <CardTitle className="text-amber-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Instrucciones del Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-amber-200 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                        {selectedOrder.clientNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                {(isCheater && selectedOrder.assignedTo === session?.user?.id) || canManageOrders ? (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-white font-medium mb-4">Acciones</h3>
                      <div className="flex gap-3">
                        {selectedOrder.status === "not_started" && (
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => updateOrderStatus(selectedOrder.id, "in_progress")}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Empezar Trabajo
                          </Button>
                        )}
                        
                        {selectedOrder.status === "in_progress" && (
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateOrderStatus(selectedOrder.id, "completed")}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar Completado
                          </Button>
                        )}

                        {selectedOrder.status === "completed" && canManageOrders && (
                          <Button 
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Marcar como Entregado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Gamepad2 className="w-20 h-20 mx-auto mb-4 text-purple-400/50" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {orders.length === 0 ? "Panel listo para uso" : "No hay órdenes"}
              </h3>
              <p className="text-gray-400 mb-6">
                {orders.length === 0 
                  ? "El sistema está configurado y listo para recibir las primeras órdenes de servicios gaming."
                  : "No se encontraron órdenes que coincidan con los filtros aplicados."
                }
              </p>
              {canManageOrders && (
                <Button 
                  onClick={() => setIsNewOrderOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {orders.length === 0 ? "Crear primera orden" : "Nueva orden"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
