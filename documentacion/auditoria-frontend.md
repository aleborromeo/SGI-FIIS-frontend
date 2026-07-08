# Auditoría Técnica del Frontend — SGI-FIIS

**Fecha:** 2026-07-07 · **Rama:** `develop` (commit `34ec1f9`) · **Alcance:** solo lectura y análisis, previo al desarrollo del módulo **"Bandeja Lógica de Trámites y Subsanaciones"** (`src/pages/tramites/` y `src/pages/observations/`).

**Stack:** React 19.2 + TypeScript 6.0 + Vite 8 + react-router-dom 7 + lucide-react · Tests: Vitest 4 + Testing Library (jsdom) · Lint: oxlint 1.71 · Gestor de paquetes: **npm** (`package-lock.json` versionado).

---

## (a) Resumen ejecutivo

El proyecto está en una etapa temprana pero funcional: compila sin errores de TypeScript, el lint pasa con 0 errores (6 warnings) y los 10 tests existentes pasan. Hay un design system definido (DESIGN.MD + variables CSS en `index.css` + componentes en `components/ui/`) y un patrón claro de página/ruta/servicio que los módulos `projects`, `evaluations` y `progressreports` siguen de forma razonablemente consistente.

**Los puntos que más te afectan:**

1. **`src/pages/tramites/` está completamente vacío** (solo `.gitkeep`). No existe ruta, servicio, tipo ni entrada de menú para trámites. Partes de cero, pero el dominio ya existe implícitamente: los dashboards (`types/auth.ts`) manejan contadores de "procedures" y `observationService` opera sobre `procedureId`.
2. **`src/pages/observations/` ya tiene una implementación funcional** (`ObservationsPanel.tsx` + test + ruta `/observations/panel` + `observationService`), pero está escrita 100 % con estilos inline y colores hardcodeados, **sin usar el design system** — es el módulo más inconsistente del proyecto y probablemente tengas que refactorizarlo o convivir con él.
3. **`npm run test` falla en esta máquina Windows** por timeout de los workers (pool `forks` de Vitest); con `npx vitest run --pool=threads` los 10 tests pasan. Tenlo en cuenta antes de asumir que "rompiste" algo.
4. Las capas `api/`, `api/mocks/`, `hooks/`, `utils/`, `data/`, `components/business/` y `assets/styles/` **existen solo como carpetas vacías con `.gitkeep`**: la arquitectura declarada aún no está implementada. Los mocks reales viven inline en las páginas o en los archivos `.test.tsx`.
5. Conviven **tres sistemas de estilo** (variables CSS + clases utilitarias, archivos `.css` por página, e inline styles masivos). Para tu módulo: usa componentes de `components/ui/` + variables CSS, que es la dirección del design system.

No hay problemas críticos que bloqueen el desarrollo. Los hallazgos completos están en la sección (e).

---

## (b) Mapa de arquitectura y convenciones que DEBES seguir

### Estructura de carpetas (estado real)

| Carpeta | Responsabilidad prevista | Estado actual |
|---|---|---|
| `src/api/` + `src/api/mocks/` | Capa HTTP / mocks | **Vacía** (`.gitkeep`). El cliente HTTP real está en `src/services/api.ts` |
| `src/components/ui/` | Componentes base del design system | 10 componentes + `ui.css` (ver inventario) |
| `src/components/common/` | Componentes compartidos no-UI-base | Solo `Spinner.tsx` |
| `src/components/business/` | Componentes de dominio | **Vacía** |
| `src/context/` | Estado global | `AuthContext.tsx` (auth + roles) |
| `src/hooks/` | Hooks reutilizables | **Vacía** |
| `src/layout/` | Layouts | `Sidebar.tsx` (menú real), `MainLayout.tsx` (**muerto**, nadie lo importa) |
| `src/pages/<modulo>/` | Una carpeta por módulo funcional, en minúsculas | 15 módulos; 8 son carpetas vacías (`convocatorias`, `documents`, `reports`, `researchgroups`, `researchlines`, `resolutions`, `tramites`, `users`) |
| `src/services/` | Un `<entidad>Service.ts` por dominio, sobre `api.ts` | 7 servicios |
| `src/types/` | Tipos compartidos | Solo `auth.ts` (auth + DTOs de dashboards) |
| `src/utils/`, `src/data/` | Utilidades / datos estáticos | **Vacías** |
| `src/assets/styles/` | Estilos globales extra | **Vacía**; lo global vive en `src/index.css` |

