"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CalendarIcon,
  DollarSign,
  User,
  Phone,
  Mail,
  Package,
  CreditCard,
  Calculator,
  Save,
  Plus,
  Trash2,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface SaleFormData {
  // Información del cliente
  cliente: string;
  telefono: string;
  email: string;
  
  // Información del producto/servicio
  producto: string;
  descripcion: string;
  cantidad: number;
  
  // Información financiera
  precioVenta: number;
  costoCheto: number;
  descuento: number;
  impuestos: number;
  comisionPago: number;
  pagoEmpleado: number;
  canalVenta: string;
  metodoPago: string;
  
  // Estado y seguimiento
  notasVenta: string;
  fechaEntrega: string;
}

const initialFormData: SaleFormData = {
  cliente: "",
  telefono: "",
  email: "",
  producto: "",
  descripcion: "",
  cantidad: 1,
  precioVenta: 0,
  costoCheto: 0,
  descuento: 0,
  impuestos: 0,
  comisionPago: 0,
  pagoEmpleado: 0,
  canalVenta: "",
  metodoPago: "",
  notasVenta: "",
  fechaEntrega: ""
};

interface EnhancedSalesFormProps {
  onSaleCreated?: () => void;
}

export function EnhancedSalesForm({ onSaleCreated }: EnhancedSalesFormProps = {}) {
  const [formData, setFormData] = useState<SaleFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    subtotal: 0,
    total: 0,
    ganunciaNeta: 0
  });

  // Calcular valores automáticamente
  const calculateValues = (data: SaleFormData) => {
    const subtotal = data.precioVenta * data.cantidad;
    const totalConDescuento = subtotal - data.descuento;
    const total = totalConDescuento + data.impuestos;
    const ganunciaNeta = total - data.costoCheto - data.comisionPago - data.pagoEmpleado;
    
    setCalculatedValues({
      subtotal,
      total,
      ganunciaNeta
    });
  };

  const handleInputChange = (field: keyof SaleFormData, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Recalcular si es un campo numérico
    if (typeof value === 'number' || 
        ['precioVenta', 'cantidad', 'costoCheto', 'descuento', 'impuestos', 'comisionPago', 'pagoEmpleado'].includes(field)) {
      calculateValues(newData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente || !formData.producto || formData.precioVenta <= 0) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saleData = {
        ...formData,
        ganunciaNeta: calculatedValues.ganunciaNeta,
        fecha: new Date().toISOString(),
        status: "PENDING"
      };
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      
      if (response.ok) {
        toast.success("Venta registrada exitosamente");
        setFormData(initialFormData);
        setCalculatedValues({ subtotal: 0, total: 0, ganunciaNeta: 0 });
        
        // Llamar al callback si se proporciona
        if (onSaleCreated) {
          onSaleCreated();
        }
      } else {
        toast.error("Error al registrar la venta");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Registro de Venta Detallado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              <h3 className="font-semibold">Información del Cliente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cliente">
                  Cliente *
                </Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">
                  <Phone className="h-3 w-3 inline mr-1" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+52 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="email">
                  <Mail className="h-3 w-3 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Información del Producto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4" />
              <h3 className="font-semibold">Producto/Servicio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="producto">
                  Producto *
                </Label>
                <Input
                  id="producto"
                  value={formData.producto}
                  onChange={(e) => handleInputChange('producto', e.target.value)}
                  placeholder="Nombre del producto o servicio"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cantidad">
                  Cantidad
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Descripción detallada del producto o servicio"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Información Financiera */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4" />
              <h3 className="font-semibold">Información Financiera</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precioVenta">
                  Precio de Venta *
                </Label>
                <Input
                  id="precioVenta"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precioVenta}
                  onChange={(e) => handleInputChange('precioVenta', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="costoCheto">
                  Costo Cheto
                </Label>
                <Input
                  id="costoCheto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costoCheto}
                  onChange={(e) => handleInputChange('costoCheto', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="descuento">
                  Descuento
                </Label>
                <Input
                  id="descuento"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.descuento}
                  onChange={(e) => handleInputChange('descuento', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="impuestos">
                  Impuestos
                </Label>
                <Input
                  id="impuestos"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.impuestos}
                  onChange={(e) => handleInputChange('impuestos', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="comisionPago">
                  Comisión de Pago
                </Label>
                <Input
                  id="comisionPago"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.comisionPago}
                  onChange={(e) => handleInputChange('comisionPago', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="pagoEmpleado">
                  Pago a Empleado
                </Label>
                <Input
                  id="pagoEmpleado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pagoEmpleado}
                  onChange={(e) => handleInputChange('pagoEmpleado', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Canal de Venta y Método de Pago */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4" />
              <h3 className="font-semibold">Canal y Método de Pago</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="canalVenta">
                  Canal de Venta
                </Label>
                <Select 
                  value={formData.canalVenta} 
                  onValueChange={(value) => handleInputChange('canalVenta', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Discord">Discord</SelectItem>
                    <SelectItem value="Web">Página Web</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Referido">Referido</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="metodoPago">
                  Método de Pago
                </Label>
                <Select 
                  value={formData.metodoPago} 
                  onValueChange={(value) => handleInputChange('metodoPago', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="cripto">Criptomonedas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Adicional */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4" />
              <h3 className="font-semibold">Información Adicional</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaEntrega">
                  Fecha de Entrega (opcional)
                </Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={formData.fechaEntrega}
                  onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notasVenta">
                Notas de la Venta
              </Label>
              <Textarea
                id="notasVenta"
                value={formData.notasVenta}
                onChange={(e) => handleInputChange('notasVenta', e.target.value)}
                placeholder="Notas adicionales sobre la venta"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Resumen de Cálculos */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Resumen Financiero
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-background rounded border">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-lg font-semibold">
                  ${calculatedValues.subtotal.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded border">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-lg font-semibold">
                  ${calculatedValues.total.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded border">
                <div className="text-sm text-muted-foreground">Ganancia Neta</div>
                <div className={`text-lg font-semibold ${
                  calculatedValues.ganunciaNeta >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${calculatedValues.ganunciaNeta.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData(initialFormData);
                setCalculatedValues({ subtotal: 0, total: 0, ganunciaNeta: 0 });
              }}
            >
              Limpiar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Registrar Venta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
