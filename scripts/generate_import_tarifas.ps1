$ErrorActionPreference = "Stop"

$csvPath = "C:\Users\USUARIO\Downloads\valores_municipio_2024.csv"
$outPath = "C:\Users\USUARIO\Desktop\login-cas\scripts\import_tarifas_municipio.sql"
$periodo = 2026

function Fix-Text {
    param([string]$value)
    if ([string]::IsNullOrWhiteSpace($value)) { return "" }
    if ($value -match "[ÃÂ]") {
        $bytes = [System.Text.Encoding]::GetEncoding(28591).GetBytes($value)
        return [System.Text.Encoding]::UTF8.GetString($bytes)
    }
    return $value
}

function Escape-Sql {
    param([string]$value)
    return $value -replace "'", "''"
}

$rows = Import-Csv -Path $csvPath -Encoding UTF8
$sb = New-Object System.Text.StringBuilder
$null = $sb.AppendLine("SET NOCOUNT ON;")
$null = $sb.AppendLine("")

foreach ($r in $rows) {
    $regionId = [int]($r.RegionId)
    $municipio = (Fix-Text $r.Municipio).Trim()
    if ([string]::IsNullOrWhiteSpace($municipio)) { continue }

    $desayuno = [int]([int]0 + ($r.Desayuno -as [int]))
    $almuerzo = [int]([int]0 + ($r.Almuerzo -as [int]))
    $once = [int]([int]0 + ($r.Once -as [int]))
    $cena = [int]([int]0 + ($r.Cena -as [int]))
    $viatico = [int]([int]0 + ($r.Viatico -as [int]))

    $municipioSql = Escape-Sql $municipio

    $null = $sb.AppendLine("MERGE TarifasMunicipio AS target")
    $null = $sb.AppendLine("USING (SELECT $regionId AS RegionId, N'$municipioSql' AS Municipio, $periodo AS Periodo) AS source")
    $null = $sb.AppendLine("ON target.RegionId = source.RegionId AND target.Municipio = source.Municipio AND target.Periodo = source.Periodo")
    $null = $sb.AppendLine("WHEN MATCHED THEN")
    $null = $sb.AppendLine("  UPDATE SET Desayuno = $desayuno, Almuerzo = $almuerzo, Once = $once, Cena = $cena, Viatico = $viatico, Activo = 1")
    $null = $sb.AppendLine("WHEN NOT MATCHED THEN")
    $null = $sb.AppendLine("  INSERT (RegionId, Municipio, Desayuno, Almuerzo, Once, Cena, Viatico, Periodo, Activo)")
    $null = $sb.AppendLine("  VALUES ($regionId, N'$municipioSql', $desayuno, $almuerzo, $once, $cena, $viatico, $periodo, 1);")
    $null = $sb.AppendLine("")
}

$sb.ToString() | Set-Content -Path $outPath -Encoding UTF8
Write-Host "SQL generado en $outPath"
