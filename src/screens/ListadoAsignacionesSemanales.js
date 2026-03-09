import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { COLORS } from "../constants/colors";
import { Card, Col, Label, Row, SectionTitle, Select } from "../components/UI";

// Listados generales (asignaciones, periodos, deudores, devoluciones)
export default function ListadoAsignacionesSemanales({ token }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 920;
  const [tab, setTab] = useState("asignaciones");
  const [items, setItems] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [capacitadores, setCapacitadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [periodosListado, setPeriodosListado] = useState([]);
  const [deudores, setDeudores] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [estado, setEstado] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [capacitadorId, setCapacitadorId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [error, setError] = useState("");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const formatMoney = (value) => `$ ${Number(value || 0).toLocaleString("es-CL")}`;
  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };
  const getWeekLabel = (startDateValue) => {
    const d = toDate(startDateValue);
    if (!d) return "Semana";
    return `Semana ${Math.ceil(d.getDate() / 7)}`;
  };

  const toDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (periodoId) params.append("periodoId", periodoId);
    if (capacitadorId) params.append("capacitadorId", capacitadorId);
    if (clienteId) params.append("clienteId", clienteId);
    if (estado) params.append("estado", estado);
    const q = params.toString();
    return q ? `?${q}` : "";
  }, [capacitadorId, clienteId, estado, periodoId]);

  const loadCatalogos = useCallback(async () => {
    try {
      const [p, c, cl] = await Promise.all([
        fetch(`${API_BASE}/Periodos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Capacitadores`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Clientes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (p.ok) setPeriodos(await p.json());
      if (c.ok) setCapacitadores(await c.json());
      if (cl.ok) setClientes(await cl.json());
    } catch {
      // ignore
    }
  }, [token]);

  const loadAsignaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/AsignacionesSemanales/listado${buildQuery()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "No se pudo cargar el listado.");
    }
  }, [buildQuery, token]);

  const loadPeriodosListado = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/Listados/periodos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPeriodosListado(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar periodos.");
    }
  }, [token]);

  const loadDeudores = useCallback(async () => {
    try {
      const q = periodoId ? `?periodoId=${encodeURIComponent(periodoId)}` : "";
      const res = await fetch(`${API_BASE}/Listados/deudores${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDeudores(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar deudores.");
    }
  }, [periodoId, token]);

  const loadDevoluciones = useCallback(async () => {
    try {
      const q = periodoId ? `?periodoId=${encodeURIComponent(periodoId)}` : "";
      const res = await fetch(`${API_BASE}/Listados/devoluciones${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDevoluciones(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar devoluciones.");
    }
  }, [periodoId, token]);

  useEffect(() => {
    loadCatalogos();
    loadAsignaciones();
    loadPeriodosListado();
    loadDeudores();
    loadDevoluciones();
  }, [loadAsignaciones, loadCatalogos, loadDeudores, loadDevoluciones, loadPeriodosListado]);

  useEffect(() => {
    if (tab === "asignaciones") loadAsignaciones();
    if (tab === "deudores") loadDeudores();
    if (tab === "devoluciones") loadDevoluciones();
  }, [loadAsignaciones, loadDeudores, loadDevoluciones, tab]);

  const yearItems = useMemo(() => {
    const years = new Set();
    (Array.isArray(periodosListado) ? periodosListado : []).forEach((p) => {
      const d = toDate(p.fechaInicio ?? p.FechaInicio);
      if (d) years.add(d.getFullYear());
    });
    if (years.size === 0) years.add(selectedYear);
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((y) => ({ label: String(y), value: String(y) }));
  }, [periodosListado, selectedYear]);

  const filteredPeriodos = useMemo(() => {
    const list = Array.isArray(periodos) ? periodos : [];
    return list
      .filter((p) => {
        const d = toDate(p.fechaInicio ?? p.FechaInicio);
        if (!d) return false;
        return d.getFullYear() === Number(selectedYear) && d.getMonth() === selectedMonth;
      })
      .sort((a, b) => {
        const fa = toDate(a.fechaInicio ?? a.FechaInicio)?.getTime() || 0;
        const fb = toDate(b.fechaInicio ?? b.FechaInicio)?.getTime() || 0;
        return fa - fb;
      });
  }, [periodos, selectedMonth, selectedYear]);

  const periodosItemsByMonth = useMemo(
    () =>
      filteredPeriodos
        .slice()
        .sort((a, b) => {
          const fa = toDate(a.fechaInicio ?? a.FechaInicio)?.getTime() || 0;
          const fb = toDate(b.fechaInicio ?? b.FechaInicio)?.getTime() || 0;
          return fa - fb;
        })
        .map((p) => {
        const nombre = p.nombre ?? p.Nombre ?? "";
        const fiRaw = p.fechaInicio ?? p.FechaInicio;
        const ftRaw = p.fechaTermino ?? p.FechaTermino;
        const fiDate = toDate(fiRaw);
        const weekInMonth = fiDate ? Math.ceil(fiDate.getDate() / 7) : null;
        const fi = formatDate(fiRaw);
        const ft = formatDate(ftRaw);
        const semanaLabel = weekInMonth ? `Semana ${weekInMonth}` : "Semana";
        return {
          label: fi && ft ? `${semanaLabel} (${fi} - ${ft})` : nombre || semanaLabel,
          value: String(p.id ?? p.Id),
        };
      }),
    [filteredPeriodos]
  );

  useEffect(() => {
    if (periodoId && !periodosItemsByMonth.some((p) => p.value === periodoId)) {
      setPeriodoId("");
    }
  }, [periodoId, periodosItemsByMonth]);

  const capacitadoresItems = useMemo(
    () =>
      (Array.isArray(capacitadores) ? capacitadores : []).map((c) => ({
        label: c.nombre ?? c.Nombre,
        value: String(c.id ?? c.Id),
      })),
    [capacitadores]
  );

  const clientesItems = useMemo(
    () =>
      (Array.isArray(clientes) ? clientes : []).map((c) => ({
        label: c.nombre ?? c.Nombre,
        value: String(c.id ?? c.Id),
      })),
    [clientes]
  );

  const downloadAsignaciones = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/AsignacionesSemanales/listado/${type}${buildQuery()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "pdf" ? "listado_asignaciones.pdf" : "listado_asignaciones.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "No se pudo descargar.");
    }
  };

  const downloadListado = async (tipo, ext) => {
    try {
      const q = periodoId ? `?periodoId=${encodeURIComponent(periodoId)}` : "";
      const res = await fetch(`${API_BASE}/Listados/${tipo}/${ext}${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo}.${ext === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "No se pudo descargar.");
    }
  };

  const resumen = useMemo(() => {
    if (tab === "asignaciones") {
      return items.reduce(
        (acc, it) => ({
          total: acc.total + 1,
          asignado: acc.asignado + Number(it.totalAsignado || 0),
          rendido: acc.rendido + Number(it.totalRendido || 0),
        }),
        { total: 0, asignado: 0, rendido: 0 }
      );
    }
    if (tab === "deudores") {
      return deudores.reduce(
        (acc, it) => ({
          total: acc.total + Number(it.cantidad || 0),
          asignado: acc.asignado + Number(it.totalAsignado || 0),
          rendido: acc.rendido + Number(it.totalRendido || 0),
        }),
        { total: 0, asignado: 0, rendido: 0 }
      );
    }
    if (tab === "devoluciones") {
      return devoluciones.reduce(
        (acc, it) => ({
          total: acc.total + Number(it.cantidad || 0),
          asignado: acc.asignado + Number(it.totalAsignado || 0),
          rendido: acc.rendido + Number(it.totalRendido || 0),
        }),
        { total: 0, asignado: 0, rendido: 0 }
      );
    }
    return { total: filteredPeriodos.length, asignado: 0, rendido: 0 };
  }, [deudores, devoluciones, filteredPeriodos.length, items, tab]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <SectionTitle title="Listados generales" subtitle="Resumenes del sistema con filtros y exportacion." />

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, tab === "asignaciones" && styles.tabActive]}
          onPress={() => setTab("asignaciones")}
        >
          <Text style={[styles.tabText, tab === "asignaciones" && styles.tabTextActive]}>Asignaciones</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "periodos" && styles.tabActive]} onPress={() => setTab("periodos")}>
          <Text style={[styles.tabText, tab === "periodos" && styles.tabTextActive]}>Periodos</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "deudores" && styles.tabActive]} onPress={() => setTab("deudores")}>
          <Text style={[styles.tabText, tab === "deudores" && styles.tabTextActive]}>Deudores</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "devoluciones" && styles.tabActive]}
          onPress={() => setTab("devoluciones")}
        >
          <Text style={[styles.tabText, tab === "devoluciones" && styles.tabTextActive]}>Devoluciones</Text>
        </Pressable>
      </View>

      <Card style={{ marginBottom: 12 }}>
        <Text style={styles.filterTitle}>Filtros rapidos</Text>
        <Text style={{ marginBottom: 8, color: COLORS.muted, fontWeight: "700" }}>
          Filtra por mes, ano y responsables para obtener un resumen limpio.
        </Text>

        <View style={styles.monthRow}>
          {MONTHS.map((m, idx) => (
            <Pressable
              key={m}
              style={[styles.monthChip, selectedMonth === idx && styles.monthChipActive]}
              onPress={() => setSelectedMonth(idx)}
            >
              <Text style={[styles.monthText, selectedMonth === idx && styles.monthTextActive]}>{m}</Text>
            </Pressable>
          ))}
          <View style={styles.yearSelect}>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))} items={yearItems} />
          </View>
        </View>

        <Row gap={12} style={{ marginTop: 12 }}>
          <Col>
            <Label>Semana del mes</Label>
            <Select
              value={periodoId}
              onValueChange={setPeriodoId}
              items={[{ label: "Todos", value: "" }, ...periodosItemsByMonth]}
            />
            <Text style={styles.periodHint}>
              {periodosItemsByMonth.length
                ? `${MONTHS[selectedMonth]} ${selectedYear}: ${periodosItemsByMonth.length} semana(s) disponibles`
                : `${MONTHS[selectedMonth]} ${selectedYear}: sin semanas definidas`}
            </Text>
            {periodoId ? (
              <Text style={styles.weekSelectedHint}>
                Semana seleccionada: {periodosItemsByMonth.find((w) => w.value === periodoId)?.label || "-"}
              </Text>
            ) : null}
          </Col>
          <Col>
            <Label>Capacitador</Label>
            <Select
              value={capacitadorId}
              onValueChange={setCapacitadorId}
              items={[{ label: "Todos", value: "" }, ...capacitadoresItems]}
            />
          </Col>
        </Row>

        {tab === "asignaciones" && (
          <Row gap={12} style={{ marginTop: 12 }}>
            <Col>
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId} items={[{ label: "Todos", value: "" }, ...clientesItems]} />
            </Col>
            <Col>
              <Label>Estado</Label>
              <Select
                value={estado}
                onValueChange={setEstado}
                items={[
                  { label: "Todos", value: "" },
                  { label: "Pendiente", value: "Pendiente" },
                  { label: "Asignada", value: "Asignada" },
                  { label: "Completada", value: "Completada" },
                ]}
              />
            </Col>
          </Row>
        )}

        <View style={styles.actionsRow}>
          {tab === "asignaciones" && (
            <>
              <Pressable style={styles.btn} onPress={() => downloadAsignaciones("csv")}>
                <Text style={styles.btnText}>Descargar CSV</Text>
              </Pressable>
              <Pressable style={styles.btnSecondary} onPress={() => downloadAsignaciones("pdf")}>
                <Text style={styles.btnTextSecondary}>Descargar PDF</Text>
              </Pressable>
            </>
          )}
          {tab === "periodos" && (
            <>
              <Pressable style={styles.btn} onPress={() => downloadListado("periodos", "csv")}>
                <Text style={styles.btnText}>Descargar CSV</Text>
              </Pressable>
              <Pressable style={styles.btnSecondary} onPress={() => downloadListado("periodos", "pdf")}>
                <Text style={styles.btnTextSecondary}>Descargar PDF</Text>
              </Pressable>
            </>
          )}
          {tab === "deudores" && (
            <>
              <Pressable style={styles.btn} onPress={() => downloadListado("deudores", "csv")}>
                <Text style={styles.btnText}>Descargar CSV</Text>
              </Pressable>
              <Pressable style={styles.btnSecondary} onPress={() => downloadListado("deudores", "pdf")}>
                <Text style={styles.btnTextSecondary}>Descargar PDF</Text>
              </Pressable>
            </>
          )}
          {tab === "devoluciones" && (
            <>
              <Pressable style={styles.btn} onPress={() => downloadListado("devoluciones", "csv")}>
                <Text style={styles.btnText}>Descargar CSV</Text>
              </Pressable>
              <Pressable style={styles.btnSecondary} onPress={() => downloadListado("devoluciones", "pdf")}>
                <Text style={styles.btnTextSecondary}>Descargar PDF</Text>
              </Pressable>
            </>
          )}
        </View>
      </Card>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <Card>
        <View style={[styles.summaryRow, isMobile && styles.summaryRowMobile]}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              {tab === "periodos" ? "Periodos" : tab === "asignaciones" ? "Asignaciones" : "Rendiciones"}
            </Text>
            <Text style={styles.summaryValue}>{Number(resumen.total || 0).toLocaleString("es-CL")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total asignado</Text>
            <Text style={styles.summaryValue}>{formatMoney(resumen.asignado)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total rendido</Text>
            <Text style={styles.summaryValue}>{formatMoney(resumen.rendido)}</Text>
          </View>
        </View>

        {tab === "asignaciones" &&
          (items.length === 0 ? (
            <Text style={styles.empty}>No hay asignaciones.</Text>
          ) : (
            items.map((it) => (
              <View key={it.id ?? `${it.capacitador}-${it.periodo}-${it.cliente}`} style={[styles.row, isMobile && styles.rowMobile]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{it.capacitador}</Text>
                  <Text style={styles.sub}>
                    {it.periodo} - {it.cliente} - {it.region}
                  </Text>
                  <View style={styles.chipRow}>
                    <Text style={[styles.statusChip, getStatusStyle(it.estado)]}>{it.estado || "Sin estado"}</Text>
                  </View>
                </View>
                <View style={[styles.right, isMobile && styles.rightMobile]}>
                  <Text style={styles.money}>Asignado: {formatMoney(it.totalAsignado)}</Text>
                  <Text style={styles.money}>Rendido: {formatMoney(it.totalRendido)}</Text>
                  <Text style={styles.sub}>Rendiciones: {it.cantidadRendiciones}</Text>
                </View>
              </View>
            ))
          ))}

        {tab === "periodos" &&
          (filteredPeriodos.length === 0 ? (
            <Text style={styles.empty}>No hay periodos.</Text>
          ) : (
            filteredPeriodos.map((p) => (
              <View key={p.id} style={[styles.row, isMobile && styles.rowMobile]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{getWeekLabel(p.fechaInicio)} · {p.nombre}</Text>
                  <Text style={styles.sub}>
                    {formatDate(p.fechaInicio)} - {formatDate(p.fechaTermino)}
                  </Text>
                </View>
                <View style={[styles.right, isMobile && styles.rightMobile]}>
                  <Text style={styles.sub}>Activo: {p.activo ? "Si" : "No"}</Text>
                </View>
              </View>
            ))
          ))}

        {tab === "deudores" &&
          (deudores.length === 0 ? (
            <Text style={styles.empty}>No hay deudores.</Text>
          ) : (
            deudores.map((d, idx) => (
              <View key={`${d.capacitador}-${idx}`} style={[styles.row, isMobile && styles.rowMobile]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{d.capacitador}</Text>
                  <Text style={styles.sub}>Rendiciones: {d.cantidad}</Text>
                </View>
                <View style={[styles.right, isMobile && styles.rightMobile]}>
                  <Text style={styles.money}>Asignado: {formatMoney(d.totalAsignado)}</Text>
                  <Text style={styles.money}>Rendido: {formatMoney(d.totalRendido)}</Text>
                  <Text style={styles.sub}>Diferencia: {formatMoney(d.diferencia)}</Text>
                </View>
              </View>
            ))
          ))}

        {tab === "devoluciones" &&
          (devoluciones.length === 0 ? (
            <Text style={styles.empty}>No hay devoluciones.</Text>
          ) : (
            devoluciones.map((d, idx) => (
              <View key={`${d.capacitador}-${idx}`} style={[styles.row, isMobile && styles.rowMobile]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{d.capacitador}</Text>
                  <Text style={styles.sub}>Rendiciones: {d.cantidad}</Text>
                </View>
                <View style={[styles.right, isMobile && styles.rightMobile]}>
                  <Text style={styles.money}>Asignado: {formatMoney(d.totalAsignado)}</Text>
                  <Text style={styles.money}>Rendido: {formatMoney(d.totalRendido)}</Text>
                  <Text style={styles.sub}>Diferencia: {formatMoney(d.diferencia)}</Text>
                </View>
              </View>
            ))
          ))}
      </Card>
    </ScrollView>
  );
}

function getStatusStyle(estado) {
  const value = String(estado || "").toLowerCase();
  if (value.includes("pend")) return styles.statusWarning;
  if (value.includes("comp") || value.includes("apro")) return styles.statusOk;
  if (value.includes("rech")) return styles.statusError;
  return styles.statusNeutral;
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  tabActive: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  tabText: { fontWeight: "900", color: COLORS.text },
  tabTextActive: { color: COLORS.blue2 },
  btn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "900" },
  btnSecondary: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  btnTextSecondary: { color: COLORS.blue2, fontWeight: "900" },
  errorBox: {
    borderWidth: 1,
    borderColor: "#F6C7CC",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  error: { color: "#B42318", fontWeight: "800" },
  empty: { color: COLORS.muted, fontWeight: "700" },
  filterTitle: {
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
  },
  monthRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  monthChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  monthChipActive: {
    backgroundColor: COLORS.blue2,
    borderColor: COLORS.blue2,
  },
  monthText: { fontWeight: "900", color: COLORS.text },
  monthTextActive: { color: "#fff" },
  yearSelect: { minWidth: 120 },
  periodHint: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  weekSelectedHint: {
    marginTop: 4,
    color: COLORS.blue2,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  summaryRowMobile: {
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFF",
  },
  summaryLabel: { color: COLORS.muted, fontWeight: "800", fontSize: 12, marginBottom: 4 },
  summaryValue: { color: COLORS.text, fontWeight: "900", fontSize: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
    marginBottom: 10,
    gap: 10,
  },
  rowMobile: {
    flexDirection: "column",
  },
  title: { fontWeight: "900", color: COLORS.text, fontSize: 15 },
  sub: { marginTop: 4, color: COLORS.muted, fontWeight: "700", lineHeight: 18 },
  chipRow: { marginTop: 8, alignItems: "flex-start" },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "900",
    overflow: "hidden",
    borderWidth: 1,
    fontSize: 12,
  },
  statusOk: { backgroundColor: "#ECFDF3", color: "#027A48", borderColor: "#ABEFC6" },
  statusWarning: { backgroundColor: "#FFF8E8", color: "#B54708", borderColor: "#F9D79B" },
  statusError: { backgroundColor: "#FFF1F2", color: "#B42318", borderColor: "#F6C7CC" },
  statusNeutral: { backgroundColor: "#EEF2F6", color: "#344054", borderColor: "#D0D5DD" },
  right: {
    alignItems: "flex-end",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    backgroundColor: "#F8FAFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 210,
  },
  rightMobile: { alignItems: "flex-start", width: "100%" },
  money: { fontWeight: "900", color: COLORS.text, fontSize: 13 },
});
