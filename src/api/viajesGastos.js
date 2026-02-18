import { API_BASE } from "../config/api";
// Endpoint base: ViajesGastos
const API_URL = `${API_BASE}/ViajesGastos`;

// Convierte DD/MM/AAAA a YYYY-MM-DD (para backend)
function toIsoDate(fechaDDMMYYYY) {
  if (!fechaDDMMYYYY || typeof fechaDDMMYYYY !== "string") return fechaDDMMYYYY;
  const parts = fechaDDMMYYYY.split("/");
  if (parts.length !== 3) return fechaDDMMYYYY;
  const [d, m, y] = parts;
  if (!d || !m || !y) return fechaDDMMYYYY;
  return `${y}-${m}-${d}`;
}

// Normaliza fechas del payload antes de enviar
function normalizeViajePayload(viaje) {
  if (!viaje || typeof viaje !== "object") return viaje;
  return {
    ...viaje,
    fecha: toIsoDate(viaje.fecha),
    fechaInicio: toIsoDate(viaje.fechaInicio),
    fechaTermino: toIsoDate(viaje.fechaTermino),
  };
}

// LISTAR viajes
export async function listarViajes() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al listar viajes");
  return await res.json();
}

// CREAR viaje
export async function crearViaje(viaje, token) {
  const payload = normalizeViajePayload(viaje);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Error al crear viaje");
  }

  return await res.json();
}

// ACTUALIZAR viaje (PUT)
export async function actualizarViaje(id, viaje) {
  const payload = normalizeViajePayload(viaje);
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Error al actualizar");
  }

  return true; // 204
}

// ELIMINAR viaje
export async function eliminarViaje(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar");
  return true;
}
