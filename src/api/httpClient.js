import { API_BASE } from "../config/api";

function buildUrl(endpoint) {
  const cleanEndpoint = String(endpoint || "").trim();
  if (!cleanEndpoint) return API_BASE;
  if (cleanEndpoint.startsWith("http://") || cleanEndpoint.startsWith("https://")) return cleanEndpoint;
  return `${API_BASE}${cleanEndpoint.startsWith("/") ? "" : "/"}${cleanEndpoint}`;
}

function tryParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractErrorMessage(status, bodyText, parsedJson) {
  if (parsedJson && typeof parsedJson === "object") {
    const fromMessage = parsedJson.message || parsedJson.error || parsedJson.title || "";
    if (fromMessage) return String(fromMessage);
  }

  const text = String(bodyText || "").trim();
  if (!text) return `Error HTTP ${status}`;
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    return "El servidor devolvio HTML en vez de JSON. Revisa API/CORS/backend.";
  }
  return text;
}

export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    token,
    headers = {},
    body,
    timeoutMs = 20000,
    signal,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const mergedSignal = signal || controller.signal;

  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let finalBody = body;
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
    finalBody = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(buildUrl(endpoint), {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: mergedSignal,
    });

    const contentType = res.headers.get("content-type") || "";
    const bodyText = await res.text();
    const parsedJson = contentType.includes("application/json") ? tryParseJson(bodyText) : null;

    if (!res.ok) {
      throw new Error(extractErrorMessage(res.status, bodyText, parsedJson));
    }

    if (res.status === 204) return null;
    if (parsedJson !== null) return parsedJson;
    return bodyText;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al conectar con el servidor.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiGet = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "GET" });
export const apiPost = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: "POST", body });
export const apiPut = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: "PUT", body });
export const apiDelete = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "DELETE" });

export async function apiGetBlob(endpoint, options = {}) {
  const { token, headers = {}, timeoutMs = 20000, signal } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const mergedSignal = signal || controller.signal;

  try {
    const res = await fetch(buildUrl(endpoint), {
      method: "GET",
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: mergedSignal,
    });

    if (!res.ok) {
      const bodyText = await res.text();
      throw new Error(extractErrorMessage(res.status, bodyText, tryParseJson(bodyText)));
    }

    return await res.blob();
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al conectar con el servidor.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
