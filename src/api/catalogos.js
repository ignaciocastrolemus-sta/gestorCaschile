// Base API
const API_BASE = "http://localhost:5067/api";

// Helper: fetch + JSON
async function fetchJson(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error al consultar ${url}`);
  return await res.json();
}

// Catálogo: regiones
export async function obtenerRegiones(token) {
  return await fetchJson(`${API_BASE}/Regiones`, token);
}

// Catálogo: comunas
export async function obtenerComunas(token) {
  return await fetchJson(`${API_BASE}/Comunas`, token);
}

// Catálogo: capacitadores
export async function obtenerCapacitadores(token) {
  return await fetchJson(`${API_BASE}/Capacitadores`, token);
}

// Catálogo: jefes de proyecto
export async function obtenerJefesProyecto(token) {
  return await fetchJson(`${API_BASE}/JefesProyecto`, token);
}

// Catálogo: municipios por región
export async function obtenerMunicipios(regionId, token) {
  const params = regionId ? `?region=${encodeURIComponent(regionId)}` : "";
  return await fetchJson(`${API_BASE}/Municipios${params}`, token);
}
