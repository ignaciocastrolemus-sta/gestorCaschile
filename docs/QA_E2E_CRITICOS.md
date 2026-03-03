# QA E2E Criticos

Objetivo: validar flujos de negocio de punta a punta antes de desplegar.

## 1) Login por rol
- Probar acceso con: `Administrador`, `Secretaria`, `Contadora`, `Usuario Terreno`.
- Verificar que cada rol vea solo su menu.
- Verificar rechazo de credenciales invalidas.

## 2) Flujo secretaria -> capacitador -> secretaria -> contadora
- Secretaria crea viaje/asignacion.
- Capacitador ingresa rendicion con adjuntos y envia.
- Secretaria ve rendicion, envia a contadora.
- Contadora aprueba/rechaza.
- Verificar estado final de viaje/rendicion.

## 3) Doble clic / acciones repetidas
- En capacitador: doble clic en "Enviar rendicion".
- En secretaria: doble clic en "Enviar a contadora" y "Registrar pago/devolucion".
- En contadora: doble clic en "Aprobar", "Rechazar", "Registrar saldo".
- Resultado esperado: solo una operacion efectiva.

## 4) Saldos
- Caso A favor (Reembolso): aprobar y registrar pago.
- Caso En contra (Devolucion): aprobar y registrar devolucion.
- Verificar movimientos en historial y cierre de saldo.

## 5) Baja segura de usuario
- En Admin Usuarios, aplicar "Baja segura".
- Verificar:
  - `Activo = false`
  - `Anonimizado = true`
  - campos personales anonimizados
  - el usuario ya no puede iniciar sesion.

## 6) Validaciones de formularios admin
- Roles/Periodos/Usuarios: probar campos obligatorios y formatos invalidos.
- Verificar mensajes de error claros y sin caidas.

## 7) Exportes
- Generar Excel/PDF en vistas que corresponda.
- Verificar nombre de archivo, contenido y filtros aplicados.

## Evidencia recomendada
- Capturas por paso + resultado esperado.
- IDs de rendicion usados en prueba.
- Fecha/hora de ejecucion.

