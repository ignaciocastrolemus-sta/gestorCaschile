// Montos por comuna (backend)
const API_URL = "http://localhost:5067/api/MontosComuna";

// Consulta montos por región y comuna
export async function obtenerMontos(regionId, comuna, signal) {
  if (!regionId || !comuna) return null;
  const params = new URLSearchParams({
    region: String(regionId),
    comuna,
  });
  const res = await fetch(`${API_URL}?${params.toString()}`, { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al obtener montos");
  return await res.json();
}
