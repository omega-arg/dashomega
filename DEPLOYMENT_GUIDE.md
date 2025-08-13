# 🚀 Guía Completa de Deployment - Omega Store Dashboard

## 📋 Pasos para subir a Vercel

### 1️⃣ **Preparar el Repositorio en GitHub**

```bash
# Navegar al directorio del proyecto
cd "/Users/omegaarg/Downloads/Proyectos/Copia de DashboardOmega 3/app"

# Inicializar git (si no está ya inicializado)
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "🎮 Initial commit - Omega Store Dashboard ready for production"

# Crear la rama main
git branch -M main

# Conectar con tu repositorio de GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/TU-USUARIO/omega-store-dashboard.git

# Subir el código
git push -u origin main
```

### 2️⃣ **Configurar Vercel**

1. Ve a [vercel.com](https://vercel.com) y regístrate/inicia sesión
2. Conecta tu cuenta de GitHub
3. Haz clic en "Add New Project"
4. Selecciona tu repositorio `omega-store-dashboard`
5. Configure las siguientes opciones:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### 3️⃣ **Variables de Entorno en Vercel**

En la sección "Environment Variables" de tu proyecto en Vercel, agrega:

```bash
# Autenticación
NEXTAUTH_SECRET=tKYSoS8sNvuXTa5E1jdZrek2YcVlL/Cc2gOixqUZmac=
NEXTAUTH_URL=https://tu-proyecto.vercel.app

# Base de datos (temporal - SQLite)
DATABASE_URL=file:./prisma/dev.db
```

**⚠️ IMPORTANTE**: Cambia `tu-proyecto` por el nombre real que te asigne Vercel.

### 4️⃣ **Migrar a Base de Datos de Producción**

Para producción, necesitas cambiar de SQLite a PostgreSQL:

#### **Opción A: Vercel Postgres (Recomendada)**

1. En tu proyecto de Vercel, ve a la pestaña "Storage"
2. Crea una nueva base de datos Postgres
3. Copia la `DATABASE_URL` que te proporcione
4. Actualiza la variable de entorno en Vercel

#### **Opción B: PlanetScale**

1. Regístrate en [planetscale.com](https://planetscale.com)
2. Crea una nueva base de datos
3. Obtén la connection string
4. Actualiza `DATABASE_URL` en Vercel

### 5️⃣ **Actualizar Schema de Prisma para Producción**

Si usas PostgreSQL, actualiza `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Cambiar de "sqlite" a "postgresql"
  url      = env("DATABASE_URL")
}

// ... resto del schema igual
```

### 6️⃣ **Scripts de Deployment**

Agrega estos scripts a tu repositorio:

**`scripts/deploy.sh`:**
```bash
#!/bin/bash
echo "🚀 Preparando deployment..."

# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Crear usuario inicial (solo en primera ejecución)
# npm run seed

echo "✅ Deployment preparado!"
```

**`scripts/seed-production.js`:**
```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Maico2005', 10)
  
  const owner = await prisma.user.upsert({
    where: { email: 'deltaarg1@gmail.com' },
    update: {},
    create: {
      email: 'deltaarg1@gmail.com',
      name: 'Owner Principal',
      role: 'OWNER',
      password: hashedPassword,
      isActive: true,
      country: '🇺🇸 Estados Unidos',
      joinedAt: new Date(),
      lastActiveAt: new Date()
    }
  })

  console.log('✅ Usuario owner creado:', owner.email)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 7️⃣ **Deploy Automático**

Una vez configurado todo:

1. Haz cualquier cambio en tu código
2. Commit y push:
   ```bash
   git add .
   git commit -m "✨ Update for production"
   git push
   ```
3. Vercel automáticamente detectará el cambio y desplegará

### 8️⃣ **Post-Deployment**

Después del primer deploy:

1. Ve a tu URL de Vercel (ej: `https://omega-store-dashboard.vercel.app`)
2. Ejecuta el seed de datos (una sola vez):
   ```bash
   # En la terminal de Vercel o localmente conectado a prod
   npm run seed
   ```
3. Inicia sesión con:
   - **Email**: `deltaarg1@gmail.com`
   - **Password**: `Maico2005`

### 9️⃣ **Dominio Personalizado (Opcional)**

1. En Vercel, ve a Project Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones
4. Actualiza `NEXTAUTH_URL` con tu nuevo dominio

## 🔐 **Seguridad en Producción**

### **Cambiar Credenciales por Defecto**
1. Inicia sesión como owner
2. Cambia inmediatamente la contraseña
3. Crea otros usuarios admin según necesites

### **Variables de Entorno Seguras**
- Nunca commits archivos `.env` al repositorio
- Usa secrets fuertes para `NEXTAUTH_SECRET`
- Considera usar variables específicas para prod/dev

### **Base de Datos**
- Usa siempre PostgreSQL en producción
- Configura backups automáticos
- Monitorea el uso y performance

## 📊 **Monitoreo y Maintenance**

### **Analytics**
- Vercel proporciona analytics automáticos
- Monitorea errores desde el dashboard de Vercel

### **Updates**
- Usa branches para features nuevas
- Haz deploys desde `main` branch
- Mantén backups de la base de datos

## 🆘 **Troubleshooting**

### **Error: Module not found**
```bash
# Limpiar cache y reinstalar
rm -rf .next node_modules
npm install
```

### **Error: Prisma Client**
```bash
# Regenerar Prisma Client
npx prisma generate
```

### **Error: Environment Variables**
- Verifica que todas las variables estén configuradas en Vercel
- Redeploya después de cambiar variables

---

## 📞 **¿Necesitas Ayuda?**

Si encuentras problemas durante el deployment:

1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté conectada correctamente

**¡Tu Omega Store Dashboard estará listo para conquistar el mundo gaming! 🎮🚀**
