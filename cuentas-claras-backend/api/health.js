const { sql } = require('../lib/db');
const { setCors, handleOptions, sendJson } = require('../lib/util');

// GET /api/health — para confirmar que la API está viva y conectada a Neon.
module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (!sql) return sendJson(res, 500, { ok: false, error: 'db_not_configured' });
  try {
    const rows = await sql`select now() as ahora`;
    return sendJson(res, 200, { ok: true, db_time: rows[0].ahora });
  } catch (e) {
    console.error('[health]', e);
    return sendJson(res, 500, { ok: false, error: 'db_error' });
  }
};
