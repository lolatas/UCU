// Utilidades compartidas por los endpoints de la API.

function normCedula(v) {
  return String(v || '').replace(/\D/g, '');
}

function validCedula(c) {
  return /^\d{6,8}$/.test(c);
}

function validCelular(c) {
  return /^\d{7,12}$/.test(normCedula(c));
}

// CORS abierto para esta prueba conceptual: la API la va a llamar la página publicada
// (Artifact / futuro sitio propio), que no tiene un origen fijo todavía.
// Antes de manejar datos reales de clientes, esto debería restringirse a los dominios
// reales que sirvan el frontend.
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

// Autenticación de administrador MUY simple (un secreto compartido), suficiente para
// una prueba conceptual con un equipo chico. No reemplaza un sistema de usuarios/roles
// real antes de manejar datos de clientes en producción.
function isAdmin(req) {
  const token = req.headers['x-admin-token'];
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

module.exports = {
  normCedula,
  validCedula,
  validCelular,
  setCors,
  handleOptions,
  isAdmin,
  sendJson,
};
