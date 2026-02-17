# QA - Login y redireccion por rol

Fecha base: 2026-02-11
Objetivo: validar cambio obligatorio de clave + redireccion por rol.

## 1) Precondicion

- Backend levantado en `http://localhost:5067`
- Frontend levantado en `http://localhost:8081`
- Usuario admin con acceso a `Usuarios`

## 2) Casos de prueba

### Caso A - Primer ingreso (cambio obligatorio)

1. Crear usuario nuevo desde vista Admin > Usuarios.
2. Ingresar con ese usuario y clave temporal.
3. Resultado esperado:
   - No entra a la app principal.
   - Muestra bloque "Cambiar contrasena obligatoria".
4. Probar validaciones:
   - Nueva clave sin mayuscula => rechaza.
   - Nueva clave sin numero => rechaza.
   - Nueva clave sin simbolo => rechaza.
   - Nueva clave igual a actual => rechaza.
5. Cambiar con clave valida.
6. Resultado esperado:
   - Autenticacion correcta.
   - Redireccion a la vista segun rol.

### Caso B - Reingreso normal

1. Cerrar sesion.
2. Volver a iniciar con la nueva clave.
3. Resultado esperado:
   - No pide cambio obligatorio.
   - Entra directo a su vista por rol.

### Caso C - Rol Administrador

1. Ingresar con un usuario rol `Administrador`.
2. Resultado esperado: abre `AdminHome`.

### Caso D - Rol Secretaria

1. Ingresar con un usuario rol `Secretaria`.
2. Resultado esperado: abre `SecretariaLayout`.

### Caso E - Rol Contadora

1. Ingresar con un usuario rol `Contadora`.
2. Resultado esperado: abre `ContadoraHome`.

### Caso F - Rol Usuario Terreno

1. Ingresar con un usuario rol `Usuario Terreno`.
2. Resultado esperado: abre `CapacitadorHome`.

## 3) Verificacion en BD (SQL)

### Ver estado de cambio obligatorio

```sql
SELECT Id, Email, DebeCambiarPassword, RolId
FROM Usuarios
ORDER BY Id DESC;
```

### Esperado

- Antes de primer cambio: `DebeCambiarPassword = 1`
- Despues de cambiar clave: `DebeCambiarPassword = 0`

## 4) Criterio de aprobado

- Todos los roles redirigen a su vista correcta.
- Cambio obligatorio se aplica solo en primer ingreso.
- Login posterior funciona sin bloqueo.
- No hay 401 para credenciales validas.
