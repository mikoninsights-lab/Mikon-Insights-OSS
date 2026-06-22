# Mikon OSS - Product Requirements Document

## Project Overview
**Mikon OSS** es una plataforma de Business Intelligence Interno para Mikon Insights, una consultoría boutique de ciencia de datos aplicada a marketing y talento (HR).

## Architecture

### Backend Stack
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB con Mongoose ODM
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **Data Ingestion**: Native fs + CSV parsing

### Frontend Stack
- **Library**: React 18
- **Routing**: react-router-dom
- **Forms**: react-hook-form + @hookform/resolvers/zod
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Shadcn)
- **Charts**: Recharts

## User Personas

### Admin (Fundador)
- Acceso completo a todas las funcionalidades
- Puede crear/eliminar proyectos, gastos, servicios
- Visualiza todos los KPIs y métricas

### Manager
- Acceso a lectura y edición limitada
- Puede crear y editar proyectos
- Sin permisos de eliminación

## Core Requirements (Static)

1. ✅ Autenticación JWT con roles
2. ✅ Dashboard con KPIs de rentabilidad
3. ✅ CRUD de Proyectos con paginación
4. ✅ CRUD de Gastos Fijos
5. ✅ Catálogo de Servicios/Módulos
6. ✅ Simulador ROI con sliders
7. ✅ Hooks avanzados (useMemo, useReducer)
8. ✅ Seed desde CSV con fs nativo
9. ✅ Validación Zod en backend

## What's Been Implemented

### March 23, 2026
- [x] Backend Node.js/Express completo
- [x] 5 colecciones MongoDB (User, Service, Project, ProjectArchitecture, FixedCost)
- [x] Script seed.js que lee CSVs con fs
- [x] 339 proyectos + 179 gastos importados
- [x] Sistema de autenticación JWT
- [x] Dashboard con KPIs en tiempo real
- [x] useIndependenceScore, useCapacityAlert hooks
- [x] useROISimulator con useReducer
- [x] UI responsive con dark theme Mikon
- [x] Navegación sidebar
- [x] CRUD completo con modales
- [x] README estratégico

### April 2026 — UI/UX Integration (6 bloques XAI Authority)
- [x] **Bloque 1**: Animaciones Framer Motion en Dashboard
- [x] **Bloque 2**: Sidebar colapsable con persistencia en localStorage (`mikon_sidebar_collapsed`)
- [x] **Bloque 3**: Sales Pipeline Kanban en `/pipeline` con mock leads y scoring por temperatura
- [x] **Bloque 4**: Tokens CSS de temperatura (`--hot`, `--warm`, `--cold`) en `index.css`
- [x] **Bloque 5**: Migración a TanStack React Query para fetching y mutations
- [x] **Bloque 6** (April 20, 2026): **Ghostwriter** en `/ghostwriter` con integración Gemini real
    - Endpoint `POST /api/ghostwriter/generate` con `@google/generative-ai` SDK
    - Modelos: `gemini-flash-lite-latest` (primary), fallback a `gemini-2.5-flash-lite`
    - Retry con backoff exponencial ante 503
    - Formulario: Tipo de contenido, Servicio, Audiencia, Modelo (Flash/Pro), Briefing
    - Biblioteca de assets persistida en localStorage (`mikon_assets`, cap 50)
    - Tested 100% backend, 95%+ frontend (iteration_2.json)

## Prioritized Backlog

### P0 (Crítico) - Completado
- ✅ Login/Auth funcional
- ✅ Dashboard carga datos
- ✅ Navegación entre páginas
- ✅ Ghostwriter con Gemini real

### P1 (Alto)
- [ ] Backend endpoint `/api/assets` para persistir ghostwriter content en MongoDB (actualmente solo localStorage)
- [ ] Pipeline Kanban: conectar a datos reales desde MongoDB en vez de mock
- [ ] Implementar ProjectArchitecture para vincular proyectos con módulos
- [ ] Filtros avanzados por fecha en gastos
- [ ] Export a CSV/Excel

### P2 (Medio)
- [ ] Gráficos de tendencia mensual
- [ ] Alertas email cuando capacidad > 90%
- [ ] Multi-usuario con permisos granulares
- [ ] Ghostwriter: historial con búsqueda/filtros
- [ ] Ghostwriter: editor WYSIWYG para refinamiento post-generación

### P3 (Bajo)
- [ ] Dashboard customizable
- [ ] Integración calendario
- [ ] Mobile app

## Technical Debt
- Chart warnings en recharts (responsive container, "Received NaN for children" — pre-existente)
- Optimizar queries de agregación MongoDB
- GhostwriterPage.jsx ~590 líneas; considerar extraer `AssetsLibrary` y `GeneratorForm` a sub-componentes si crece
- Considerar renombrar UI label "Gemini Pro" a "Gemini Flash (alta calidad)" ya que la cuenta del usuario no tiene Pro habilitado

## Deployment Notes
- Backend: Puerto 8001 (Express)
- Frontend: Puerto 3000 (React)
- MongoDB: MONGO_URL desde .env
- GEMINI_API_KEY en `/app/backend/.env` (user-provided, paid Google AI Studio account)

