import { API_BASE } from "../config/api";

// Helper: fetch + JSON
async function fetchJson(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error al consultar ${url}`);
  return await res.json();
}

function isActivo(row) {
  // Compat: si backend aun no tiene Activo, consideramos activo por defecto.
  const raw = row?.activo ?? row?.Activo;
  return raw === undefined ? true : Boolean(raw);
}

function filtrarActivos(data) {
  return Array.isArray(data) ? data.filter(isActivo) : data;
}

// Catalogo: regiones
export async function obtenerRegiones(token) {
  const data = await fetchJson(`${API_BASE}/Regiones`, token);
  return filtrarActivos(data);
}

// Catalogo: comunas
export async function obtenerComunas(token) {
  const data = await fetchJson(`${API_BASE}/Comunas`, token);
  return filtrarActivos(data);
}

// Catalogo: capacitadores
export async function obtenerCapacitadores(token) {
  const data = await fetchJson(`${API_BASE}/Usuarios/rol/Usuario%20Terreno`, token);
  // Normalizar al shape que espera el frontend: { id, nombre }
  return data.map(u => ({
    id: u.id ?? u.idUsuario,
    nombre: u.nombre ?? u.nombreCompleto,
    email: u.email ?? u.correo
  }));
}

// Catalogo: jefes de proyecto
export async function obtenerJefesProyecto(token) {
  const data = await fetchJson(`${API_BASE}/JefesProyecto`, token);
  return filtrarActivos(data);
}

// Catalogo: municipios por region
export async function obtenerMunicipios(regionId, token) {
  if (!regionId){
    return fetchJson(`${API_BASE}/Comunas`, token);
  }
  return fetchJson(`${API_BASE}/Comunas/${regionId}`, token);
}
