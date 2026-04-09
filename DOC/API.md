# ARVI API - Referencia de Endpoints

## Índice
1. [Autenticación](#autenticación)
2. [Tickets](#tickets)
3. [Proyectos](#proyectos)
4. [Clientes](#clientes)
5. [Subcontratistas](#subcontratistas)
6. [Presupuestos](#presupuestos)
7. [Facturas](#facturas)
8. [Recursos/Assets](#recursosassets)
9. [Piezas](#piezas)
10. [Contacto](#contacto)
11. [Swagger](#swagger)

---

## Autenticación

### POST /api/auth/login
Autentica usuario y devuelve token JWT.

**Body:**
```json
{
  "email": "admin@arvi.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "admin@arvi.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

### GET /api/auth/me
Obtiene datos del usuario actual (requiere token).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "id": "1",
  "email": "admin@arvi.com",
  "name": "Administrador",
  "role": "admin"
}
```

---

## Tickets

### GET /api/tickets
Listar tickets con paginación.

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | number | 1 | Página actual |
| limit | number | 20 | Items por página |
| status | string | - | Filtrar por estado |
| search | string | - | Buscar en título |

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Fuga de agua",
      "description": "Fuga en el baño del segundo piso",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### POST /api/tickets
Crear nuevo ticket.

**Body:**
```json
{
  "title": "Título del ticket",
  "description": "Descripción detallada",
  "priority": "medium",
  "status": "open",
  "category": "mantenimiento",
  "clientId": "1",
  "assignedTo": "user-id"
}
```

### GET /api/tickets/:id
Obtener ticket por ID.

### PUT /api/tickets/:id
Actualizar ticket.

### DELETE /api/tickets/:id
Eliminar ticket.

---

## Proyectos

### GET /api/projects
Listar proyectos.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | number | Página |
| limit | number | Items por página |
| status | string | Estado del proyecto |

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Reforma comunidad Barcelona",
      "description": "Renovación integral",
      "status": "active",
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "budget": 15000,
      "clientId": "1"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### POST /api/projects
Crear proyecto.

**Body:**
```json
{
  "name": "Nombre del proyecto",
  "description": "Descripción",
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 10000,
  "clientId": "1"
}
```

### GET /api/projects/:id
Ver proyecto con sus tickets.

### PUT /api/projects/:id
Actualizar proyecto.

### DELETE /api/projects/:id
Eliminar proyecto.

---

## Clientes

### GET /api/clients
Listar clientes.

**Query Parameters:**
- `page`, `limit` - Paginación
- `search` - Buscar por nombre/CIF

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Comunidad de Vecinos Plaza Catalunya",
      "cif": "B12345678",
      "email": "info@vecinos.com",
      "phone": "+34 600 000 000",
      "address": "Plaza Catalunya 10, Barcelona",
      "contactPerson": "Juan García"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

### POST /api/clients
Crear cliente.

**Body:**
```json
{
  "name": "Nombre del cliente",
  "cif": "B12345678",
  "email": "email@cliente.com",
  "phone": "+34 600 000 000",
  "address": "Dirección completa",
  "contactPerson": "Persona de contacto",
  "iban": "ES12 3456 7890 1234 5678 90"
}
```

### GET /api/clients/:id
Ver cliente con sus proyectos y facturas.

### PUT /api/clients/:id
Actualizar cliente.

### DELETE /api/clients/:id
Eliminar cliente.

---

## Subcontratistas

### GET /api/subcontractors
Listar subcontratistas.

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Electricista Juan",
      "cif": "B87654321",
      "email": "juan@electricista.com",
      "phone": "+34 600 000 001",
      "specialty": "electricidad",
      "rate": 35
    }
  ],
  "total": 8
}
```

### POST /api/subcontractors
Crear subcontratista.

**Body:**
```json
{
  "name": "Nombre",
  "cif": "B87654321",
  "email": "email@subcontratista.com",
  "phone": "+34 600 000 000",
  "specialty": "electricidad",
  "rate": 35,
  "notes": "Notas adicionales"
}
```

### PUT /api/subcontractors/:id
Actualizar subcontratista.

### DELETE /api/subcontractors/:id
Eliminar subcontratista.

---

## Presupuestos

### GET /api/budgets
Listar presupuestos.

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "number": "PRES-2024-001",
      "clientId": "1",
      "projectId": "1",
      "status": "pending",
      "total": 5000,
      "items": [
        {
          "description": "Trabajo de fontanería",
          "quantity": 1,
          "unitPrice": 2000,
          "total": 2000
        }
      ],
      "validUntil": "2024-03-01",
      "createdAt": "2024-01-15"
    }
  ],
  "total": 15
}
```

### POST /api/budgets
Crear presupuesto.

**Body:**
```json
{
  "clientId": "1",
  "projectId": "1",
  "items": [
    {
      "description": "Trabajo de fontanería",
      "quantity": 1,
      "unitPrice": 2000
    }
  ],
  "notes": "Notas del presupuesto",
  "validUntil": "2024-03-01"
}
```

### GET /api/budgets/:id
Ver presupuesto detallado.

### PUT /api/budgets/:id
Actualizar presupuesto (incluye cambiar estado).

### DELETE /api/budgets/:id
Eliminar presupuesto.

---

## Facturas

### GET /api/invoices
Listar facturas.

**Query Parameters:**
- `page`, `limit` - Paginación
- `status` - pending/paid/overdue
- `clientId` - Filtrar por cliente

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "number": "FAC-2024-001",
      "clientId": "1",
      "clientName": "Comunidad Barcelona",
      "issueDate": "2024-01-15",
      "dueDate": "2024-02-15",
      "status": "pending",
      "subtotal": 1000,
      "iva": 210,
      "total": 1210,
      "items": [
        {
          "description": "Mantenimiento enero",
          "quantity": 1,
          "unitPrice": 1000,
          "iva": 21
        }
      ]
    }
  ],
  "total": 30,
  "page": 1
}
```

### POST /api/invoices
Crear factura.

**Body:**
```json
{
  "clientId": "1",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "items": [
    {
      "description": "Mantenimiento enero",
      "quantity": 1,
      "unitPrice": 1000,
      "iva": 21
    }
  ],
  "notes": "Notas de la factura"
}
```

### GET /api/invoices/:id
Ver factura detallada con línea de items.

### PUT /api/invoices/:id
Actualizar factura (estado, items, etc).

**Estados posibles:** `pending`, `paid`, `overdue`, `cancelled`

### DELETE /api/invoices/:id
Eliminar factura.

---

## Recursos/Assets

### GET /api/assets
Listar archivos subidos.

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "filename": "presupuesto.pdf",
      "originalName": "presupuesto-cliente.pdf",
      "mimeType": "application/pdf",
      "size": 102400,
      "url": "/api/storage/presupuesto.pdf",
      "uploadedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/assets
Subir archivo.

**Content-Type:** multipart/form-data

**Body:**
- `file`: Archivo a subir

**Respuesta:**
```json
{
  "id": "1",
  "filename": "uuid-presupuesto.pdf",
  "url": "/api/storage/uuid-presupuesto.pdf"
}
```

### DELETE /api/assets/:id
Eliminar archivo.

---

## Piezas

### GET /api/parts
Listar piezas/recambios.

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Grifo monomando",
      "reference": "GR-001",
      "category": "fontaneria",
      "stock": 10,
      "unitPrice": 25,
      "supplier": "Suministros López"
    }
  ]
}
```

### POST /api/parts
Crear pieza.

**Body:**
```json
{
  "name": "Nombre de la pieza",
  "reference": "REF-001",
  "category": "electricidad",
  "stock": 5,
  "unitPrice": 15.50,
  "supplier": "Proveedor"
}
```

### PUT /api/parts/:id
Actualizar pieza.

### DELETE /api/parts/:id
Eliminar pieza.

---

## Contacto

### POST /api/contact
Enviar formulario de contacto (público, sin auth).

**Body:**
```json
{
  "name": "Nombre del cliente",
  "email": "email@cliente.com",
  "phone": "+34 600 000 000",
  "subject": "Solicitud de presupuesto",
  "message": "Hola, me gustaría solicitar...",
  "service": "integral"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Tu solicitud ha sido recibida. Te contactaremos pronto.",
  "id": "1704067200000"
}
```

### GET /api/contact
Obtener todos los mensajes (requiere auth admin).

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "data": [
    {
      "id": "1704067200000",
      "name": "Nombre",
      "email": "email@cliente.com",
      "subject": "Solicitud",
      "message": "...",
      "status": "new",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5
}
```

### PUT /api/contact/:id/read
Marcar mensaje como leído (requiere auth admin).

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o no proporcionado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 500 | Internal Server Error - Error del servidor |

---

## Errores Comunes

```json
{
  "error": "Nombre, email y mensaje son obligatorios"
}
```

```json
{
  "error": "Acceso no autorizado"
}
```

```json
{
  "error": "Ticket no encontrado"
}
```

---

## Paginación

Todos los endpoints de listado soportan paginación:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

Parámetros:
- `page`: Página actual (default: 1)
- `limit`: Items por página (default: 20, max: 100)

---

## Swagger

Documentación interactiva disponible en:

```
http://localhost:3001/api-docs
```

Allí puedes:
- Ver todos los endpoints
- Probar solicitudes directamente
- Ver modelos de datos
- Descargar OpenAPI spec

---

*Documento actualizado: Abril 2026*