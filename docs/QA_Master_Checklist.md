# QA Funcional - Checklist Maestro

Proyecto: Gestor CAS Chile
Fecha base: 2026-02-11

## Precondiciones

- Backend arriba en `http://localhost:5067`
- Frontend arriba en `http://localhost:8081`
- BD `gestorcaschile` disponible
- Datos minimos: periodos, clientes, regiones, usuarios por rol

## Documentos de prueba

- `docs/QA_Login_Roles.md`
- `docs/QA_E2E_Flujo.md`
- `docs/QA_Secretaria.md`
- `docs/QA_Capacitador.md`
- `docs/QA_Contadora.md`
- `docs/QA_Admin.md`
- `docs/QA_Encuadre_Transferencias.md`

## Cierre funcional (aprobado/rechazado)

- Login y cambio obligatorio por primer acceso: [ ]
- Flujo Secretaria (asigna y envia): [ ]
- Flujo Capacitador (rinde con adjuntos): [ ]
- Flujo Contadora (aprueba/rechaza): [ ]
- Flujo Admin (CRUD + catalogos + periodos + tarifas): [ ]
- Encuadre (KPI + filtros + detalle + exportes): [ ]
- Transferencias (resumen + generar + exportes): [ ]

## Evidencias sugeridas

- Captura de pantalla por caso importante
- CSV/Excel/PDF exportados
- 3 consultas SQL de validacion (usuarios/rendiciones/transferencias)
