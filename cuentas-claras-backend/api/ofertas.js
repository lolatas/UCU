const { sql } = require('../lib/db');
const { normCedula, validCedula, setCors, handleOptions, sendJson } = require('../lib/util');

// GET /api/ofertas?cedula=12345678
// Devuelve las ofertas cargadas para esa cédula. Cada oferta la confirmó la
// institución que figura en ella, no LLAB.
module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method_not_allowed' });
  if (!sql) return sendJson(res, 500, { error: 'db_not_configured' });

  const cedula = normCedula(req.query.cedula);
  if (!validCedula(cedula)) {
    return sendJson(res, 400, { error: 'invalid_input', message: 'Cédula inválida.' });
  }

  try {
    const rows = await sql`
      select institucion, tasa, gastos, seguro, monto, plazo, vigencia, cargado_en
      from ofertas
      where cedula = ${cedula}
      order by cargado_en desc
    `;
    return sendJson(res, 200, { ofertas: rows });
  } catch (e) {
    console.error('[ofertas]', e);
    return sendJson(res, 500, { error: 'server_error' });
  }
};
