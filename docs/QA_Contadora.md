# QA Funcional - Contadora

## Objetivo

Validar revision de rendiciones, descarga de adjuntos y resolucion.

## Casos

### CO1 - Ver rendiciones en revision

1. Entrar con rol `Contadora`.
2. Ir a `Rendiciones`.
3. Esperado:
   - Lista documentos pendientes de resolver.

### CO2 - Revisar adjuntos

1. Abrir una rendicion.
2. Descargar adjuntos.
3. Esperado:
   - Archivo descargable sin error.

### CO3 - Aprobar

1. Aprobar rendicion.
2. Esperado:
   - Estado final aprobado/transferida segun flujo.

### CO4 - Rechazar

1. Rechazar con observacion.
2. Esperado:
   - Motivo visible para capacitador/secretaria.
