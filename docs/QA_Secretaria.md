# QA Funcional - Secretaria

## Objetivo

Validar asignacion de viajes, carpeta de viajes y transferencia a contadora.

## Casos

### S1 - Crear viaje/asignacion

1. Entrar con rol `Secretaria`.
2. Ir a `Ingresar gasto`.
3. Completar datos obligatorios y guardar.
4. Esperado:
   - Mensaje de guardado correcto.
   - Viaje visible para capacitador.

### S2 - Asignacion clientes por semana

1. Ir a `Asignacion clientes`.
2. Seleccionar mes/anio y semana activa.
3. Crear asignacion sin duplicados.
4. Esperado:
   - Guarda correctamente.
   - Si duplicas misma combinacion semana+capacitador+cliente, bloquea.

### S3 - Filtros rapidos

1. Filtrar por semana, capacitador y estado.
2. Esperado:
   - Listado solo con coincidencias.

### S4 - Envio a contadora

1. Ir a `Carpeta de viajes`.
2. Seleccionar rendicion pendiente.
3. Enviar a contadora.
4. Esperado:
   - Cambia estado a revision contadora.

## Validacion SQL

```sql
SELECT TOP 20 Id, Estado, TotalAsignado, TotalRendido
FROM Rendiciones
ORDER BY Id DESC;
```
