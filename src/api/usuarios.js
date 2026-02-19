import { API_BASE } from "../config/api";

// Ejecuta baja segura: desactiva y anonimiza PII. Si backend aun no tiene endpoint,
// cae a DELETE (baja logica existente) para no romper flujo.
export async function bajaSeguraUsuario(token, userId, motivo) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const payload = { motivo: String(motivo || "").trim() || "Desvinculacion laboral" };
  const secureUrl = `${API_BASE}/Usuarios/${userId}/baja-segura`;
  const secureRes = await fetch(secureUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (secureRes.ok) return { mode: "secure" };

  if (secureRes.status !== 404 && secureRes.status !== 405) {
    throw new Error((await secureRes.text()) || "No se pudo ejecutar baja segura.");
  }

  const fallbackRes = await fetch(`${API_BASE}/Usuarios/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!fallbackRes.ok) {
    throw new Error((await fallbackRes.text()) || "No se pudo desactivar cuenta.");
  }
  return { mode: "fallback" };
}

export function buildAnonUserView(user) {
  return {
    ...user,
    activo: false,
    nombre: `ANON_${user.id}`,
    email: `anon_${user.id}@anon.local`,
    banco: "",
    cuentaNumero: "",
    cuentaBancaria: "",
    cuentaTipo: "",
    titularNombre: "",
    titularRut: "",
    anonimizado: true,
  };
}
