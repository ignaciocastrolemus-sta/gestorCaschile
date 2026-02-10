import { API_BASE } from "../config/api";

// Helper: fetch + JSON
async function fetchJson(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error al consultar ${url}`);
  return await res.json();
}

// CatÃ¡logo: regiones
export async function obtenerRegiones(token) {
  return await fetchJson(`${API_BASE}/Regiones`, token);
}

// CatÃ¡logo: comunas
export async function obtenerComunas(token) {
  return await fetchJson(`${API_BASE}/Comunas`, token);
}

// CatÃ¡logo: capacitadores
export async function obtenerCapacitadores(token) {
  return await fetchJson(`${API_BASE}/Capacitadores`, token);
}

// CatÃ¡logo: jefes de proyecto
export async function obtenerJefesProyecto(token) {
  return await fetchJson(`${API_BASE}/JefesProyecto`, token);
}

// CatÃ¡logo: municipios por regiÃ³n
export async function obtenerMunicipios(regionId, token) {
  const params = regionId ? `?region=${encodeURIComponent(regionId)}` : "";
  return await fetchJson(`${API_BASE}/Municipios${params}`, token);
}




