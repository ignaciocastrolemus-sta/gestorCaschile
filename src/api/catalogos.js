import { API_BASE } from "../config/api";

// Helper: fetch + JSON
async function fetchJson(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error al consultar ${url}`);
  return await res.json();
}

function isActivo(row) {
  const raw = row?.activo ?? row?.Activo;
  return raw === undefined ? true : Boolean(raw);
}

function filtrarActivos(data) {
  return Array.isArray(data) ? data.filter(isActivo) : data;
}

export async function obtenerRegiones(token) {
  const data = await fetchJson(`${API_BASE}/Regiones`, token);
  return filtrarActivos(data);
}

export async function obtenerComunas(token) {
  const data = await fetchJson(`${API_BASE}/Comunas`, token);
  return filtrarActivos(data);
}

export async function obtenerCapacitadores(token) {
  const data = await fetchJson(`${API_BASE}/Usuarios/rol/Capacitador`, token);
  return data.map(u => ({
    id: u.id ?? u.idUsuario,
    nombre: u.nombre ?? u.nombreCompleto,
    email: u.email ?? u.correo
  }));
}

export async function obtenerMunicipios(regionId, token) {
  const path = regionId ? `/Comunas/${regionId}` : `/Comunas`;
  return fetchJson(`${API_BASE}/Comunas/region/${regionId}`, token);
}

// --- NUEVAS FUNCIONES CORREGIDAS ---

export async function obtenerSemanas(token) {
  // El controlador en tu backend es AsignacionSemanal
  return fetchJson(`${API_BASE}/AsignacionSemanals`, token);
}

export async function obtenerClientesPorComuna(idComuna, token) {
  // El controlador es Cliente y recibe idComuna por query
  return fetchJson(`${API_BASE}/Clientes?idComuna=${idComuna}`, token);
}

export async function obtenerTarifasPorCliente(clienteId, token) {
  // Ruta: AsignacionClientes/cliente/{id}
  return fetchJson(`${API_BASE}/AsignacionClientes/cliente/${clienteId}`, token);
}