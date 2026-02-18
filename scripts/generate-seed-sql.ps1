$ErrorActionPreference = "Stop"

function Get-QuotedValues {
    param([string]$text)
    return [regex]::Matches($text, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
}

function Escape-Sql {
    param([string]$value)
    return $value -replace "'", "''"
}

$root = Split-Path -Parent $PSScriptRoot
$capFile = Join-Path $root "src\data\capacitadores.js"
$jefesFile = Join-Path $root "src\data\jefesProyecto.js"
$regionesFile = Join-Path $root "src\data\regiones.js"
$comunasFile = Join-Path $root "src\data\comunasPorRegion.js"

$capacitadores = Get-QuotedValues (Get-Content -Raw $capFile)
$jefes = Get-QuotedValues (Get-Content -Raw $jefesFile)
$regionesRaw = Get-QuotedValues (Get-Content -Raw $regionesFile)

$regionMap = @{
    "Tarapaca" = "Tarapacá"
    "Valparaiso" = "Valparaíso"
    "Nuble" = "Ñuble"
    "Biobio" = "Biobío"
    "La Araucania" = "La Araucanía"
    "Los Rios" = "Los Ríos"
    "Aysen del General Carlos Ibanez del Campo" = "Aysén del General Carlos Ibáñez del Campo"
    "Magallanes y de la Antartica Chilena" = "Magallanes y de la Antártica Chilena"
}

$romanMap = @{
    "Arica y Parinacota" = "XV"
    "Tarapacá" = "I"
    "Antofagasta" = "II"
    "Atacama" = "III"
    "Coquimbo" = "IV"
    "Valparaíso" = "V"
    "Metropolitana de Santiago" = "RM"
    "Libertador General Bernardo O'Higgins" = "VI"
    "Maule" = "VII"
    "Ñuble" = "XVI"
    "Biobío" = "VIII"
    "La Araucanía" = "IX"
    "Los Ríos" = "XIV"
    "Los Lagos" = "X"
    "Aysén del General Carlos Ibáñez del Campo" = "XI"
    "Magallanes y de la Antártica Chilena" = "XII"
}

$regiones = $regionesRaw | ForEach-Object {
    if ($regionMap.ContainsKey($_)) { $regionMap[$_] } else { $_ }
} | Select-Object -Unique

$comunasText = Get-Content -Raw $comunasFile
$pattern = '(?ms)(?:(?:"(?<region>[^"]+)")|(?<region>[A-Za-z0-9_ÁÉÍÓÚáéíóúÑñ\.'' ]+))\s*:\s*\[(?<comunas>[^\]]*)\]'
$regionBlocks = [regex]::Matches($comunasText, $pattern)

$comunasPorRegion = @{}
foreach ($match in $regionBlocks) {
    $regionName = $match.Groups['region'].Value.Trim()
    if ([string]::IsNullOrWhiteSpace($regionName)) { continue }
    if ($regionMap.ContainsKey($regionName)) { $regionName = $regionMap[$regionName] }
    $comunas = Get-QuotedValues $match.Groups['comunas'].Value
    $comunasPorRegion[$regionName] = $comunas
}

$sb = New-Object System.Text.StringBuilder
$null = $sb.AppendLine("SET NOCOUNT ON;")
$null = $sb.AppendLine("")

foreach ($region in $regiones) {
    if (-not $romanMap.ContainsKey($region)) {
        throw "No existe romano para la region: $region"
    }
    $roman = $romanMap[$region]
    $regionSql = Escape-Sql $region
    $romanSql = Escape-Sql $roman
    $null = $sb.AppendLine("IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'$romanSql')")
    $null = $sb.AppendLine("    UPDATE Regiones SET Nombre = N'$regionSql', Romano = N'$romanSql' WHERE Romano = N'$romanSql';")
    $null = $sb.AppendLine("ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'$regionSql')")
    $null = $sb.AppendLine("    UPDATE Regiones SET Romano = N'$romanSql' WHERE Nombre = N'$regionSql';")
    $null = $sb.AppendLine("ELSE")
    $null = $sb.AppendLine("    INSERT INTO Regiones (Nombre, Romano) VALUES (N'$regionSql', N'$romanSql');")
    $null = $sb.AppendLine("")
}

foreach ($region in $comunasPorRegion.Keys) {
    $comunas = $comunasPorRegion[$region]
    foreach ($comuna in $comunas) {
        $regionSql = Escape-Sql $region
        $comunaSql = Escape-Sql $comuna
        $null = $sb.AppendLine("IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'$regionSql') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'$comunaSql')")
        $null = $sb.AppendLine("    INSERT INTO Comunas (Nombre, RegionId)")
        $null = $sb.AppendLine("    SELECT N'$comunaSql', Id FROM Regiones WHERE Nombre = N'$regionSql';")
        $null = $sb.AppendLine("")
    }
}

foreach ($cap in $capacitadores) {
    $capSql = Escape-Sql $cap
    $null = $sb.AppendLine("IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'$capSql')")
    $null = $sb.AppendLine("    INSERT INTO Capacitadores (Nombre) VALUES (N'$capSql');")
    $null = $sb.AppendLine("")
}

foreach ($j in $jefes) {
    $jSql = Escape-Sql $j
    $null = $sb.AppendLine("IF NOT EXISTS (SELECT 1 FROM JefesProyecto WHERE Nombre = N'$jSql')")
    $null = $sb.AppendLine("    INSERT INTO JefesProyecto (Nombre) VALUES (N'$jSql');")
    $null = $sb.AppendLine("")
}

$outFile = Join-Path $PSScriptRoot "seed_catalogos.sql"
$sb.ToString() | Set-Content -Path $outFile -Encoding UTF8
Write-Host "SQL generado en $outFile"
