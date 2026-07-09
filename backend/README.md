# Mikon Insights OSS — Backend

API REST en Node.js/Express que da servicio al panel de control interno de Mikon Insights. Ver el [README general](../README.md) para el contexto de negocio y el [README de frontend](../frontend/README.md) para la parte de cliente.

## Stack

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 4 |
| ODM | Mongoose 8 (MongoDB Atlas) |
| Validación | Zod 3 |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| IA (Ghostwriter) | `@google/generative-ai` (Gemini) |
| Ingesta de datos | `fs` nativo + `csv-parser` |

## Arquitectura MVC

```
/backend
├── models/          # Esquemas Mongoose: User, Service, Project, ProjectArchitecture, FixedCost, AuditLog
├── controllers/      # Lógica de negocio, una función nombrada y exportada por endpoint
├── routes/           # Express routers: solo declaran middleware + qué controller atiende cada ruta
├── middleware/        # auth.js — authenticateToken, requireRole, generateToken
├── utils/             # validators.js (schemas Zod), auditLogger.js (log fire-and-forget)
├── seed/              # Script de ingesta desde CSV con fs nativo
└── server.js          # Bootstrap de Express + conexión a Mongo
```

Cada archivo de `routes/` es un espejo 1:1 de su controller en `controllers/`: la ruta solo compone middleware (`authenticateToken`, `requireRole`, `validate(schema)`) con la función del controller correspondiente. Toda la lógica de negocio (queries, agregaciones, validaciones de negocio) vive en `controllers/`, nunca en `routes/`.

### `analytics.controller.js`: agregaciones en paralelo

El endpoint `/analytics/dashboard` calcula 9 métricas independientes (estadísticas de proyectos, desglose de ingresos, gastos del mes, coste fijo total, horas de mantenimiento, capacidad del usuario, eficiencia, ingresos por mes, gastos por categoría). Cada una es una función nombrada y se ejecutan concurrentemente con `Promise.all`, en vez de encadenar 9+ `await` secuenciales — reduce la latencia del endpoint más pesado de la API a la del cálculo más lento del lote, no a la suma de todos.

## Endpoints

Todas las rutas (salvo `/auth/register` y `/auth/login`) requieren `Authorization: Bearer <token>`.

| Método | Ruta | Rol requerido | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | público | Crear usuario |
| POST | `/api/auth/login` | público | Login, devuelve JWT |
| GET | `/api/auth/me` | autenticado | Usuario actual |
| PUT | `/api/auth/profile` | autenticado | Actualizar `maxHoursCapacity` propio |
| GET | `/api/projects` | autenticado | Listado paginado, filtros `category/status/search` |
| GET | `/api/projects/:id` | autenticado | Detalle |
| POST | `/api/projects` | autenticado | Crear (audit log) |
| PUT | `/api/projects/:id` | autenticado | Actualizar (audit log) |
| DELETE | `/api/projects/:id` | **Admin** | Eliminar (audit log) |
| GET | `/api/expenses` | autenticado | Listado paginado, filtros `category/frequency/startDate/endDate` |
| GET | `/api/expenses/summary/monthly` | autenticado | Resumen agregado por mes |
| GET | `/api/expenses/:id` | autenticado | Detalle |
| POST | `/api/expenses` | autenticado | Crear (audit log) |
| PUT | `/api/expenses/:id` | autenticado | Actualizar (audit log) |
| DELETE | `/api/expenses/:id` | **Admin** | Eliminar (audit log) |
| GET | `/api/services` | autenticado | Listado, filtros `category/isActive/isScalable` |
| GET | `/api/services/:id` | autenticado | Detalle |
| POST | `/api/services` | **Admin** | Crear |
| PUT | `/api/services/:id` | **Admin** | Actualizar |
| DELETE | `/api/services/:id` | **Admin** | Eliminar |
| GET | `/api/analytics/dashboard` | autenticado | KPIs, independence score, gráficos |
| POST | `/api/analytics/roi-simulator` | autenticado | Cálculo de ROI puntual (stateless) |
| POST | `/api/ghostwriter/generate` | autenticado | Generación de contenido vía Gemini |
| GET | `/api/audit-logs` | **Admin** | Historial de create/update/delete |
| GET | `/api/health` | público | Health check (estado de Mongo) |

## Colecciones y relaciones

`User` — `Project` — `FixedCost` — `Service` — `ProjectArchitecture` (relación N:M entre Project y Service) — `AuditLog` (referencia genérica a `entityType` + `entityId`, y a `User` como autor). Ver diagrama completo en el [README general](../README.md#-colecciones-mongodb-relacionadas).

## Variables de entorno

Copia `.env.example` a `.env` y rellena con tus credenciales de Atlas. **`.env` nunca se commitea** (gitignorado).

```env
MONGO_URL=mongodb+srv://...
DB_NAME=mikon_oss
JWT_SECRET=una-clave-larga-y-aleatoria
PORT=8001
CORS_ORIGINS=http://localhost:5173
GEMINI_API_KEY=            # opcional, solo para Ghostwriter IA
```

## Seed de datos

`seed/seed.js` lee `Operaciones.csv` y `Gastos.csv` con `fs.readFileSync` nativo (sin librerías de parsing externas para el CSV en sí — un parser propio maneja campos entrecomillados, formato de moneda español (punto de millares, coma decimal) y fechas `DD/MM/YYYY`). Genera 2 usuarios, ~24 servicios, ~338 proyectos y ~178 gastos fijos.

```bash
npm install
npm run seed
```

## Ejecutar en local

```bash
npm install
npm start        # producción
npm run dev      # con --watch
```

El servidor arranca en `http://localhost:8001` (o el puerto de `PORT`). `GET /api/health` confirma la conexión a MongoDB.

## Rendimiento — decisiones y mejoras futuras

- Las agregaciones independientes del dashboard se ejecutan en paralelo (`Promise.all`), no en cadena — ver sección de arquitectura arriba.
- **Pendiente / roadmap**: añadir índices explícitos en `Project` (`status`, `category`) y confirmar cobertura en `AuditLog` (`createdAt`) para acelerar los listados según crezca el volumen de datos; introducir caché de servidor (Redis) si el número de usuarios concurrentes lo justifica — con el volumen actual (cientos de documentos, un puñado de usuarios) no aporta beneficio real; y pruebas de carga (k6/Artillery) antes de un eventual salto a tráfico concurrente real.
