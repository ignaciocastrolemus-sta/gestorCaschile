export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function resolveTipoResultado(item) {
  const tipoRaw = String(item?.tipoResultado || "").toLowerCase();
  if (tipoRaw.includes("reemb")) return "Reembolso";
  if (tipoRaw.includes("devol")) return "Devolucion";
  const diferencia = Number(
    item?.diferencia ?? Number(item?.totalRendido || 0) - Number(item?.totalAsignado || 0)
  );
  if (diferencia > 0) return "Reembolso";
  if (diferencia < 0) return "Devolucion";
  return "Cuadrada";
}

export function resolveSaldoEstado(item) {
  const raw = String(item?.saldoEstado || "").toLowerCase();
  if (raw.includes("cerr")) return "Cerrado";
  if (Number(item?.saldoPendiente || 0) <= 0) return "Cerrado";
  return "Pendiente";
}

export function isSaldoRendicionValida(item) {
  const estado = normalizeText(item?.estado || "");
  if (!estado) return false;
  // Regla de negocio: solo rendiciones aprobadas/transferidas generan saldo financiero.
  if (estado.includes("rechaz")) return false;
  return (
    estado.includes("aprob") ||
    estado.includes("transfer") ||
    estado.includes("completa") ||
    estado.includes("cerrad")
  );
}
