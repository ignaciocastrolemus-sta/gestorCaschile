import { apiGet } from "./httpClient";

export async function obtenerSaldoMovimientos(token, rendicionId) {
  return await apiGet(`/Rendiciones/${rendicionId}/saldo-movimientos`, { token });
}

