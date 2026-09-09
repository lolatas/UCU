-- Cuentas Claras — esquema de base de datos (Neon Postgres)
-- Prueba conceptual. Pensado para volumen chico (piloto), no para producción a escala.

-- Personas que se registraron para recibir ofertas / usar el buscador.
create table if not exists registros (
  cedula        text primary key,           -- solo dígitos, 6 a 8 caracteres
  nombre        text,
  celular       text not null,               -- solo dígitos
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Ofertas de préstamo pre-aprobadas, cargadas por (o en representación de) cada institución.
-- Una fila por institución + cédula; "reemplaza" la anterior de esa misma institución.
create table if not exists ofertas (
  id            bigserial primary key,
  cedula        text not null references registros(cedula) on delete cascade,
  institucion   text not null,
  tasa          text,
  gastos        text,
  seguro        text,
  monto         text,
  plazo         text,
  vigencia      text,
  cargado_en    timestamptz not null default now(),
  cargado_por   text,                        -- identificador de quién hizo la carga (equipo LLAB / institución)
  unique (cedula, institucion)
);
create index if not exists idx_ofertas_cedula on ofertas(cedula);

-- Situación de deuda y oferta de cancelación, cargada por cada institución acreedora.
create table if not exists deudas (
  id                 bigserial primary key,
  cedula             text not null,          -- no exige registro previo: alguien puede tener deuda sin haberse registrado
  institucion        text not null,
  monto              text,
  moneda             text,
  atraso_dias        text,
  oferta_cancelacion text,
  plazo_convenio     text,
  tasa_convenio      text,
  vigencia           text,
  cargado_en         timestamptz not null default now(),
  cargado_por        text,
  unique (cedula, institucion)
);
create index if not exists idx_deudas_cedula on deudas(cedula);

-- Pedidos de asesoría para tramitar un crédito (servicio pago, gestionado fuera de la app).
create table if not exists asesorias (
  id          bigserial primary key,
  nombre      text not null,
  celular     text not null,
  tipo        text,                          -- 'hipotecario' | 'automotor' | 'consumo'
  comentario  text,
  estado      text not null default 'nuevo', -- 'nuevo' | 'contactado' | 'cerrado'
  creado_en   timestamptz not null default now()
);

-- Empresas/instituciones sugeridas para revisar y sumar al comparador.
create table if not exists pendientes (
  id          bigserial primary key,
  nombre      text not null,
  web         text,
  notas       text,
  estado      text not null default 'pendiente', -- 'pendiente' | 'revisado'
  creado_en   timestamptz not null default now()
);
