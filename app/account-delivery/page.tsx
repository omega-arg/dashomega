"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, Edit, Trash2, Plus, Lock, User, Mail, Key, FileText, Calendar, DollarSign, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const allowedRoles = ["OWNER", "ADMIN_GENERAL", "AT_CLIENTE"];

type Delivery = {
  id: string;
  clientName: string;
  clientUser: string;
  clientContact: string;
  productType: string;
  productDetails: string;
  price: number;
  paymentMethod: string;
  purchaseDate: string;
  deliveryUser?: string | null;
  deliveryPass?: string | null;
  deliveryEmail?: string | null;
  deliveryInstructions?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AccountDeliveryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [useMockAPI, setUseMockAPI] = useState(false); // Usar producción (Neon) por defecto
  
  const apiEndpoint = useMockAPI ? "/api/account-delivery-mock" : "/api/account-delivery";
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientUser: "",
    clientContact: "",
    productType: "",
    productDetails: "",
    price: "",
    paymentMethod: "",
    deliveryUser: "",
    deliveryPass: "",
    deliveryEmail: "",
    deliveryInstructions: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    
    console.log("Session status:", status);
    console.log("Session data:", session);
    
    // Temporal: permitir acceso directo para OWNER
    if (status === "unauthenticated") {
      // Mostrar mensaje para iniciar sesión
      setError("🔐 Debes iniciar sesión para acceder a esta sección.");
      setLoading(false);
      return;
    }
    
    if (session?.user) {
      console.log("User role:", session.user.role);
      console.log("Allowed roles:", allowedRoles);
      
      if (!allowedRoles.includes(session.user.role)) {
        setError(`No tienes acceso a esta sección. Tu rol: ${session.user.role}. Necesitas: ${allowedRoles.join(", ")}`);
        setLoading(false);
        return;
      }
    }
    
    fetchDeliveries();
  }, [session, status, apiEndpoint]); // Re-fetch when API endpoint changes

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching deliveries from:", apiEndpoint);
      const res = await fetch(apiEndpoint);
      
      console.log("🔍 Fetch response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("🔍 Fetched deliveries:", data);
      
      setDeliveries(Array.isArray(data) ? data : []);
      setError(""); // Limpiar errores previos
    } catch (e) {
      console.error("❌ Error fetching deliveries:", e);
      setError(`Error al cargar entregas: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      setDeliveries([]); // Mostrar interfaz vacía
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientUser: "",
      clientContact: "",
      productType: "",
      productDetails: "",
      price: "",
      paymentMethod: "",
      deliveryUser: "",
      deliveryPass: "",
      deliveryEmail: "",
      deliveryInstructions: "",
    });
  };

  const handleCreate = async () => {
    try {
      console.log("🔍 Creating delivery with data:", formData);
      
      // Validación en el frontend
      if (!formData.clientName.trim()) {
        toast({ title: "El nombre del cliente es requerido", variant: "destructive" });
        return;
      }
      
      if (!formData.productType.trim()) {
        toast({ title: "El tipo de producto es requerido", variant: "destructive" });
        return;
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        purchaseDate: new Date().toISOString(),
      };

      console.log("🔍 Sending payload:", payload);

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("🔍 Response status:", res.status);
      
      const responseData = await res.json();
      console.log("🔍 Response data:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || `Error ${res.status}: ${res.statusText}`);
      }
      
      toast({ title: "✅ Entrega creada exitosamente" });
      setShowNewModal(false);
      resetForm();
      fetchDeliveries();
    } catch (error) {
      console.error("❌ Error creating delivery:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({ 
        title: "Error al crear entrega", 
        description: errorMessage,
        variant: "destructive" 
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedDelivery) return;
    
    try {
      const res = await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDelivery.id,
          ...formData,
          price: parseFloat(formData.price),
          deliveredAt: formData.deliveryUser ? new Date().toISOString() : null,
        }),
      });
      
      if (!res.ok) throw new Error("Error al actualizar entrega");
      
      toast({ title: "Entrega actualizada exitosamente" });
      setShowEditModal(false);
      resetForm();
      setSelectedDelivery(null);
      fetchDeliveries();
    } catch (error) {
      toast({ title: "Error al actualizar entrega", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta entrega? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch(apiEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error("Error al eliminar entrega");
      
      toast({ title: "Entrega eliminada exitosamente" });
      fetchDeliveries();
    } catch (error) {
      toast({ title: "Error al eliminar entrega", variant: "destructive" });
    }
  };

  const handleMarkAsDelivered = async (delivery: Delivery) => {
    if (delivery.deliveredAt) {
      toast({ title: "Esta entrega ya está marcada como entregada", variant: "destructive" });
      return;
    }

    if (!confirm("¿Marcar esta entrega como enviada/entregada?")) return;
    
    try {
      const res = await fetch("/api/account-delivery/mark-delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: delivery.id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        throw new Error(`Error al marcar como entregada: ${errorData.error || res.statusText}`);
      }
      
      toast({ title: "✅ Entrega marcada como enviada exitosamente" });
      fetchDeliveries();
    } catch (error) {
      console.error("Error marking as delivered:", error);
      toast({ title: "Error al marcar como entregada", variant: "destructive" });
    }
  };

  const openViewModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowViewModal(true);
  };

  const openEditModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setFormData({
      clientName: delivery.clientName,
      clientUser: delivery.clientUser,
      clientContact: delivery.clientContact,
      productType: delivery.productType,
      productDetails: delivery.productDetails,
      price: delivery.price.toString(),
      paymentMethod: delivery.paymentMethod,
      deliveryUser: delivery.deliveryUser || "",
      deliveryPass: delivery.deliveryPass || "",
      deliveryEmail: delivery.deliveryEmail || "",
      deliveryInstructions: delivery.deliveryInstructions || "",
    });
    setShowEditModal(true);
  };

  const canEditDelete = session?.user?.role !== "AT_CLIENTE";

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado al portapapeles" });
    } catch (err) {
      toast({ title: "Error al copiar", variant: "destructive" });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur border-red-500/50">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
            <p className="text-red-200">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            Entrega de Cuentas
          </h1>
          <p className="text-purple-200">Gestión segura y entrega de cuentas vendidas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200">Total Entregas</p>
                  <p className="text-2xl font-bold text-white">{deliveries.length}</p>
                </div>
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200">Pendientes</p>
                  <p className="text-2xl font-bold text-white">
                    {deliveries.filter(d => !d.deliveredAt).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200">Entregadas</p>
                  <p className="text-2xl font-bold text-white">
                    {deliveries.filter(d => d.deliveredAt).length}
                  </p>
                </div>
                <User className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200">Valor Total</p>
                  <p className="text-2xl font-bold text-white">
                    ${deliveries.reduce((sum, d) => sum + d.price, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Lista de Entregas</CardTitle>
              <div className="flex items-center gap-4">
                {/* API Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Badge variant={useMockAPI ? "secondary" : "default"} className="text-xs">
                    {useMockAPI ? "Modo Test" : "Producción"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseMockAPI(!useMockAPI)}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    {useMockAPI ? "🔧 Switch to Prod" : "🧪 Switch to Test"}
                  </Button>
                </div>
                {canEditDelete && (
                <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Entrega
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Crear Nueva Entrega</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div>
                        <Label htmlFor="clientName" className="text-white">Nombre del Cliente</Label>
                        <Input
                          id="clientName"
                          value={formData.clientName}
                          onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientUser" className="text-white">Usuario del Cliente</Label>
                        <Input
                          id="clientUser"
                          value={formData.clientUser}
                          onChange={(e) => setFormData({...formData, clientUser: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientContact" className="text-white">Contacto</Label>
                        <Input
                          id="clientContact"
                          value={formData.clientContact}
                          onChange={(e) => setFormData({...formData, clientContact: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productType" className="text-white">Tipo de Producto</Label>
                        <Input
                          id="productType"
                          value={formData.productType}
                          onChange={(e) => setFormData({...formData, productType: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="Netflix, Spotify, Disney+, etc."
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="productDetails" className="text-white">Detalles del Producto</Label>
                        <Textarea
                          id="productDetails"
                          value={formData.productDetails}
                          onChange={(e) => setFormData({...formData, productDetails: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="Características, duración, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-white">Precio ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod" className="text-white">Método de Pago</Label>
                        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="Zelle">Zelle</SelectItem>
                            <SelectItem value="PayPal">PayPal</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {setShowNewModal(false); resetForm();}}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreate} className="bg-gradient-to-r from-green-500 to-emerald-500">
                        Crear Entrega
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-purple-200">Cliente</th>
                    <th className="text-left py-3 px-4 text-purple-200">Producto</th>
                    <th className="text-left py-3 px-4 text-purple-200">Precio</th>
                    <th className="text-left py-3 px-4 text-purple-200">Método Pago</th>
                    <th className="text-left py-3 px-4 text-purple-200">Fecha Compra</th>
                    <th className="text-left py-3 px-4 text-purple-200">Estado</th>
                    <th className="text-left py-3 px-4 text-purple-200">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No hay entregas registradas. {canEditDelete && "Haz clic en 'Nueva Entrega' para comenzar."}
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-b border-slate-700 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{delivery.clientName}</div>
                          <div className="text-sm text-gray-400">{delivery.clientUser}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{delivery.productType}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">{delivery.productDetails}</div>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          ${delivery.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-white">{delivery.paymentMethod}</td>
                        <td className="py-3 px-4 text-white">
                          {new Date(delivery.purchaseDate).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={delivery.deliveredAt ? "default" : "secondary"} className={
                            delivery.deliveredAt 
                              ? "bg-green-500/20 text-green-400 border-green-500/50" 
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                          }>
                            {delivery.deliveredAt ? "Entregada" : "Pendiente"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openViewModal(delivery)}
                              className="border-slate-600 text-white hover:bg-slate-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!delivery.deliveredAt && canEditDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsDelivered(delivery)}
                                className="border-green-600 text-green-400 hover:bg-green-700/20"
                                title="Marcar como entregado"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {canEditDelete && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(delivery)}
                                  className="border-slate-600 text-white hover:bg-slate-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(delivery.id)}
                                  className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Datos de Entrega
            </DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-6">
              {/* Información básica del cliente y producto */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-700">
                <div>
                  <Label className="text-purple-200">Cliente</Label>
                  <p className="text-white font-medium">{selectedDelivery.clientName}</p>
                </div>
                <div>
                  <Label className="text-purple-200">Producto</Label>
                  <p className="text-white">{selectedDelivery.productType}</p>
                </div>
                <div>
                  <Label className="text-purple-200">Precio</Label>
                  <p className="text-white font-medium">${selectedDelivery.price.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-purple-200">Estado</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedDelivery.deliveredAt ? "bg-green-400" : "bg-yellow-400"
                    }`}></div>
                    <span className="text-white">{selectedDelivery.deliveredAt ? "ENTREGADO" : "PENDIENTE"}</span>
                  </div>
                </div>
              </div>

              {/* Datos de Entrega - Siempre visible */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Instrucciones para el Cliente
                </h4>
                <div className="space-y-4">
                  {selectedDelivery.deliveryInstructions ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-purple-200">Instrucciones de Entrega</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedDelivery.deliveryInstructions || "")}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <div className="bg-slate-800 p-4 rounded border min-h-[120px]">
                        <pre className="text-white whitespace-pre-wrap text-sm">
                          {selectedDelivery.deliveryInstructions}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 p-4 rounded border border-dashed border-slate-600 text-center">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400">No hay instrucciones de entrega disponibles</p>
                    </div>
                  )}

                  {selectedDelivery.deliveredAt && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Entregado</span>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Fecha de entrega: {new Date(selectedDelivery.deliveredAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Entrega
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-clientName" className="text-white">Nombre del Cliente</Label>
                <Input
                  id="edit-clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-clientUser" className="text-white">Usuario del Cliente</Label>
                <Input
                  id="edit-clientUser"
                  value={formData.clientUser}
                  onChange={(e) => setFormData({...formData, clientUser: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-price" className="text-white">Precio ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-paymentMethod" className="text-white">Método de Pago</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="Zelle">Zelle</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                Datos de Entrega
              </h4>
              <div className="col-span-2">
                <Label htmlFor="edit-deliveryInstructions" className="text-white">Instrucciones para el Cliente</Label>
                <Textarea
                  id="edit-deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({...formData, deliveryInstructions: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Instrucciones adicionales, consejos de uso, etc."
                  rows={6}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {setShowEditModal(false); resetForm(); setSelectedDelivery(null);}}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              Actualizar Entrega
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
