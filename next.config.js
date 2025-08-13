/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true 
  },
  // Configuraciones adicionales si es necesario
};

// Asegurarse de que el directorio de uploads exista
try {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio de uploads creado');
  }
} catch (err) {
  console.error('Error al crear directorio de uploads:', err);
}

module.exports = nextConfig;
