import { apiGet, apiGetBlob, apiPost } from "./httpClient";

export async function obtenerSaldoMovimientos(token, rendicionId) {
  return await apiGet(`/Rendiciones/${rendicionId}/saldo-movimientos`, { token });
}

export async function obtenerRendicionesSecretariaPaginadas(token, page, pageSize) {
  return await apiGet(`/Rendiciones/secretaria/paged?page=${page}&pageSize=${pageSize}`, { token });
}

export async function obtenerRendicionesSecretaria(token) {
  return await apiGet("/Rendiciones/secretaria", { token });
}

export async function obtenerRendicionesContadoraPaginadas(token, page, pageSize) {
  return await apiGet(`/Rendiciones/contadora/paged?page=${page}&pageSize=${pageSize}`, { token });
}

export async function obtenerRendicionesContadora(token) {
  return await apiGet("/Rendiciones/contadora", { token });
}

export async function obtenerHistorialContadora(token, estado = "") {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  return await apiGet(`/Rendiciones/contadora/historial${query}`, { token });
}

export async function obtenerRendicionesMias(token) {
  return await apiGet("/Rendiciones/mias", { token });
}

export async function obtenerSaldosPaginados(token, page, pageSize, incluirCerrados = true) {
  return await apiGet(
    `/Rendiciones/saldos/paged?page=${page}&pageSize=${pageSize}&incluirCerrados=${incluirCerrados ? "true" : "false"}`,
    { token }
  );
}

export async function obtenerSaldos(token) {
  return await apiGet("/Rendiciones/saldos", { token });
}

export async function obtenerRendicionesJustificadas(token) {
  return await apiGet("/Rendiciones/justificadas", { token });
}

export async function obtenerNotificacionesSaldo(token, top = 10) {
  return await apiGet(`/Rendiciones/saldos/notificaciones?top=${top}`, { token });
}

export async function enviarRendicionAContadora(token, rendicionId) {
  return await apiPost(`/Rendiciones/${rendicionId}/enviar-contadora`, {}, { token });
}

export async function resolverRendicionContadora(token, rendicionId, payload) {
  return await apiPost(`/Rendiciones/${rendicionId}/resolver`, payload, { token });
}

export async function justificarPendienteRendicion(token, rendicionId, payload) {
  return await apiPost(`/Rendiciones/${rendicionId}/justificar-pendiente`, payload, { token });
}

export async function levantarJustificacionRendicion(token, rendicionId) {
  return await apiPost(`/Rendiciones/${rendicionId}/levantar-justificacion`, {}, { token });
}

export async function registrarSaldoSecretaria(token, rendicionId, payload) {
  return await apiPost(`/Rendiciones/${rendicionId}/registrar-saldo`, payload, { token });
}

export async function registrarSaldoCapacitador(token, rendicionId, formData) {
  return await apiPost(`/Rendiciones/${rendicionId}/registrar-saldo-capacitador`, formData, { token });
}

export async function revertirSaldoRendicion(token, rendicionId, payload) {
  return await apiPost(`/Rendiciones/${rendicionId}/revertir-saldo`, payload, { token });
}

export async function obtenerAdjuntosRendicion(token, rendicionId) {
  return await apiGet(`/Rendiciones/${rendicionId}/adjuntos`, { token });
}

export async function descargarAdjuntoRendicion(token, adjuntoId) {
  return await apiGetBlob(`/Rendiciones/adjuntos/${adjuntoId}`, { token });
}
