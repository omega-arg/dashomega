"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useRef } from "react";
import { 
  CreditCard,
  Upload,
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
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronDown,
  Trash,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Define payment interface
interface PaymentRecord {
  id: string;
  clientName: string | null;
  communicationMethod: string | null; // Reemplaza al email, indica donde compró el cliente (Discord, Instagram, Web)
  productName: string | null; // Nombre del producto
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
  proofImage: string;
  notes?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: Date | null;
  uploadedBy?: {
    id: string;
    name: string | null;
  };
  managerPercentage?: number | null; // Porcentaje que se lleva el encargado del método de pago
  orderId?: string | null;
  saleId?: string | null;
}

// Payment methods configuration
const PAYMENT_METHODS = {
  zelle: { 
    label: "Zelle", 
    color: "from-blue-500 to-blue-600", 
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    manager: "Encargado Zelle" 
  },
  mercadopago: { 
    label: "MercadoPago", 
    color: "from-cyan-500 to-cyan-600", 
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
    manager: "Encargado Argentina" 
  },
  peru: { 
    label: "Pago Perú", 
    color: "from-red-500 to-red-600", 
    badge: "bg-red-500/20 text-red-300 border-red-500/50",
    manager: "Encargado Perú" 
  },
  colombia: { 
    label: "Pago Colombia", 
    color: "from-yellow-500 to-yellow-600", 
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    manager: "Encargado Colombia" 
  },
  mexico: { 
    label: "Pago México", 
    color: "from-green-500 to-green-600", 
    badge: "bg-green-500/20 text-green-300 border-green-500/50",
    manager: "Encargado México" 
  }
};

// Status configurations
const STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-500",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    actionLabel: "Marcar como revisado",
    actionColor: "bg-blue-600 hover:bg-blue-700",
  },
  CONFIRMED: {
    label: "Confirmado",
    icon: CheckCircle,
    color: "text-green-500",
    badge: "bg-green-500/20 text-green-300 border-green-500/50",
    actionLabel: "Rechazar",
    actionColor: "bg-red-600 hover:bg-red-700",
  },
  REJECTED: {
    label: "Rechazado",
    icon: XCircle,
    color: "text-red-500",
    badge: "bg-red-500/20 text-red-300 border-red-500/50",
    actionLabel: "Aprobar",
    actionColor: "bg-green-600 hover:bg-green-700",
  }
};