> Nota: el módulo "convocatorias" mencionado en el enunciado **no está implementado** — su carpeta está vacía. Los módulos de referencia reales son `projects`, `evaluations`, `progressreports`, `observations`, `thesis`, `dashboards` y `auth`.

### Patrón de página (el estándar de facto — cópialo de `MyEvaluations.tsx`)

- Archivo `PascalCase.tsx` en `src/pages/<modulo>/`, exportando `export const NombreVista: React.FC = () => {...}` (named export, **no** default export; solo `App.tsx` usa default).
- Estructura visual estándar:
  ```tsx
  <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', ... marginBottom: '32px' }}>
      <div>
        <h1 className="text-headline-lg">Título de la Vista</h1>
        <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Subtítulo.</p>
      </div>
      {/* botón de acción primaria */}
    </div>
    <Card><CardContent>{/* tabla o contenido */}</CardContent></Card>
  </div>
  ```
- Datos: `useEffect` + `service.getX().then(...).catch(...).finally(() => setLoading(false))` con estados `loading` / `error` locales (`useState`). No hay react-query ni gestor de estado global de datos.
- Parámetros: `useParams` para rutas dinámicas (`/projects/:id`) o `new URLSearchParams(useLocation().search)` para query strings (`?procedureId=1`, patrón usado en `ObservationsPanel` y `EvaluationForm`).
- Iconos: siempre `lucide-react`, tamaño 16–24, pasados como `icon={<X size={18}/>}` a `Button`.

### Registro de rutas (en `src/App.tsx`, único router)

Toda vista privada se envuelve en `ProtectedRoute` (redirige a `/login` si no hay sesión) + `DashboardContainer` (layout con Sidebar, topbar móvil y footer):

```tsx
<Route path="/tramites" element={<ProtectedRoute><DashboardContainer><TramitesInbox /></DashboardContainer></ProtectedRoute>} />
```

Convención de paths: `/<modulo>` para listados y `/<modulo>/<accion>` para vistas específicas (`/evaluations/my-evaluations`, `/observations/panel`, `/progressreports/review`). El comodín `*` redirige a `/` (WelcomePage pública).

Para que tu vista aparezca en el menú, agrega el ítem en el array `navGroups` de [Sidebar.tsx](src/layout/Sidebar.tsx) (id, label, icono lucide de 20px, path).

### Capa de servicios

- Un archivo `src/services/<entidad>Service.ts` que exporta un objeto literal con métodos async, todos delegando en `api`/`fetchApi` de [api.ts](src/services/api.ts).
- `api.ts` es un wrapper de `fetch` con: base `/api/v1` (proxy de Vite → `http://localhost:8080`), inyección de `Authorization: Bearer <sgi_token>` desde localStorage, manejo centralizado de 401 (limpia sesión y redirige a `/login`), 403, errores JSON/texto y 204.
- Dos estilos conviven: `api.get<T>(...)`/`api.post<T>(...)` (solo `authService`) y `fetchApi<T>(endpoint, { method, body: JSON.stringify(...) })` (el resto). **Preferir `api.get/post/patch`** — es el más nuevo y evita el `JSON.stringify` manual.
- Los tipos de dominio hoy se declaran **dentro del service** (`Observation` en `observationService.ts`, `Project` en `projectService.ts`). Para tu módulo es más limpio ponerlos en `src/types/tramites.ts`, pero si el equipo prefiere consistencia literal, decláralos junto al service.

### Autenticación y roles

- `AuthContext` ([AuthContext.tsx](src/context/AuthContext.tsx)) expone `{ isAuthenticated, user, roles, currentRole, loading, error, login, logout, switchRole, ... }`. Se consume con `useContext(AuthContext)` directo — **no existe hook `useAuth()`** (la carpeta `hooks/` está vacía).
- Roles conocidos (códigos usados en `Sidebar.getRoleLabel` y `RoleDashboards`): `ADMIN`, `ESTUDIANTE`, `DOCENTE_INVESTIGADOR`, `COORDINADOR_GRUPO`, `DIRECTOR_INVESTIGACION`, `DECANO`, `EVALUADOR`. Para renderizar la bandeja según rol: `const { currentRole } = useContext(AuthContext)` y ramificar como hace `RoleDashboards.tsx`.
- Sesión: token JWT en `localStorage['sgi_token']`, usuario en `localStorage['sgi_user']`.

