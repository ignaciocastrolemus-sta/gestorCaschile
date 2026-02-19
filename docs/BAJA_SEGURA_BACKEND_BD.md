# Baja segura (backend + BD)

## Objetivo
Desactivar cuenta y anonimizar datos personales, manteniendo el `Id` para trazabilidad.

## 1) SQL sugerido

```sql
USE gestorcaschile;
GO

IF COL_LENGTH('dbo.Usuarios', 'Anonimizado') IS NULL
  ALTER TABLE dbo.Usuarios ADD Anonimizado BIT NOT NULL CONSTRAINT DF_Usuarios_Anonimizado DEFAULT(0);
GO
IF COL_LENGTH('dbo.Usuarios', 'AnonimizadoEn') IS NULL
  ALTER TABLE dbo.Usuarios ADD AnonimizadoEn DATETIME2 NULL;
GO
IF COL_LENGTH('dbo.Usuarios', 'MotivoBaja') IS NULL
  ALTER TABLE dbo.Usuarios ADD MotivoBaja NVARCHAR(250) NULL;
GO

IF OBJECT_ID('dbo.UsuariosBajaAuditoria', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UsuariosBajaAuditoria(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    EjecutadoPorId INT NULL,
    Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Motivo NVARCHAR(250) NULL,
    Modo NVARCHAR(50) NOT NULL
  );
END
GO
```

## 2) Endpoint esperado

- `POST /api/Usuarios/{id}/baja-segura`
- Body:

```json
{
  "motivo": "Desvinculacion laboral"
}
```

## 3) Comportamiento esperado

1. `Activo = 0`
2. `Anonimizado = 1`
3. `AnonimizadoEn = now`
4. `MotivoBaja = motivo`
5. Reemplazar PII:
   - `Nombre = 'ANON_<Id>'`
   - `Email = 'anon_<Id>@anon.local'`
   - `TitularNombre = NULL`
   - `TitularRut = NULL`
   - `Banco = NULL`
   - `CuentaNumero/CuentaBancaria = NULL`
   - `CuentaTipo = NULL`
6. Insertar registro en `UsuariosBajaAuditoria`.

## 4) Nota de compatibilidad

El frontend ya implementa llamada a `baja-segura`. Si backend aun no existe, cae a `DELETE /api/Usuarios/{id}` para no romper flujo.
