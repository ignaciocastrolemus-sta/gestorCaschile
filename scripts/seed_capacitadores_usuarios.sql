/* ============================================================
   Carga/actualiza cuentas de Capacitador en dbo.Usuarios
   - Usa Nombre + Email reales
   - Fuerza Rol de capacitador y Activo = 1
   - No borra usuarios existentes
   ============================================================ */

USE gestorcaschile;
GO

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRAN;

    DECLARE @RolCapacitadorId INT;

    SELECT TOP (1) @RolCapacitadorId = r.Id
    FROM dbo.Roles r
    WHERE r.Nombre IN (N'Usuario Terreno', N'Capacitador')
    ORDER BY CASE WHEN r.Nombre = N'Usuario Terreno' THEN 0 ELSE 1 END;

    IF @RolCapacitadorId IS NULL
        THROW 50001, 'No existe rol "Usuario Terreno" ni "Capacitador".', 1;

    DECLARE @TempPassword NVARCHAR(200) = N'Temporal1234!';

    DECLARE @Capacitadores TABLE
    (
        Nombre NVARCHAR(200) NOT NULL,
        Email  NVARCHAR(200) NOT NULL
    );

    INSERT INTO @Capacitadores (Nombre, Email)
    VALUES
    (N'JOSMAR BASTIDAS CONTRERAS', N'josmar.bastidas@caschile.cl'),
    (N'JUAN LUNA', N'juan.luna@caschile.cl'),
    (N'REINALDO MARTINEZ', N'reinaldo.martinez@caschile.cl'),
    (N'FRANCO FIGUEROA', N'franco.figueroa@caschile.cl'),
    (N'JULIO GONZALEZ', N'julio.gonzalez@caschile.cl'),
    (N'MANUEL CASTRO RODRIGUEZ', N'manuel.castro@caschile.cl'),
    (N'MARCELA VIEGAND', N'marcela.viegand@caschile.cl'),
    (N'MAXIMO PEREZ LARA', N'maximo.perez@caschile.cl'),
    (N'ABRAHAM GALVEZ', N'abraham.galvez@caschile.cl'),
    (N'DANIELA SANDOVAL SOLAR', N'daniela.sandoval@caschile.cl'),
    (N'MARIO MORENO LADA', N'mario.moreno@caschile.cl'),
    (N'MIGUEL CACERES GONZALEZ', N'miguel.caceres@caschile.cl'),
    (N'RICHARD TOLORZA', N'richard.tolorza@caschile.cl'),
    (N'RODRIGO CASTRO ALVIAL', N'rodrigo.castro@caschile.cl'),
    (N'SIMON GAMBOA', N'simon.gamboa@caschile.cl'),
    (N'XIOGENYS PINEDA', N'xiogenys.pineda@caschile.cl'),
    (N'CRISTOBAL MACHUCA', N'cristobal.machuca@caschile.cl'),
    (N'CAROLINA ALLENDE', N'carolina.allende@caschile.cl'),
    (N'MARCELO BAEZA MANRIQUEZ', N'marcelo.baeza@caschile.cl'),
    (N'ROMINA HERNANDEZ', N'romina.hernandez@caschile.cl'),
    (N'ROXANA RAMIREZ', N'roxana.ramirez@caschile.cl'),
    (N'SABINA PEREZ', N'sabina.perez@caschile.cl');

    /* 1) Actualiza por Email (si ya existe cuenta) */
    UPDATE u
       SET u.Nombre = c.Nombre,
           u.RolId = @RolCapacitadorId,
           u.Activo = 1
    FROM dbo.Usuarios u
    INNER JOIN @Capacitadores c
        ON LTRIM(RTRIM(LOWER(u.Email))) = LTRIM(RTRIM(LOWER(c.Email)));

    /* 2) Actualiza por Nombre (si coincide y el email nuevo no está ocupado) */
    UPDATE u
       SET u.Email = c.Email,
           u.RolId = @RolCapacitadorId,
           u.Activo = 1
    FROM dbo.Usuarios u
    INNER JOIN @Capacitadores c
        ON u.Nombre COLLATE Latin1_General_CI_AI = c.Nombre COLLATE Latin1_General_CI_AI
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.Usuarios ux
        WHERE LTRIM(RTRIM(LOWER(ux.Email))) = LTRIM(RTRIM(LOWER(c.Email)))
          AND ux.Id <> u.Id
    );

    /* 3) Inserta los que no existen por Email */
    IF COL_LENGTH('dbo.Usuarios', 'MotivoBaja') IS NOT NULL
    BEGIN
        INSERT INTO dbo.Usuarios
        (
            Nombre,
            Email,
            PasswordHash,
            CuentaBancaria,
            Activo,
            RolId,
            MotivoBaja
        )
        SELECT
            c.Nombre,
            c.Email,
            @TempPassword,
            N'',
            1,
            @RolCapacitadorId,
            N''
        FROM @Capacitadores c
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM dbo.Usuarios u
            WHERE LTRIM(RTRIM(LOWER(u.Email))) = LTRIM(RTRIM(LOWER(c.Email)))
        );
    END
    ELSE
    BEGIN
        INSERT INTO dbo.Usuarios
        (
            Nombre,
            Email,
            PasswordHash,
            CuentaBancaria,
            Activo,
            RolId
        )
        SELECT
            c.Nombre,
            c.Email,
            @TempPassword,
            N'',
            1,
            @RolCapacitadorId
        FROM @Capacitadores c
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM dbo.Usuarios u
            WHERE LTRIM(RTRIM(LOWER(u.Email))) = LTRIM(RTRIM(LOWER(c.Email)))
        );
    END

    /* 4) Si existe columna DebeCambiarPassword, forzar cambio de clave */
    IF COL_LENGTH('dbo.Usuarios', 'DebeCambiarPassword') IS NOT NULL
    BEGIN
        UPDATE u
           SET u.DebeCambiarPassword = 1
        FROM dbo.Usuarios u
        INNER JOIN @Capacitadores c
            ON LTRIM(RTRIM(LOWER(u.Email))) = LTRIM(RTRIM(LOWER(c.Email)));
    END

    COMMIT;

    SELECT
        u.Id,
        u.Nombre,
        u.Email,
        u.RolId,
        u.Activo
    FROM dbo.Usuarios u
    INNER JOIN @Capacitadores c
        ON LTRIM(RTRIM(LOWER(u.Email))) = LTRIM(RTRIM(LOWER(c.Email)))
    ORDER BY u.Nombre;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO

/* Nota:
   En tu lista de nombres aparece "ELIZABETH GOMEZ" y "ZOLTAN ROJAS GUERRERO",
   pero no venían correos en la imagen de emails. Cuando tengas esos correos,
   agrégalos al INSERT de @Capacitadores. */
