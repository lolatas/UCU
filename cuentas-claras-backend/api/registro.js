const { sql } = require('../lib/db');
const { normCedula, validCedula, validCelular, setCors, handleOptions, sendJson } = require('../lib/util');

// POST /api/registro  { nombre, cedula, celular }
module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });
  if (!sql) return sendJson(res, 500, { error: 'db_not_configured' });

  const body = req.body || {};
  const cedula = normCedula(body.cedula);
  const celular = normCedula(body.celular);
  const nombre = String(body.nombre || '').trim().slice(0, 120);

  if (!validCedula(cedula) || !validCelular(celular)) {
    return sendJson(res, 400, { error: 'invalid_input', message: 'Cédula (6 a 8 dígitos) y celular (7 a 12 dígitos) son obligatorios.' });
  }

  try {
    await sql`
      insert into registros (cedula, nombre, celular)
      values (${cedula}, ${nombre}, ${celular})
      on conflict (cedula) do update
        set nombre = excluded.nombre, celular = excluded.celular, actualizado_en = now()
    `;
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('[registro]', e);
    return sendJson(res, 500, { error: 'server_error' });
  }
};
