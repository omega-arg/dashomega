import fs from 'fs';
import path from 'path';

// Función para asegurar que el directorio de uploads exista
export function ensureUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio de uploads creado');
  }
}
