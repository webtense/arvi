# Auditoria Seguridad y SEO - 2026-04-09

## Alcance

- Frontend `arvi-app` (React + Vite)
- Backend `arvi-api` (Express + Prisma)
- Infraestructura publica (`arvimanteniment.com`)
- Criterios SEO aplicados en base a buenas practicas de Google recopiladas en `bibliadelseo.com`

## Resumen ejecutivo

- HTTPS corregido con certificado valido de Let's Encrypt.
- Canonical de host aplicado (`www -> arvimanteniment.com`).
- Exposicion directa de Odoo por `:8069` cerrada (solo loopback).
- CORS endurecido con allowlist de origenes.
- Cabeceras de seguridad reforzadas en Nginx y API.
- `robots.txt` y `sitemap.xml` reales publicados.
- Base SEO on-page reforzada (meta, canonical, JSON-LD, nuevas landings de cobertura Catalunya).

## Hallazgos de seguridad y estado

### 1) TLS/HTTPS
- Estado: **Corregido**
- Antes: certificado autofirmado (error de confianza).
- Ahora: Let’s Encrypt valido para `arvimanteniment.com` y `www.arvimanteniment.com`.

### 2) Canonicalizacion de dominio
- Estado: **Corregido**
- Ahora: redireccion 301 de `http` y `https://www` hacia `https://arvimanteniment.com`.

### 3) Exposicion de puertos sensibles
- Estado: **Corregido**
- Antes: `:8069` (Odoo) accesible publicamente.
- Ahora: Odoo ligado a `127.0.0.1` y solo accesible via Nginx reverse proxy.

### 4) CORS API
- Estado: **Corregido**
- Antes: `Access-Control-Allow-Origin: *`.
- Ahora: allowlist por `CORS_ORIGIN` con fallback seguro y sin wildcard para produccion.

### 5) Fingerprinting backend
- Estado: **Corregido**
- Antes: `X-Powered-By: Express` visible.
- Ahora: desactivado en Express.

### 6) Contact endpoint
- Estado: **Mejorado**
- Validacion y sanitizacion de payload.
- Proteccion de listado/lectura de mensajes mediante middleware auth + rol admin.
- Rate limit dedicado para envio de contactos.

## Versiones y dependencias

## Runtime local
- Node.js: `v20.20.2`
- npm: `10.8.2`

## Frontend (arvi-app)
- React: `18.x`
- Vite: `4.x`
- Resultado `npm audit --omit=dev`: **0 vulnerabilidades**

## Backend (arvi-api)
- Express: `4.x`
- Prisma: `5.x`
- Helmet: `8.x`
- Resultado `npm audit --omit=dev`: **0 vulnerabilidades**

## Servidor
- Odoo: `16.0-20260407`
- Nginx: `1.18.0`
- OpenSSL: `1.1.1w`
- Python: `3.9.2`
- Certbot: `1.12.0`

## SEO: criterios aplicados (alineados con BibliadelSEO)

### Canonical
- Una URL canonica de host y etiqueta canonical en home.
- Redirecciones y señales consistentes hacia el dominio principal.

### Metadatos
- Meta description robusta, OpenGraph y Twitter Cards en plantilla.
- `SeoHead` para reforzar titulo/descripcion/canonical por pagina publica clave.

### Sitemaps y robots
- `robots.txt` funcional con `Sitemap:` declarado.
- `sitemap.xml` publicado con URLs publicas prioritarias.

### Datos estructurados
- JSON-LD `Organization` en la plantilla principal.
- JSON-LD por pagina en rutas clave (ej. cobertura/blog post).

### SEO local (Catalunya)
- Nueva ruta de cobertura territorial: `/cobertura-catalunya`.
- Contenido orientado por provincias: Barcelona, Girona, Lleida, Tarragona.
- Refuerzo de NAP y cobertura geografica.

## Tareas SEO siguientes (prioridad alta)

1. Pasar paginas publicas principales a pre-render/SSR para mejorar indexacion inicial de SPA.
2. Crear landings locales por provincia/comarca con URL dedicada y enlazado interno.
3. Añadir `BreadcrumbList` estructurado en servicios y blog.
4. Implementar `FAQPage` schema donde aplique.
5. Registrar sitemap en Google Search Console y monitorizar cobertura/indexacion.

## Riesgos y recomendaciones operativas

- Rotar credenciales sensibles usadas durante la intervencion (root/tokens).
- No usar root para operaciones de app en regimen permanente.
- Mantener renovacion de certbot activa (timer validado).
- Definir checklist de despliegue con rollback para API y frontend.
