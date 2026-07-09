# Mikon Insights OSS — Frontend

Cliente React del panel de control interno de Mikon Insights. Ver el [README general](../README.md) para el contexto de negocio y el [README de backend](../backend/README.md) para la API.

## Stack

| Categoría | Tecnología |
|---|---|
| Build | Vite 6 |
| Framework | React 19 + TypeScript |
| Estilos | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Estado de servidor | TanStack Query (React Query) |
| Formularios | react-hook-form + Zod 4 |
| Routing | react-router-dom 7 |
| Animación | Framer Motion |
| Gráficos | Recharts |
| i18n | react-i18next (ES / EN / CA) |
| Notificaciones | Sonner (toasts) |

## Arquitectura: Folder-by-Feature

```
/frontend/src
├── features/            # Una carpeta por dominio de negocio, no por tipo de archivo
│   ├── auth/             # Login / registro
│   ├── dashboard/         # KPIs, Independence Score, gráfico de evolución
│   ├── projects/          # CRUD de proyectos (filtros y formulario extraídos como subcomponentes)
│   ├── expenses/          # CRUD de gastos fijos
│   ├── services/          # Catálogo de servicios/módulos
│   ├── pipeline/           # Sales pipeline (leads)
│   ├── simulator/          # Simulador de ROI y calculadora SaaS
│   ├── ghostwriter/         # Generación de contenido con IA
│   ├── audit/               # Historial de auditoría (solo Admin)
│   └── Layout.tsx            # Shell: sidebar + header, usado por todas las rutas protegidas
├── hooks/                # Hooks de dominio reutilizables entre features (ver abajo)
├── context/               # AuthContext (JWT, usuario actual, rol)
├── components/ui/          # Componentes shadcn/ui (Button, Card, Dialog, Select…)
├── lib/                   # Cliente API (api.ts) y utilidades (utils.ts)
├── i18n/                  # Configuración de react-i18next + locales/{es,en,ca}.json
├── style.css               # Tokens de marca: colores, espaciado, tipografía, clases reutilizables
└── index.css                # Variables shadcn (HSL) + Tailwind + @layer components
```

Cada feature es autocontenida: su página, subcomponentes y lógica de UI viven en la misma carpeta. La lógica de dominio reutilizable (cálculos, no fetching) se extrae a `hooks/`.

## Hooks avanzados

- **`useROISimulator`** — `useReducer` con acciones tipadas (`SET_HOURS`, `SET_MODULES`, `CALCULATE`…) para el simulador de ROI: separa el estado de los inputs del cálculo derivado, evitando recalcular en cada render.
- **`useIndependenceScore`** / **`useCapacityAlert`** / **`useEfficiencyScore`** — `useMemo` sobre datos del dashboard para evitar recomputar ratios financieros en cada render.
- **`useDashboardData`** — encapsula el `useQuery` del endpoint `/analytics/dashboard` y expone los campos que consumen las tarjetas de KPIs.
- **`useSaaSSimulator`** — cálculo de proyección de ingresos recurrentes para la calculadora SaaS.

## Sistema de diseño

- **`style.css`**: variables CSS de marca (`--mikon-primary`, `--mikon-secondary`, `--mikon-navy`…), escala de espaciado, tipografía y clases reutilizables (`.tech-card`, `.btn-primary`, `.sidebar-nav-item`, `.kpi-card`…).
- **`index.css`**: variables HSL que consume shadcn/ui (`--background`, `--primary`…) más la configuración de Tailwind (`@layer components`). El modo oscuro está forzado (`darkMode: "class"` + `<html class="dark">`).

## Internacionalización

`react-i18next` con 3 idiomas (`es`/`en`/`ca`), selector en el header, persistencia en `localStorage`. Los textos viven en `src/i18n/locales/{es,en,ca}.json`, agrupados por feature (`dashboard.*`, `projects.*`, `common.*`…).

## Ejecutar en local

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint
```

Variables de entorno (`.env`):

```env
VITE_BACKEND_URL=http://localhost:8001
```

## Autenticación

`AuthContext` guarda el JWT y el usuario decodificado, y expone `isAuthenticated` / `isAdmin`. Las rutas protegidas (`App.tsx`) redirigen a `/auth` si no hay sesión, y las que requieren rol Admin (`requireAdmin`) redirigen al dashboard si el usuario no cumple el rol.
