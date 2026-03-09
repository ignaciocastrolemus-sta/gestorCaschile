const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hasAny = (text, words) => words.some((w) => text.includes(w));

export function shouldHideResolvedNotification(notification) {
  const text = normalizeText(`${notification?.titulo || ""} ${notification?.mensaje || ""}`);

  // Si hay accion pendiente, la notificacion debe seguir visible.
  if (
    hasAny(text, [
      "rechaz",
      "pendiente",
      "devolucion",
      "devolver",
      "reembolso",
      "saldo pendiente",
      "empresa te debe",
      "debes devolver",
      "justific",
    ])
  ) {
    return false;
  }

  const isAprobada = hasAny(text, ["aprobo", "aprobada", "aprobado"]);
  const isCerradaSinSaldo = hasAny(text, ["cuadrad", "sin saldo", "saldo cerrado", "estado cerrado"]);

  return isAprobada && isCerradaSinSaldo;
}

export function getVisibleNotifications(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((n) => !shouldHideResolvedNotification(n));
}

export function getRecentVisibleNotificationCount(list, days = 3) {
  const from = new Date();
  from.setDate(from.getDate() - Math.max(0, Number(days) || 0));
  return getVisibleNotifications(list).filter((n) => {
    const d = new Date(n?.fechaRegistro || "");
    return !Number.isNaN(d.getTime()) && d >= from;
  }).length;
}

