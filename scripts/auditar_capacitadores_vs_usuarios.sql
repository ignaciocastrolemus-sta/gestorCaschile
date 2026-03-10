USE gestorcaschile;
GO

SET NOCOUNT ON;

/* 1) Catalogo legacy de capacitadores */
SELECT
    c.Id,
    c.Nombre
FROM dbo.Capacitadores c
ORDER BY c.Nombre;
GO

/* 2) Usuarios reales con rol capacitador */
SELECT
    u.Id,
    u.Nombre,
    u.Email,
    u.Activo,
    r.Nombre AS Rol
FROM dbo.Usuarios u
INNER JOIN dbo.Roles r ON r.Id = u.RolId
WHERE u.Activo = 1
  AND r.Nombre IN (N'Usuario Terreno', N'Capacitador')
ORDER BY u.Nombre;
GO

/* 3) Capacitadores legacy sin usuario real equivalente por nombre */
SELECT
    c.Id,
    c.Nombre
FROM dbo.Capacitadores c
LEFT JOIN dbo.Usuarios u
    ON UPPER(LTRIM(RTRIM(u.Nombre))) = UPPER(LTRIM(RTRIM(c.Nombre)))
LEFT JOIN dbo.Roles r
    ON r.Id = u.RolId
   AND r.Nombre IN (N'Usuario Terreno', N'Capacitador')
WHERE u.Id IS NULL OR r.Id IS NULL
ORDER BY c.Nombre;
GO

/* 4) Usuarios capacitadores que aun no tienen reflejo en tabla legacy */
SELECT
    u.Id,
    u.Nombre,
    u.Email
FROM dbo.Usuarios u
INNER JOIN dbo.Roles r ON r.Id = u.RolId
LEFT JOIN dbo.Capacitadores c
    ON UPPER(LTRIM(RTRIM(c.Nombre))) = UPPER(LTRIM(RTRIM(u.Nombre)))
WHERE u.Activo = 1
  AND r.Nombre IN (N'Usuario Terreno', N'Capacitador')
  AND c.Id IS NULL
ORDER BY u.Nombre;
GO

/* 5) Uso real de la tabla legacy en AsignacionesSemanales */
SELECT
    a.CapacitadorId,
    c.Nombre,
    COUNT(*) AS TotalAsignaciones
FROM dbo.AsignacionesSemanales a
INNER JOIN dbo.Capacitadores c ON c.Id = a.CapacitadorId
GROUP BY a.CapacitadorId, c.Nombre
ORDER BY TotalAsignaciones DESC, c.Nombre;
GO

/* 6) Uso real de la tabla legacy en Transferencias */
SELECT
    t.CapacitadorId,
    c.Nombre,
    COUNT(*) AS TotalTransferencias
FROM dbo.Transferencias t
INNER JOIN dbo.Capacitadores c ON c.Id = t.CapacitadorId
GROUP BY t.CapacitadorId, c.Nombre
ORDER BY TotalTransferencias DESC, c.Nombre;
GO

/* 7) Uso real de la tabla legacy en TransferenciasSolicitudes */
SELECT
    t.CapacitadorId,
    c.Nombre,
    COUNT(*) AS TotalSolicitudes
FROM dbo.TransferenciasSolicitudes t
INNER JOIN dbo.Capacitadores c ON c.Id = t.CapacitadorId
GROUP BY t.CapacitadorId, c.Nombre
ORDER BY TotalSolicitudes DESC, c.Nombre;
GO
