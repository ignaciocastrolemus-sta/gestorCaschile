import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";

const statusStyle = (estadoRaw) => {
  const estado = String(estadoRaw || "").toLowerCase();
  if (estado.includes("rechaz")) return styles.badgeDanger;
  if (estado.includes("justific")) return styles.badgeInfo;
  if (estado.includes("aprob") || estado.includes("transfer") || estado.includes("completa"))
    return styles.badgeOk;
  if (estado.includes("revision")) return styles.badgeReview;
  return styles.badgePending;
};

export default function CapacitadorCarpeta({ token, onIrRendicion }) {
  const [viajes, setViajes] = useState([]);
  const [errorViajes, setErrorViajes] = useState("");
  
  const [tab, setTab] = useState("activas");
  const [filters, setFilters] = useState({ mes: "", estado: "Todos", busqueda: "" });
  const [selectedId, setSelectedId] = useState(null);
  
  const scrollRef = useRef(null);
  const detailYRef = useRef(0);

  const kpiItems = useMemo(() => {
    const totalAsignado = viajes.reduce((acc, v) => acc + Number(v.totalPresupuesto || 0), 0);
    const activos = viajes.filter((v) => !isHistorico(v?.estado)).length;
    
    return [
      { key: "asignados", label: "Viajes totales", value: viajes.length },
      { key: "activos", label: "Viajes activos", value: activos },
      { key: "asignado", label: "Total presupuesto", value: `$ ${totalAsignado.toLocaleString("es-CL")}` },
    ];
  }, [viajes]);

  const loadViajes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/Viajes/mios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar viajes");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setViajes(list);
      setErrorViajes("");
      if (list.length > 0 && !selectedId) setSelectedId(list[0].idAsignacionViaje);
    } catch (err) {
      setErrorViajes(err.message);
    }
  }, [token, selectedId]);

  useEffect(() => {
    loadViajes();
  }, [loadViajes]);

  const monthOptions = useMemo(() => buildMonthOptions(viajes), [viajes]);
  
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.mes) {
      const mesLabel = monthOptions.find((w) => w.value === filters.mes)?.label || filters.mes;
      chips.push(`Mes: ${mesLabel}`);
    }
    if (String(filters.estado || "").toLowerCase() !== "todos") chips.push(`Estado: ${filters.estado}`);
    if (String(filters.busqueda || "").trim()) chips.push(`Buscando: ${filters.busqueda}`);
    return chips;
  }, [filters, monthOptions]);

  const filteredViajes = useMemo(() => {
    return filterViajes(viajes, filters, tab);
  }, [viajes, filters, tab]);

  const counts = useMemo(() => {
    const activas = viajes.filter((v) => !isHistorico(v.estado)).length;
    const historial = viajes.length - activas;
    return { activas, historial };
  }, [viajes]);

  const selected = useMemo(
    () => filteredViajes.find((v) => String(v.idAsignacionViaje) === String(selectedId)) || filteredViajes[0] || null,
    [filteredViajes, selectedId]
  );

  useEffect(() => {
    if (!selected && filteredViajes.length > 0) {
      setSelectedId(filteredViajes[0].idAsignacionViaje);
    }
  }, [filteredViajes, selected]);

  const estadoUi = useMemo(() => {
    const estado = normalizeText(selected?.estado || "Pendiente");

    if (estado.includes("rechaz")) {
      return { badge: "Rechazada", tone: styles.badgeDanger, prompt: "Viaje rechazado u observado.", actionLabel: "Ir a rendición" };
    }
    if (estado.includes("pend") || estado.includes("revision") || estado.includes("asignado")) {
      return { badge: selected?.estado || "Asignado", tone: styles.badgePending, prompt: "Qué hacer ahora: iniciar o completar rendición.", actionLabel: "Ir a rendición" };
    }
    if (estado.includes("aprob") || estado.includes("transfer") || estado.includes("completa")) {
      return { badge: selected?.estado || "Aprobada", tone: styles.badgeOk, prompt: "Viaje finalizado o transferido.", actionLabel: "Ver historial" };
    }
    
    return { badge: selected?.estado || "Pendiente", tone: styles.badgePending, prompt: "Revisar estado del viaje.", actionLabel: "Ver detalles" };
  }, [selected]);

  const limpiarFiltros = () => setFilters({ mes: "", estado: "Todos", busqueda: "" });

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Carpeta de viajes"
        subtitle="Revisa los viajes asignados a tu nombre y su presupuesto."
        secondaryLabel="Actualizar"
        onSecondaryPress={loadViajes}
      />
      <KpiRow items={kpiItems} />

      {errorViajes ? (
        <View style={styles.errorBox}>
           <Text style={styles.errorBoxText}>• {errorViajes}</Text>
        </View>
      ) : null}

      <View style={dash.panel}>
        <View style={styles.headerRow}>
          <Text style={dash.panelTitle}>Mis viajes</Text>
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tabBtn, tab === "activas" && styles.tabBtnActive]}
              onPress={() => setTab("activas")}
            >
              <Text style={[styles.tabText, tab === "activas" && styles.tabTextActive]}>
                Activos ({counts.activas})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "historial" && styles.tabBtnActive]}
              onPress={() => setTab("historial")}
            >
              <Text style={[styles.tabText, tab === "historial" && styles.tabTextActive]}>
                Historial ({counts.historial})
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.filterTopRow}>
          <Text style={styles.filterTitle}>Filtros rápidos</Text>
          <Pressable style={styles.clearFilterBtn} onPress={limpiarFiltros}>
            <Text style={styles.clearFilterBtnText}>Limpiar filtros</Text>
          </Pressable>
        </View>

        <View style={styles.filterBar}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Mes y Año</Text>
            <View style={styles.filterSelectWrap}>
              <Picker
                selectedValue={filters.mes}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, mes: value }))}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todos los meses" value="" />
                {monthOptions.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Estado</Text>
            <View style={styles.filterSelectWrap}>
              <Picker
                selectedValue={filters.estado}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, estado: value }))}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todos" value="Todos" />
                <Picker.Item label="Asignado" value="Asignado" />
                <Picker.Item label="Transferido" value="Transferido" />
                <Picker.Item label="En revisión" value="En revisión" />
                <Picker.Item label="Rechazado" value="Rechazado" />
              </Picker>
            </View>
          </View>
          <View style={[styles.filterItem, styles.filterSearch]}>
            <Text style={styles.filterLabel}>Búsqueda (Destino o Cliente)</Text>
            <TextInput
              placeholder="Ej: Codelco, Calama..."
              placeholderTextColor={COLORS.muted}
              value={filters.busqueda}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, busqueda: value }))}
              style={styles.input}
            />
          </View>
        </View>

        {activeFilterChips.length > 0 ? (
          <View style={styles.filterChipsRow}>
            {activeFilterChips.map((chip) => (
              <View key={chip} style={styles.filterChip}>
                <Text style={styles.filterChipText}>{chip}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {filteredViajes.length === 0 ? (
          <Text style={styles.emptyText}>No hay viajes que coincidan con la búsqueda.</Text>
        ) : (
          <View style={styles.cardList}>
            {filteredViajes.map((row) => (
              <View key={row.idAsignacionViaje} style={[styles.card, String(row.idAsignacionViaje) === String(selectedId) && styles.cardActive]}>
                <Pressable style={styles.cardHeader} onPress={() => setSelectedId(row.idAsignacionViaje)}>
                  <Text style={styles.cardTitle}>{row.nombreComuna || "Sin destino"}</Text>
                  <View style={[styles.badge, statusStyle(row.estado)]}>
                    <Text style={styles.badgeText}>{row.estado}</Text>
                  </View>
                </Pressable>
                <Text style={styles.cardSub}>
                  {row.razonSocialCliente} · {row.nombreRegion} · {formatRango(row.fechaInicio, row.fechaTermino)} · {row.totalDias} días
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAmount}>
                    Asignado: $ {Number(row.totalPresupuesto || 0).toLocaleString("es-CL")}
                  </Text>
                  <Pressable style={styles.linkBtn} onPress={() => setSelectedId(row.idAsignacionViaje)}>
                    <Text style={styles.linkBtnText}>Ver detalle</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View
        style={dash.panel}
        onLayout={(e) => {
          detailYRef.current = e?.nativeEvent?.layout?.y || 0;
        }}
      >
        <View style={styles.detailHeader}>
          <Text style={dash.panelTitle}>Detalle de presupuesto</Text>
          {estadoUi?.badge ? (
            <View style={[styles.badge, estadoUi.tone]}>
              <Text style={styles.badgeText}>{estadoUi.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.panelSub}>Revisa los montos asignados para tu viaje.</Text>
        <View style={styles.nextActionBox}>
          <Text style={styles.nextActionTitle}>{estadoUi.prompt}</Text>
          <View style={styles.nextActionRow}>
              <Pressable style={styles.primaryBtn} onPress={() => onIrRendicion?.(selected?.idAsignacionViaje)}>
                <Text style={styles.primaryBtnText}>{estadoUi.actionLabel}</Text>
              </Pressable>
          </View>
        </View>

        {!selected ? (
          <Text style={styles.emptyText}>Selecciona un viaje para ver el detalle.</Text>
        ) : (
          <View style={styles.detailGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Alimentación (Tarifa Cliente)</Text>
              {renderAsignacionRow("Desayuno", selected.montoDesayuno)}
              {renderAsignacionRow("Almuerzo", selected.montoAlmuerzo)}
              {renderAsignacionRow("Once", selected.montoOnce)}
              {renderAsignacionRow("Cena", selected.montoCena)}
              {renderAsignacionRow("Viático Extra", selected.montoViatico)}
              <View style={styles.detailTotal}>
                <Text style={styles.detailTotalText}>Total Alimentación / Día</Text>
                <Text style={styles.detailTotalValue}>
                  $ {calcSubtotalDia(selected).toLocaleString("es-CL")}
                </Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Movilización y Otros (Asignados)</Text>

              {/* NUEVO: Mostrar el Tipo de Transporte */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Medio de Transporte</Text>
                <Text style={styles.detailValue}>
                  {selected.TipoTransporte || selected.tipoTransporte || "No especificado"}
                </Text>
              </View>

              {/* DESGLOSE EXACTO DEL EXCEL Y BACKEND */}
              {renderCategoriaRow("Bus (Interurbano)", selected.MontoBus || selected.montoBus)}
              {renderCategoriaRow("Uber", selected.MontoUber || selected.montoUber)}
              {renderCategoriaRow("Transfer", selected.MontoTransfer || selected.montoTransfer)}
              {renderCategoriaRow("Colectivo / Taxi", selected.MontoColectivo || selected.montoColectivo)}
              {renderCategoriaRow("Combustible", selected.MontoCombustible || selected.montoCombustible)}
              {renderCategoriaRow("Peajes", selected.MontoPeajes || selected.montoPeajes)}
              {renderCategoriaRow("Estacionamiento", selected.MontoEstacionamiento || selected.montoEstacionamiento)}
              {renderCategoriaRow("Varios / Reembolsos", selected.MontoVarios || selected.montoVarios)}

              <View style={styles.detailTotal}>
                <Text style={styles.detailTotalText}>Total Presupuesto Viaje</Text>
                <Text style={styles.detailTotalValue}>
                  $ {Number(selected.TotalPresupuesto || selected.totalPresupuesto || 0).toLocaleString("es-CL")}
                </Text>
              </View>
              <View style={styles.detailActions}>
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => onDownloadPlantilla(selected.IdAsignacionViaje || selected.idAsignacionViaje, token)}
                >
                  <Text style={styles.secondaryBtnText}>Descargar plantilla</Text>
                </Pressable>
              </View>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  Regla: puedes enviar con diferencia. Si rindes más, queda reembolso; si rindes menos, queda saldo por devolver.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// -------------------------------------------------------------------------
// FUNCIONES UTILITARIAS Y DE FILTRADO
// -------------------------------------------------------------------------

function parseDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.includes("-") && raw.split("-")[0].length === 4) {
    const iso = new Date(raw);
    return Number.isNaN(iso.getTime()) ? null : new Date(iso.getTime() + iso.getTimezoneOffset() * 60000);
  }
  return null;
}

function normalizeText(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function isHistorico(estadoRaw) {
  const estado = normalizeText(estadoRaw);
  return estado.includes("aprob") || estado.includes("transfer") || estado.includes("completa");
}

const NOMBRES_MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function buildMonthOptions(list) {
  const map = new Map();
  list.forEach((v) => {
    const date = parseDateInput(v.fechaInicio);
    if (!date) return;
    const m = date.getMonth();
    const y = date.getFullYear();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`; 
    const label = `${NOMBRES_MESES[m]} ${y}`;
    if (!map.has(key)) map.set(key, { value: key, label });
  });
  return Array.from(map.values()).sort((a, b) => b.value.localeCompare(a.value));
}

function filterViajes(list, filters, tab) {
  const busqueda = normalizeText(filters.busqueda);
  const estado = normalizeText(filters.estado).replace(/\s+/g, "");
  const mes = filters.mes;

  return list.filter((v) => {
    const estadoBase = v.estado;
    if (tab === "activas" && isHistorico(estadoBase)) return false;
    if (tab === "historial" && !isHistorico(estadoBase)) return false;

    if (busqueda) {
      const comuna = normalizeText(v.nombreComuna || "");
      const region = normalizeText(v.nombreRegion || "");
      const cliente = normalizeText(v.razonSocialCliente || "");
      if (!comuna.includes(busqueda) && !region.includes(busqueda) && !cliente.includes(busqueda)) return false;
    }

    if (estado && estado !== "todos") {
      const estadoViaje = normalizeText(estadoBase).replace(/\s+/g, "");
      if (!estadoViaje.includes(estado)) return false;
    }

    if (mes) {
      const date = parseDateInput(v.fechaInicio);
      if (!date) return false;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (key !== mes) return false;
    }

    return true;
  });
}

function calcSubtotalDia(viaje) {
  if (!viaje) return 0;
  return (
    Number(viaje.montoDesayuno || 0) +
    Number(viaje.montoAlmuerzo || 0) +
    Number(viaje.montoOnce || 0) +
    Number(viaje.montoCena || 0) +
    Number(viaje.montoViatico || 0)
  );
}

function calcTransporte(viaje) {
  if (!viaje) return 0;
  return (
    Number(viaje.montoBus || 0) + 
    Number(viaje.montoUber || 0) + 
    Number(viaje.montoTransfer || 0) + 
    Number(viaje.montoColectivo || 0)
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
    if (!res.ok) throw new Error("No se pudo descargar");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_rendicion_${viajeId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (_e) { }
}

function formatRango(inicio, termino) {
  if (!inicio || !termino) return "";
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = (d) =>
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear();
  return `${fmt(new Date(start.getTime() + start.getTimezoneOffset() * 60000))} - ${fmt(new Date(end.getTime() + end.getTimezoneOffset() * 60000))}`;
}

const styles = StyleSheet.create({
  panelSub: { color: COLORS.muted, fontWeight: "700", marginBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tabs: { flexDirection: "row", gap: 8 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.grayBorder, backgroundColor: "#fff" },
  tabBtnActive: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  tabText: { fontWeight: "900", color: COLORS.muted },
  tabTextActive: { color: COLORS.blue2 },
  filterTopRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  filterTitle: { color: COLORS.text, fontWeight: "900" },
  clearFilterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "#D9E5FF", backgroundColor: "#EEF3FF" },
  clearFilterBtnText: { fontWeight: "900", color: COLORS.blue2, fontSize: 12 },
  filterBar: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, alignItems: "flex-end" },
  filterItem: { minWidth: 180, flex: 1 },
  filterSearch: { minWidth: 220 },
  filterLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "800", marginBottom: 6 },
  filterSelectWrap: { height: 40, borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 10, overflow: "hidden", backgroundColor: "#fff", justifyContent: "center" },
  filterPicker: { height: 40, color: COLORS.text },
  filterChipsRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "#BFD4FF", backgroundColor: "#E8F0FF" },
  filterChipText: { fontWeight: "800", color: COLORS.blue2, fontSize: 12 },
  input: { height: 40, borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 10, paddingHorizontal: 10, color: COLORS.text, backgroundColor: "#fff" },
  primaryBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: COLORS.blue2 },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  secondaryBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" },
  secondaryBtnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  cardList: { marginTop: 12, gap: 10 },
  card: { borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 14, padding: 12, backgroundColor: "#fff" },
  cardActive: { borderColor: "#BFD4FF", backgroundColor: "#F5F9FF" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 18 },
  cardSub: { marginTop: 6, color: COLORS.muted, fontWeight: "700", fontSize: 13 },
  cardFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardAmount: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  linkBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" },
  linkBtnText: { color: COLORS.blue2, fontWeight: "900" },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
  badgePending: { backgroundColor: "#FFF4E5", borderWidth: 1, borderColor: "#FFD39A" },
  badgeReview: { backgroundColor: "#EAF2FF", borderWidth: 1, borderColor: "#BFD4FF" },
  badgeInfo: { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" },
  badgeOk: { backgroundColor: "#E7F8ED", borderWidth: 1, borderColor: "#BFE8CB" },
  badgeDanger: { backgroundColor: "#FFEFEF", borderWidth: 1, borderColor: "#F3B6B6" },
  badgeText: { fontSize: 11, fontWeight: "900", color: COLORS.text },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  nextActionBox: { marginTop: 10, marginBottom: 6, borderWidth: 1, borderColor: "#D9E5FF", borderRadius: 10, backgroundColor: "#F5F9FF", padding: 10 },
  nextActionTitle: { fontWeight: "900", color: COLORS.text, marginBottom: 4 },
  nextActionHint: { fontWeight: "700", color: COLORS.muted, fontSize: 12 },
  nextActionRow: { marginTop: 8, alignItems: "flex-start" },
  detailCard: { flex: 1, minWidth: 320, borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  detailTitle: { fontWeight: "900", color: COLORS.blue2, marginBottom: 8, fontSize: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.grayBorder },
  detailLabel: { fontWeight: "700", color: COLORS.text, flex: 1, fontSize: 15 },
  detailValue: { fontWeight: "900", color: COLORS.text, marginRight: 8, fontSize: 16 },
  detailTotal: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#EEF3FF", padding: 10, borderRadius: 10 },
  detailTotalText: { fontWeight: "900", color: COLORS.text, fontSize: 14 },
  detailTotalValue: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  detailActions: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  emptyText: { color: COLORS.muted, fontWeight: "700", marginTop: 10, fontSize: 14, textAlign: 'center' },
  errorBox: { marginTop: 12, backgroundColor: "#FFEFEF", borderWidth: 1, borderColor: "#F3B6B6", borderRadius: 10, padding: 12 },
  errorBoxText: { color: "#D32F2F", fontWeight: "800", fontSize: 13, marginBottom: 4 }
});