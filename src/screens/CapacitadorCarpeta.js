import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

// Capacitador: carpeta de viajes + filtros + estado de rendiciÃ³n

const statusStyle = (estado) => {
  if (estado === "Rendicion completa") return styles.badgeOk;
  if (estado === "En revision") return styles.badgeReview;
  return styles.badgePending;
};

export default function CapacitadorCarpeta({ token, onIrRendicion }) {
  const [viajes, setViajes] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ destino: "", desde: "", hasta: "", estado: "Todos" });
  const [applied, setApplied] = useState({ destino: "", desde: "", hasta: "", estado: "Todos" });
  const [selectedId, setSelectedId] = useState(null);
  const [rendiciones, setRendiciones] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Viajes/mios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Error al cargar viajes");
        }
        const data = await res.json();
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setViajes(list);
        if (list.length > 0) setSelectedId(list[0].id);
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Error al cargar viajes");
        setViajes([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Rendiciones/mias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Error al cargar rendiciones");
        }
        const data = await res.json();
        if (!alive) return;
        setRendiciones(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setRendiciones([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const filteredViajes = useMemo(() => {
    return filterViajes(viajes, applied);
  }, [viajes, applied]);

  const resumen = useMemo(() => {
    const total = filteredViajes.length;
    const pendientes = filteredViajes.filter((v) => v.estado === "Pendiente").length;
    const revision = filteredViajes.filter((v) => v.estado === "EnRevisionSecretaria" || v.estado === "EnRevisionContadora" || v.estado === "En revision").length;
    const completas = filteredViajes.filter((v) => v.estado === "Rendicion completa" || v.estado === "Aprobada").length;
    return { total, pendientes, revision, completas };
  }, [filteredViajes]);

  const selected = useMemo(
    () => filteredViajes.find((v) => v.id === selectedId) || filteredViajes[0] || null,
    [filteredViajes, selectedId]
  );

  const selectedRendicion = useMemo(() => {
    if (!selected) return null;
    const direct = rendiciones.find((r) => r.asignacionViajeId === selected.id);
    if (direct) return direct;
    return rendiciones.find((r) => r.viaje?.id === selected.id) || null;
  }, [rendiciones, selected]);

  const rechazoMensaje = useMemo(() => {
    const estadoRendicion = String(selectedRendicion?.estado || "").toLowerCase();
    const estadoViaje = String(selected?.estado || "").toLowerCase();
    if (estadoRendicion.includes("rechaz") || estadoViaje.includes("rechaz")) {
      return selectedRendicion?.observacion || "La contadora rechazo la rendicion.";
    }
    return "";
  }, [selectedRendicion, selected]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Carpeta de viajes</Text>
      <Text style={dash.h2}>
        Aqui puedes revisar tus viajes asignados, ver las asignaciones por viaje y el estado de tu rendicion.
      </Text>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Filtros</Text>
        <Text style={styles.panelSub}>Busca por destino, rango de fechas o estado.</Text>

        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.label}>Destino</Text>
            <TextInput
              placeholder="Ej: Santiago"
              placeholderTextColor={COLORS.muted}
              value={filters.destino}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, destino: value }))}
              style={styles.input}
            />
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.label}>Desde</Text>
            <TextInput
              placeholder="dd/mm/yyyy"
              placeholderTextColor={COLORS.muted}
              value={filters.desde}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, desde: value }))}
              style={styles.input}
            />
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.label}>Hasta</Text>
            <TextInput
              placeholder="dd/mm/yyyy"
              placeholderTextColor={COLORS.muted}
              value={filters.hasta}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, hasta: value }))}
              style={styles.input}
            />
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.label}>Estado</Text>
            <TextInput
              placeholder="Todos"
              placeholderTextColor={COLORS.muted}
              value={filters.estado}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, estado: value }))}
              style={styles.input}
            />
          </View>
          <View style={styles.filterActions}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                const list = filterViajes(viajes, filters);
                setApplied({ ...filters });
                setSelectedId(list[0]?.id ?? null);
              }}
            >
              <Text style={styles.primaryBtnText}>Aplicar</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                const clean = { destino: "", desde: "", hasta: "", estado: "Todos" };
                setFilters(clean);
                setApplied(clean);
              }}
            >
              <Text style={styles.secondaryBtnText}>Limpiar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Viajes asignados" value={resumen.total} />
          <SummaryCard label="Pendientes" value={resumen.pendientes} />
          <SummaryCard label="En revision" value={resumen.revision} />
          <SummaryCard label="Completas" value={resumen.completas} />
        </View>
      </View>

      <View style={dash.panel}>
        <View style={styles.listHeader}>
          <Text style={dash.panelTitle}>Mis viajes</Text>
          <Text style={styles.orderText}>Orden: mas recientes primero</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 0.6 }]}>ID Viaje</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Destino</Text>
          <Text style={[styles.th, { flex: 1.1 }]}>Region</Text>
          <Text style={[styles.th, { flex: 1.1 }]}>Modalidad</Text>
          <Text style={[styles.th, { flex: 1.6 }]}>Desde - Hasta</Text>
          <Text style={[styles.th, { flex: 0.6 }]}>Dias</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Total asignado</Text>
          <Text style={[styles.th, { flex: 1.1 }]}>Total rendido</Text>
          <Text style={[styles.th, { flex: 1 }]}>Estado</Text>
          <Text style={[styles.th, { flex: 0.8 }]}>Accion</Text>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredViajes.length === 0 ? (
          <Text style={styles.errorText}>No hay viajes para mostrar.</Text>
        ) : (
          filteredViajes.map((row) => (
          <View key={row.id} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 0.6 }]}>{row.id}</Text>
            <Text style={[styles.td, { flex: 1.2 }]}>{row.municipio || row.comuna || "Sin destino"}</Text>
            <Text style={[styles.td, { flex: 1.1 }]}>{row.regionNombre || row.region || ""}</Text>
            <Text style={[styles.td, { flex: 1.1 }]}>{row.modalidad}</Text>
            <Text style={[styles.td, { flex: 1.6 }]}>{formatRango(row.fechaInicio, row.fechaTermino)}</Text>
            <Text style={[styles.td, { flex: 0.6 }]}>{row.totalDias}</Text>
            <Text style={[styles.td, { flex: 1.2 }]}>
              $ {Number(row.montoViaticoTotal || 0).toLocaleString("es-CL")}
            </Text>
            <Text style={[styles.td, { flex: 1.1 }]}>
              $ {Number(row.totalRendido || 0).toLocaleString("es-CL")}
            </Text>
            <View style={[styles.td, { flex: 1 }]}>
              <View style={[styles.badge, statusStyle(row.estado)]}>
                <Text style={styles.badgeText}>{row.estado}</Text>
              </View>
            </View>
            <View style={[styles.td, { flex: 0.8 }]}>
              <Pressable style={styles.primaryBtnSmall} onPress={() => setSelectedId(row.id)}>
                <Text style={styles.primaryBtnText}>Ver detalle</Text>
              </Pressable>
            </View>
          </View>
        )))}
      </View>

      <View style={dash.panel}>
        <View style={styles.detailHeader}>
          <Text style={dash.panelTitle}>Detalle de viaje</Text>
          {selected?.estado ? (
            <View style={[styles.badge, statusStyle(selected.estado)]}>
              <Text style={styles.badgeText}>{selected.estado}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.panelSub}>Revisa asignaciones, montos y avance de rendicion.</Text>

        {!selected ? (
          <Text style={styles.errorText}>No hay viajes para mostrar.</Text>
        ) : (
          <View style={styles.detailGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Asignaciones por dia</Text>
              {renderAsignacionRow("Desayuno", selected.desayuno)}
              {renderAsignacionRow("Almuerzo", selected.almuerzo)}
              {renderAsignacionRow("Once", selected.once)}
              {renderAsignacionRow("Cena", selected.cena)}
              {renderAsignacionRow("Viatico", selected.viatico)}
              <View style={styles.detailTotal}>
                <Text style={styles.detailTotalText}>Total asignaciones/dia</Text>
                <Text style={styles.detailTotalValue}>
                  $ {calcSubtotalDia(selected).toLocaleString("es-CL")}
                </Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Gastos ingresados (categorias)</Text>
              {renderCategoriaRow("Transporte / Uber / Taxi", calcTransporte(selected))}
              {renderCategoriaRow("Peajes", selected.peajes)}
              {renderCategoriaRow("Reembolsos / Descuentos", selected.reembolsos)}
              {renderCategoriaRow("Varios", selected.varios)}
              {renderCategoriaRow("Copec", selected.copec)}
              <View style={styles.detailTotal}>
                <Text style={styles.detailTotalText}>Total asignado viaje</Text>
                <Text style={styles.detailTotalValue}>
                  $ {Number(selected.montoViaticoTotal || 0).toLocaleString("es-CL")}
                </Text>
              </View>
              <View style={styles.detailActions}>
                <Pressable style={styles.secondaryBtn} onPress={() => onDownloadPlantilla(selected.id, token)}>
                  <Text style={styles.secondaryBtnText}>Descargar plantilla</Text>
                </Pressable>
                <Pressable style={styles.primaryBtn} onPress={() => onIrRendicion?.(selected.id)}>
                  <Text style={styles.primaryBtnText}>Ir a rendicion</Text>
                </Pressable>
              </View>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  Regla: si el total rendido no coincide con el total asignado, no podras enviar la rendicion.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {rechazoMensaje ? (
        <View style={styles.rejectBox}>
          <Text style={styles.rejectTitle}>Motivo de rechazo</Text>
          <Text style={styles.rejectText}>
            {rechazoMensaje}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function parseDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.includes("-") && raw.split("-")[0].length === 4) {
    const iso = new Date(raw);
    return Number.isNaN(iso.getTime()) ? null : iso;
  }
  const parts = raw.split(/[\/\-]/).map((p) => Number(p));
  if (parts.length !== 3) return null;
  let [a, b, c] = parts;
  if (!a || !b || !c) return null;
  let day = a;
  let month = b;
  if (a <= 12 && b <= 12) {
    day = a;
    month = b;
  } else if (a > 12) {
    day = a;
    month = b;
  } else {
    day = b;
    month = a;
  }
  const d = new Date(c, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toDateOnly(date) {
  if (!date) return null;
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Number.isNaN(d.getTime()) ? null : d;
}

function filterViajes(list, filters) {
  const destino = normalizeText(filters.destino);
  const estado = normalizeText(filters.estado);
  const desde = toDateOnly(parseDateInput(filters.desde));
  const hasta = toDateOnly(parseDateInput(filters.hasta));
  return list.filter((v) => {
    const target = normalizeText(v.municipio || v.comuna || "");
    if (destino && !target.includes(destino)) return false;
    if (estado && estado !== "todos") {
      const estadoViaje = normalizeText(v.estado);
      if (!estadoViaje.includes(estado)) return false;
    }
    if (desde || hasta) {
      const start = toDateOnly(parseDateInput(v.fechaInicio));
      const end = toDateOnly(parseDateInput(v.fechaTermino));
      if (start && desde && start < desde) return false;
      if (end && hasta && end > hasta) return false;
    }
    return true;
  });
}

function calcSubtotalDia(viaje) {
  if (!viaje) return 0;
  return (
    Number(viaje.desayuno || 0) +
    Number(viaje.almuerzo || 0) +
    Number(viaje.once || 0) +
    Number(viaje.cena || 0) +
    Number(viaje.viatico || 0)
  );
}

function calcTransporte(viaje) {
  if (!viaje) return 0;
  return (
    Number(viaje.movAsignado || 0) +
    Number(viaje.transferUber || 0) +
    Number(viaje.colectivoTaxi || 0)
  );
}

function renderAsignacionRow(label, monto) {
  const value = Number(monto || 0);
  const badgeStyle = value > 0 ? styles.badgeOk : styles.badgePending;
  const badgeText = value > 0 ? "Asignado" : "0";
  return (
    <View key={label} style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>$ {value.toLocaleString("es-CL")}</Text>
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    </View>
  );
}

function renderCategoriaRow(label, monto) {
  const value = Number(monto || 0);
  const badgeStyle = value > 0 ? styles.badgeOk : styles.badgePending;
  const badgeText = value > 0 ? "Asignado" : "0";
  return (
    <View key={label} style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>$ {value.toLocaleString("es-CL")}</Text>
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    </View>
  );
}

async function onDownloadPlantilla(viajeId, token) {
  try {
    const res = await fetch(`${API_BASE}/Rendiciones/plantilla/${viajeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "No se pudo descargar");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_rendicion_${viajeId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    // ignore for now
  }
}

function formatRango(inicio, termino) {
  if (!inicio || !termino) return "";
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = (d) => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  return `${fmt(start)} - ${fmt(end)}`;
}

function SummaryCard({ label, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panelSub: { color: COLORS.muted, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: "800", marginBottom: 6 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "flex-end" },
  filterCol: { minWidth: 160, flex: 1 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  filterActions: { flexDirection: "row", gap: 8 },
  primaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  primaryBtnSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  secondaryBtnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  summaryCard: {
    minWidth: 160,
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  summaryLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "800" },
  summaryValue: { marginTop: 4, fontWeight: "900", color: COLORS.text, fontSize: 16 },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderText: { color: COLORS.muted, fontWeight: "700" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  th: { fontSize: 12, fontWeight: "900", color: COLORS.muted },
  td: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgePending: { backgroundColor: "#FFF4E5", borderWidth: 1, borderColor: "#FFD39A" },
  badgeReview: { backgroundColor: "#EAF2FF", borderWidth: 1, borderColor: "#BFD4FF" },
  badgeOk: { backgroundColor: "#E7F8ED", borderWidth: 1, borderColor: "#BFE8CB" },
  badgeText: { fontSize: 11, fontWeight: "900", color: COLORS.text },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  detailCard: {
    flex: 1,
    minWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  detailTitle: { fontWeight: "900", color: COLORS.blue2, marginBottom: 8 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  detailLabel: { fontWeight: "700", color: COLORS.text, flex: 1 },
  detailValue: { fontWeight: "900", color: COLORS.text, marginRight: 8 },
  detailTotal: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF3FF",
    padding: 10,
    borderRadius: 10,
  },
  detailTotalText: { fontWeight: "900", color: COLORS.text },
  detailTotalValue: { fontWeight: "900", color: COLORS.text },
  detailActions: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  noteBox: {
    marginTop: 10,
    backgroundColor: "#FFF4E5",
    borderWidth: 1,
    borderColor: "#FFD39A",
    borderRadius: 10,
    padding: 10,
  },
  noteText: { fontWeight: "700", color: COLORS.text, fontSize: 12 },
  rejectBox: {
    marginTop: 12,
    backgroundColor: "#FFEFEF",
    borderWidth: 1,
    borderColor: "#F3B6B6",
    borderRadius: 10,
    padding: 12,
  },
  rejectTitle: { fontWeight: "900", color: COLORS.text, marginBottom: 6 },
  rejectText: { fontWeight: "700", color: COLORS.text },
  errorText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
});



