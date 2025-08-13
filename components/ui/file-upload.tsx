import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  label?: string;
  onFileSelected: (file: File | null) => void;
  onPreviewChange: (preview: string | null) => void;
  previewUrl: string | null;
  className?: string;
}

export function FileUpload({
  label = "Comprobante de Pago",
  onFileSelected,
  onPreviewChange,
  previewUrl,
  className
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validaciones
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato no soportado. Use JPEG, PNG, GIF o WebP");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande (máximo 5MB)");
      return;
    }
    
    // Notificar archivo seleccionado
    onFileSelected(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onPreviewChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleClearFile = () => {
    onFileSelected(null);
    onPreviewChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          id="file-upload"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {!previewUrl ? (
          <Button
            type="button"
            variant="outline"
            className="w-full h-[100px] bg-slate-800 border-slate-700 border-dashed flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="mt-2 text-sm">Procesando...</span>
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm">Subir comprobante de pago</span>
                <span className="text-xs mt-1">Haz clic para seleccionar</span>
              </>
            )}
          </Button>
        ) : (
          <div className="relative rounded-md overflow-hidden border border-slate-700">
            <img 
              src={previewUrl} 
              alt="Vista previa del comprobante" 
              className="w-full h-auto max-h-[200px] object-cover" 
            />
            <Button 
              type="button" 
              size="icon" 
              variant="destructive"
              className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
              onClick={handleClearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
