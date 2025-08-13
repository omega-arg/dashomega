"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/payments/payment-form";
import { 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  User,
  Calendar,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Define payment interface
interface PaymentRecord {
  id: string;
  clientName: string | null;
  communicationMethod: string | null;
  productName: string | null;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "CONFIRMED" | "REVIEWING" | "REJECTED";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  orderId?: string;
  proofImage: string;
  managerPercentage: number | null;
}

// Status configurations
const STATUS_CONFIG = {
  PENDING: { 
    label: "Pendientes", 
    color: "from-amber-500 to-yellow-500", 
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/50",
    icon: Clock
  },
  CONFIRMED: { 
    label: "Confirmados", 
    color: "from-green-500 to-emerald-500", 
    badge: "bg-green-500/20 text-green-300 border-green-500/50",
    icon: CheckCircle
  },
  REVIEWING: { 
    label: "En revisión", 
    color: "from-purple-500 to-violet-500", 
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    icon: Eye
  },
  REJECTED: { 
    label: "Rechazados", 
    color: "from-red-500 to-rose-500", 
    badge: "bg-red-500/20 text-red-300 border-red-500/50",
    icon: XCircle
  }
};

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const userRole = session?.user?.role;
  // Ajustamos los roles según nuestro modelo Prisma
  const canCreatePayments = ["AT_CLIENTE", "SOPORTE", "ADMIN_GENERAL", "OWNER"].includes(userRole || "");
  const canReviewPayments = userRole === "OWNER" || userRole === "ADMIN_GENERAL" || 
    ["ENCARGADO_PAGO_MEXICO", "ENCARGADO_PAGO_PERU", "ENCARGADO_PAGO_COLOMBIA", "ENCARGADO_PAGO_ZELLE"].includes(userRole || "");
  
  // Cargar datos de la API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/payments');
        if (!response.ok) {
          throw new Error('Error al cargar pagos');
        }
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('No se pudieron cargar los pagos. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchPayments();
    }
  }, [session]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.clientName && payment.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.communicationMethod && payment.communicationMethod.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.productName && payment.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.orderId && payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesMethod = filterMethod === "all" || payment.paymentMethod === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  const pendingPayments = filteredPayments.filter(p => p.status === "PENDING");
  const approvedPayments = filteredPayments.filter(p => p.status === "CONFIRMED");
  const reviewingPayments = filteredPayments.filter(p => p.status === "REVIEWING");
  const rejectedPayments = filteredPayments.filter(p => p.status === "REJECTED");
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalApproved = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalReviewing = reviewingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRejected = rejectedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Añadir un nuevo pago
  const handleAddNewPayment = (paymentData: any) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `${payments.length + 1}`,
      orderId: paymentData.orderId || `ORD-00${payments.length + 1}`,
    };
    
    setPayments(prevPayments => [...prevPayments, newPayment]);
    setIsNewPaymentOpen(false);
    
    toast({
      title: "Pago registrado",
      description: "El pago ha sido registrado correctamente",
      variant: "default",
    });
  };

  // Actualizar estado de un pago
  const updatePaymentStatus = (id: string, status: PaymentRecord['status'], notes?: string) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === id 
          ? { 
              ...payment, 
              status, 
              reviewedAt: new Date().toISOString(),
              reviewedBy: session?.user?.name || 'Usuario',
              reviewNotes: notes || payment.reviewNotes
            }
          : payment
      )
    );
    
    setSelectedPayment(null);
    
    toast({
      title: `Pago ${STATUS_CONFIG[status].label.toLowerCase()}`,
      description: `El estado del pago ha sido actualizado a ${STATUS_CONFIG[status].label.toLowerCase()}`,
      variant: status === "CONFIRMED" ? "default" : status === "REJECTED" ? "destructive" : "default",
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            <CreditCard className="inline-block mr-2 text-purple-500" />
            Control de Pagos
          </h1>
          
          {canCreatePayments && (
            <Button 
              onClick={() => setIsNewPaymentOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pago
            </Button>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatusCard 
            status="PENDING"
            count={pendingPayments.length}
            amount={totalPending}
          />
          <StatusCard 
            status="CONFIRMED"
            count={approvedPayments.length}
            amount={totalApproved}
          />
          <StatusCard 
            status="REVIEWING"
            count={reviewingPayments.length}
            amount={totalReviewing}
          />
          <StatusCard 
            status="REJECTED"
            count={rejectedPayments.length}
            amount={totalRejected}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Buscar por nombre, producto, ID..." 
                className="pl-10 bg-slate-800 border-slate-700 text-white" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700 text-white">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filtrar por método" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="zelle">Zelle</SelectItem>
                <SelectItem value="mercadopago">MercadoPago</SelectItem>
                <SelectItem value="peru">Pago Perú</SelectItem>
                <SelectItem value="colombia">Pago Colombia</SelectItem>
                <SelectItem value="mexico">Pago México</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Formulario de Nuevo Pago como componente separado */}
        <PaymentForm 
          isOpen={isNewPaymentOpen}
          onClose={() => setIsNewPaymentOpen(false)}
          onSubmit={handleAddNewPayment}
        />

        {/* Payment Details Modal */}
        {selectedPayment && (
          <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-purple-500" />
                  Detalles del Pago
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2 bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        <Receipt className="mr-2 h-4 w-4 text-purple-400" />
                        Información del Pago
                      </span>
                      <Badge className={cn("ml-2", STATUS_CONFIG[selectedPayment.status].badge)}>
                        {STATUS_CONFIG[selectedPayment.status].label}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Cliente</p>
                        <p className="font-medium">{selectedPayment.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Producto</p>
                        <p className="font-medium">{selectedPayment.productName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Monto</p>
                        <p className="font-medium text-lg">${selectedPayment.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Método de Pago</p>
                        <p className="font-medium capitalize">{selectedPayment.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Canal</p>
                        <p className="font-medium">{selectedPayment.communicationMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">ID de Pedido</p>
                        <p className="font-medium">{selectedPayment.orderId}</p>
                      </div>
                    </div>
                    
                    {/* Comprobante de Pago */}
                    {selectedPayment.proofImage && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Comprobante de Pago</p>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 flex justify-center items-center"
                          onClick={() => window.open(selectedPayment.proofImage, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver imagen de comprobante
                        </Button>
                      </div>
                    )}
                    
                    {/* Notas */}
                    {selectedPayment.reviewNotes && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Notas</p>
                        <div className="p-3 bg-slate-700/30 rounded-md text-sm">
                          {selectedPayment.reviewNotes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-purple-400" />
                      Línea de Tiempo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex">
                      <div className="mr-3 flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Plus className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex-1 w-0.5 bg-slate-700 my-1"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pago Registrado</p>
                        <p className="text-gray-400">
                          {format(new Date(selectedPayment.createdAt), "PPpp", { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    {selectedPayment.reviewedAt && (
                      <div className="flex">
                        <div className="mr-3 flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {(() => {
                              const Icon = STATUS_CONFIG[selectedPayment.status].icon;
                              return <Icon className="h-4 w-4 text-blue-400" />;
                            })()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            Estado: {STATUS_CONFIG[selectedPayment.status].label}
                          </p>
                          <p className="text-gray-400">
                            {format(new Date(selectedPayment.reviewedAt), "PPpp", { locale: es })}
                          </p>
                          <p className="text-gray-400">Por: {selectedPayment.reviewedBy}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Botones de acción para revisores */}
              {canReviewPayments && selectedPayment.status !== "CONFIRMED" && selectedPayment.status !== "REJECTED" && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updatePaymentStatus(selectedPayment.id, "CONFIRMED")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pago
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => updatePaymentStatus(selectedPayment.id, "PENDING", "Requiere revisión adicional")}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Marcar como Pendiente
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => updatePaymentStatus(selectedPayment.id, "REJECTED", "Comprobante inválido o incompleto")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Payments Table */}
        {filteredPayments.length > 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <PaymentsTable 
              payments={filteredPayments} 
              onViewPayment={setSelectedPayment}
              canReview={canReviewPayments}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No se encontraron pagos</h3>
            <p className="text-gray-400">
              {loading ? 'Cargando pagos...' : error ? error : 'No hay pagos que coincidan con los filtros aplicados.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para tarjetas de estado
function StatusCard({ status, count, amount }: { status: keyof typeof STATUS_CONFIG, count: number, amount: number }) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-slate-800">
      <div className={`h-1 bg-gradient-to-r ${config.color}`}></div>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-full bg-slate-700/50">
            <config.icon className="h-5 w-5 text-white" />
          </div>
          <Badge variant="outline" className={config.badge}>
            {count} {count === 1 ? 'pago' : 'pagos'}
          </Badge>
        </div>
        <h3 className="font-medium text-lg text-gray-200">{config.label}</h3>
        <div className="mt-1 flex items-center">
          <div className="text-2xl font-bold text-white">${amount.toFixed(2)}</div>
          <div className="ml-auto">
            {status === "CONFIRMED" ? (
              <div className="flex items-center text-green-400 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Confirmados
              </div>
            ) : status === "REJECTED" ? (
              <div className="flex items-center text-red-400 text-xs">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                Rechazados
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para la tabla de pagos
function PaymentsTable({
  payments,
  onViewPayment,
  canReview
}: {
  payments: PaymentRecord[],
  onViewPayment: (payment: PaymentRecord) => void,
  canReview: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Método</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {payments.map((payment) => (
            <tr 
              key={payment.id} 
              className={cn(
                "transition-colors hover:bg-slate-700/50",
                payment.status === "CONFIRMED" && "bg-green-900/10",
                payment.status === "REJECTED" && "bg-red-900/10"
              )}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-white">{payment.clientName}</div>
                    <div className="text-xs text-gray-400">{payment.communicationMethod}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-white">{payment.productName}</div>
                <div className="text-xs text-gray-400">{payment.orderId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="font-medium text-white">${payment.amount.toFixed(2)}</div>
                {payment.managerPercentage && (
                  <div className="text-xs text-gray-400">{payment.managerPercentage}% comisión</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white capitalize">
                {payment.paymentMethod}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={STATUS_CONFIG[payment.status].badge}>
                  {(() => {
                    const Icon = STATUS_CONFIG[payment.status].icon;
                    return <Icon className="h-3 w-3 mr-1" />;
                  })()}
                  {STATUS_CONFIG[payment.status].label}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {format(new Date(payment.createdAt), "dd/MM/yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewPayment(payment)}
                  className="text-gray-300 hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
