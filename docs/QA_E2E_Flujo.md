# QA Funcional - Flujo E2E (Secretaria -> Capacitador -> Contadora)

Proyecto: Gestor CAS Chile
Objetivo: probar el flujo completo de asignacion, rendicion, revision, encuadre y transferencias.

## 0) Precondiciones

- Backend arriba en `http://localhost:5067` (Swagger operativo).
- Frontend arriba en `http://localhost:8081`.
- BD `gestorcaschile` disponible.
- Existe al menos:
  - 1 periodo semanal activo.
  - 1 cliente (con comuna y region).
  - 1 usuario por rol: `Administrador`, `Secretaria`, `Contadora`, `Usuario Terreno`.

## 1) Datos de prueba sugeridos (sin tocar produccion)

- Periodo (semanal):
  - Nombre: `Semana 06 - 2026`
  - Inicio (lunes): `2026-02-09`
  - Termino (viernes): `2026-02-13`
  - Activo: `Si`
  - Dias limite rendicion: `3`
- Cliente:
  - Nombre: `Cliente QA Iquique`
  - ComunaId: usar una comuna existente (ver en Admin > Catalogos).
- Viaje:
  - Destino (Municipio/Comuna): `Providencia` (o cualquier comuna existente)
  - Modalidad: `Terreno`
  - Dias: `2` o `3`
  - Montos: usar valores simples y que el total rendido pueda igualar al asignado.

## 2) Nota sobre RUT (para crear usuarios)

En la vista Admin > Usuarios, el RUT debe ser valido (digito verificador mod 11).

Formato recomendado:

- `12345678-5` (sin puntos) o `12.345.678-5` (si la UI lo acepta)

Regla DV (resumen):

- Multiplica los digitos (de derecha a izquierda) por 2..7 repetido, suma, calcula `11 - (suma % 11)`.
- Resultado:
  - 11 => DV `0`
  - 10 => DV `K`
  - otro => ese numero

Ejemplos validos (solo para QA):

- `12345678-5`
- `11111111-1`
- `22222222-2`

## 3) Flujo E2E principal

### Paso A - Admin (preparacion minima)

1. Entrar como `Administrador`.
2. Ir a `Admin > Periodos`.
3. Crear/editar un periodo semanal y marcarlo como `Activo`.
4. Ir a `Admin > Catalogos`.
5. Confirmar que existe al menos 1 `Region`, 1 `Comuna` y 1 `Cliente`.

Esperado:

- El periodo activo aparece en selects (Secretaria y Transferencias).
- Catalogos se reflejan en formularios.

### Paso B - Secretaria (asignar un viaje)

1. Entrar como `Secretaria`.
2. Ir a `Ingresar gasto` (asignacion de viaje).
3. Completar datos obligatorios (capacitador, jefe, region, comuna/municipio, modalidad, dias, fechas).
4. Guardar.

Esperado:

- Mensaje de guardado correcto.
- El viaje aparece en el capacitador (pendiente por rendir).

### Paso C - Capacitador (enviar rendicion con adjuntos)

1. Entrar como `Usuario Terreno`.
2. Ir a `Ingresar rendicion`.
3. Verificar que el selector "Selecciona un viaje" muestre solo `Pendiente` o `Rechazada`.
4. Seleccionar el viaje.
5. Ingresar montos por categoria (el total rendido debe ser igual al total asignado).
6. Adjuntar archivos (pdf/imagen) por categoria con monto > 0.
7. Enviar rendicion.

Esperado:

- Mensaje "Rendicion enviada correctamente".
- El viaje deja de aparecer en el selector (pasa a revision).
- En `Carpeta de viajes` aparece el viaje con estado de revision (segun backend).

### Paso D - Secretaria (enviar a contadora)

1. Entrar como `Secretaria`.
2. Ir a `Carpeta de viajes`.
3. Abrir la rendicion recibida.
4. Enviar a contadora.

Esperado:

- Estado cambia a `EnRevisionContadora` (o equivalente).

### Paso E - Contadora (aprobar / rechazar)

1. Entrar como `Contadora`.
2. Ir a `Rendiciones`.
3. Boton `Actualizar`:

- Solo refresca la lista desde el backend (no aprueba ni rechaza).

4. Abrir una rendicion.
5. Descargar adjuntos por categoria (pdf/imagen).
6. Probar dos variantes:

- E1 Aprobar: aprobar rendicion.
- E2 Rechazar: rechazar con observacion (motivo).

Esperado (E1):

- La rendicion queda `Aprobada` o `Transferida` segun el flujo.
- En Capacitador:
  - `Carpeta de viajes` -> `Historial` muestra la rendicion como aprobada/transferida.
  - No vuelve a aparecer en el selector de "Ingresar rendicion".

Esperado (E2):

- La rendicion queda `Rechazada`.
- En Capacitador:
  - Se muestra el motivo de rechazo.
  - Vuelve a aparecer en el selector para reenviar.

### Paso F - Encuadre (Admin)

1. Entrar como `Administrador`.
2. Ir a `Admin > Encuadre`.
3. Aplicar filtros (periodo / capacitador / estado).
4. Descargar CSV/Excel/PDF si corresponde.

Esperado:

- KPI coherentes (asignado, rendido, diferencia, % cuadre).
- Las filas muestran estado y diferencias.
- Los exportes respetan filtros aplicados.

### Paso G - Transferencias (Secretaria)

1. Entrar como `Secretaria`.
2. Ir a `Transferencias`.
3. Filtrar por estado (ej: `Aprobada`) y periodo (ej: periodo activo).
4. Ver resumen por capacitador.
5. Descargar CSV/Excel.
6. Generar transferencias (si el backend lo soporta con ese rol/endpoint).

Esperado:

- Totales por capacitador correctos.
- CSV/Excel con filas (no solo headers) cuando hay datos.
- Si genera: mensaje con cantidad creada y persistencia en BD.

## 4) Pruebas negativas (rapidas)

- Login:
  - Password incorrecta => 401 y mensaje.
  - Usuario inactivo => bloqueo.
- Rendicion:
  - Total rendido != total asignado => bloquea envio.
  - Monto > 0 sin adjunto => bloquea envio.
- Duplicados:
  - Asignacion semanal duplicada (misma semana + capacitador + cliente) => error.
- Permisos:
  - Endpoints protegidos con rol incorrecto => 403 (esperado).

## 5) Evidencias sugeridas

- 1 captura por paso critico: asignacion, envio rendicion, aprobacion/rechazo, encuadre, transferencias.
- 1 CSV/Excel exportado con datos.
- 1 consulta SQL de validacion (rendiciones recientes):

```sql
SELECT TOP 20 Id, Estado, TotalAsignado, TotalRendido, FechaEnvio
FROM Rendiciones
ORDER BY Id DESC;
```
