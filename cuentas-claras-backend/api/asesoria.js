const { sql } = require('../lib/db');
const { normCedula, validCelular, setCors, handleOptions, sendJson } = require('../lib/util');

// POST /api/asesoria  { nombre, celular, tipo, comentario }
// Pedido de asesoría paga para tramitar un crédito. No se cobra nada acá: LLAB
// contacta por celular para confirmar alcance y costo antes de empezar.
module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });
  if (!sql) return sendJson(res, 500, { error: 'db_not_configured' });

  const body = req.body || {};
  const nombre = String(body.nombre || '').trim().slice(0, 120);
  const celular = normCedula(body.celular);
  const tipo = ['hipotecario', 'automotor', 'consumo'].includes(body.tipo) ? body.tipo : null;
  const comentario = String(body.comentario || '').trim().slice(0, 300);

  if (!nombre || !validCelular(celular)) {
    return sendJson(res, 400, { error: 'invalid_input', message: 'Nombre y celular válido son obligatorios.' });
  }

  try {
    await sql`
      insert into asesorias (nombre, celular, tipo, comentario)
      values (${nombre}, ${celular}, ${tipo}, ${comentario})
    `;
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('[asesoria]', e);
    return sendJson(res, 500, { error: 'server_error' });
  }
};
