#!/bin/bash

# 🚀 SCRIPT DE DEPLOY PARA OMEGA STORE DASHBOARD

echo "🔥 Iniciando proceso de deploy..."

# Paso 1: Inicializar Git
echo "📂 Inicializando repositorio Git..."
git init

# Paso 2: Agregar todos los archivos
echo "📁 Agregando archivos al repositorio..."
git add .

# Paso 3: Crear commit inicial
echo "💾 Creando commit inicial..."
git commit -m "🚀 Omega Store Dashboard - Production Ready

✅ Features implementadas:
- Sistema de entrega de cuentas completo
- Dashboard con métricas en tiempo real
- Autenticación NextAuth con roles
- Base de datos Neon PostgreSQL
- Time tracking funcional
- Build exitoso para producción

🔧 Tecnologías:
- Next.js 14.2.28
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth.js
- Tailwind CSS
- shadcn/ui"

# Paso 4: Configurar rama main
echo "🌳 Configurando rama main..."
git branch -M main

echo "✅ Repositorio local preparado!"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "1. Crea un repositorio en GitHub con el nombre 'omega-store-dashboard'"
echo "2. Copia la URL del repositorio (ejemplo: https://github.com/tu-usuario/omega-store-dashboard.git)"
echo "3. Ejecuta: git remote add origin [URL-DE-TU-REPO]"
echo "4. Ejecuta: git push -u origin main"
echo "5. Ve a vercel.com para hacer el deploy"
echo ""
echo "📋 Variables de entorno para Vercel:"
echo "DATABASE_URL=postgresql://neondb_owner:npg_s0tM7QmSEgyF@ep-blue-wave-actlvqtz-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "NEXTAUTH_URL=https://tu-proyecto.vercel.app"
echo "NEXTAUTH_SECRET=new-secret-key-for-development-2024"
