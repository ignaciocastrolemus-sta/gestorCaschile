// Configuracion centralizada de API por ambiente.
// Prioridad:
// 1) EXPO_PUBLIC_API_BASE (recomendado para QA/Produccion)
// 2) URL por defecto local en desarrollo
const ENV_API_BASE =
  (typeof process !== "undefined" && process.env && process.env.EXPO_PUBLIC_API_BASE) || "";

const DEFAULT_DEV_API_BASE = "http://192.168.10.117:8086/api";
const DEFAULT_PROD_API_BASE = "http://192.168.10.117:8086/api";3

const baseUrl = ENV_API_BASE || (__DEV__ ? DEFAULT_DEV_API_BASE : DEFAULT_PROD_API_BASE);

export const API_BASE = String(baseUrl).replace(/\/+$/, "");







