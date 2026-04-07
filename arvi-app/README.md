# ARVI App - Gestión Integral para Mantenimientos y Comunidades

**ARVI** es una aplicación web (PWA) construida con React y Vite, diseñada específicamente para pymes y autónomos en España dedicados a:
- Mantenimiento integral de edificios.
- Gestión de comunidades de vecinos.
- Pequeñas obras y reformas.

Surgió a partir de un **análisis competitivo** del mercado de software español (GMAO, TucomunidApp, Fixner, MovilGmao, etc.) para centralizar todos los flujos de trabajo de técnicos, administradores de fincas y presidentes de la comunidad en una sola plataforma.

---

## 🚀 Funcionalidades y Módulos Principales

El núcleo de la aplicación se divide en diferentes pantallas accesibles desde el **Backoffice Principal (`/app`)** y un portal orientado a clientes:

### 1. Portal del Cliente (Vecino / Presidente)
- **Ruta:** `/portal-cliente`
- **Descripción:** Interfaz simplificada estilo PWA, pensada para que los clientes o miembros de la comunidad puedan reportar incidencias directas (Tickets), adjuntar fotos desde su móvil y consultar el estado de reparación en tiempo real (Pendiente / Resuelto), sin necesidad de intermediarios.

### 2. Mantenimiento Preventivo
- **Ruta:** `/app/preventivo`
- **Descripción:** Programador visual de rutinas y checklists recurrentes. Permite que tareas como limpiar el grupo de presión del agua, revisar el ascensor mensualmente o el mantenimiento anual de las calderas no caigan en el olvido, asegurando ingresos recurrentes.

### 3. Gestión de Activos y Equipamientos
- **Ruta:** `/app/activos`
- **Descripción:** Directorio enfocado en la vida útil del inventario de cada comunidad (ej: Ascensor OTIS, Puerta Automática). Permite su identificación rápida mediante códigos QR y agrupa el historial técnico para decisiones de sustitución vs. reparación.

### 4. Control de Presupuestos y Rentabilidad
- **Ruta:** `/app/presupuestos`
- **Descripción:** Módulo de viabilidad pensado para las **"Pequeñas Obras"**. Permite comparar márgenes en tiempo real, tabulando material comprado y horas invertidas por el técnico de campo contra el importe facturado al cliente.

### 5. Firma Digital in-situ (HTML5 Canvas)
- **Ruta:** `/app/partes`
- **Descripción:** Durante la creación de un nuevo Parte de Trabajo o Proforma, existe una sección habilitada para que el equipo técnico recoja la conformidad del presidente o cliente final recogiendo una firma interactiva a través del ratón o la pantalla táctil de su dispositivo móvil.

### 6. Control de Subcontratas
- **Ruta:** `/app/subcontratas`
- **Descripción:** Agenda enfocada a profesionales delegados (electricistas, pintores, cerrajeros que colaboran con ARVI). Aquí se audita a qué especialista fue cedido un mantenimiento y el saldo deudor/acreedor que mantenemos con el técnico externo.

### 7. Gestión Documental Centralizada
- **Ruta:** `/app/documentos`
- **Descripción:** Nube privada de documentación adjunta. Cada comunidad posee un repositorio encriptado donde se almacenan seguros de responsabilidad civil, certificados técnicos, facturas pasadas y manuales técnicos (evitando viajes innecesarios a la oficina).

---

## 📱 Otras herramientas incluidas
Adicionalmente, el núcleo principal de la app ya soporta módulos estables como:
- **Dashboard (`/app/dashboard`):** Resumen financiero, seguimiento de proyectos y facturación pendiente en un vistazo.
- **Tickets OCR (`/app/tickets`):** Simulador de carga de gastos, peajes o gasolina del personal mediante interfaz estilo cámara y volcado automatizado.
- **Facturas (`/app/facturas`):** Bandeja de facturas emitidas por periodos.

---

## 🛠️ Tecnologías Utilizadas
- **React (v18.2):** Librería principal para el renderizado del frontend.
- **Vite:** Empaquetador extremadamente rápido orientado al desarrollo en servidor local.
- **React Router DOM:** Manejador de las rutas cliente y transiciones dinámicas SPA.
- **Lucide-React:** Set iconográfico minimalista para la UI general del proyecto.
- **HTML5 Canvas:** Generador de la grilla de captación para las firmas digitales.

---

## 🖥️ Instalación y Uso Local

Para desplegar y visualizar esta interfaz en tu ordenador:

```sh
# 1. Instalar dependencias si todavía no existen
npm install

# 2. Levantar el servidor de desarrollo local
npm run dev
```

El proyecto estará disponible a través de tu localhost, habitualmente en el puerto `5173` (e.g. `http://localhost:5173`).