### Sistema de estilos

- **Fuente de verdad:** [DESIGN.MD](DESIGN.MD) (raíz) — Material-style tokens: primario `#002045` (azul institucional), Inter, radios 0.25–1.5rem, sombras sm/md. Existe un segundo `src/assets/diseños/DESIGN.md` con contenido *distinto* (duplicación a resolver con el equipo; el de la raíz coincide con las variables implementadas).
- **`src/index.css`:** define todas las variables CSS (`--primary`, `--surface-*`, `--outline-variant`, `--error`, `--radius-*`, `--stack-*`, `--shadow-*`), reset global, clases tipográficas utilitarias (`.text-display-lg`, `.text-headline-lg`, `.text-headline-md`, `.text-title-lg`, `.text-body-lg`, `.text-body-md`, `.text-label-md`, `.text-caption`), `.container-main` y `.fade-in`. **Ojo:** `.text-title-md`, `.text-body-sm` y `var(--success)` se usan en algunas páginas pero **no existen** — no los copies.
- **`src/components/ui/ui.css`:** clases de los componentes base (`.btn*`, `.card*`, `.badge*`, `.alert*`, `.input`, `.select`, `.textarea`, `.table*`). Se importa automáticamente al importar cualquier componente de `ui/`.
- **CSS por página:** las páginas grandes (`WelcomePage`, `LoginPage`, `RegisterPage`, `DashboardContainer`, `RoleDashboards`) tienen su `.css` hermano con clases prefijadas (`sgi-*`, `login-*`). Las páginas de módulos (`projects`, `evaluations`...) usan componentes UI + inline styles puntuales con variables CSS.
- **Convención recomendada para tu módulo:** componentes de `ui/` + clases tipográficas + variables CSS en inline styles puntuales (como `MyEvaluations`). Si necesitas mucho CSS propio, crea `TramitesInbox.css` junto a la página con prefijo propio.

### Tests

- Archivo `<Vista>.test.tsx` **junto a la página** (no hay carpeta `__tests__`).
- Patrón: Vitest + `@testing-library/react`, render dentro de `<MemoryRouter>`, `vi.mock('../../services/xService')` para el servicio, asserts con `screen.getByText` / `getByRole` y `waitFor` para lo async. `ObservationsPanel.test.tsx` es el mejor ejemplo (mock de servicio con `vi.mocked(...).mockResolvedValue`).
- Config en `vite.config.ts` (`test: { environment: 'jsdom', globals: true, coverage: v8 }`). No hay archivo setup ni jest-dom (por eso los asserts usan `toBeDefined()` y no `toBeInTheDocument()`).

---

## (c) Inventario de componentes / hooks / servicios reutilizables

### Componentes UI — `src/components/ui/`

| Componente | Ruta | API relevante |
|---|---|---|
| `Button` | [Button.tsx](src/components/ui/Button.tsx) | `variant: 'primary'\|'secondary'\|'danger'`, `icon`, resto de props nativas. ⚠️ hace `console.log` si no le pasas `onClick` |
| `Card`, `CardHeader`, `CardContent` | [Card.tsx](src/components/ui/Card.tsx) | `interactive` (hover shadow) |
| `Badge` | [Badge.tsx](src/components/ui/Badge.tsx) | `variant: 'success'\|'warning'\|'error'\|'info'\|'neutral'`, `icon`. Ideal para estados de trámite |
| `Input` | [Input.tsx](src/components/ui/Input.tsx) | `label`, `error`, `helpText` |
| `Select` | [Select.tsx](src/components/ui/Select.tsx) | `label`, `error`, `helpText`, `options: {value,label}[]` |
| `Textarea` | [Textarea.tsx](src/components/ui/Textarea.tsx) | `label`, `error`, `helpText` |
| `TableContainer/Head/Body/Row/Header/Cell` | [Table.tsx](src/components/ui/Table.tsx) | `TableContainer` ya incluye `<table>` con scroll horizontal. Base para la bandeja |
| `Alert` | [Alert.tsx](src/components/ui/Alert.tsx) | Solo `variant='warning'` implementado, `title` |
| `Stepper` | [Stepper.tsx](src/components/ui/Stepper.tsx) | `steps: {id,label,status: 'listo'\|'aprobado'\|'observado'\|'actual', sublabel}[]`. Útil para el flujo del trámite |
| `Timeline`, `TimelineItem` | [Timeline.tsx](src/components/ui/Timeline.tsx) | `status: 'error'\|'active'\|'success'\|'pending'`, `badge`, `isLast`. Útil para historial de subsanaciones |

