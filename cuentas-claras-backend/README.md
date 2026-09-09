# Cuentas Claras — backend (prueba conceptual)

API en Node.js pensada para desplegarse gratis en **Vercel** (funciones serverless)
contra una base de datos **Neon** (Postgres). Reemplaza a la base de datos del
Artifact para poder manejar datos reales de un piloto, con más control de acceso.

## 1. Base de datos (Neon)

1. Creá un proyecto en [neon.tech](https://neon.tech) (plan gratuito).
2. Abrí el **SQL Editor** del proyecto y pegá el contenido de `schema.sql` para
   crear las tablas.
3. Copiá el **connection string** (Dashboard → Connection Details) — algo como
   `postgresql://usuario:password@ep-xxxx.neon.tech/basededatos?sslmode=require`.

## 2. Variables de entorno

Copiá `.env.example` a `.env` (para probar local) y completá:

- `DATABASE_URL`: el connection string de Neon del paso anterior.
- `ADMIN_TOKEN`: un secreto elegido por vos (largo y random), para proteger la
  carga de ofertas y deudas.

## 3. Desplegar en Vercel

1. Subí esta carpeta a un repositorio (GitHub/GitLab) o corré `vercel` desde acá
   con la CLI de Vercel.
2. En Vercel: **New Project** → importá el repo.
3. En **Environment Variables**, cargá `DATABASE_URL` y `ADMIN_TOKEN`.
4. Deploy. Vercel publica cada archivo de `api/` como un endpoint:
   - `GET  /api/health` — confirma que la API está viva y conectada.
   - `POST /api/registro` — `{ nombre, cedula, celular }`
   - `GET  /api/ofertas?cedula=...`
   - `GET  /api/deudas?cedula=...`
   - `POST /api/asesoria` — `{ nombre, celular, tipo, comentario }`
   - `GET/POST /api/pendientes`
   - `POST /api/admin/ofertas` (header `x-admin-token`) — `{ rows: [...] }`
   - `POST /api/admin/deudas` (header `x-admin-token`) — `{ rows: [...] }`

## 4. Probar

```bash
curl https://<tu-proyecto>.vercel.app/api/health
```

Debería devolver `{"ok":true,"db_time":"..."}`.

## Qué NO es esto todavía

Esto sigue siendo una prueba conceptual, no un sistema listo para manejar datos
reales de clientes a gran escala:

- El "login" de administrador es un secreto compartido (`ADMIN_TOKEN`), no un
  sistema de usuarios con roles y auditoría.
- No hay cifrado a nivel de columna para cédula/celular/monto de deuda (Neon
  cifra el disco, pero cualquiera con `DATABASE_URL` ve todo en texto plano).
- El CORS está abierto (`*`) — hay que restringirlo al dominio real del
  frontend antes de ir a producción.
- No hay límite de intentos (rate limiting) en los endpoints públicos.
- No se pide consentimiento explícito ni hay política de privacidad — necesario
  antes de manejar datos de personas reales, por la Ley 18.331 de Protección de
  Datos Personales en Uruguay.
