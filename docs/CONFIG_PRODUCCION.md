# Configuracion para QA/Produccion

## Frontend (Expo)

Crear archivo `.env` en la raiz del proyecto:

```env
EXPO_PUBLIC_API_BASE=http://localhost:5067/api
```

Para produccion:

```env
EXPO_PUBLIC_API_BASE=https://api.tu-dominio.cl/api
```

La app usa `EXPO_PUBLIC_API_BASE` desde `src/config/api.js`.
