USE gestorcaschile;
GO

-- 1) Validacion de columnas de baja segura
SELECT name
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.Usuarios')
  AND name IN ('Anonimizado', 'AnonimizadoEn', 'MotivoBaja');
GO

-- 2) Validacion de columnas de justificacion
SELECT name
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.Rendiciones')
  AND name IN ('EstadoPrevioJustificacion', 'MotivoPendiente', 'PendienteHasta', 'ObservacionPendiente');
GO

-- 3) Top rendiciones recientes (sanity check)
SELECT TOP 20
  Id,
  Estado,
  TipoResultado,
  SaldoEstado,
  SaldoPendiente,
  FechaEnvio
FROM Rendiciones
ORDER BY Id DESC;
GO

-- 4) Top usuarios anonimizados
SELECT TOP 20
  Id,
  Nombre,
  Email,
  Activo,
  Anonimizado,
  AnonimizadoEn,
  MotivoBaja
FROM Usuarios
WHERE Anonimizado = 1
ORDER BY Id DESC;
GO
