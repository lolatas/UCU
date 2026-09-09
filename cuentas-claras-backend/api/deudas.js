const { sql } = require('../lib/db');
const { normCedula, validCedula, setCors, handleOptions, sendJson } = require('../lib/util');

// GET /api/deudas?cedula=12345678
// Devuelve la situación de deuda y las ofertas de cancelación cargadas para esa
// cédula. Los montos y condiciones los informa cada institución acreedora, no LLAB.
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
      select institucion, monto, moneda, atraso_dias, oferta_cancelacion,
             plazo_convenio, tasa_convenio, vigencia, cargado_en
      from deudas
      where cedula = ${cedula}
      order by cargado_en desc
    `;
    return sendJson(res, 200, { deudas: rows });
  } catch (e) {
    console.error('[deudas]', e);
    return sendJson(res, 500, { error: 'server_error' });
  }
};
