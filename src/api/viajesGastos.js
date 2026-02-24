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
export const crearViaje = async (payload, token) => {
  try {
    const res = await fetch(`${API_BASE}/AsignacionViajes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Se inyecta el token de sesión
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Si la respuesta no es 200/201 (Ej. un 400 Bad Request por validación del backend)
    if (!res.ok) {
      // Intentamos extraer el campo "error" que envía el AsignacionViajesController
      const mensajeError = data.error || "Error desconocido en el servidor.";
      throw new Error(mensajeError); 
    }

    return data; // Si todo sale bien, retornamos el id del viaje asignado
  } catch (error) {
    // Propagamos el error hacia useSecretariaForm.js
    throw error;
  }
};

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