export default function PaymentsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{id: string, status: PaymentRecord['status']} | null>(null);
  
  // Estado para almacenar la URL de la imagen subida
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  // Roles y permisos
  const isOwner = session?.user?.name?.includes("Owner") || false;
  const isManager = session?.user?.name?.includes("Manager") || false;
  const canReviewPayments = isOwner || isManager;
  const canCreatePayments = !!session?.user;

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los pagos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    // Text search
    const matchesSearch = 
      !searchTerm || 
      payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Method filter
    const matchesMethod = filterMethod === "all" || payment.paymentMethod === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  // Payment stats
  const pendingPayments = payments.filter(p => p.status === "PENDING");
  const approvedPayments = payments.filter(p => p.status === "CONFIRMED");
  const rejectedPayments = payments.filter(p => p.status === "REJECTED");
  const reviewingPayments: PaymentRecord[] = []; // Implementación futura para pagos en revisión
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalApproved = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRejected = rejectedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalReviewing = reviewingPayments.reduce((sum, p) => sum + p.amount, 0);

  // Open payment details modal
  const openPaymentDetails = (payment: PaymentRecord) => {
    setReviewNote("");
    setSelectedPayment(payment);
  };

  const updatePaymentStatus = (id: string, status: PaymentRecord['status'], notes?: string) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === id 
          ? { 
              ...payment, 
              status, 
              ...(notes && { reviewNotes: notes }),
              ...(status !== "PENDING" && { 
                reviewedBy: session?.user?.name || "Usuario del Sistema",
                reviewedAt: new Date()
              })
            }
          : payment
      )
    );
    
    // Close the dialog
    setSelectedPayment(null);
  };

  const handleSubmitNewPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Si no hay imagen subida, mostrar un mensaje de error
    if (!uploadedImageUrl) {
      toast({
        title: "Falta comprobante",
        description: "Por favor sube una imagen del comprobante de pago",
        variant: "destructive",
      });
      return;
    }
    
    const newPayment: PaymentRecord = {
      id: `${payments.length + 1}`,
      clientName: formData.get('clientName') as string,
      communicationMethod: formData.get('communicationMethod') as string,
      productName: formData.get('productName') as string,
      amount: Number(formData.get('amount')),
      paymentMethod: formData.get('paymentMethod') as string,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      reviewNotes: formData.get('notes') as string || undefined,
      orderId: formData.get('orderId') as string || `ORD-00${payments.length + 1}`,
      proofImage: uploadedImageUrl,
      managerPercentage: formData.get('managerPercentage') ? Number(formData.get('managerPercentage')) : null
    };
    
    setPayments(prevPayments => [...prevPayments, newPayment]);
    setIsNewPaymentOpen(false);
    setUploadedImageUrl(''); // Resetear la URL de la imagen para futuros pagos
    
    toast({
      title: "Pago registrado",
      description: "El pago se ha registrado correctamente",
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
            status="PENDING"
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

        {/* New Payment Dialog */}
        <Dialog open={isNewPaymentOpen} onOpenChange={setIsNewPaymentOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center">
                <Plus className="mr-2 h-5 w-5 text-purple-500" />
                Registrar Nuevo Pago
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitNewPayment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre del Cliente</Label>
                  <Input 
                    id="clientName" 
                    name="clientName" 
                    required 
                    className="bg-slate-800 border-slate-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communicationMethod">Lugar donde compró (Discord, Instagram, Web)</Label>
                  <Input 
                    id="communicationMethod" 
                    name="communicationMethod" 
                    required 
                    className="bg-slate-800 border-slate-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName">Producto</Label>
                  <Input 
                    id="productName" 
                    name="productName" 
                    required 
                    className="bg-slate-800 border-slate-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (USD)</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    required 
                    min="0.01" 
                    step="0.01" 
                    className="bg-slate-800 border-slate-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Select name="paymentMethod" required defaultValue="zelle">
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="mercadopago">MercadoPago</SelectItem>
                      <SelectItem value="peru">Pago Perú</SelectItem>
                      <SelectItem value="colombia">Pago Colombia</SelectItem>
                      <SelectItem value="mexico">Pago México</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerPercentage">Porcentaje para el encargado (%)</Label>
                  <div className="relative">
                    <Input 
                      id="managerPercentage" 
                      name="managerPercentage"
                      type="number" 
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="5.00" 
                      className="bg-slate-800 border-slate-700 text-white pr-12" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                      %
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Porcentaje que se llevará el encargado del método de pago</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderId">ID de Pedido (opcional)</Label>
                  <Input 
                    id="orderId" 
                    name="orderId" 
                    className="bg-slate-800 border-slate-700 text-white" 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]" 
                    placeholder="Información adicional relevante para el pago..."
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="proofImage">Comprobante de Pago</Label>
                  <ImageUploader onImageUploaded={setUploadedImageUrl} />
                  <p className="text-xs text-gray-400 mt-1">Sube una imagen del comprobante de pago (máx. 5MB)</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsNewPaymentOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Pago
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">ID: {selectedPayment.id}</p>
                        <h2 className="text-xl font-semibold text-white">{selectedPayment.productName}</h2>
                      </div>
                      <Badge className={cn("text-sm", STATUS_CONFIG[selectedPayment.status].badge)}>
                        {STATUS_CONFIG[selectedPayment.status].label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Cliente</p>
                        <div className="flex items-center mt-1">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-purple-700 text-white">
                              {selectedPayment.clientName ? selectedPayment.clientName.charAt(0) : 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{selectedPayment.clientName || 'Sin nombre'}</p>
                            <p className="text-sm text-gray-400">{selectedPayment.communicationMethod || 'Sin contacto'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Monto</p>
                        <p className="text-2xl font-bold text-white">${selectedPayment.amount.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Método de Pago</p>
                        <Badge className={cn("mt-1", PAYMENT_METHODS[selectedPayment.paymentMethod as keyof typeof PAYMENT_METHODS]?.badge || "bg-gray-500/20 text-gray-300")}>
                          {PAYMENT_METHODS[selectedPayment.paymentMethod as keyof typeof PAYMENT_METHODS]?.label || selectedPayment.paymentMethod}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Fecha</p>
                        <p className="text-white">
                          {format(new Date(selectedPayment.createdAt), 'PPP', { locale: es })}
                        </p>
                        <p className="text-sm text-gray-400">
                          {format(new Date(selectedPayment.createdAt), 'p', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    {selectedPayment.notes && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Notas</p>
                        <p className="text-white bg-slate-800 p-3 rounded-md">{selectedPayment.notes}</p>
                      </div>
                    )}
                    
                    {selectedPayment.reviewNotes && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Notas de Revisión</p>
                        <p className="text-white bg-slate-800 p-3 rounded-md">{selectedPayment.reviewNotes}</p>
                      </div>
                    )}
                    
                    {/* Mostrar la imagen del comprobante si existe */}
                    {selectedPayment.proofImage && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Comprobante de Pago</p>
                        <div className="mt-2 relative">
                          <a 
                            href={selectedPayment.proofImage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img 
                              src={selectedPayment.proofImage} 
                              alt="Comprobante de pago" 
                              className="w-full max-h-[300px] object-contain rounded-md border border-slate-700" 
                            />
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Acciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {canReviewPayments && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="reviewNote">Nota de Revisión</Label>
                          <Textarea 
                            id="reviewNote"
                            placeholder="Ingresa una nota sobre la revisión del pago..."
                            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {selectedPayment.status === "PENDING" && (
                            <>
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setPendingAction({id: selectedPayment.id, status: "CONFIRMED"});
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprobar Pago
                              </Button>
                              <Button 
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                  setPendingAction({id: selectedPayment.id, status: "REJECTED"});
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rechazar Pago
                              </Button>
                            </>
                          )}

                          {selectedPayment.status === "CONFIRMED" && (
                            <Button 
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => {
                                setPendingAction({id: selectedPayment.id, status: "REJECTED"});
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Marcar como Rechazado
                            </Button>
                          )}

                          {selectedPayment.status === "REJECTED" && (
                            <Button 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                setPendingAction({id: selectedPayment.id, status: "CONFIRMED"});
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Aprobado
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedPayment(null)}
                    >
                      Cerrar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                {pendingAction?.status === "CONFIRMED" 
                  ? "¿Estás seguro de que deseas aprobar este pago? Esta acción se registrará en el sistema."
                  : "¿Estás seguro de que deseas rechazar este pago? Esta acción se registrará en el sistema."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className={pendingAction?.status === "CONFIRMED" 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-red-600 hover:bg-red-700 text-white"}
                onClick={() => {
                  if (pendingAction) {
                    updatePaymentStatus(pendingAction.id, pendingAction.status, reviewNote);
                    setPendingAction(null);
                    setReviewNote("");
                    
                    toast({
                      title: pendingAction.status === "CONFIRMED" ? "Pago aprobado" : "Pago rechazado",
                      description: "La acción se ha registrado correctamente",
                    });
                  }
                }}
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payments Table */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Registro de Pagos
              </div>
              
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white h-8 text-sm">
                  <div className="flex items-center">
                    <SelectValue placeholder="Filtrar por método" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  <SelectItem value="peru">Pago Perú</SelectItem>
                  <SelectItem value="colombia">Pago Colombia</SelectItem>
                  <SelectItem value="mexico">Pago México</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="text-white">Cargando pagos...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <PaymentsTable 
                  payments={filteredPayments} 
                  onOpenDetails={openPaymentDetails}
                />
              </div>
            )}
            
            {filteredPayments.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-400">No se encontraron pagos que coincidan con los criterios de búsqueda</p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterMethod("all");
                  }}
                  variant="outline" 
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusCard({ status, count, amount }: { status: keyof typeof STATUS_CONFIG, count: number, amount: number }) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Card className={cn("bg-slate-800/50 border-slate-700/50 overflow-hidden relative")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 from-transparent", 
        status === "PENDING" ? "to-yellow-500" : 
        status === "CONFIRMED" ? "to-green-500" : 
        status === "REJECTED" ? "to-red-500" : "to-blue-500"
      )} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-full", config.badge)}>
            {status === "PENDING" && <Clock className={cn("w-5 h-5", config.color)} />}
            {status === "CONFIRMED" && <CheckCircle className={cn("w-5 h-5", config.color)} />}
            {status === "REJECTED" && <XCircle className={cn("w-5 h-5", config.color)} />}
          </div>
          <Badge className={cn("text-sm", config.badge)}>
            {config.label}
          </Badge>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-400">Cantidad</div>
          <div className="text-2xl font-bold text-white">{count} pagos</div>
        </div>
        <div className="mt-3">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl font-bold text-white">${amount.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentsTable({
  payments, 
  onOpenDetails
}: { 
  payments: PaymentRecord[], 
  onOpenDetails: (payment: PaymentRecord) => void 
}) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-700">
          <th className="p-2 text-sm font-medium text-gray-300">ID</th>
          <th className="p-2 text-sm font-medium text-gray-300">Cliente</th>
          <th className="p-2 text-sm font-medium text-gray-300">Producto</th>
          <th className="p-2 text-sm font-medium text-gray-300">Monto</th>
          <th className="p-2 text-sm font-medium text-gray-300">Método</th>
          <th className="p-2 text-sm font-medium text-gray-300">Estado</th>
          <th className="p-2 text-sm font-medium text-gray-300">Fecha</th>
          <th className="p-2 text-sm font-medium text-gray-300">Imagen</th>
          <th className="p-2 text-sm font-medium text-gray-300"></th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <tr 
            key={payment.id}
            className="border-b border-slate-800 hover:bg-slate-700/20 transition-colors cursor-pointer"
            onClick={() => onOpenDetails(payment)}
          >
            <td className="p-2 text-sm text-gray-200">{payment.id}</td>
            <td className="p-2">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-purple-700 text-white text-xs">
                    {payment.clientName ? payment.clientName.charAt(0) : 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-white">{payment.clientName}</p>
                  <p className="text-xs text-gray-400">{payment.communicationMethod}</p>
                </div>
              </div>
            </td>
            <td className="p-2 text-sm text-gray-200">{payment.productName}</td>
            <td className="p-2 text-sm font-semibold text-white">${payment.amount.toFixed(2)}</td>
            <td className="p-2">
              <Badge className={cn("text-xs", PAYMENT_METHODS[payment.paymentMethod as keyof typeof PAYMENT_METHODS]?.badge || "bg-gray-500/20 text-gray-300")}>
                {PAYMENT_METHODS[payment.paymentMethod as keyof typeof PAYMENT_METHODS]?.label || payment.paymentMethod}
              </Badge>
            </td>
            <td className="p-2">
              <Badge className={cn("text-xs", STATUS_CONFIG[payment.status].badge)}>
                <div className="flex items-center">
                  {payment.status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                  {payment.status === "CONFIRMED" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {payment.status === "REJECTED" && <XCircle className="w-3 h-3 mr-1" />}
                  <span>{STATUS_CONFIG[payment.status].label}</span>
                </div>
              </Badge>
            </td>
            <td className="p-2 text-sm text-gray-300">{format(new Date(payment.createdAt), 'dd/MM/yyyy')}</td>
            <td className="p-2 text-sm text-gray-300">
              {payment.proofImage && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(payment.proofImage, '_blank');
                  }}
                >
                  <Image className="w-3 h-3 mr-1" />
                  Ver
                </Button>
              )}
            </td>
            <td className="p-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(payment);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
