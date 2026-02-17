# QA Funcional - Admin

## Objetivo

Validar mantenedores y gobierno de datos.

## Casos

### A1 - Usuarios

1. Crear usuario con datos bancarios.
2. Validar RUT y campos obligatorios.
3. Editar usuario.
4. Desactivar usuario.
5. Esperado:
   - CRUD operativo.
   - Login respeta estado activo.

### A2 - Roles

1. Crear, editar y eliminar rol no protegido.
2. Intentar eliminar rol protegido.
3. Esperado:
   - Protecciones aplicadas.

### A3 - Catalogos

1. Crear/editar/eliminar clientes, comunas y regiones.
2. Esperado:
   - Cambios reflejados en formularios.

### A4 - Periodos

1. Crear semana (inicio/termino/dias limite).
2. Activar semana actual.
3. Filtrar por mes/anio.
4. Esperado:
   - Periodos visibles y consistentes.

### A5 - Tarifas

1. Buscar por municipio.
2. Editar tarifa existente.
3. Esperado:
   - Sin listas gigantes, busqueda rapida util.
