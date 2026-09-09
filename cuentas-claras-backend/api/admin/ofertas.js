const { sql } = require('../../lib/db');
const { normCedula, validCedula, setCors, handleOptions, isAdmin, sendJson } = require('../../lib/util');

// POST /api/admin/ofertas   header: x-admin-token
// body: { rows: [{ cedula, institucion, tasa, gastos, seguro, monto, plazo, vigencia }, ...] }
// Carga masiva de ofertas (protegida). Cada fila reemplaza la oferta anterior de
// esa misma institución para esa cédula.
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
      // Un registro previo no es obligatorio: si la cédula no está en "registros"
      // todavía, se crea un registro mínimo (sin celular) para poder guardar la oferta,
      // ya que la clave foránea de "ofertas" apunta a "registros".
      await sql`
        insert into registros (cedula, celular)
        values (${cedula}, '')
        on conflict (cedula) do nothing
      `;
      await sql`
        insert into ofertas (cedula, institucion, tasa, gastos, seguro, monto, plazo, vigencia, cargado_por)
        values (${cedula}, ${institucion}, ${r.tasa || ''}, ${r.gastos || ''}, ${r.seguro || ''}, ${r.monto || ''}, ${r.plazo || ''}, ${r.vigencia || ''}, 'admin')
        on conflict (cedula, institucion) do update set
          tasa = excluded.tasa, gastos = excluded.gastos, seguro = excluded.seguro,
          monto = excluded.monto, plazo = excluded.plazo, vigencia = excluded.vigencia,
          cargado_en = now(), cargado_por = excluded.cargado_por
      `;
      ok++;
    } catch (e) {
      console.error('[admin/ofertas] fila falló', e);
      fail++;
    }
  }

  return sendJson(res, 200, { ok, fail });
};
