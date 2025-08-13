# 🎮 Omega Store Dashboard

Dashboard administrativo completo para gestión de gaming services con sistema de chetadores, empleados, finanzas y más.

## ✨ Características

- 🎯 **Panel de Chetadores**: Gestión completa de órdenes gaming
- 👥 **Gestión de Empleados**: Control de tiempo y productividad
- 💰 **Sistema Financiero**: Tracking de ventas y ganancias
- 📊 **Dashboard Ejecutivo**: Métricas y reportes en tiempo real
- 🔐 **Sistema de Roles**: OWNER, ADMIN, CHEATER con permisos específicos
- 📱 **Responsive Design**: Optimizado para desktop y móvil

## 🚀 Despliegue en Vercel

### 1. Preparar repositorio
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/omega-dashboard.git
git push -u origin main
```

### 2. Configurar Vercel
1. Ve a [vercel.com](https://vercel.com) y conecta tu GitHub
2. Importa tu repositorio
3. Configura las variables de entorno:
   - `NEXTAUTH_SECRET`: Genera uno nuevo con `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Tu dominio de Vercel (ej: `https://omega-dashboard.vercel.app`)
   - `DATABASE_URL`: Para producción, considera PostgreSQL o PlanetScale

### 3. Variables de Entorno Requeridas
```env
NEXTAUTH_SECRET=tu-secret-super-seguro
NEXTAUTH_URL=https://tu-dominio.vercel.app
DATABASE_URL=tu-database-url-de-produccion
```

## 🗄️ Base de Datos

Para producción, recomendamos migrar de SQLite a PostgreSQL:

### Opción 1: Vercel Postgres
1. En tu proyecto de Vercel, ve a "Storage"
2. Crea una nueva base de datos Postgres
3. Copia la `DATABASE_URL` a tus variables de entorno

### Opción 2: PlanetScale (Recomendado)
1. Crea cuenta en [planetscale.com](https://planetscale.com)
2. Crea una nueva base de datos
3. Obtén la connection string
4. Actualiza `DATABASE_URL`

## 📦 Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de Datos**: Prisma ORM, SQLite (dev) / PostgreSQL (prod)
- **Autenticación**: NextAuth.js
- **Deployment**: Vercel

## 🔧 Comandos

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Generar Prisma Client
npx prisma generate

# Migrar base de datos
npx prisma db push
```

## 👤 Usuario Inicial

Ejecuta el script de seed para crear el usuario administrador inicial:

```bash
npm run db:seed
```

**Credenciales por defecto:**
- Email: `owner@omega.com`
- Password: `omega123`

⚠️ **¡Cambia estas credenciales inmediatamente en producción!**

## 🛡️ Seguridad

- Todas las rutas están protegidas con NextAuth.js
- Sistema de roles con permisos granulares
- Validación de datos en frontend y backend
- Sanitización de inputs para prevenir XSS

## 📱 Módulos Disponibles

1. **Dashboard Principal**: Métricas y overview
2. **Panel de Chetadores**: Gestión de órdenes gaming
3. **Empleados**: Control de tiempo y productividad
4. **Finanzas**: Tracking de ventas y ganancias
5. **Entrega de Cuentas**: Sistema de delivery
6. **Registro de Horas**: Time tracking en tiempo real

---

**Desarrollado para Omega Store** 🎮
