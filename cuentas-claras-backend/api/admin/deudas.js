const { sql } = require('../../lib/db');
const { normCedula, validCedula, setCors, handleOptions, isAdmin, sendJson } = require('../../lib/util');

// POST /api/admin/deudas   header: x-admin-token
// body: { rows: [{ cedula, institucion, monto, moneda, atraso_dias, oferta_cancelacion,
//                   plazo_convenio, tasa_convenio, vigencia }, ...] }
module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });
  if (!isAdmin(req)) return sendJson(res, 401, { error: 'unauthorized' });
  if (!sql) return sendJson(res, 500, { error: 'db_not_configured' });

  const rows = Array.isArray((req.body || {}).rows) ? req.body.rows : [];
  let ok = 0, fail = 0;

  for (const r of rows) {
    const cedula = normCedula(r.cedula);
    const institucion = String(r.institucion || '').trim().slice(0, 160);
    if (!validCedula(cedula) || !institucion) { fail++; continue; }
    try {
      await sql`
        insert into deudas (cedula, institucion, monto, moneda, atraso_dias, oferta_cancelacion, plazo_convenio, tasa_convenio, vigencia, cargado_por)
        values (${cedula}, ${institucion}, ${r.monto || ''}, ${r.moneda || ''}, ${r.atraso_dias || ''}, ${r.oferta_cancelacion || ''}, ${r.plazo_convenio || ''}, ${r.tasa_convenio || ''}, ${r.vigencia || ''}, 'admin')
        on conflict (cedula, institucion) do update set
          monto = excluded.monto, moneda = excluded.moneda, atraso_dias = excluded.atraso_dias,
          oferta_cancelacion = excluded.oferta_cancelacion, plazo_convenio = excluded.plazo_convenio,
          tasa_convenio = excluded.tasa_convenio, vigencia = excluded.vigencia,
          cargado_en = now(), cargado_por = excluded.cargado_por
      `;
      ok++;
    } catch (e) {
      console.error('[admin/deudas] fila falló', e);
      fail++;
    }
  }

  return sendJson(res, 200, { ok, fail });
};
