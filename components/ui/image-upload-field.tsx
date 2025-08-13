import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

interface ImageUploadFieldProps {
  onFileSelected: (file: File) => void;
  onPreviewGenerated: (previewUrl: string) => void;
  onReset: () => void;
  previewUrl: string | null;
  isUploading?: boolean;
  className?: string;
}

export function ImageUploadField({ 
  onFileSelected, 
  onPreviewGenerated, 
  onReset,
  previewUrl,
  isUploading = false,
  className 
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato no soportado",
        description: "Por favor sube una imagen en formato JPEG, PNG, GIF o WebP",
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Imagen demasiado grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive"
      });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onPreviewGenerated(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notificar archivo seleccionado
    onFileSelected(file);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id="payment-proof"
      />
      
      {previewUrl ? (
        <div className="relative w-full rounded-md overflow-hidden border border-slate-700">
          <img 
            src={previewUrl} 
            alt="Comprobante de pago" 
            className="w-full h-auto object-cover max-h-[200px]"
          />
          <Button 
            type="button"
            size="icon" 
            variant="destructive" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={onReset}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full h-[100px] bg-slate-800 border-slate-700 border-dashed flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span className="mt-2 text-sm">Subiendo...</span>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 mb-2" />
              <span className="text-sm">Subir comprobante de pago</span>
              <span className="text-xs mt-1">Haz clic o arrastra aquí</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