### Componentes comunes — `src/components/common/`

| Componente | Ruta | Notas |
|---|---|---|
| `Spinner` | [Spinner.tsx](src/components/common/Spinner.tsx) | `size: 'small'\|'medium'\|'large'`, `color`, `light` |

**No existen** (tendrás que crearlos o prescindir): Modal/Dialog, Toast/Notification, Pagination, Tabs, filtros reutilizables, EmptyState, upload de archivos. `components/business/` está vacío — si creas algo de dominio reutilizable (p. ej. `TramiteStatusBadge`, `FileUploadBox`), ese es su lugar.

### Layout

| Pieza | Ruta | Notas |
|---|---|---|
| `DashboardContainer` | [DashboardContainer.tsx](src/pages/dashboards/DashboardContainer.tsx) | **El layout real** de toda vista privada (Sidebar + topbar móvil + footer) |
| `Sidebar` | [Sidebar.tsx](src/layout/Sidebar.tsx) | Menú `navGroups` — aquí registras tu entrada de "Trámites" |
| `MainLayout` | [MainLayout.tsx](src/layout/MainLayout.tsx) | ⚠️ Código muerto, no usar |

### Servicios — `src/services/`

| Servicio | Ruta | Endpoints |
|---|---|---|
| `api` / `fetchApi` | [api.ts](src/services/api.ts) | Cliente HTTP base (`/api/v1`, JWT, manejo 401/403) |
| `authService` | [authService.ts](src/services/authService.ts) | login, profile, register, verify, `getDashboardData` |
| `observationService` | [observationService.ts](src/services/observationService.ts) | `getByProcedureId(procedureId)`, `addRemedy(observationId, content)` + tipo `Observation` — **directamente relevante para tu módulo** |
| `projectService` | [projectService.ts](src/services/projectService.ts) | CRUD básico de proyectos + tipo `Project` |
| `evaluacionService` | [evaluacionService.ts](src/services/evaluacionService.ts) | asignar jurados, enviar resultado |
| `thesisService` | [thesisService.ts](src/services/thesisService.ts) | planes/informes de tesis, aprobar/observar/rectificar por rol |
| `userService` | [userService.ts](src/services/userService.ts) | `getAll`, `getById` + tipo `User` |

### Tipos — `src/types/`

Solo [auth.ts](src/types/auth.ts): `User`, `LoginResponse`, `UserProfile`, `AlertItem` y los 7 DTOs `Dashboard*Response`. Estos últimos ya modelan contadores de trámites (`pendingProcedures`, `proceduresUnderReview`, `approvedProcedures`, `observedProcedures`, `proceduresWithCoordinator/Director/Dean`, `completedProcedures`...) — **úsalos como referencia del vocabulario de estados que espera el backend**. No existe ningún tipo `Tramite`/`Procedure` ni `Document`.

### Hooks y contextos

- `AuthContext` + `AuthProvider` ([AuthContext.tsx](src/context/AuthContext.tsx)) — único estado global. No hay hooks personalizados.

---

## (d) Estado actual de `tramites/` y `observations/`

### `src/pages/tramites/` — vacío total

- Contiene solo `.gitkeep`. No hay ruta en `App.tsx`, ni servicio, ni tipos, ni entrada en el Sidebar, ni mocks. La palabra "trámites" solo aparece en textos de dashboards y en un ancla decorativa del WelcomePage (`#tramites`).
- Punto de partida real: los DTOs de dashboards en `types/auth.ts` definen el ciclo de vida implícito del trámite (presentado → en revisión → con coordinador/director/decano → aprobado/observado/rechazado/completado) y `observationService` ya opera sobre `procedureId`.

### `src/pages/observations/` — implementado pero fuera del design system

