export const SESSION_MS = 5 * 60 * 60 * 1000;
export const STORAGE_TOKEN_KEY = "cas_token";
export const STORAGE_TS_KEY = "cas_token_ts";

export function saveSession(token) {
  const ts = Date.now();
  try {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_TS_KEY, String(ts));
  } catch {
    // Ignora si localStorage esta bloqueado
  }
  try {
    sessionStorage.setItem(STORAGE_TOKEN_KEY, token);
    sessionStorage.setItem(STORAGE_TS_KEY, String(ts));
  } catch {}
  return ts;
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_TS_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_TS_KEY);
  } catch {}
}

export function loadSession() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY);
  const tsRaw = localStorage.getItem(STORAGE_TS_KEY) || sessionStorage.getItem(STORAGE_TS_KEY);
  const ts = Number(tsRaw);
  return { token, ts };
}
