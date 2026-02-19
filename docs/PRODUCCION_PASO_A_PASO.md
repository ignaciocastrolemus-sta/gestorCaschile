# Paso a produccion - Checklist operativo

Fecha: ____ / ____ / ______
Version (frontend): __________________
Version (backend): ___________________
Responsable: _________________________

## 1) Previo al despliegue

- [ ] Confirmar rama/tag a desplegar.
- [ ] Confirmar que `dotnet build` backend compila sin errores.
- [ ] Confirmar frontend sin errores criticos en consola.
- [ ] Crear respaldo de BD (backup completo).
- [ ] Validar archivo `.env` de produccion (sin `localhost`).

## 2) BD (primero)

- [ ] Ejecutar scripts/migraciones pendientes.
- [ ] Validar columnas nuevas requeridas (`Usuarios`, `Rendiciones`, etc.).
- [ ] Validar indices creados.

## 3) Backend (segundo)

- [ ] Publicar API con `appsettings.Production.json`.
- [ ] Verificar cadena de conexion productiva.
- [ ] Verificar JWT/secretos por variable de entorno.
- [ ] Verificar endpoints criticos:
  - [ ] `POST /api/Auth/login`
  - [ ] `GET /api/Usuarios`
  - [ ] `GET /api/Rendiciones/contadora/paged`
  - [ ] `GET /api/Rendiciones/saldos/paged`

## 4) Frontend (tercero)

- [ ] Configurar `EXPO_PUBLIC_API_BASE` apuntando a API productiva.
- [ ] Desplegar build.
- [ ] Confirmar login y navegacion por rol.

## 5) Smoke test post-deploy

- [ ] Admin: crear usuario y ver listado.
- [ ] Secretaria: ver rendiciones y enviar a contadora.
- [ ] Contadora: aprobar/rechazar rendicion.
- [ ] Capacitador: ver estado en carpeta de viajes.
- [ ] Saldos: registrar pago/devolucion y ver movimientos.
- [ ] Exportes: CSV/Excel/PDF se descargan correctamente.

## 6) Criterio de aprobacion

- [ ] No hay errores 500 en endpoints criticos.
- [ ] No hay errores de esquema SQL (columnas faltantes).
- [ ] Login y flujo principal E2E OK.

## 7) Rollback (si falla)

1. Revertir frontend a version anterior.
2. Revertir API a version anterior.
3. Restaurar backup BD (si el problema es de datos/esquema).
4. Revalidar login y endpoints base.

---

## Estado actual (2026-02-18)

- [x] Frontend con `.env` configurado (`EXPO_PUBLIC_API_BASE`).
- [x] Frontend lint (`npm run lint`) sin errores.
- [x] Backend compila (`dotnet build`) sin errores.
- [ ] Ejecutar `docs/SQL_VALIDACION_POST_DEPLOY.sql` en SQL Server y adjuntar evidencia.
- [ ] Completar smoke test final por rol (Admin/Secretaria/Contadora/Capacitador).
