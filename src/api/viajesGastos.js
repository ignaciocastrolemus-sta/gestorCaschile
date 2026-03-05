import { API_BASE } from "../config/api";
// Endpoint base: ViajesGastos
const API_URL = `${API_BASE}/AsignacionViajes`;

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
export async function listarViajes(token) {
  // Verificamos si llega el token por consola para debuggear (borrar después)
  console.log("Token enviado al API:", token ? "Recibido" : "FALTANTE");

  const res = await fetch(`${API_BASE}/AsignacionViajes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // <-- Vital: Espacio después de Bearer
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
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


export async function obtenerViajesPorTransferir(token) {
  try {
    const res = await fetch(`${API_BASE}/AsignacionViajes/pendientes-transferencia`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[API GET pendientes-transferencia] Falló con status:", res.status, errorText);
      throw new Error("Error al cargar los viajes pendientes de transferencia.");
    }
    
    return await res.json();
  } catch (error) {
    console.error("[API] Excepción de red en obtenerViajesPorTransferir:", error);
    throw error;
  }
}

export async function transferirFondosViaje(idAsignacionViaje, token) {
  try {
    const res = await fetch(`${API_BASE}/AsignacionViajes/${idAsignacionViaje}/transferir`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      // Intentamos parsear el JSON de error que manda tu backend en el BadRequest
      let errorMsg = "Error al aprobar la transferencia de fondos.";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch (parseError) {
        const textData = await res.text();
        console.error("[API PUT transferir] Respuesta no JSON:", textData);
      }
      
      console.error(`[API PUT transferir] Falló para ID ${idAsignacionViaje} con status:`, res.status, errorMsg);
      throw new Error(errorMsg);
    }
    
    return await res.json();
  } catch (error) {
    console.error("[API] Excepción de red en transferirFondosViaje:", error);
    throw error;
  }
}