- **[ObservationsPanel.tsx](src/pages/observations/ObservationsPanel.tsx)** (263 líneas): panel de dos columnas (lista de observaciones del jurado + formulario de subsanación). Lee `?procedureId=` de la URL (default `'1'` hardcodeado "for testing"). Carga con `observationService.getByProcedureId`, envía subsanación con `addRemedy` **en bucle secuencial sobre cada observación pendiente** (misma justificación para todas).
- **Deudas dentro del componente:** todo inline styles con colores hardcodeados (`#1e3a8a`, `#fee2e2`...) sin variables CSS ni componentes `ui/`; el input de archivo existe pero **el archivo nunca se sube al backend** (solo se limpia el ref); feedback vía `alert()`; estados de observación comparados contra el string `'SUBSANADO'` sin tipo/enum.
- **[ObservationsPanel.test.tsx](src/pages/observations/ObservationsPanel.test.tsx)**: 3 tests, buen patrón de mocking del servicio — pasa.
- **Ruta registrada:** `/observations/panel` en `App.tsx`; entrada "Mis Observaciones" en el Sidebar.
- **Servicio:** `observationService` con tipo `Observation` (`id, procedureId, type, content, status, createdAt, remedy?, remediedAt?`).

**Implicación:** tu "Bandeja de Trámites" sería la vista de lista (nueva, en `tramites/`) y el `ObservationsPanel` existente es el detalle de subsanación al que enlazarías con `?procedureId=`. Coordina con el equipo si el panel actual se refactoriza al design system o se reemplaza.

---

## (e) Salud del código — resultados de comandos y problemas por severidad

### Resultados de los comandos (2026-07-07)

| Comando | Resultado |
|---|---|
| `npm run lint` (oxlint) | ✅ **0 errores, 6 warnings** (detalle abajo) |
| `npx tsc -b --noEmit` | ✅ **0 errores** (tras `npm install`; con `node_modules` desactualizado daba 23 errores TS2307 de módulos faltantes) |
| `npm run test` (vitest, pool `forks` por defecto) | ❌ **Falla en esta máquina Windows**: los 4 workers hacen timeout (`[vitest-pool-runner]: Timeout waiting for worker to respond`), 0 tests ejecutados |
| `npx vitest run --pool=threads` | ✅ **4 archivos, 10/10 tests pasan** (37 s) |

Warnings de oxlint:

1. `src/pages/WelcomePage.tsx:67` — `exhaustive-deps`: falta `slides.length` en deps de `useEffect`.
2. `src/pages/auth/LoginPage.tsx:28` — `exhaustive-deps`: falta `clearError`.
3. `src/components/ui/Timeline.tsx:69` — `const-comparisons`: expresión lógica redundante (ambos lados iguales).
4. `src/services/api.ts:49` — catch param `e` sin usar.
5. `src/services/api.ts:54` — catch param `innerError` sin usar.
6. `src/context/AuthContext.tsx:19` — `only-export-components`: exportar contexto + componente en el mismo archivo rompe Fast Refresh.

### Problemas clasificados

#### 🔴 Alto

