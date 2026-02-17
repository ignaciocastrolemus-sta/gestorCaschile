using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaGastos.Core.Entities;
using SistemaGastos.Data;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SistemaGastos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RendicionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
        private const long MaxTotalSize = 50 * 1024 * 1024; // 50 MB
        private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "image/jpeg",
            "image/png"
        };

        public RendicionesController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost]
        [Authorize(Roles = "Usuario Terreno")]
        [RequestSizeLimit(MaxTotalSize)]
        public async Task<IActionResult> Post()
        {
            if (!Request.HasFormContentType)
            {
                return BadRequest("Se requiere form-data.");
            }

            var form = await Request.ReadFormAsync();
            if (!int.TryParse(form["viajeId"], out var viajeId) || viajeId <= 0)
            {
                return BadRequest("viajeId invalido.");
            }

            var detallesJson = form["detalles"].ToString();
            if (string.IsNullOrWhiteSpace(detallesJson))
            {
                return BadRequest("detalles es obligatorio.");
            }

            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var detalles = JsonSerializer.Deserialize<List<RendicionDetalleDto>>(detallesJson, jsonOptions) ?? new();
            if (detalles.Count == 0)
            {
                return BadRequest("detalles vacio.");
            }

            var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdRaw, out var userId))
            {
                return Unauthorized("Token invalido.");
            }

            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
            var nombre = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

            var viaje = await _context.AsignacionesViajes
                .FirstOrDefaultAsync(v => v.Id == viajeId);

            if (viaje == null)
            {
                return NotFound("Viaje no encontrado.");
            }

            var matchesCapacitador = NormalizeText(viaje.Capacitador) == NormalizeText(email)
                || NormalizeText(viaje.Capacitador) == NormalizeText(nombre);
            if (!matchesCapacitador)
            {
                return Forbid("El viaje no pertenece al capacitador.");
            }

            var files = form.Files;
            var totalSize = files.Sum(f => f.Length);
            if (totalSize > MaxTotalSize)
            {
                return BadRequest("Total de archivos excede 50MB.");
            }

            foreach (var file in files)
            {
                if (file.Length > MaxFileSize)
                {
                    return BadRequest($"Archivo demasiado grande: {file.FileName}");
                }
                if (!AllowedTypes.Contains(file.ContentType))
                {
                    return BadRequest($"Tipo no permitido: {file.FileName}");
                }
            }

            var asignadoPorCategoria = GetAsignadoPorCategoria(viaje);
            foreach (var det in detalles)
            {
                if (!asignadoPorCategoria.TryGetValue(det.Categoria, out _))
                {
                    return BadRequest($"Categoria no valida: {det.Categoria}");
                }
                if (det.MontoRendido < 0)
                {
                    return BadRequest("Monto rendido invalido.");
                }
            }

            var totalAsignado = asignadoPorCategoria.Values.Sum();
            var totalRendido = detalles.Sum(d => d.MontoRendido);
            var diferencia = totalRendido - totalAsignado;
            var tipoResultado = CalcularTipoResultado(diferencia);

            var filesByCategory = files
                .GroupBy(f => ExtractCategory(f.Name))
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var det in detalles)
            {
                if (det.MontoRendido > 0)
                {
                    if (!filesByCategory.TryGetValue(det.Categoria, out var catFiles) || catFiles.Count == 0)
                    {
                        return BadRequest($"Faltan adjuntos para categoria {det.Categoria}");
                    }
                }
            }

            var rendicion = new Rendicion
            {
                AsignacionViajeId = viajeId,
                UsuarioId = userId,
                Estado = "EnRevisionSecretaria",
                TotalAsignado = totalAsignado,
                TotalRendido = totalRendido,
                Diferencia = diferencia,
                TipoResultado = tipoResultado,
                FechaEnvio = DateTime.UtcNow
            };

            foreach (var det in detalles)
            {
                var asignado = asignadoPorCategoria[det.Categoria];
                rendicion.Detalles.Add(new RendicionDetalle
                {
                    Categoria = det.Categoria,
                    MontoAsignado = asignado,
                    MontoRendido = det.MontoRendido,
                    Observacion = det.Observacion ?? string.Empty
                });
            }

            _context.Rendiciones.Add(rendicion);
            await _context.SaveChangesAsync();

            var baseDir = Path.Combine(_env.ContentRootPath, "uploads", "rendiciones", rendicion.Id.ToString());
            Directory.CreateDirectory(baseDir);

            foreach (var file in files)
            {
                var categoria = ExtractCategory(file.Name);
                var detalle = rendicion.Detalles.FirstOrDefault(d => d.Categoria == categoria);
                if (detalle == null) continue;

                var catDir = Path.Combine(baseDir, categoria);
                Directory.CreateDirectory(catDir);

                var safeName = Path.GetFileName(file.FileName);
                var filePath = Path.Combine(catDir, safeName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var hash = await ComputeSha256Async(filePath);
                var adjunto = new RendicionAdjunto
                {
                    RendicionDetalleId = detalle.Id,
                    Ruta = filePath,
                    NombreArchivo = safeName,
                    ContentType = file.ContentType,
                    Size = file.Length,
                    HashSha256 = hash
                };

                _context.RendicionesAdjuntos.Add(adjunto);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                rendicionId = rendicion.Id,
                estado = rendicion.Estado,
                totalAsignado = rendicion.TotalAsignado,
                totalRendido = rendicion.TotalRendido,
                diferencia = rendicion.Diferencia,
                tipoResultado = rendicion.TipoResultado
            });
        }

        [HttpGet("secretaria")]
        [Authorize(Roles = "Secretaria")]
        public async Task<IActionResult> GetSecretaria()
        {
            var items = await _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .Include(r => r.Detalles)
                    .ThenInclude(d => d.Adjuntos)
                .Where(r => r.Estado == "EnRevisionSecretaria")
                .OrderByDescending(r => r.FechaEnvio)
                .ToListAsync();

            return Ok(items.Select(MapRendicion));
        }

        [HttpPost("{id:int}/enviar-contadora")]
        [Authorize(Roles = "Secretaria")]
        public async Task<IActionResult> EnviarAContadora(int id)
        {
            var rendicion = await _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rendicion == null) return NotFound("Rendicion no encontrada.");
            if (rendicion.Estado != "EnRevisionSecretaria") return BadRequest("Estado invalido.");

            rendicion.Estado = "EnRevisionContadora";
            if (rendicion.AsignacionViaje != null)
            {
                rendicion.AsignacionViaje.Estado = "EnRevisionContadora";
            }

            await _context.SaveChangesAsync();
            return Ok(new { estado = rendicion.Estado });
        }

        [HttpGet("mias")]
        [Authorize(Roles = "Usuario Terreno")]
        public async Task<IActionResult> GetMias()
        {
            var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdRaw, out var userId))
            {
                return Unauthorized("Token invalido.");
            }

            var list = await _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .Include(r => r.Detalles)
                    .ThenInclude(d => d.Adjuntos)
                .Where(r => r.UsuarioId == userId)
                .OrderByDescending(r => r.FechaEnvio)
                .ToListAsync();

            var latest = list
                .GroupBy(r => r.AsignacionViajeId)
                .Select(g => g.OrderByDescending(x => x.FechaEnvio).First())
                .ToList();

            return Ok(latest.Select(MapRendicion));
        }

        [HttpGet("plantilla/{viajeId:int}")]
        [Authorize(Roles = "Usuario Terreno,Secretaria,Contadora")]
        public async Task<IActionResult> DescargarPlantilla(int viajeId)
        {
            var viaje = await _context.AsignacionesViajes.FirstOrDefaultAsync(v => v.Id == viajeId);
            if (viaje == null) return NotFound("Viaje no encontrado.");

            var lines = new List<string>
            {
                $"Plantilla Rendicion Viaje #{viaje.Id}",
                $"Capacitador: {viaje.Capacitador}",
                $"Region: {viaje.RegionNombre}",
                $"Municipio: {viaje.Municipio}",
                $"Fechas: {viaje.FechaInicio:dd/MM/yyyy} - {viaje.FechaTermino:dd/MM/yyyy}",
                $"Dias: {viaje.TotalDias}",
                "",
                "Asignaciones por dia:",
                $"Desayuno: {viaje.Desayuno}",
                $"Almuerzo: {viaje.Almuerzo}",
                $"Once: {viaje.Once}",
                $"Cena: {viaje.Cena}",
                $"Viatico: {viaje.Viatico}",
                "",
                "Gastos por categoria:",
                $"Transporte: {viaje.MovAsignado + viaje.TransferUber + viaje.ColectivoTaxi}",
                $"Peajes: {viaje.Peajes}",
                $"Reembolsos: {viaje.Reembolsos}",
                $"Varios: {viaje.Varios}",
                $"Copec: {viaje.Copec}"
            };

            var bytes = BuildSimplePdf(lines);
            var fileName = $"plantilla_rendicion_{viajeId}.pdf";
            return File(bytes, "application/pdf", fileName);
        }

        [HttpGet("contadora")]
        [Authorize(Roles = "Contadora")]
        public async Task<IActionResult> GetContadora()
        {
            var items = await _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .Include(r => r.Detalles)
                    .ThenInclude(d => d.Adjuntos)
                .Where(r => r.Estado == "EnRevisionContadora")
                .OrderByDescending(r => r.FechaEnvio)
                .ToListAsync();

            return Ok(items.Select(MapRendicion));
        }

        [HttpGet("contadora/resumen")]
        [Authorize(Roles = "Contadora")]
        public async Task<IActionResult> GetContadoraResumen([FromQuery] string? estado = null)
        {
            var query = _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .Include(r => r.Detalles)
                    .ThenInclude(d => d.Adjuntos)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(estado))
            {
                query = query.Where(r => r.Estado == estado);
            }

            var items = await query
                .OrderByDescending(r => r.FechaEnvio)
                .ToListAsync();

            return Ok(items.Select(MapRendicion));
        }

        [HttpGet("encuadre")]
        [Authorize(Roles = "Administrador,Secretaria,Contadora")]
        public async Task<IActionResult> GetEncuadre([FromQuery] DateTime? desde = null, [FromQuery] DateTime? hasta = null, [FromQuery] string? estado = null, [FromQuery] string? capacitador = null, [FromQuery] string? cliente = null)
        {
            var query = _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .AsQueryable();

            if (desde.HasValue)
            {
                var d = desde.Value.Date;
                query = query.Where(r => r.FechaEnvio >= d);
            }

            if (hasta.HasValue)
            {
                var h = hasta.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(r => r.FechaEnvio <= h);
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                query = query.Where(r => r.Estado == estado);
            }

            if (!string.IsNullOrWhiteSpace(capacitador))
            {
                query = query.Where(r => r.AsignacionViaje != null && r.AsignacionViaje.Capacitador.Contains(capacitador));
            }

            if (!string.IsNullOrWhiteSpace(cliente))
            {
                query = query.Where(r => r.AsignacionViaje != null && r.AsignacionViaje.Municipio.Contains(cliente));
            }

            var list = await query
                .OrderByDescending(r => r.FechaEnvio)
                .ToListAsync();

            var result = list.Select(r => new
            {
                r.Id,
                r.AsignacionViajeId,
                r.Estado,
                r.TotalAsignado,
                r.TotalRendido,
                r.Diferencia,
                r.TipoResultado,
                r.FechaEnvio,
                Viaje = r.AsignacionViaje == null ? null : new
                {
                    r.AsignacionViaje.Capacitador,
                    r.AsignacionViaje.RegionNombre,
                    r.AsignacionViaje.Municipio,
                    r.AsignacionViaje.FechaInicio,
                    r.AsignacionViaje.FechaTermino
                }
            });

            return Ok(result);
        }

        [HttpPost("{id:int}/resolver")]
        [Authorize(Roles = "Contadora")]
        public async Task<IActionResult> Resolver(int id, [FromBody] RendicionDecisionDto dto)
        {
            var rendicion = await _context.Rendiciones
                .Include(r => r.AsignacionViaje)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rendicion == null) return NotFound("Rendicion no encontrada.");
            if (rendicion.Estado != "EnRevisionContadora") return BadRequest("Estado invalido.");
            if (dto == null) return BadRequest("Datos invalidos.");

            if (dto.Aprobar)
            {
                rendicion.Estado = "Aprobada";
                rendicion.Observacion = dto.Mensaje ?? string.Empty;
                if (rendicion.AsignacionViaje != null)
                {
                    rendicion.AsignacionViaje.Estado = "Rendicion completa";
                }
            }
            else
            {
                rendicion.Estado = "Rechazada";
                rendicion.Observacion = dto.Mensaje ?? "Rechazada por contadora.";
                if (rendicion.AsignacionViaje != null)
                {
                    rendicion.AsignacionViaje.Estado = "Rechazada";
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { estado = rendicion.Estado });
        }

        [HttpGet("adjuntos/{id:int}")]
        [Authorize(Roles = "Contadora,Secretaria")]
        public async Task<IActionResult> DescargarAdjunto(int id)
        {
            var adjunto = await _context.RendicionesAdjuntos
                .Include(a => a.RendicionDetalle)
                .ThenInclude(d => d.Rendicion)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (adjunto == null) return NotFound("Adjunto no encontrado.");
            if (string.IsNullOrWhiteSpace(adjunto.Ruta) || !System.IO.File.Exists(adjunto.Ruta))
            {
                return NotFound("Archivo no encontrado.");
            }

            var stream = System.IO.File.OpenRead(adjunto.Ruta);
            var fileName = adjunto.NombreArchivo ?? "adjunto";
            var contentType = adjunto.ContentType ?? "application/octet-stream";
            return File(stream, contentType, fileName);
        }

        private static string ExtractCategory(string fieldName)
        {
            if (string.IsNullOrWhiteSpace(fieldName)) return string.Empty;
            return fieldName.Replace("files.", string.Empty).Trim();
        }

        private static string NormalizeText(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;
            var normalized = value.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder(normalized.Length);
            foreach (var ch in normalized)
            {
                var uc = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch);
                if (uc != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(char.ToLowerInvariant(ch));
                }
            }
            return sb.ToString().Trim();
        }

        private static Dictionary<string, decimal> GetAsignadoPorCategoria(AsignacionViaje viaje)
        {
            return new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase)
            {
                ["transporte"] = viaje.MovAsignado + viaje.TransferUber + viaje.ColectivoTaxi,
                ["peajes"] = viaje.Peajes,
                ["reembolsos"] = viaje.Reembolsos,
                ["varios"] = viaje.Varios,
                ["copec"] = viaje.Copec
            };
        }

        private static string CalcularTipoResultado(decimal diferencia)
        {
            if (diferencia > 0) return "Reembolso";
            if (diferencia < 0) return "Devolucion";
            return "Cuadrada";
        }

        private static async Task<string> ComputeSha256Async(string filePath)
        {
            using var sha = SHA256.Create();
            await using var stream = System.IO.File.OpenRead(filePath);
            var hash = await sha.ComputeHashAsync(stream);
            return Convert.ToHexString(hash);
        }

        private static object MapRendicion(Rendicion r)
        {
            return new
            {
                r.Id,
                r.AsignacionViajeId,
                r.UsuarioId,
                r.Estado,
                r.TotalAsignado,
                r.TotalRendido,
                r.Diferencia,
                r.TipoResultado,
                r.FechaEnvio,
                r.Observacion,
                Viaje = r.AsignacionViaje == null ? null : new
                {
                    r.AsignacionViaje.Id,
                    r.AsignacionViaje.Capacitador,
                    r.AsignacionViaje.JefeProyecto,
                    r.AsignacionViaje.RegionNombre,
                    r.AsignacionViaje.Municipio,
                    r.AsignacionViaje.Modalidad,
                    r.AsignacionViaje.FechaInicio,
                    r.AsignacionViaje.FechaTermino,
                    r.AsignacionViaje.TotalDias
                },
                Detalles = r.Detalles.Select(d => new
                {
                    d.Id,
                    d.Categoria,
                    d.MontoAsignado,
                    d.MontoRendido,
                    d.Observacion,
                    Adjuntos = d.Adjuntos.Select(a => new
                    {
                        a.Id,
                        a.NombreArchivo,
                        a.ContentType,
                        a.Size
                    })
                })
            };
        }

        private static byte[] BuildSimplePdf(IEnumerable<string> lines)
        {
            var contentBuilder = new StringBuilder();
            contentBuilder.AppendLine("BT");
            contentBuilder.AppendLine("/F1 12 Tf");
            contentBuilder.AppendLine("72 720 Td");
            foreach (var line in lines)
            {
                var safe = (line ?? string.Empty).Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
                contentBuilder.AppendLine($"({safe}) Tj");
                contentBuilder.AppendLine("0 -16 Td");
            }
            contentBuilder.AppendLine("ET");
            var streamContent = contentBuilder.ToString();

            var objects = new List<string>
            {
                "1 0 obj<< /Type /Catalog /Pages 2 0 R>>endobj",
                "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1>>endobj",
                "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R>> >> >>endobj",
                $"4 0 obj<< /Length {Encoding.ASCII.GetByteCount(streamContent)} >>stream\n{streamContent}endstream\nendobj",
                "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj"
            };

            using var ms = new MemoryStream();
            void Write(string s) => ms.Write(Encoding.ASCII.GetBytes(s));

            Write("%PDF-1.4\n");
            var offsets = new List<long> { 0 };
            foreach (var obj in objects)
            {
                offsets.Add(ms.Position);
                Write(obj + "\n");
            }

            var xrefPos = ms.Position;
            Write($"xref\n0 {offsets.Count}\n");
            Write("0000000000 65535 f \n");
            for (var i = 1; i < offsets.Count; i++)
            {
                Write($"{offsets[i]:0000000000} 00000 n \n");
            }
            Write("trailer\n");
            Write($"<< /Size {offsets.Count} /Root 1 0 R >>\n");
            Write("startxref\n");
            Write($"{xrefPos}\n");
            Write("%%EOF");

            return ms.ToArray();
        }

        private class RendicionDetalleDto
        {
            public string Categoria { get; set; } = string.Empty;
            public decimal MontoRendido { get; set; }
            public string? Observacion { get; set; }
        }

        public class RendicionDecisionDto
        {
            public bool Aprobar { get; set; }
            public string? Mensaje { get; set; }
        }
    }
}
