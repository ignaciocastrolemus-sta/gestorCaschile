function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function ensureWeb() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function buildReportHtml({ title, subtitle, meta = [], headers = [], rows = [], summary = [] }) {
  const metaHtml = meta
    .map((item) => `<div class="meta"><b>${escapeHtml(item.label)}:</b> ${escapeHtml(item.value)}</div>`)
    .join("");
  const summaryHtml = summary.length
    ? `
      <div class="summary">
        ${summary
          .map(
            (item) => `
              <div class="summary-card">
                <div class="summary-label">${escapeHtml(item.label)}</div>
                <div class="summary-value">${escapeHtml(item.value)}</div>
              </div>
            `
          )
          .join("")}
      </div>
    `
    : "";
  const headerHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const rowsHtml = rows
    .map((row) => {
      const cols = row
        .map((cell) => {
          const align = cell?.align || "left";
          return `<td style="text-align:${align}">${escapeHtml(cell?.value)}</td>`;
        })
        .join("");
      return `<tr>${cols}</tr>`;
    })
    .join("");

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 18px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; }
          .subtitle { font-size: 13px; color: #4b5563; margin: 4px 0 10px; }
          .meta { font-size: 12px; color: #374151; margin: 2px 0; }
          .summary { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
          .summary-card { border: 1px solid #dbe5ff; background: #f5f8ff; border-radius: 8px; padding: 8px; min-width: 140px; }
          .summary-label { font-size: 11px; color: #4b5563; font-weight: 700; }
          .summary-value { font-size: 15px; color: #163f8a; font-weight: 900; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d9e6; padding: 7px; font-size: 12px; }
          th { background: #eef3ff; color: #163f8a; text-align: left; }
        </style>
      </head>
      <body>
        <h1 class="title">${escapeHtml(title)}</h1>
        <div class="subtitle">${escapeHtml(subtitle || "")}</div>
        ${metaHtml}
        ${summaryHtml}
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml || `<tr><td colspan="${headers.length || 1}">Sin datos para exportar</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `;
}

export function exportReportExcel({ fileName, ...config }) {
  if (!ensureWeb()) return false;
  const html = buildReportHtml(config);
  const blob = new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "reporte.xls";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return true;
}

export function exportReportPdf({ fileName, ...config }) {
  if (!ensureWeb()) return false;
  const html = buildReportHtml(config);
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 150);
  return true;
}
