import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE } from "../config/api";
import { COLORS } from "../constants/colors";
import { obtenerCapacitadoresUsuarios } from "../api/catalogos";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const [yyyy, mm, dd] = raw.split("-");
  if (!yyyy || !mm || !dd) return raw;
  return `${dd}/${mm}/${yyyy}`;
};

const formatPeriodoLabel = (p) => {
  const nombre = p?.nombre ?? p?.Nombre ?? "Periodo";
  const inicio = formatDate(p?.fechaInicio ?? p?.FechaInicio);
  const termino = formatDate(p?.fechaTermino ?? p?.FechaTermino);
  const activo = (p?.activo ?? p?.Activo) === true ? " · Activa" : "";
  if (inicio && termino) return `${nombre} (${inicio} - ${termino})${activo}`;
  return `${nombre}${activo}`;
};

// Secretaria: transferencias (resumen por capacitador)
export default function TransferenciasSecretaria({ token }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [transferRendiciones, setTransferRendiciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [capacitadores, setCapacitadores] = useState([]);
  const [actionMsg, setActionMsg] = useState("");
  const [actionKind, setActionKind] = useState("info");
  const [transferEstado, setTransferEstado] = useState("Aprobada");
  const [transferPeriodoId, setTransferPeriodoId] = useState("");
  const [transferCapacitadorId, setTransferCapacitadorId] = useState("");
  const [draftEstado, setDraftEstado] = useState("Aprobada");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [draftPeriodoId, setDraftPeriodoId] = useState("");
  const [draftCapacitadorId, setDraftCapacitadorId] = useState("");

  const transferItems = useMemo(
    () =>
      transferRendiciones.map((r) => ({
        capacitador: r.capacitador ?? r.Capacitador ?? "Sin nombre",
        capacitadorUsuarioId: Number(r.capacitadorUsuarioId ?? r.CapacitadorUsuarioId ?? 0),
        totalAsignado: Number(r.totalAsignado ?? r.TotalAsignado ?? 0),
        totalRendido: Number(r.totalRendido ?? r.TotalRendido ?? 0),
        cantidad: Number(r.cantidadRendiciones ?? r.CantidadRendiciones ?? 0),
      })),
    [transferRendiciones]
  );

  const filteredTransferItems = transferItems;

  const capacitadoresItems = useMemo(
    () =>
      (Array.isArray(capacitadores) ? capacitadores : [])
        .map((c) => ({
          label: c?.nombre || c?.email || "Sin nombre",
          value: String(c?.id ?? ""),
        }))
        .filter((c) => c.value),
    [capacitadores]
  );

  const yearItems = useMemo(() => {
    const years = new Set();
    (Array.isArray(periodos) ? periodos : []).forEach((p) => {
      const d = toDate(p?.fechaInicio ?? p?.FechaInicio);
      if (d) years.add(d.getFullYear());
    });
    if (years.size === 0) years.add(currentYear);
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((y) => ({ label: String(y), value: String(y) }));
  }, [currentYear, periodos]);

  const periodosItemsByMonth = useMemo(
    () =>
      (Array.isArray(periodos) ? periodos : [])
        .filter((p) => {
          const d = toDate(p?.fechaInicio ?? p?.FechaInicio);
          if (!d) return false;
          return d.getFullYear() === Number(selectedYear) && d.getMonth() === selectedMonth;
        })
        .sort((a, b) => {
          const fa = toDate(a?.fechaInicio ?? a?.FechaInicio)?.getTime() || 0;
          const fb = toDate(b?.fechaInicio ?? b?.FechaInicio)?.getTime() || 0;
          return fa - fb;
        })
        .map((p) => ({
          label: formatPeriodoLabel(p),
          value: String(p?.id ?? p?.Id),
          activo: (p?.activo ?? p?.Activo) === true,
        })),
    [periodos, selectedMonth, selectedYear]
  );

  const activePeriodoOfMonth = useMemo(
    () => periodosItemsByMonth.find((p) => p.activo) || null,
    [periodosItemsByMonth]
  );

  const selectedPeriodoLabel = useMemo(() => {
    if (!transferPeriodoId) return "Sin semana aplicada";
    return (
      periodosItemsByMonth.find((p) => String(p.value) === String(transferPeriodoId))?.label ||
      periodos.find((p) => String(p.id ?? p.Id) === String(transferPeriodoId))?.nombre ||
      periodos.find((p) => String(p.id ?? p.Id) === String(transferPeriodoId))?.Nombre ||
      `Semana #${transferPeriodoId}`
    );
  }, [periodos, periodosItemsByMonth, transferPeriodoId]);

  const selectedCapacitadorLabel = useMemo(() => {
    if (!transferCapacitadorId) return "Todos";
    return (
      capacitadores.find((c) => String(c?.id ?? "") === String(transferCapacitadorId))?.nombre ||
      transferCapacitadorId
    );
  }, [capacitadores, transferCapacitadorId]);

  const kpis = useMemo(() => {
    const totalAsignado = filteredTransferItems.reduce((acc, it) => acc + Number(it.totalAsignado || 0), 0);
    const totalRendido = filteredTransferItems.reduce((acc, it) => acc + Number(it.totalRendido || 0), 0);
    const cantidadRendiciones = filteredTransferItems.reduce((acc, it) => acc + Number(it.cantidad || 0), 0);
    return {
      totalAsignado,
      totalRendido,
      cantidadRendiciones,
      capacitadores: filteredTransferItems.length,
    };
  }, [filteredTransferItems]);

  const loadPeriodos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/Periodos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPeriodos(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }, [token]);

  const loadCapacitadores = useCallback(async () => {
    try {
      const data = await obtenerCapacitadoresUsuarios(token);
      setCapacitadores(Array.isArray(data) ? data : []);
    } catch {
      setCapacitadores([]);
    }
  }, [token]);

  const loadTransfer = useCallback(
    async (estado, periodoId, capacitadorId) => {
      try {
        const params = new URLSearchParams();
        if (estado) params.set("estado", estado);
        if (periodoId) params.set("periodoId", periodoId);
        if (capacitadorId) params.set("capacitadorId", capacitadorId);
        const q = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`${API_BASE}/Transferencias/solicitudes${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Error al cargar transferencias");
        }
        const data = await res.json();
        setTransferRendiciones(Array.isArray(data) ? data : []);
        setActionMsg("");
        setActionKind("info");
      } catch (e) {
        setActionMsg(e?.message || "No se pudo cargar transferencias.");
        setActionKind("error");
      }
    },
    [token]
  );

  // Exporta una planilla ordenada para Excel sin depender del backend.
  const downloadTransferExcel = () => {
    if (typeof window === "undefined") {
      setActionMsg("La exportacion Excel solo esta disponible en web.");
      return;
    }

    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const fecha = new Date().toLocaleString("es-CL");
    const periodoNombre =
      transferPeriodoId === ""
        ? "Sin semana seleccionada"
        : periodosItemsByMonth.find((p) => String(p.value) === String(transferPeriodoId))?.label ||
          periodos.find((p) => String(p.id ?? p.Id) === String(transferPeriodoId))?.nombre ||
          periodos.find((p) => String(p.id ?? p.Id) === String(transferPeriodoId))?.Nombre ||
          transferPeriodoId;
    const capacitadorNombre =
      transferCapacitadorId === ""
        ? "Todos"
        : capacitadores.find((c) => String(c?.id ?? "") === String(transferCapacitadorId))?.nombre ||
          transferCapacitadorId;

    const rowsHtml = transferItems
      .map(
        (t) => `
          <tr>
            <td>${esc(t.capacitador)}</td>
            <td style="text-align:right">${Number(t.totalAsignado).toLocaleString("es-CL")}</td>
            <td style="text-align:right">${Number(t.totalRendido).toLocaleString("es-CL")}</td>
            <td style="text-align:center">${esc(t.cantidad)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
            .meta { margin: 2px 0; color: #333; }
            table { border-collapse: collapse; margin-top: 12px; width: 100%; }
            th, td { border: 1px solid #cfd7e6; padding: 8px; font-size: 12px; }
            th { background: #eef3ff; color: #163F8A; text-align: left; }
          </style>
        </head>
        <body>
          <div class="title">Transferencias por capacitador</div>
          <div class="meta"><b>Fecha:</b> ${esc(fecha)}</div>
          <div class="meta"><b>Estado:</b> ${esc(transferEstado)}</div>
          <div class="meta"><b>Periodo:</b> ${esc(periodoNombre)}</div>
          <div class="meta"><b>Capacitador:</b> ${esc(capacitadorNombre)}</div>
          <table>
            <thead>
              <tr>
                <th>Capacitador</th>
                <th>Total asignado</th>
                <th>Total rendido</th>
                <th>Cantidad rendiciones</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="4">Sin datos para exportar</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transferencias_solicitudes.xls";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const onGenerarTransferencias = async () => {
    if (!transferPeriodoId) {
      setActionMsg("Selecciona una semana del mes antes de generar transferencias.");
      setActionKind("error");
      return;
    }

    try {
      setActionMsg("");
      setActionKind("info");
      const params = new URLSearchParams();
      if (transferEstado) params.set("estado", transferEstado);
      if (transferPeriodoId) params.set("periodoId", transferPeriodoId);
      if (transferCapacitadorId) params.set("capacitadorId", transferCapacitadorId);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_BASE}/Transferencias/solicitudes/generar${q}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo generar transferencias.");
      }
      const data = await res.json();
      setActionMsg(`Transferencias generadas: ${data?.created ?? 0}`);
      setActionKind("success");
      loadTransfer(transferEstado, transferPeriodoId, transferCapacitadorId);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo generar transferencias.");
      setActionKind("error");
    }
  };

  const onApplyFilters = () => {
    setTransferEstado(draftEstado);
    setTransferPeriodoId(draftPeriodoId);
    setTransferCapacitadorId(draftCapacitadorId);
    loadTransfer(draftEstado, draftPeriodoId, draftCapacitadorId);
  };

  const onClearFilters = () => {
    setDraftEstado("Aprobada");
    setSelectedYear(String(currentYear));
    setSelectedMonth(currentMonth);
    setDraftPeriodoId("");
    setDraftCapacitadorId("");
    setTransferEstado("Aprobada");
    setTransferPeriodoId("");
    setTransferCapacitadorId("");
    loadTransfer("Aprobada", "", "");
  };

  useEffect(() => {
    if (draftPeriodoId && !periodosItemsByMonth.some((p) => String(p.value) === String(draftPeriodoId))) {
      setDraftPeriodoId("");
    }
  }, [draftPeriodoId, periodosItemsByMonth]);

  useEffect(() => {
    if (draftPeriodoId) return;
    if (!activePeriodoOfMonth) return;
    setDraftPeriodoId(String(activePeriodoOfMonth.value));
  }, [activePeriodoOfMonth, draftPeriodoId]);

  const onGenerateWithConfirm = () => {
    const msg = "Se generaran las transferencias para el filtro actual. ¿Deseas continuar?";
    const proceed =
      typeof window !== "undefined" && typeof window.confirm === "function" ? window.confirm(msg) : false;
    if (!proceed) return;
    onGenerarTransferencias();
  };

  useEffect(() => {
    loadPeriodos();
    loadCapacitadores();
    loadTransfer(transferEstado, transferPeriodoId, transferCapacitadorId);
  }, [loadCapacitadores, loadPeriodos, loadTransfer, transferEstado, transferPeriodoId, transferCapacitadorId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Transferencias"
        subtitle="Resumen por capacitador para generar transferencias."
        secondaryLabel="Actualizar"
        onSecondaryPress={() => loadTransfer(transferEstado, transferPeriodoId, transferCapacitadorId)}
      />

      <StatusMessage
        tone={actionKind === "error" ? "error" : actionKind === "success" ? "info" : "warning"}
        text={actionMsg}
      />

      <KpiRow
        items={[
          {
            key: "asignado",
            label: "Total asignado",
            value: `$ ${kpis.totalAsignado.toLocaleString("es-CL")}`,
          },
          {
            key: "rendido",
            label: "Total rendido",
            value: `$ ${kpis.totalRendido.toLocaleString("es-CL")}`,
          },
          { key: "rendiciones", label: "Rendiciones", value: kpis.cantidadRendiciones },
          { key: "capacitadores", label: "Capacitadores", value: kpis.capacitadores },
        ]}
      />

      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Filtros rapidos</Text>
        <Text style={styles.transferSub}>Define estado, año, mes, semana y capacitador.</Text>
        <View style={styles.filterSummaryRow}>
          <View style={styles.filterSummaryPill}>
            <Text style={styles.filterSummaryLabel}>Semana activa sugerida</Text>
            <Text style={styles.filterSummaryValue}>
              {activePeriodoOfMonth?.label || "No hay semana activa en este mes"}
            </Text>
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Estado</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={draftEstado}
                onValueChange={(v) => setDraftEstado(v)}
                style={styles.transferPicker}
              >
                <Picker.Item label="Aprobada" value="Aprobada" />
                <Picker.Item label="Pendiente" value="Pendiente" />
                <Picker.Item label="Rechazada" value="Rechazada" />
              </Picker>
            </View>
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Año</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(v) => setSelectedYear(v)}
                style={styles.transferPicker}
              >
                {yearItems.map((y) => (
                  <Picker.Item key={y.value} label={y.label} value={y.value} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Mes</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
                style={styles.transferPicker}
              >
                {MONTHS.map((m, idx) => (
                  <Picker.Item key={`${m}-${idx}`} label={m} value={String(idx)} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Semana del mes</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={draftPeriodoId}
                onValueChange={(v) => setDraftPeriodoId(v)}
                style={styles.transferPicker}
              >
                <Picker.Item label="Selecciona semana" value="" />
                {periodosItemsByMonth.map((p) => (
                  <Picker.Item
                    key={p.value}
                    label={p.label}
                    value={p.value}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.transferHint}>
              {periodosItemsByMonth.length
                ? `${MONTHS[selectedMonth]} ${selectedYear}: ${periodosItemsByMonth.length} semana(s) disponibles`
                : `No hay semanas cargadas para ${MONTHS[selectedMonth]} ${selectedYear}`}
            </Text>
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Capacitador</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={draftCapacitadorId}
                onValueChange={(v) => setDraftCapacitadorId(v)}
                style={styles.transferPicker}
              >
                <Picker.Item label="Todos" value="" />
                {capacitadoresItems.map((c) => (
                  <Picker.Item key={c.value} label={c.label} value={c.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        <View style={styles.filterActions}>
          <Pressable style={styles.transferBtn} onPress={onApplyFilters}>
            <Text style={styles.transferBtnText}>Aplicar</Text>
          </Pressable>
          <Pressable style={styles.transferBtnSecondary} onPress={onClearFilters}>
            <Text style={styles.transferBtnTextSecondary}>Limpiar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Transferencias (vista previa)</Text>
        <Text style={styles.transferSub}>Resultado del filtro aplicado.</Text>
        <View style={styles.filterSummaryRow}>
          <View style={styles.filterSummaryPill}>
            <Text style={styles.filterSummaryLabel}>Estado aplicado</Text>
            <Text style={styles.filterSummaryValue}>{transferEstado || "-"}</Text>
          </View>
          <View style={styles.filterSummaryPill}>
            <Text style={styles.filterSummaryLabel}>Semana aplicada</Text>
            <Text style={styles.filterSummaryValue}>{selectedPeriodoLabel}</Text>
          </View>
          <View style={styles.filterSummaryPill}>
            <Text style={styles.filterSummaryLabel}>Capacitador</Text>
            <Text style={styles.filterSummaryValue}>{selectedCapacitadorLabel}</Text>
          </View>
        </View>

        {filteredTransferItems.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay rendiciones para ese filtro. Revisa la semana seleccionada, el estado exacto y si ya generaste las solicitudes para ese periodo.
          </Text>
        ) : (
          <View style={styles.transferTable}>
            <View style={styles.transferHeaderRow}>
              <Text style={[styles.transferHeader, styles.colTransferCap]}>Capacitador</Text>
              <Text style={[styles.transferHeader, styles.colTransferAsig]}>Asignado</Text>
              <Text style={[styles.transferHeader, styles.colTransferRend]}>Rendido</Text>
              <Text style={[styles.transferHeader, styles.colTransferCant]}>Cant.</Text>
            </View>
            {filteredTransferItems.map((t, idx) => (
              <View key={`${t.capacitador}-${idx}`} style={styles.transferRow}>
                <Text style={[styles.transferCell, styles.colTransferCap]}>{t.capacitador}</Text>
                <Text style={[styles.transferCell, styles.colTransferAsig]}>
                  $ {Number(t.totalAsignado).toLocaleString("es-CL")}
                </Text>
                <Text style={[styles.transferCell, styles.colTransferRend]}>
                  $ {Number(t.totalRendido).toLocaleString("es-CL")}
                </Text>
                <Text style={[styles.transferCell, styles.colTransferCant]}>{t.cantidad}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.transferActions}>
          <Pressable style={styles.transferBtnSecondary} onPress={downloadTransferExcel}>
            <Text style={styles.transferBtnTextSecondary}>Descargar Excel</Text>
          </Pressable>
          <Pressable style={styles.transferBtnPrimary} onPress={onGenerateWithConfirm}>
            <Text style={styles.transferBtnText}>Generar transferencias</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  transferCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  transferTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  transferSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
  filterRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  filterCol: { minWidth: 220, flexGrow: 1 },
  filterActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  transferFilterLabel: { fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  transferSelectWrap: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    justifyContent: "center",
    maxWidth: 320,
  },
  transferPicker: { height: 40, color: COLORS.text },
  transferHint: { marginTop: 6, color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  filterSummaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  filterSummaryPill: {
    minWidth: 220,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterSummaryLabel: { color: COLORS.muted, fontWeight: "800", fontSize: 11 },
  filterSummaryValue: { color: COLORS.text, fontWeight: "900", marginTop: 3, fontSize: 12 },
  transferTable: { marginTop: 10 },
  transferHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  transferHeader: { fontWeight: "900", color: COLORS.muted, fontSize: 12 },
  transferRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  transferCell: { fontWeight: "800", color: COLORS.text },
  colTransferCap: { width: 320, textAlign: "left" },
  colTransferAsig: { width: 140, textAlign: "right" },
  colTransferRend: { width: 140, textAlign: "right" },
  colTransferCant: { width: 80, textAlign: "center" },
  transferActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  transferBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  transferBtnPrimary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    borderWidth: 1,
    borderColor: "#D98A1A",
  },
  transferBtnText: { color: "#fff", fontWeight: "900" },
  transferBtnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  transferBtnTextSecondary: { color: COLORS.blue2, fontWeight: "900" },
  emptyText: { color: COLORS.muted, fontWeight: "700" },
});
