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

// Usuarios capacitadores desde UsuariosController.
export async function obtenerCapacitadoresUsuarios(token) {
  const data = await fetchJson(`${API_BASE}/Usuarios/capacitadores`, token);
  const rows = filtrarActivos(data);
  if (!Array.isArray(rows)) return [];

  return rows
    .filter((u) => {
      const rol = String(u?.rolNombre ?? u?.RolNombre ?? "").trim().toLowerCase();
      const rolId = Number(u?.rolId ?? u?.RolId ?? 0);
      return rolId === 2 || rol === "usuario terreno" || rol === "capacitador";
    })
    .map((u) => ({
      id: u?.id ?? u?.Id ?? null,
      nombre: String(u?.nombre ?? u?.Nombre ?? "").trim(),
      email: String(u?.email ?? u?.Email ?? "").trim(),
    }))
    .filter((u) => u.nombre);
}

// Catalogo: jefes de proyecto
export async function obtenerJefesProyecto(token) {
  const data = await fetchJson(`${API_BASE}/JefesProyecto`, token);
  return filtrarActivos(data);
}

// Catalogo: municipios por region
export async function obtenerMunicipios(regionId, token) {
  const params = regionId ? `?region=${encodeURIComponent(regionId)}` : "";
  const data = await fetchJson(`${API_BASE}/Municipios${params}`, token);
  return filtrarActivos(data);
}
