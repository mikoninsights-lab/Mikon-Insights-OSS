# Mikon OSS - Business Intelligence Interno

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss" />
</div>

## 🎯 ¿Qué es Mikon OSS?

**Mikon OSS** es el sistema operativo interno de [Mikon Insights](https://mikoninsights.es) - una consultoría boutique de ciencia de datos aplicada a marketing y recursos humanos.

> *"La brújula que te guía y conecta al éxito"*

Así como Mikon Insights transforma datos complejos en **guías de anticipación** para sus clientes, Mikon OSS aplica esa misma filosofía internamente: monitorizar la rentabilidad, escalabilidad y eficiencia operativa **sin depender de perfiles técnicos**.

### La Filosofía Mikon

| Principio | En Clientes | En Mikon OSS |
|-----------|-------------|--------------|
| **Anticipación Estratégica** | Predicción de churn y attrition | Independence Score para prever riesgos |
| **Sinergia sin Silos** | Alinea Marketing y RRHH | Unifica proyectos, gastos y módulos |
| **Transparencia Humana** | Modelos explicables | KPIs claros sin "cajas negras" |

### El Modelo de Negocio Híbrido

Mikon Insights opera con una **Arquitectura de Anticipación** bajo el principio **Local-First**:

| Nivel | Servicio | Inversión | Tipo |
|-------|----------|-----------|------|
| **N1** | Auditoría de Salud | 950€ | Puntual |
| **N2** | Diagnóstico XAI | 1.850€ | Puntual |
| **N3** | Brújula Predictiva | 3.200€ | + Mantenimiento |
| **N4** | Módulo Anticipación | 7.500€ | + Bonus Éxito |
| **N5** | Partner Estratégico | 2.800€/mes | Recurrente |

**Mikon Lab (MicroSaaS):**
- **PersonaCraft** - Marketing Data Science (NLP, Eneatipos, Belbin)
- **CultureCraft** - People Data Science (Big Five, DISC, MBTI)
- **SourceCraft** - IA Visibility / GEO (Próximamente)

### El Problema que Resuelve

Como fundador de una consultoría unipersonal, necesitas responder constantemente:

- ¿Cuánto de mis ingresos dependen de mis horas de trabajo vs. módulos XAI escalables?
- ¿Puedo cubrir mis gastos fijos solo con ingresos de mantenimientos y MicroSaaS?
- ¿Cuánta capacidad me queda antes de tener que rechazar proyectos N3/N4?
- ¿Este nuevo diagnóstico será rentable si uso PersonaCraft o CultureCraft?

## 🔐 El "Cinturón de Seguridad" Financiero

El sistema monitoriza el **Independence Score** (Índice de Independencia):

```
Independence Score = (Ingresos Escalables) / (Gastos Fijos Mensuales) × 100
```

| Score | Estado | Significado |
|-------|--------|-------------|
| ≥150% | Óptimo | Cinturón de seguridad completo |
| 100-150% | Bueno | Gastos cubiertos por escalables |
| 50-99% | Atención | Dependencia parcial de consultoría |
| <50% | Crítico | Alta dependencia de horas |

## 🏗️ Arquitectura FullStack

### Backend (Node.js)
```
/backend
├── models/          # Mongoose schemas (User, Service, Project, FixedCost)
├── routes/          # Express routers con validación Zod
├── middleware/      # JWT auth middleware
├── seed/            # Script de ingesta desde CSV
└── server.js        # Express app
```

### Frontend (React)
```
/frontend/src
├── features/        # Folder-by-Feature architecture
│   ├── auth/        # Login, registro
│   ├── dashboard/   # KPIs, gráficos
│   ├── projects/    # CRUD proyectos
│   ├── expenses/    # CRUD gastos
│   ├── services/    # Catálogo módulos
│   └── simulator/   # ROI Simulator
├── hooks/           # Hooks avanzados
├── context/         # AuthContext
└── lib/             # API client
```

## 📊 Colecciones MongoDB Relacionadas

```
┌─────────────────┐      ┌─────────────────┐
│     Users       │      │    Services     │
│  (Autenticación)│      │ (Catálogo NLP)  │
└────────┬────────┘      └────────┬────────┘
         │ user (ref)             │ isScalable
         │                        │
┌────────┴────────┐      ┌────────┴────────┐
│   FixedCosts    │      │    Projects     │
│ (Gastos Fijos)  │      │  (Operaciones)  │
└────────┬────────┘      └────────┬────────┘
         │                        │
         └──────► AuditLog ◄──────┘
             (entityType + entityId)
```

### Datos del Seed
- **339 Operaciones** desde `Operaciones.csv`
- **179 Gastos** desde `Gastos.csv`
- **24 Servicios** únicos extraídos
- **2 Usuarios** de prueba (Admin, Manager)

### AuditLog (4ª colección relacionada)
Cada create/update/delete sobre `Project` o `Expense` queda registrado: quién (`User`), qué acción, sobre qué entidad y cuándo. Visible solo para rol `Admin` en `/audit-log`.

**Detalle de diseño**: el log se escribe de forma *fire-and-forget* (`utils/auditLogger.js`) — la respuesta al usuario no espera a que el log termine de guardarse.

## ⚡ Hooks Avanzados

### `useIndependenceScore(scalableRevenue, fixedCosts)`
Calcula el ratio de libertad financiera. Usa `useMemo` para optimización.

### `useEfficiencyScore(budget, modulesUsed, artisanHours)`
Evalúa si un proyecto aprovecha los módulos existentes o depende de horas manuales.

### `useCapacityAlert(committedHours, maxCapacity)`
Alerta visual al 90% de capacidad. Previene overbooking.

### `useROISimulator()` 
Implementado con `useReducer`. Simulador dinámico con sliders para proyectar márgenes antes de firmar contratos.

## 🌐 Internacionalización (i18n)

`react-i18next` con 3 idiomas (ES / EN / CA), selector en el header, persistencia en `localStorage`. Cobertura actual: navegación, header y pantalla de login/registro (resto de páginas pendiente de extender con la misma estructura).

## ✅ Estado de integración

Frontend y backend están conectados de extremo a extremo. No hay Supabase ni datos mock en el proyecto: `lib/api.ts` es el único cliente de datos, usado por Auth, Dashboard, Projects, Expenses, Services y Audit Log. El token JWT se gestiona en un único sitio (`AuthContext`) y se reutiliza en toda la app.

## 🛡️ Seguridad

- **JWT** para autenticación stateless
- **bcrypt** para hash de contraseñas (salt rounds: 10)
- **Zod** para validación de schemas en todas las rutas
- **Roles** (Admin, Manager) para control de acceso

## 🚀 Despliegue

### Variables de Entorno

**Backend (.env):**
```env
MONGO_URL=mongodb+srv://...
DB_NAME=mikon_oss
JWT_SECRET=tu-clave-secreta
PORT=8001
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://tu-backend.com
```

### Comandos

```bash
# Backend
cd backend
npm install
npm run seed    # Poblar DB desde CSVs
npm start       # Iniciar servidor

# Frontend
cd frontend
yarn install
yarn start      # Desarrollo
yarn build      # Producción
```

### Plataformas Recomendadas
- **Backend**: Render, Railway
- **Frontend**: Vercel, Netlify
- **Base de Datos**: MongoDB Atlas

## 📈 Tecnologías Utilizadas

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| Backend | Express.js | Framework web |
| ODM | Mongoose | Modelado MongoDB |
| Validación | Zod | Schemas y validación |
| Auth | JWT + bcrypt | Seguridad |
| Frontend | React 18 | UI Library |
| Routing | react-router-dom | SPA Navigation |
| Formularios | react-hook-form | Form management |
| Estilos | Tailwind CSS | Utility-first CSS |
| UI | Radix UI (Shadcn) | Headless components |
| Charts | Recharts | Visualización |
| Ingesta | Node fs + CSV | Lectura de archivos |
| i18n | react-i18next | ES / EN / CA |

## 👥 Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@mikon.com | admin123 | Admin |
| manager@mikon.com | manager123 | Manager |

## 📝 Entrega - Rock The Code

Este proyecto cumple con:
- ✅ Backend Node.js con Express
- ✅ Frontend React
- ✅ MongoDB con 3+ colecciones relacionadas
- ✅ Seed desde CSV con fs nativo
- ✅ Autenticación JWT con roles
- ✅ Hooks avanzados (useMemo, useReducer)
- ✅ Arquitectura clara y mantenible
- ✅ UX/UI profesional y con propósito

---

<div align="center">
  <p><strong>Mikon Insights</strong> - <a href="https://mikoninsights.es">mikoninsights.es</a></p>
  <p>🐺 La brújula que te guía y conecta al éxito</p>
  <p><em>Anticipación Estratégica · Sinergia sin Silos · Transparencia Humana</em></p>
</div>