| # | Problema | Evidencia |
|---|---|---|
| A1 | **`npm run test` inutilizable en Windows local** con el pool `forks` por defecto (timeout de workers). El CI (sonar.yaml, Linux) puede pasar mientras localmente nadie puede correr tests con el script oficial. Workaround verificado: `--pool=threads`. | Salida de vitest arriba |
| A2 | **Navegación rota en el Sidebar**: "Dashboard" apunta a `/` (WelcomePage pública, fuera del panel) en vez de `/dashboard`; "Métricas" (`/metrics`), "Directorio" (`/users`) y "Líneas Inv." (`/lines`) apuntan a rutas inexistentes → el comodín `*` expulsa al usuario a la página de bienvenida. | [Sidebar.tsx:10-33](src/layout/Sidebar.tsx#L10-L33), [App.tsx:96](src/App.tsx#L96) |
| A3 | **Subsanación incompleta en `ObservationsPanel`**: el documento corregido nunca se envía al backend (no hay upload); la misma justificación se aplica en N requests secuenciales (una por observación) sin atomicidad — si falla la request k, quedan subsanaciones parciales. | [ObservationsPanel.tsx:44-59](src/pages/observations/ObservationsPanel.tsx#L44-L59) |
| A4 | **`coverage/` versionado en git** y ausente de `.gitignore` (26 archivos HTML/lcov generados). Contamina diffs y puede desincronizarse del código. | `coverage/` en el repo; [.gitignore](.gitignore) |
| A5 | **Doble lockfile**: el repo usa npm (`package-lock.json`) pero hay un `pnpm-lock.yaml` local sin trackear. Mezclar gestores producirá `node_modules` inconsistentes entre compañeros. | `git status` |

#### 🟠 Medio

| # | Problema | Evidencia |
|---|---|---|
| M1 | `Input`/`Select`/`Textarea` generan el `id` con `Math.random()` **en cada render** → el `htmlFor` del label se re-asocia a un id nuevo en cada re-render (accesibilidad y tests frágiles). Debería ser `React.useId()`. | [Input.tsx:12](src/components/ui/Input.tsx#L12), Select, Textarea |
| M2 | Clases CSS y variables **inexistentes** en uso: `.text-title-md`, `.text-body-sm` (no definidas en `index.css`) y `var(--success)` (no definida en `:root`) → estilos silenciosamente ausentes (el botón "Aprobar" no es verde). | [ReviewProgressReports.tsx:34-60](src/pages/progressreports/ReviewProgressReports.tsx#L34-L60), AssignReviewers:102, EvaluationForm:124 |
| M3 | **Feedback vía `alert()` nativo en 8 archivos** (19 llamadas) — no hay Toast/Modal. UX inconsistente y bloqueante. | ObservationsPanel, ThesisTraceability, AssignReviewers, EvaluationForm, ProjectMonitoring, RegisterPage |
| M4 | **Tres sistemas de estilo conviven** (design system `ui/` + variables, CSS por página `sgi-*`, inline styles con hex hardcodeados). `ObservationsPanel` y `App.tsx` (spinner de ProtectedRoute) ignoran por completo las variables CSS. | Comparar [MyEvaluations.tsx](src/pages/evaluations/MyEvaluations.tsx) vs [ObservationsPanel.tsx](src/pages/observations/ObservationsPanel.tsx) |
| M5 | **Tipado laxo generalizado**: `user: any` en AuthContext, `catch (err: any)`, `.then((data: any)` en páginas, `getByEvaluator(): Promise<any[]>`. Los tipos de dominio se declaran dentro de los services en vez de `types/`. | AuthContext.tsx:7, ProjectsList.tsx:18, evaluacionService.ts |
| M6 | Ruta muerta: `NewProposal` navega a `/thesis` tras crear un plan, ruta que no existe → redirige a WelcomePage. | [NewProposal.tsx:51](src/pages/projects/NewProposal.tsx#L51) |
| M7 | `Button` hace `console.log` en producción cuando no recibe `onClick` (los botones "Ver", "Aprobar", "Observar", "Guardar Avance" de varias páginas no tienen handler y solo loguean). | [Button.tsx:17](src/components/ui/Button.tsx#L17) |
| M8 | **DESIGN.md duplicado y divergente**: `DESIGN.MD` (raíz) ≠ `src/assets/diseños/DESIGN.md` (hashes distintos). Riesgo de seguir la guía equivocada. | Ambos archivos |
| M9 | Datos mock inline en páginas que aparentan estar conectadas (`MyEvaluations`, `ReviewProgressReports` renderizan arrays hardcodeados; los tests dependen de esos literales). `api/mocks/` vacío. | MyEvaluations.tsx:13-16 |
| M10 | Warnings de lint reales: deps faltantes en `useEffect` (WelcomePage, LoginPage) y comparación redundante en Timeline. | Salida de oxlint |

#### 🟡 Bajo

| # | Problema | Evidencia |
|---|---|---|
| B1 | Identidad del proyecto sin configurar: `"name": "tmp-vite"` en package.json, `<title>tmp-vite</title>` y `lang="en"` en index.html (la app es en español). | package.json:2, index.html |
| B2 | `MainLayout.tsx` es código muerto (nadie lo importa; `DashboardContainer` es el layout real). | src/layout/MainLayout.tsx |
| B3 | Imágenes sin optimizar en `src/assets/images/`: varios PNG de 5–9 MB (`congresos.png` 9.6 MB, `reconocimineto.png` 9.6 MB — además con typo) que inflan el bundle si se importan. | src/assets/images/ |
| B4 | Inconsistencias menores de estilo de código: imports con extensión `.tsx` solo en App.tsx; `<td>` crudo mezclado con `TableCell` en ProjectsList (filas de loading/empty); `Alert` solo implementa variante `warning`. | ProjectsList.tsx:70-75 |
| B5 | `procedureId`/`evaluacionId`/`projectId` con default `'1'` "for testing" en 3 páginas — riesgo de operar sobre el expediente equivocado si se navega sin query param. | ObservationsPanel.tsx:9, EvaluationForm.tsx:23, AssignReviewers.tsx:15 |

---

## (f) Recomendaciones concretas para implementar tu módulo

### Estructura propuesta (consistente con el proyecto)

```
src/types/tramites.ts                  # Tramite, EstadoTramite, Subsanacion, DTOs
src/services/tramiteService.ts         # getAll/getByRole/getById/derivar/etc. sobre api.ts
src/pages/tramites/TramitesInbox.tsx   # la bandeja (lista + filtros)
src/pages/tramites/TramitesInbox.test.tsx
src/pages/tramites/TramiteDetail.tsx   # detalle/flujo (si aplica)
```

1. **Servicio:** crea `tramiteService.ts` siguiendo el patrón de `observationService`, pero usando la forma `api.get<T>()/api.post<T>()` (más limpia que `fetchApi` + `JSON.stringify` manual). Endpoints bajo `/api/v1` (el proxy de Vite ya apunta a `localhost:8080`).
2. **Tipos:** define `Tramite` y su enum de estados en `src/types/tramites.ts`. Alinea los nombres de estado con el vocabulario ya existente en `types/auth.ts` (`pending`, `underReview`, `withCoordinator/Director/Dean`, `approved`, `observed`, `rejected`, `completed`) y con los strings que ya usa el código (`'SUBSANADO'`, `'PENDIENTE'`, `'OBSERVADO'` en ObservationsPanel/tests).
3. **Rutas:** registra en `App.tsx` con el patrón exacto `<ProtectedRoute><DashboardContainer>...</DashboardContainer></ProtectedRoute>`. Sugerencia: `/tramites` (bandeja) y `/tramites/:id` (detalle). Para subsanar, enlaza al panel existente: `/observations/panel?procedureId=${tramite.id}`.
4. **Sidebar:** añade tu ítem en `navGroups` (grupo "Gestión Académica"), con icono lucide (p. ej. `Inbox` o `FolderKanban`, size 20).
5. **UI de la bandeja:** reutiliza `Card + CardContent + TableContainer/... + Badge + Button` calcando `MyEvaluations.tsx` (es la página más limpia del repo). Mapea estados → variantes de Badge: pendiente=`warning`, observado=`error`, aprobado=`success`, en revisión=`info`, borrador=`neutral`. Barra de búsqueda: copia el patrón input+icono de `ProjectsList.tsx`.
6. **Filtrado por rol:** `const { currentRole } = useContext(AuthContext)` y ramifica qué trámites/acciones se muestran, como hace `RoleDashboards`. No inventes un hook `useAuth` salvo que lo acuerdes con el equipo (hoy nadie lo usa).
7. **Estados de carga/error:** `useState` locales + `Spinner` de `components/common` + mensaje con `var(--error)`, como `ProjectsList`/`RoleDashboards`.
8. **Estilos:** solo variables CSS (`var(--primary)`, `var(--on-surface-variant)`, `var(--radius-md)`...) y clases tipográficas existentes (`text-headline-lg`, `text-body-md`, `text-caption`). **No uses** `text-title-md`, `text-body-sm` ni `var(--success)` (no existen — ver M2). Evita hex hardcodeados: es el principal defecto del ObservationsPanel actual.
9. **Feedback al usuario:** evita `alert()`. Como no hay Toast/Modal, la opción consistente con el design system es un banner inline con `Alert` (o un div con `--error-container`/verde como `NewProposal.tsx:81-85`). Si construyes un Modal/Toast genérico, ponlo en `components/common/` — será la primera pieza reutilizable que el resto del equipo necesita también.
10. **Tests:** `TramitesInbox.test.tsx` junto a la página, con `vi.mock('../../services/tramiteService')` + `MemoryRouter` + `waitFor`, calcando `ObservationsPanel.test.tsx`. Ejecuta localmente con `npx vitest run --pool=threads` mientras el equipo no arregle A1.
11. **Coordinar con el equipo antes de empezar:** (a) si `ObservationsPanel` se refactoriza al design system o tu bandeja solo enlaza a él; (b) qué endpoints reales expondrá el backend para trámites (hoy solo existen los de observations y los contadores de dashboard); (c) npm vs pnpm (A5); (d) sacar `coverage/` del repo (A4).

### Comandos útiles

```bash
npm install                      # obligatorio tras cada pull (deps nuevas)
npm run dev                      # Vite en :5173, proxy /api → :8080
npm run lint                     # oxlint
npx tsc -b --noEmit              # type-check (igual que la 1ª fase de npm run build)
npx vitest run --pool=threads    # tests (workaround Windows, ver A1)
npm run test:coverage            # coverage (mismo problema de pool en Windows)
```
