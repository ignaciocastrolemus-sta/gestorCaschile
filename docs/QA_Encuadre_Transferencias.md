# QA Funcional - Encuadre y Transferencias

## Objetivo

Validar conciliacion de montos y generacion de transferencias con exportes.

## Encuadre

### E1 - Filtros

1. Ir a `Admin > Encuadre`.
2. Aplicar filtros por periodo/capacitador/estado.
3. Esperado:
   - KPI se actualiza (asignado, rendido, diferencia, % cuadre).

### E2 - Detalle y rendicion

1. Boton `Ver detalle`.
2. Boton `Ver rendicion`.
3. Esperado:
   - Modal o vista con informacion completa.

### E3 - Exportes

1. Descargar CSV/Excel/PDF.
2. Esperado:
   - Encabezados legibles, filtros aplicados, filas completas.

## Transferencias (Secretaria)

### T1 - Resumen por estado y periodo

1. Ir a `Secretaria > Transferencias`.
2. Filtrar por estado y periodo.
3. Esperado:
   - Totales por capacitador correctos.

### T2 - Generar transferencias

1. Ejecutar `Generar transferencias`.
2. Esperado:
   - Mensaje con cantidad creada.
   - Registro persistido en backend/BD.

### T3 - Exportes

1. Descargar CSV/Excel.
2. Esperado:
   - Datos de transferencia visibles y ordenados.

## Validacion SQL sugerida

```sql
SELECT TOP 20 Id, Estado, TotalAsignado, TotalRendido
FROM Rendiciones
ORDER BY Id DESC;

SELECT TOP 20 *
FROM AsignacionesSemanales
ORDER BY Id DESC;
```
