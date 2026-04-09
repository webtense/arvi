# ARVI - Libro de Estilos

## Índice
1. [Colores](#colores)
2. [Tipografía](#tipografía)
3. [Componentes](#componentes)
4. [Botones](#botones)
5. [Formularios](#formularios)
6. [Tarjetas](#tarjetas)
7. [Navegación](#navegación)
8. [Toast Notificaciones](#toast-notificaciones)
9. [Responsive](#responsive)

---

## Colores

### Paleta Principal
```css
/* Verde marca - Uso principal */
--brand-green: #38a169;
--brand-green-dark: #2f855a;
--brand-green-light: #48bb78;

/* Azul marca - Acentos */
--brand-blue: #3182ce;
--brand-blue-dark: #2b6cb0;

/* Fondos oscurecidos */
--bg-darker: #0d0f12;      /* Fondo más oscuro (body) */
--bg-dark: #1a202c;        /* Fondo principal */
--bg-card: #232a34;         /* Fondo tarjetas */
--bg-input: #1a202c;       /* Fondo inputs */

/* Textos */
--text-main: #e2e8f0;      /* Texto principal */
--text-muted: #a0aec0;      /* Texto secundario */
--text-inverse: #1a202c;   /* Texto sobre fondo claro */

/* Estados */
--success: #48bb78;
--warning: #ecc94b;
--error: #fc8181;
--info: #63b3ed;

/* Bordes */
--border-color: #4a5568;
--border-focus: #38a169;
```

### Uso de Colores
- ** brand-green**: Botones primarios, CTAs, highlights
- ** brand-blue**: Links, acentos informativos
- ** bg-darker**: Fondo principal de la app
- ** bg-card**: Fondos de componentes
- ** text-main**: Títulos y texto principal
- ** text-muted**: Subtítulos, placeholders, hints

---

## Tipografía

### Familia
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
```

### Tamaños
```css
--text-xs: 0.75rem;    /* 12px - etiquetas pequeñas */
--text-sm: 0.875rem;   /* 14px - texto secundario */
--text-base: 1rem;     /* 16px - texto base */
--text-lg: 1.125rem;   /* 18px - texto destacado */
--text-xl: 1.25rem;    /* 20px - subtítulos */
--text-2xl: 1.5rem;    /* 24px - títulos de sección */
--text-3xl: 1.875rem;  /* 30px - títulos de página */
--text-4xl: 2.25rem;   /* 36px - hero */
--text-5xl: 3rem;      /* 48px - landing hero */
```

### Pesos
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Heading Styles
```css
h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.2;
}

h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.3;
}

h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.4;
}
```

---

## Componentes

### Estructura General
Todos los componentes siguen:
- Diseño oscuro con bordes sutiles
- Border-radius consistente (10px estándar)
- Padding generoso (1rem - 2rem)
- Transiciones suaves (0.2s - 0.3s)

### Estados
```css
/* Hover */
transform: translateY(-2px);
box-shadow: var(--shadow-card);

/* Active */
transform: scale(0.98);

/* Focus */
outline: 2px solid var(--brand-green);
outline-offset: 2px;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

---

## Botones

### Variantes
```css
/* Primary - Verde marca */
.btn-primary {
  background: var(--brand-green);
  color: white;
}
.btn-primary:hover {
  background: var(--brand-green-dark);
}

/* Secondary - Borde verde */
.btn-secondary {
  background: transparent;
  border: 2px solid var(--brand-green);
  color: var(--brand-green);
}
.btn-secondary:hover {
  background: rgba(56, 161, 105, 0.1);
}

/* Danger - Rojo */
.btn-danger {
  background: var(--error);
  color: white;
}

/* Ghost - Sin fondo */
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
}
```

### Tamaños
```css
.btn-sm { padding: 0.5rem 1rem; font-size: var(--text-sm); }
.btn-md { padding: 0.75rem 1.5rem; font-size: var(--text-base); }
.btn-lg { padding: 1rem 2rem; font-size: var(--text-lg); }
```

### Propiedades Comunes
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
```

---

## Formularios

### Inputs
```css
.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: var(--text-base);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: var(--brand-green);
  outline: none;
  box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.2);
}

.form-control::placeholder {
  color: var(--text-muted);
}
```

### Labels
```css
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-main);
  font-weight: 500;
  font-size: var(--text-sm);
}
```

### Textarea
```css
textarea.form-control {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}
```

### Select
```css
select.form-control {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,...dropdown-arrow");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}
```

---

## Tarjetas

### Card Principal
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
}
```

### Card Hover
```css
.card-hover {
  transition: transform 0.2s, box-shadow 0.2s;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-dropdown);
}
```

### Card Header
```css
.card-header {
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
}
```

---

## Navegación

### Bottom Navigation (Móvil)
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 0.75rem 0;
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.bottom-nav-item.active {
  color: var(--brand-green);
}
```

### Drawer (Móvil)
```css
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--bg-darker);
  transform: translateX(-100%);
  transition: transform 0.3s;
  z-index: 200;
}

.drawer.open {
  transform: translateX(0);
}
```

### Top Bar
```css
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-darker);
  border-bottom: 1px solid var(--border-color);
}
```

---

## Toast Notificaciones

### Container
```css
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
  max-width: 400px;
}
```

### Variantes
```css
.toast-success {
  background: var(--success);
  border-left: 4px solid #2f855a;
}

.toast-error {
  background: var(--bg-card);
  border-left: 4px solid var(--error);
}

.toast-warning {
  background: var(--bg-card);
  border-left: 4px solid var(--warning);
}

.toast-info {
  background: var(--bg-card);
  border-left: 4px solid var(--info);
}
```

### Animación
```css
.toast {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## Responsive

### Breakpoints
```css
/* Móvil */
@media (max-width: 640px) {
  --text-4xl: 1.75rem;
  .hide-mobile { display: none; }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .hide-tablet { display: none; }
}

/* Desktop */
@media (min-width: 1025px) {
  .hide-desktop { display: none; }
}
```

### Grid
```css
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
```

### Espaciado Responsive
```css
:root {
  --space-container: 1rem;    /* Móvil */
}

@media (min-width: 1024px) {
  :root {
    --space-container: 2rem;
  }
}
```

---

## Iconos

Usamos **Lucide React**:
```jsx
import { Home, Settings, Plus, Edit, Trash, User } from 'lucide-react';

// Tamaños
<Icon size={16} />  // sm
<Icon size={20} />  // md
<Icon size={24} />  // lg
<Icon size={32} />  // xl
```

### Iconos Comunes
- Navegación: Home, Grid, Ticket, Users, Briefcase, FileText, Settings
- Acciones: Plus, Edit, Trash, Search, Filter, Download, Upload
- Estados: Check, X, AlertCircle, Info, Clock
- UI: ChevronDown, ChevronRight, Menu, Close

---

## Sombras

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-card: 0 4px 20px rgba(0, 0, 0, 0.3);
--shadow-dropdown: 0 10px 40px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(56, 161, 105, 0.3);
```

---

## Animaciones

```css
/* Transiciones base */
transition: all 0.2s ease;

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

*Documento actualizado: Abril 2026*