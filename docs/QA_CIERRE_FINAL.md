# QA Cierre Final - Rendiciones CAS Chile

Fecha: 2026-02-17  
Rama: `logincaschile`

## 1) Alcance validado

- Flujo completo por rol: `Administrador`, `Secretaria`, `Contadora`, `Usuario Terreno`.
- Login con cambio obligatorio de contrasena para usuarios nuevos.
- Asignacion de viajes y rendiciones con adjuntos.
- Revision y resolucion de rendiciones (aprobar/rechazar).
- Control de saldos (reembolso/devolucion), registro de pagos y movimientos.
- Estado `PendienteJustificada` (motivo, fecha, levantamiento y retorno al flujo normal).

## 2) Checklist funcional (OK/FAIL)

### 2.1 Login y roles
- [ ] Admin inicia sesion y entra a vista Admin.
- [ ] Secretaria inicia sesion y entra a vista Secretaria.
- [ ] Contadora inicia sesion y entra a vista Contadora.
- [ ] Usuario Terreno inicia sesion y entra a vista Capacitador.
- [ ] Usuario nuevo obliga cambio de contrasena y luego permite acceso.

### 2.2 Secretaria
- [ ] Visualiza rendiciones pendientes en `Carpeta de viajes`.
- [ ] Ve semaforo/estado y bloque `Que hacer ahora`.
- [ ] Envia rendicion a contadora.
- [ ] Marca rendicion como `Pendiente justificada`.
- [ ] Visualiza rendiciones justificadas en su bloque.
- [ ] Levanta justificacion y la rendicion vuelve al flujo normal.

### 2.3 Contadora
- [ ] Ve rendiciones en revision.
- [ ] Ve semaforo/estado y bloque `Que hacer ahora`.
- [ ] Rechaza rendicion y vuelve a capacitador para correccion.
- [ ] Aprueba rendicion y registra saldo cuando corresponde.
- [ ] En `Saldos` registra pago/devolucion.
- [ ] `Ver movimientos` muestra historial de operaciones.

### 2.4 Capacitador
- [ ] Ve estado de rendiciones en `Carpeta de viajes`.
- [ ] Si esta `PendienteJustificada`, se muestra como justificada.
- [ ] Rendicion justificada no aparece para reenvio en `Mis rendiciones`.
- [ ] Rendicion rechazada permite correccion y reenvio.

### 2.5 Saldos y KPI
- [ ] KPI de saldos muestra: pendientes, monto pendiente, a favor, en contra.
- [ ] Al cerrar saldo, pasa a historial de cerrados.
- [ ] Filtros por tipo (`A favor`, `En contra`) funcionan correctamente.
- [ ] Historial de saldos cerrados filtra por mes en Secretaria.
- [ ] Historial de saldos cerrados filtra por mes en Contadora.
- [ ] Exporte mensual `Excel` descarga con resumen y tabla.
- [ ] Exporte mensual `PDF` abre impresion con el mes filtrado.

## 3) Validacion tecnica

### 3.1 Frontend
- [ ] Sin errores criticos en consola navegador.
- [ ] Navegacion por rol consistente.
- [ ] Boton `Actualizar` refresca datos en vistas operativas.

### 3.2 Backend
- [ ] Endpoints de rendiciones responden sin excepciones.
- [ ] Endpoints de justificacion operan correctamente:
  - `POST /api/Rendiciones/{id}/justificar-pendiente`
  - `POST /api/Rendiciones/{id}/levantar-justificacion`
  - `GET /api/Rendiciones/justificadas`
- [ ] Endpoints de saldos/movimientos operativos:
  - `POST /api/Rendiciones/{id}/registrar-saldo`
  - `GET /api/Rendiciones/{id}/saldo-movimientos`

### 3.3 Base de datos
- [ ] Tabla `Rendiciones` contiene columnas:
  - `EstadoPrevioJustificacion`
  - `MotivoPendiente`
  - `PendienteHasta`
  - `ObservacionPendiente`
- [ ] Indice `IX_Rendicion_Estado_PendienteHasta` creado.

## 4) SQL de verificacion

```sql
USE gestorcaschile;
GO

SELECT name
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.Rendiciones')
  AND name IN (
    'EstadoPrevioJustificacion',
    'MotivoPendiente',
    'PendienteHasta',
    'ObservacionPendiente'
  );
GO

SELECT TOP 20
  Id,
  Estado,
  TipoResultado,
  SaldoEstado,
  SaldoPendiente,
  MotivoPendiente,
  PendienteHasta,
  FechaEnvio
FROM Rendiciones
ORDER BY Id DESC;
GO
```

## 5) Notas de release

- Se integra flujo de rendiciones con control de saldos y auditoria de movimientos.
- Se incorpora `PendienteJustificada` para casos operativos (ej. licencia medica).
- Se mejora UX por rol con semaforo de estado, texto de accion sugerida y accion principal visible.
- Se mantiene compatibilidad con flujo existente de secretaria y contadora.

## 6) Criterio de cierre

El release queda aprobado cuando:

1. Todo el checklist funcional este en `OK`.
2. No existan errores criticos en backend/frontend durante pruebas.
3. La validacion SQL confirme estructura y datos esperados.
4. Se complete checklist de `docs/PRODUCCION_PASO_A_PASO.md`.
5. Se ejecute `docs/SQL_VALIDACION_POST_DEPLOY.sql` con resultado correcto.
