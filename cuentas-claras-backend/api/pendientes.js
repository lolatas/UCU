const { sql } = require('../lib/db');
const { setCors, handleOptions, sendJson } = require('../lib/util');

// GET  /api/pendientes            -> lista las últimas 50
// POST /api/pendientes { nombre, web, notas }
module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (!sql) return sendJson(res, 500, { error: 'db_not_configured' });

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        select id, nombre, web, notas, estado, creado_en
        from pendientes
        order by creado_en desc
        limit 50
      `;
      return sendJson(res, 200, { pendientes: rows });
    } catch (e) {
      console.error('[pendientes:get]', e);
      return sendJson(res, 500, { error: 'server_error' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const nombre = String(body.nombre || '').trim().slice(0, 160);
    const web = String(body.web || '').trim().slice(0, 300);
    const notas = String(body.notas || '').trim().slice(0, 300);
    if (!nombre) return sendJson(res, 400, { error: 'invalid_input', message: 'El nombre es obligatorio.' });
    try {
      await sql`insert into pendientes (nombre, web, notas) values (${nombre}, ${web}, ${notas})`;
      return sendJson(res, 200, { ok: true });
    } catch (e) {
      console.error('[pendientes:post]', e);
      return sendJson(res, 500, { error: 'server_error' });
    }
  }

  return sendJson(res, 405, { error: 'method_not_allowed' });
};
