// Conexión a Neon (Postgres serverless), pensada para funciones de Vercel.
// Requiere la variable de entorno DATABASE_URL (el "connection string" de Neon,
// el que empieza con postgresql://... y termina con ?sslmode=require).
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  // No tiramos el proceso: cada endpoint devuelve un error claro si falta la variable,
  // en vez de romper el arranque de toda la función.
  console.warn('[db] Falta la variable de entorno DATABASE_URL.');
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

module.exports = { sql };
