# Checklist Post Deploy

## Backend
- API levanta sin errores (`http://localhost:5067/swagger` o URL productiva).
- CORS permite origen frontend configurado.
- Logs sin excepciones criticas al iniciar.

## Base de datos
- Migraciones aplicadas sin error.
- Indice de rendicion abierta existe:
  - `UX_Rendicion_Viaje_Usuario_Abierta`
- Validacion SQL de columnas/indices ejecutada.

## Frontend
- `.env` apunta a la URL API correcta.
- Login carga y autentica por rol.
- No hay errores de CORS/500 en consola.

## Smoke test funcional
- Crear/editar en Admin Roles/Periodos/Usuarios.
- Enviar una rendicion desde capacitador.
- Enviar a contadora desde secretaria.
- Aprobar/rechazar desde contadora.
- Registrar saldo y revisar movimientos.

## Seguridad y datos
- Baja segura anonimiza datos personales.
- Usuario dado de baja no puede iniciar sesion.

## Cierre
- Evidencia adjunta en ticket (capturas/logs SQL).
- Version/commit desplegado registrado.
- Responsable de validacion firmado.

