"use server";

import fs from 'fs';
import path from 'path';

// Función para asegurar que el directorio de uploads existe
export async function ensureUploadDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await fs.promises.access(uploadsDir);
  } catch (error) {
    // El directorio no existe, lo creamos
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    console.log('Directorio de uploads creado correctamente');
  }
  
  return { success: true };
}
