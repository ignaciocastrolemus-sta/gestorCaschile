import { normalizeText } from "./textUtils";

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

const HIDDEN_STORAGE_PREFIX = "noti_hidden_v1";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage || null;
}

export function getHiddenNotificationIds(scope = "default") {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(`${HIDDEN_STORAGE_PREFIX}:${scope}`);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function hideNotifications(scope = "default", notifications = []) {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const current = new Set(getHiddenNotificationIds(scope));
    (Array.isArray(notifications) ? notifications : []).forEach((n) => {
      if (n?.id !== undefined && n?.id !== null) current.add(String(n.id));
    });
    const next = Array.from(current);
    storage.setItem(`${HIDDEN_STORAGE_PREFIX}:${scope}`, JSON.stringify(next));
    return next;
  } catch {
    return getHiddenNotificationIds(scope);
  }
}

export function getVisibleNotifications(list, hiddenIds = []) {
  const arr = Array.isArray(list) ? list : [];
  const hidden = new Set((Array.isArray(hiddenIds) ? hiddenIds : []).map((x) => String(x)));
  return arr.filter((n) => !hidden.has(String(n?.id)) && !shouldHideResolvedNotification(n));
}

export function getRecentVisibleNotificationCount(list, days = 3, hiddenIds = []) {
  const from = new Date();
  from.setDate(from.getDate() - Math.max(0, Number(days) || 0));
  return getVisibleNotifications(list, hiddenIds).filter((n) => {
    const d = new Date(n?.fechaRegistro || "");
    return !Number.isNaN(d.getTime()) && d >= from;
  }).length;
}
