// Feriados nacionales Chile 2026 (formato YYYY-MM-DD, excluye regionales)
export const FERIADOS_CL_2026 = new Set([
  "2026-01-01",
  "2026-04-03",
  "2026-04-04",
  "2026-05-01",
  "2026-05-21",
  "2026-06-20",
  "2026-06-29",
  "2026-07-16",
  "2026-08-15",
  "2026-09-18",
  "2026-09-19",
  "2026-10-12",
  "2026-10-31",
  "2026-11-01",
  "2026-12-08",
  "2026-12-25",
]);

export function toIsoDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatFecha(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

export function formatFechaHoy() {
  return formatFecha(new Date());
}

export function parseFecha(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [dd, mm, yyyy] = value.split("/").map(Number);
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  const date = new Date(yyyy, mm - 1, dd);
  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return null;
  }
  return date;
}

export function contarDiasHabiles(inicio, termino, feriados) {
  if (!inicio || !termino) return 0;
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (end < start) return 0;
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    const isWeekend = day === 0 || day === 6;
    const iso = toIsoDate(current);
    const isHoliday = feriados.has(iso);
    if (!isWeekend && !isHoliday) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function addBusinessDays(startDate, days) {
  if (!startDate || days <= 0) return null;
  const result = new Date(startDate);
  let remaining = days;
  while (remaining > 0) {
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
      if (remaining === 0) break;
    }
    result.setDate(result.getDate() + 1);
  }
  return result;
}

export function calcularFechaTermino(fechaInicio, diasStr) {
  const dias = Number(diasStr);
  if (!Number.isInteger(dias) || dias <= 0) return "";
  const startDate = parseFecha(fechaInicio);
  if (!startDate) return "";
  const endDate = addBusinessDays(startDate, dias);
  return endDate ? formatFecha(endDate) : "";
}
