// Configuracion ESLint para Expo/React Native (web + mobile).
// Objetivo: estandarizar estilo y detectar errores comunes sin tocar la logica.

module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  rules: {
    // El repo tiene varios archivos guardados con UTF-8 BOM (Visual Studio / Windows).
    // No afecta ejecucion, pero genera ruido en lint.
    "unicode-bom": "off",

    // Evita ruido en builds; RN suele tolerar console.log en desarrollo.
    "no-console": "off",
  },
};
