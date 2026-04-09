# ARVI Manteniments Integrals - Documentación del Proyecto

## Índice

1. [Información General](#información-general)
2. [Arquitectura](#arquitectura)
3. [Tecnologías](#tecnologías)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Guía de Instalación](#guía-de-instalación)
6. [API Endpoints](#api-endpoints)
7. [Estilos y Design System](#estilos-y-design-system)
8. [Funcionalidades](#funcionalidades)
9. [Contribuir](#contribuir)

---

## Información General

**Nombre del Proyecto:** ARVI Manteniments Integrals  
**Tipo:** Aplicación Web Full-Stack (PWA)  
**Sector:** Gestión de mantenimiento para comunidades y pequeñas empresas  
**Idioma:** Catalán/Español  

### Descripción
Plataforma integral para la gestión de servicios de mantenimiento que incluye:
- Gestión de tickets y solicitudes
- Administración de clientes y proyectos
- Sistema de facturación e invoices
- Panel de administración
- Landing page pública

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    ARVI Application                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐      ┌─────────────────────────┐   │
│  │   arvi-app     │      │       arvi-api          │   │
│  │   (Frontend)   │◄────►│       (Backend)         │   │
│  │   React + Vite │      │    Express + Prisma    │   │
│  └─────────────────┘      └─────────────────────────┘   │
│           │                        │                   │
│           ▼                        ▼                   │
│    Navegador Móvil           PostgreSQL/SQLite         │
│    (PWA ready)               (Prisma ORM)              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Capas
- **Frontend:** React 18, React Router, i18n, Zustand (state)
- **Backend:** Express.js, JWT auth, Prisma ORM
- **Base de Datos:** PostgreSQL (producción) / SQLite (desarrollo)
- **Despliegue:** Render / Railway / VPS

---

## Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.x | UI Framework |
| Vite | 5.x | Build tool |
| React Router | 6.x | Navegación |
| i18next | - | Internacionalización |
| Zustand | - | Estado global |
| Lucide React | - | Iconos |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Express | 4.x | Framework API |
| Prisma | 5.x | ORM |
| JWT | - | Autenticación |
| Helmet | 8.x | Seguridad |
| Express Rate Limit | 8.x | Rate limiting |
| Swagger | - | Documentación |

---

## Estructura del Proyecto

```
ARVI/
├── arvi-app/                 # Frontend React
│   ├── src/
│   │   ├── assets/          # Imágenes, fuentes
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Contextos React
│   │   ├── hooks/          # Custom hooks
│   │   ├── i18n/           # Traducciones
│   │   ├── pages/          # Páginas/views
│   │   ├── services/       # API calls
│   │   ├── utils/          # Utilidades
│   │   ├── App.jsx         # Componente raíz
│   │   └── index.css       # Estilos globales
│   ├── public/             # Assets públicos
│   └── package.json
│
├── arvi-api/                 # Backend Express
│   ├── lib/                 # Prisma client, utilitarias
│   ├── middleware/         # Middleware personalizado
│   ├── routes/             # Rutas API
│   ├── storage/            # Archivos (uploads, JSON)
│   ├── prisma/             # Schema DB
│   ├── tests/              # Tests
│   ├── index.js            # Entry point
│   └── package.json
│
├── DOC/                     # Documentación
│   ├── README.md           # Este archivo
│   ├── STYLEGUIDE.md       # Guía de estilos
│   └── API.md              # Referencia API
│
└── package.json            # Root (scripts opcionales)
```

---

## Guía de Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- PostgreSQL (opcional, usa SQLite en desarrollo)

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/webtense/arvi.git
cd ARVI

# 2. Instalar dependencias del backend
cd arvi-api
npm install

# 3. Configurar entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Ejecutar migraciones Prisma
npx prisma migrate dev

# 5. (Opcional) Seed de datos
node seed.js

# 6. Iniciar backend
npm run dev

# 7. Nuevo terminal - Frontend
cd ../arvi-app
npm install
npm run dev
```

### Variables de Entorno (arvi-api/.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secret-seguro"
PORT=3001
NODE_ENV=development
```

---

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Login usuario
- `GET /api/auth/me` - Datos usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets (paginado)
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/:id` - Ver ticket
- `PUT /api/tickets/:id` - Actualizar ticket
- `DELETE /api/tickets/:id` - Eliminar ticket

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Ver proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id` - Ver cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Subcontratistas
- `GET /api/subcontractors` - Listar subcontratistas
- `POST /api/subcontractors` - Crear subcontratista
- `PUT /api/subcontractors/:id` - Actualizar subcontratista
- `DELETE /api/subcontractors/:id` - Eliminar subcontratista

### Contacto
- `POST /api/contact` - Enviar formulario contacto
- `GET /api/contact` - Ver mensajes (admin)
- `PUT /api/contact/:id/read` - Marcar como leído (admin)

### Documentación Swagger
Accede a `http://localhost:3001/api-docs` para ver la documentación interactiva.

---

## Estilos y Design System

### Variables CSS Principales

```css
:root {
  /* Colores */
  --brand-green: #38a169;
  --brand-green-dark: #2f855a;
  --brand-blue: #3182ce;
  --bg-dark: #1a202c;
  --bg-darker: #0d0f12;
  --bg-card: #232a34;
  --text-main: #e2e8f0;
  --text-muted: #a0aec0;
  --border-color: #4a5568;
  
  /* Espaciado */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Sombras */
  --shadow-dropdown: 0 10px 40px rgba(0,0,0,0.5);
  --shadow-card: 0 4px 20px rgba(0,0,0,0.3);
  
  /* Bordes */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

### Componentes Principales
- **Button**: Variantes primary, secondary, danger, ghost
- **Card**: Contenedor con estilos predefined
- **Input/Textarea**: Estilos uniformes para formularios
- **Select**: Dropdowns estilizados
- **Modal**: Diálogos modales
- **Toast**: Notificaciones
- **BottomNav**: Navegación móvil
- **Drawer**: Menú lateral móvil

### Responsive
- Mobile: < 768px (drawer + bottom nav)
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## Funcionalidades

### Frontend
- [x] Landing page pública
- [x] Dashboard autenticado
- [x] Gestión de tickets (CRUD)
- [x] Gestión de proyectos
- [x] Gestión de clientes
- [x] Gestión de subcontratistas
- [x] Editor de invoices/facturas
- [x] Formulario de contacto
- [x] Settings / Configuración
- [x] Soporte i18n (ca/es)
- [x] PWA con manifest
- [x] Responsive iPhone
- [x] Bottom navigation móvil
- [x] Drawer navigation móvil

### Backend
- [x] API RESTful
- [x] Autenticación JWT
- [x] CRUD completo tickets
- [x] CRUD completo proyectos
- [x] CRUD completo clientes
- [x] CRUD completo subcontratistas
- [x] Sistema de invoices
- [x] Endpoint contacto (JSON storage)
- [x] Rate limiting
- [x] Helmet security headers
- [x] Documentación Swagger
- [x] Paginación endpoints
- [x] Validación de inputs
- [x] Prisma ORM

---

## Contribuir

1. Fork del repositorio
2. Crear branch `feature/nueva-funcionalidad`
3. Realizar cambios
4. Commit con mensajes descriptivos
5. Push y Pull Request

### Convenciones
- Commits en español o inglés
- Nombres de archivos en kebab-case
- Componentes en PascalCase
- Hooks en camelCase con prefijo use
- Variables CSS en kebab-case

---

*Última actualización: Abril 2026*