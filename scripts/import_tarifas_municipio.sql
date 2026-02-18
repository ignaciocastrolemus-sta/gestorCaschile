SET NOCOUNT ON;

MERGE TarifasMunicipio AS target
USING (SELECT 1 AS RegionId, N'Alto Hospicio' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (1, N'Alto Hospicio', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 1 AS RegionId, N'Camiña' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (1, N'Camiña', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 1 AS RegionId, N'Huara' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (1, N'Huara', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 1 AS RegionId, N'Ollague' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (1, N'Ollague', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 1 AS RegionId, N'Pica' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (1, N'Pica', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 2 AS RegionId, N'Maria Elena' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (2, N'Maria Elena', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 2 AS RegionId, N'Mejillones' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (2, N'Mejillones', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 2 AS RegionId, N'San Pedro de Atacama' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (2, N'San Pedro de Atacama', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 2 AS RegionId, N'Sierra Gorda' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (2, N'Sierra Gorda', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 2 AS RegionId, N'Tal Tal' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (2, N'Tal Tal', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 2 AS RegionId, N'Tocopilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (2, N'Tocopilla', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Alto del Carmen' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Alto del Carmen', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Caldera' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Caldera', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Chañaral' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Chañaral', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Copiapó' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Copiapó', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Diego de Almagro' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Diego de Almagro', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Freirina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Freirina', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'La Higuera' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'La Higuera', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Tierra Amarilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Tierra Amarilla', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 3 AS RegionId, N'Vallenar' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (3, N'Vallenar', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Andacollo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Andacollo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Canela' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Canela', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'COMBARBALA' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'COMBARBALA', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Coquimbo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Coquimbo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Corp. La Serena' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Corp. La Serena', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'ILLAPEL' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'ILLAPEL', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'La Serena' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'La Serena', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Los Vilos' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Los Vilos', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'MONTE PATRIA' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'MONTE PATRIA', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Ovalle' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Ovalle', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Punitaqui' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Punitaqui', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'Rio Hurtado' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'Rio Hurtado', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 4 AS RegionId, N'SALAMANCA' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (4, N'SALAMANCA', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Algarrobo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Algarrobo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Cabildo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Cabildo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Calle Larga' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Calle Larga', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Cartagena' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Cartagena', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Catemu' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Catemu', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'CONCON' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'CONCON', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Corporacion de Quilpue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Corporacion de Quilpue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'El Quisco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'El Quisco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'El Tabo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'El Tabo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Hijuelas' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Hijuelas', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Juan Fernandez' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Juan Fernandez', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Limache' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Limache', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Llay Llay' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Llay Llay', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Los Andes' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Los Andes', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Nogales' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Nogales', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Olmue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Olmue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'PAPUDO' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'PAPUDO', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'PETORCA' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'PETORCA', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Puchuncavi' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Puchuncavi', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Putaendo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Putaendo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Quintero' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Quintero', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Rinconada' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Rinconada', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'San Antonio' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'San Antonio', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'SAN ESTEBAN' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'SAN ESTEBAN', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'SANTA MARIA' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'SANTA MARIA', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Santo Domingo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Santo Domingo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Valparaiso' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Valparaiso', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Villa Alemana' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Villa Alemana', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Zapallar' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Zapallar', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 5 AS RegionId, N'Panquehue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (5, N'Panquehue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Chimbarongo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Chimbarongo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Codegua' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Codegua', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Coltauco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Coltauco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Corp. San Vicente' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Corp. San Vicente', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Corporacion de San Fernando' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Corporacion de San Fernando', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Doñihue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Doñihue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Graneros' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Graneros', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'La Estrella' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'La Estrella', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Las Cabras' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Las Cabras', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Litueche' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Litueche', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Lolol' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Lolol', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Machalí' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Machalí', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Malloa' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Malloa', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Marchihue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Marchihue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Navidad' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Navidad', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Palmilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Palmilla', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Paredones' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Paredones', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Peralillo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Peralillo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Peumo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Peumo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Pumanque' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Pumanque', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Requinoa' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Requinoa', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'San Fernando' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'San Fernando', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'San Vicente' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'San Vicente', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 6 AS RegionId, N'Placilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (6, N'Placilla', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Cauquenes' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Cauquenes', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Chanco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Chanco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Curico' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Curico', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Empedrado' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Empedrado', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Hualañe' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Hualañe', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Licanten' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Licanten', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Linares' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Linares', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Maule' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Maule', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Molina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Molina', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Parral' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Parral', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Pelluhue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Pelluhue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Pencahue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Pencahue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Rauco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Rauco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Retiro' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Retiro', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Rio Claro' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Rio Claro', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Romeral' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Romeral', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Sagrada Familia' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Sagrada Familia', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'San Javier' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'San Javier', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Talca' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Talca', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Teno' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Teno', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Villa Alegre' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Villa Alegre', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 7 AS RegionId, N'Yerbas Buenas' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (7, N'Yerbas Buenas', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Bulnes' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Bulnes', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Cabrero' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Cabrero', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Cañete' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Cañete', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Chillan' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Chillan', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Cobquecura' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Cobquecura', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Coelemu' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Coelemu', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Coihueco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Coihueco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Lota' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Lota', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Ninhue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Ninhue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Ñiquen' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Ñiquen', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Penco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Penco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Pinto' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Pinto', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Quilaco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Quilaco', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Quirihue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Quirihue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Ranquil' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Ranquil', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'San Carlos' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'San Carlos', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'San Fabian' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'San Fabian', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'San Nicolas' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'San Nicolas', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'San Rosendo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'San Rosendo', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Tirua' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Tirua', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Yumbel' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Yumbel', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 8 AS RegionId, N'Yungay' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (8, N'Yungay', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Angol' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Angol', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Collipulli' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Collipulli', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Curarrehue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Curarrehue', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Ercilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Ercilla', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Lautaro' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Lautaro', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Los Sauces' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Los Sauces', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Melipeuco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Melipeuco', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Perquenco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Perquenco', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Pitrufquen' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Pitrufquen', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Pucon' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Pucon', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Puerto Saavedra' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Puerto Saavedra', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Puren' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Puren', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Renaico' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Renaico', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Tolten' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Tolten', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Traiguen' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Traiguen', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 9 AS RegionId, N'Villarrica' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (9, N'Villarrica', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'Calbuco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'Calbuco', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'Chaiten' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'Chaiten', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'COCHAMO' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'COCHAMO', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'LOS MUERMOS' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'LOS MUERMOS', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'Puerto Varas' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'Puerto Varas', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'QUEILEN' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'QUEILEN', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 10 AS RegionId, N'Quinchao' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (10, N'Quinchao', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 11 AS RegionId, N'CHILE CHICO' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (11, N'CHILE CHICO', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 11 AS RegionId, N'Coyhaique' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (11, N'Coyhaique', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 11 AS RegionId, N'O´HIGGINS' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (11, N'O´HIGGINS', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 11 AS RegionId, N'Aysen' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (11, N'Aysen', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 11 AS RegionId, N'Futaleufu' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (11, N'Futaleufu', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Cabo De Hornos' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Cabo De Hornos', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Cochrane' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Cochrane', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Corp De Natales' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Corp De Natales', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Lago Verde' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Lago Verde', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Laguna Blanca' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Laguna Blanca', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'NATALES' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'NATALES', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'PORVENIR' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'PORVENIR', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Primavera' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Primavera', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Puerto Cisne' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Puerto Cisne', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Punta Arenas' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Punta Arenas', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Puqueldon' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Puqueldon', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Rio Ibañez' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Rio Ibañez', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'RIO VERDE' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'RIO VERDE', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'SAN GREGORIO' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'SAN GREGORIO', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Timaukel' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Timaukel', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Tortel' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Tortel', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 12 AS RegionId, N'Torres del Payne' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (12, N'Torres del Payne', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Alhue' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Alhue', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Amuch' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Amuch', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Cerrillos' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Cerrillos', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Cerro Navia' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Cerro Navia', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Colina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Colina', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. DE TILTIL' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. DE TILTIL', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. De Buin' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. De Buin', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp.Isla de Maipo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp.Isla de Maipo', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. Lampa' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. Lampa', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. Pirque' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. Pirque', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. Puente Alto' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. Puente Alto', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. San Joaquin' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. San Joaquin', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp. San Miguel' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp. San Miguel', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corpo Cerro Navia' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corpo Cerro Navia', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp.Educ. y Salud de Colina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp.Educ. y Salud de Colina', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp.Artes y Cultura de Colina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp.Artes y Cultura de Colina', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corp.Des. Social de Colina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corp.Des. Social de Colina', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corporacion de Melipilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corporacion de Melipilla', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Corporacion Qta. Normal' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Corporacion Qta. Normal', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Curacavi' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Curacavi', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'DIBAM' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'DIBAM', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'El Bosque' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'El Bosque', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'El Monte' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'El Monte', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Estación Central' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Estación Central', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Huechuraba' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Huechuraba', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Independencia' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Independencia', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'La Pintana' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'La Pintana', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'LAMPA' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'LAMPA', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Lo Prado' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Lo Prado', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Maria Pinto' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Maria Pinto', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Melipilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Melipilla', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Ñuñoa' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Ñuñoa', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Padre Hurtado' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Padre Hurtado', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Pedro Aguirre Cerda' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Pedro Aguirre Cerda', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Peñaflor' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Peñaflor', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Peñalolén' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Peñalolén', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Quilicura' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Quilicura', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Quinta Normal' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Quinta Normal', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Renca' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Renca', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'San Joaquin' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'San Joaquin', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'San Jose de Maipo' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'San Jose de Maipo', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'San Miguel' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'San Miguel', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'San Pedro de Melipilla' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 3650, Almuerzo = 6600, Once = 3650, Cena = 6600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'San Pedro de Melipilla', 3650, 6600, 3650, 6600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'San Ramon' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'San Ramon', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'Superint. De Salud' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'Superint. De Salud', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'TILTIL' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5950, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'TILTIL', 0, 0, 0, 0, 5950, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 13 AS RegionId, N'SLEP Barrancas' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 0, Almuerzo = 0, Once = 0, Cena = 0, Viatico = 5500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (13, N'SLEP Barrancas', 0, 0, 0, 0, 5500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Corp. Panguipulli' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Corp. Panguipulli', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Corral' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Corral', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Futrono' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Futrono', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Lago Ranco' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Lago Ranco', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Mafil' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Mafil', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Mariquina' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Mariquina', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 14 AS RegionId, N'Panguipulli' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 4200, Almuerzo = 7600, Once = 4200, Cena = 7600, Viatico = 4500, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (14, N'Panguipulli', 4200, 7600, 4200, 7600, 4500, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 15 AS RegionId, N'Camarones' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (15, N'Camarones', 5600, 10100, 5600, 10100, 5600, 2026, 1);

MERGE TarifasMunicipio AS target
USING (SELECT 15 AS RegionId, N'Colchane' AS Municipio, 2026 AS Periodo) AS source
ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo
WHEN MATCHED THEN
  UPDATE SET Desayuno = 5600, Almuerzo = 10100, Once = 5600, Cena = 10100, Viatico = 5600, Activo = 1
WHEN NOT MATCHED THEN
  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)
  VALUES (15, N'Colchane', 5600, 10100, 5600, 10100, 5600, 2026, 1);


