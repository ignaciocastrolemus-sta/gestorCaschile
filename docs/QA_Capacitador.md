# QA Funcional - Capacitador

## Objetivo

Validar seleccion de viaje, ingreso de gastos, adjuntos y envio de rendicion.

## Casos

### C1 - Ver viajes asignados

1. Entrar con rol `Usuario Terreno`.
2. Ir a `Mis rendiciones` o `Carpeta de viajes`.
3. Esperado:
   - Se listan viajes asignados.
   - Filtros responden por estado/fechas/destino.

### C2 - Enviar rendicion con adjuntos

1. Abrir un viaje pendiente.
2. Cargar montos por categoria.
3. Adjuntar archivos (img/pdf).
4. Enviar rendicion.
5. Esperado:
   - Mensaje "Rendicion enviada".
   - Estado pasa a revision.

### C3 - Rechazo y reenvio

1. Si contadora rechaza, revisar motivo.
2. Corregir y reenviar.
3. Esperado:
   - El motivo se visualiza.
   - Se permite nuevo envio.
