import { API_BASE } from "../config/api";

export async function obtenerSaldoMovimientos(token, rendicionId) {
  const res = await fetch(`${API_BASE}/Rendiciones/${rendicionId}/saldo-movimientos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "No se pudo cargar historial de movimientos.");
  }
  return await res.json();
}

