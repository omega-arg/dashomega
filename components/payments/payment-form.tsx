"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { CreditCard, Plus, X, Upload } from "lucide-react";
import { toast } from '@/hooks/use-toast';

// Define la interfaz para los pagos
interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

export function PaymentForm({ isOpen, onClose, onSubmit }: PaymentFormProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Si hay un archivo seleccionado, subir primero
    if (selectedFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al subir la imagen');
        }

        setUploadedImageUrl(result.url);
        
        // Ahora que tenemos la URL, enviamos el formulario
        submitFormWithImageUrl(e.currentTarget, result.url);
        
      } catch (error) {
        console.error("Error al subir imagen:", error);
        toast({
          title: "Error al subir la imagen",
          description: "Por favor intenta de nuevo más tarde",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // Si no hay archivo, enviamos el formulario directamente
      submitFormWithImageUrl(e.currentTarget, uploadedImageUrl);
    }
  };
  
  const submitFormWithImageUrl = (form: HTMLFormElement, imageUrl: string) => {
    const formData = new FormData(form);
    
    const paymentData = {
      clientName: formData.get('clientName') as string,
      communicationMethod: formData.get('communicationMethod') as string,
      productName: formData.get('productName') as string,
      amount: Number(formData.get('amount')),
      paymentMethod: formData.get('paymentMethod') as string,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      reviewNotes: formData.get('notes') as string || undefined,
      orderId: formData.get('orderId') as string || undefined,
      proofImage: imageUrl, // URL de la imagen subida
      managerPercentage: formData.get('managerPercentage') ? Number(formData.get('managerPercentage')) : null
    };
    
    onSubmit(paymentData);
    
    // Limpiamos el estado
    setSelectedFile(null);
    setImagePreview(null);
    setUploadedImageUrl('');
  };

  // Limpia el estado cuando se cierra el diálogo
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImagePreview(null);
      setUploadedImageUrl('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <Plus className="mr-2 h-5 w-5 text-purple-500" />
            Registrar Nuevo Pago
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="communicationMethod">Lugar donde compró</Label>
              <Input 
                id="communicationMethod" 
                name="communicationMethod" 
                required 
                placeholder="Discord, Instagram, Web..."
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
              <Label htmlFor="managerPercentage">% para el encargado</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">ID de Pedido (opcional)</Label>
              <Input 
                id="orderId" 
                name="orderId" 
                className="bg-slate-800 border-slate-700 text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urlManual">URL de imagen (opcional)</Label>
              <Input 
                id="urlManual" 
                name="urlManual"
                value={uploadedImageUrl}
                onChange={(e) => setUploadedImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
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
              <FileUpload 
                label="Comprobante de Pago (imagen)"
                onFileSelected={setSelectedFile}
                onPreviewChange={setImagePreview}
                previewUrl={imagePreview}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Pago
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
