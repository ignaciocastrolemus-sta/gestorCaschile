import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";

// Capacitador: carpeta de viajes + filtros + estado de rendicion

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
  const [error, setError] = useState("");
  const [tab, setTab] = useState("activas");
  const [filters, setFilters] = useState({ semana: "", estado: "Todos", destino: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [rendiciones, setRendiciones] = useState([]);
  const scrollRef = useRef(null);
  const detailYRef = useRef(0);

  // KPI de seguimiento rapido de viajes y rendiciones.
  const kpiItems = useMemo(() => {
    const totalAsignado = viajes.reduce((acc, v) => acc + Number(v.montoViaticoTotal || 0), 0);
    const totalRendido = rendiciones.reduce((acc, r) => acc + Number(r.totalRendido || 0), 0);
    // Pendientes: si hay rendicion, usamos su estado; si no, el del viaje.
    const map = new Map();
    (rendiciones || []).forEach((r) => {
      const id = r?.asignacionViajeId ?? r?.viaje?.id ?? r?.viajeId;
      if (!id) return;
      map.set(Number(id), r?.estado || "");
    });
    const pendientes = viajes.filter((v) => {
      const estadoVista = map.get(Number(v?.id)) || v?.estado || "";
      return !isHistorico(estadoVista);
    }).length;
    return [
      { key: "asignados", label: "Viajes asignados", value: viajes.length },
      { key: "pendientes", label: "Pendientes", value: pendientes },
      { key: "asignado", label: "Total asignado", value: `$ ${totalAsignado.toLocaleString("es-CL")}` },
      { key: "rendido", label: "Total rendido", value: `$ ${totalRendido.toLocaleString("es-CL")}` },
    ];
  }, [viajes, rendiciones]);

  const loadViajes = useCallback(async () => {
    const res = await fetch(`${API_BASE}/Viajes/mios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Error al cargar viajes");
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setViajes(list);
    if (list.length > 0) setSelectedId((prev) => prev || list[0].id);
  }, [token]);

  const loadRendiciones = useCallback(async () => {
    const res = await fetch(`${API_BASE}/Rendiciones/mias`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Error al cargar rendiciones");
    }
    const data = await res.json();
    setRendiciones(Array.isArray(data) ? data : []);
  }, [token]);

  const onActualizar = useCallback(async () => {
    try {
      await Promise.all([loadViajes(), loadRendiciones()]);
      setError("");
    } catch (err) {
      setError(err?.message || "Error al actualizar carpeta.");
    }
  }, [loadViajes, loadRendiciones]);

  useEffect(() => {
    onActualizar();
  }, [onActualizar]);

  const rendicionEstadoByViajeId = useMemo(() => {
    const map = new Map();
    (rendiciones || []).forEach((r) => {
      const id = r?.asignacionViajeId ?? r?.viaje?.id ?? r?.viajeId;
      if (!id) return;
      map.set(Number(id), r?.estado || "");
    });
    return map;
  }, [rendiciones]);

  const estadoVistaViaje = useCallback(
    (v) => {
      // Estado "real" para UI: si existe rendicion, usamos su estado.
      const rid = rendicionEstadoByViajeId.get(Number(v?.id));
      return rid || v?.estado || "Pendiente";
    },
    [rendicionEstadoByViajeId]
  );

  const viajesConEstadoVista = useMemo(() => {
    return (viajes || []).map((v) => ({ ...v, estadoVista: estadoVistaViaje(v) }));
  }, [estadoVistaViaje, viajes]);

  const weekOptions = useMemo(() => buildWeekOptions(viajes), [viajes]);
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.semana) {
      const semanaLabel = weekOptions.find((w) => w.value === filters.semana)?.label || filters.semana;
      chips.push(`Semana: ${semanaLabel}`);
    }
    if (String(filters.estado || "").toLowerCase() !== "todos") chips.push(`Estado: ${filters.estado}`);
    if (String(filters.destino || "").trim()) chips.push(`Destino: ${filters.destino}`);
    return chips;
  }, [filters, weekOptions]);

  const filteredViajes = useMemo(() => {
    return filterViajes(viajesConEstadoVista, filters, tab);
  }, [viajesConEstadoVista, filters, tab]);

  const counts = useMemo(() => {
    const activas = viajesConEstadoVista.filter((v) => !isHistorico(v.estadoVista)).length;
    const historial = viajesConEstadoVista.length - activas;
    return { activas, historial };
  }, [viajesConEstadoVista]);

  const selected = useMemo(
    () => filteredViajes.find((v) => v.id === selectedId) || filteredViajes[0] || null,
    [filteredViajes, selectedId]
  );

  useEffect(() => {
    if (!selected && filteredViajes.length > 0) {
      setSelectedId(filteredViajes[0].id);
    }
  }, [filteredViajes, selected]);

  const selectedRendicion = useMemo(() => {
    if (!selected) return null;
    const direct = rendiciones.find((r) => getViajeIdFromRendicion(r) === Number(selected.id));
    if (direct) return direct;
    return rendiciones.find((r) => Number(r?.viaje?.id || 0) === Number(selected.id)) || null;
  }, [rendiciones, selected]);

  const saldosPendientes = useMemo(() => {
    return (rendiciones || []).filter((r) => {
      if (!isSaldoRendicionValidaCapacitador(r)) return false;
      const pendiente = getPendienteSaldo(r);
      const estadoSaldo = normalizeText(getField(r, "saldoEstado", "SaldoEstado"));
      return pendiente > 0 || estadoSaldo === "pendiente";
    });
  }, [rendiciones]);

  const rechazoMensaje = useMemo(() => {
    const estadoRendicion = String(selectedRendicion?.estado || "").toLowerCase();
    const estadoViaje = String(selected?.estadoVista || selected?.estado || "").toLowerCase();
    if (estadoRendicion.includes("rechaz") || estadoViaje.includes("rechaz")) {
      return selectedRendicion?.observacion || "La contadora rechazo la rendicion.";
    }
    return "";
  }, [selectedRendicion, selected]);

  const estadoUi = useMemo(() => {
    const estadoBase = selectedRendicion?.estado || selected?.estadoVista || selected?.estado || "Pendiente";
    const estado = normalizeText(estadoBase);
    const pendiente = getPendienteSaldo(selectedRendicion);
    const tipo = normalizeText(getField(selectedRendicion, "tipoResultado", "TipoResultado"));
    const motivo = getField(selectedRendicion, "motivoPendiente", "MotivoPendiente");
    const hasta = getField(selectedRendicion, "pendienteHasta", "PendienteHasta");

    if (estado.includes("justific")) {
      return {
        badge: "Pendiente justificada",
        tone: styles.badgeInfo,
        prompt: `Qué hacer ahora: esperar regularización${hasta ? ` hasta ${formatDate(hasta)}` : ""}.`,
        action: "historial",
        actionLabel: "Ver historial",
        helper: motivo ? `Motivo: ${motivo}` : "Motivo no informado.",
      };
    }
    if (tipo === "devolucion" && pendiente > 0) {
      return {
        badge: "En contra del capacitador",
        tone: styles.badgeDanger,
        prompt: "Qué hacer ahora: rendir devolución con adjuntos.",
        action: "devolucion",
        actionLabel: "Rendir devolución",
        helper: `Saldo pendiente: $ ${pendiente.toLocaleString("es-CL")}`,
      };
    }
    if (estado.includes("rechaz")) {
      return {
        badge: "Rechazada",
        tone: styles.badgeDanger,
        prompt: "Qué hacer ahora: corregir y reenviar rendición.",
        action: "rendir",
        actionLabel: "Corregir rendición",
        helper: "Revisa observaciones y ajusta montos/adjuntos.",
      };
    }
    if (estado.includes("pend") || estado.includes("revision")) {
      return {
        badge: "Pendiente",
        tone: styles.badgePending,
        prompt: "Qué hacer ahora: completar rendición y enviar.",
        action: "rendir",
        actionLabel: "Ir a rendición",
        helper: "Adjunta respaldos por categoría antes de enviar.",
      };
    }
    if (estado.includes("aprob") || estado.includes("transfer") || estado.includes("completa")) {
      return {
        badge: "Aprobada",
        tone: styles.badgeOk,
        prompt: "Qué hacer ahora: revisar historial y estado de saldo.",
        action: "historial",
        actionLabel: "Ver historial",
        helper: "No requiere acción inmediata.",
      };
    }
    return {
      badge: estadoBase || "Pendiente",
      tone: styles.badgePending,
      prompt: "Qué hacer ahora: revisar estado de la rendición.",
      action: "historial",
      actionLabel: "Ver historial",
      helper: "Estado no clasificado.",
    };
  }, [selected, selectedRendicion]);

  const limpiarFiltros = () => setFilters({ semana: "", estado: "Todos", destino: "" });

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Carpeta de viajes"
        subtitle="Revisa viajes asignados y el estado de tu rendicion."
        secondaryLabel="Actualizar"
        onSecondaryPress={onActualizar}
      />
      <KpiRow items={kpiItems} />

      {saldosPendientes.length > 0 ? (
        <View style={styles.rejectBox}>
          <Text style={styles.rejectTitle}>Saldos pendientes</Text>
          {saldosPendientes.map((r) => (
            (() => {
              const viajeId = getViajeIdFromRendicion(r);
              const viajeRef = viajes.find((v) => Number(v?.id) === viajeId);
              const viajeApi = getField(r, "viaje", "Viaje") || {};
              const destino =
                getField(viajeApi, "municipio", "Municipio") ||
                viajeRef?.municipio ||
                getField(viajeApi, "comuna", "Comuna") ||
                "Sin destino";
              const region =
                getField(viajeApi, "regionNombre", "RegionNombre") || viajeRef?.regionNombre || "Sin region";
              const fechaInicio = getField(viajeApi, "fechaInicio", "FechaInicio") || viajeRef?.fechaInicio;
              const fechaTermino = getField(viajeApi, "fechaTermino", "FechaTermino") || viajeRef?.fechaTermino;
              const tipoResultado = String(getField(r, "tipoResultado", "TipoResultado") || "Saldo");
              const tipoNormalizado = normalizeText(tipoResultado);
              const saldoLabel =
                tipoNormalizado === "reembolso"
                  ? "A favor del capacitador"
                  : tipoNormalizado === "devolucion"
                    ? "En contra del capacitador"
                    : "Saldo pendiente";
              const esDevolucion = tipoNormalizado === "devolucion";
              const pendienteMonto = getPendienteSaldo(r);

              return (
                <Pressable
                  key={`saldo-pend-${r.id}`}
                  style={styles.pendingSaldoRow}
                  onPress={() => {
                    setTab("historial");
                    setFilters({ semana: "", estado: "Todos", destino: "" });
                    if (viajeId > 0) setSelectedId(viajeId);
                    setTimeout(() => {
                      scrollRef.current?.scrollTo?.({ y: detailYRef.current || 0, animated: true });
                    }, 80);
                  }}
                >
                  <Text style={styles.pendingSaldoText}>
                    Rendicion #{r.id} ({destino}) - {saldoLabel}: ${" "}
                    {pendienteMonto.toLocaleString("es-CL")}
                  </Text>
                  <Text style={styles.pendingSaldoHint}>
                    Viaje #{viajeId || "-"} - {region} - {formatRango(fechaInicio, fechaTermino)}
                  </Text>
                  <View style={styles.pendingActionRow}>
                    <Text style={styles.pendingSaldoHint}>Ir a detalle del saldo</Text>
                    {esDevolucion && viajeId > 0 ? (
                      <Pressable
                        style={styles.pendingActionBtn}
                        onPress={(e) => {
                          e?.stopPropagation?.();
                          onIrRendicion?.(viajeId, {
                            focusDevolucion: true,
                            montoPendiente: pendienteMonto,
                            rendicionId: r.id,
                          });
                        }}
                      >
                        <Text style={styles.pendingActionBtnText}>Rendir devolucion</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>
              );
            })()
          ))}
        </View>
      ) : null}

      <View style={dash.panel}>
        <View style={styles.headerRow}>
          <Text style={dash.panelTitle}>Mis rendiciones</Text>
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tabBtn, tab === "activas" && styles.tabBtnActive]}
              onPress={() => setTab("activas")}
            >
              <Text style={[styles.tabText, tab === "activas" && styles.tabTextActive]}>
                Activas ({counts.activas})
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
          <Text style={styles.filterTitle}>Filtros rapidos</Text>
          <Pressable style={styles.clearFilterBtn} onPress={limpiarFiltros}>
            <Text style={styles.clearFilterBtnText}>Limpiar filtros</Text>
          </Pressable>
        </View>

        <View style={styles.filterBar}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Semana</Text>
            <View style={styles.filterSelectWrap}>
              <Picker
                selectedValue={filters.semana}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, semana: value }))}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todas" value="" />
                {weekOptions.map((opt) => (
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
                <Picker.Item label="Pendiente" value="Pendiente" />
                <Picker.Item label="Pendiente justificada" value="Pendiente justificada" />
                <Picker.Item label="En revision" value="En revision" />
                <Picker.Item label="Rechazada" value="Rechazada" />
                <Picker.Item label="Aprobada" value="Aprobada" />
                <Picker.Item label="Transferida" value="Transferida" />
              </Picker>
            </View>
          </View>
          <View style={[styles.filterItem, styles.filterSearch]}>
            <Text style={styles.filterLabel}>Destino</Text>
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor={COLORS.muted}
              value={filters.destino}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, destino: value }))}
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

        {error ? (
          <StatusMessage tone="error" text={error} style={styles.messageTight} />
        ) : filteredViajes.length === 0 ? (
          <StatusMessage tone="info" text="No hay viajes para mostrar." style={styles.messageTight} />
        ) : (
          <View style={styles.cardList}>
            {filteredViajes.map((row) => (
              <View key={row.id} style={[styles.card, row.id === selectedId && styles.cardActive]}>
                <Pressable style={styles.cardHeader} onPress={() => setSelectedId(row.id)}>
                  <Text style={styles.cardTitle}>{row.municipio || row.comuna || "Sin destino"}</Text>
                  <View style={[styles.badge, statusStyle(row.estadoVista)]}>
                    <Text style={styles.badgeText}>{row.estadoVista}</Text>
                  </View>
                </Pressable>
                <Text style={styles.cardSub}>
                  {row.regionNombre || row.region || ""} · {formatRango(row.fechaInicio, row.fechaTermino)} ·{" "}
                  {row.totalDias} dias
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAmount}>
                    Monto asignado: $ {Number(row.montoViaticoTotal || 0).toLocaleString("es-CL")}
                  </Text>
                  <Pressable style={styles.linkBtn} onPress={() => setSelectedId(row.id)}>
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
          <Text style={dash.panelTitle}>Detalle de viaje</Text>
          {estadoUi?.badge ? (
            <View style={[styles.badge, estadoUi.tone]}>
              <Text style={styles.badgeText}>{estadoUi.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.panelSub}>Revisa asignaciones, montos y avance de rendicion.</Text>
        <View style={styles.nextActionBox}>
          <Text style={styles.nextActionTitle}>{estadoUi.prompt}</Text>
          <Text style={styles.nextActionHint}>{estadoUi.helper}</Text>
          <View style={styles.nextActionRow}>
            {estadoUi.action === "devolucion" ? (
              <Pressable
                style={styles.primaryBtn}
                onPress={() =>
                  onIrRendicion?.(selected?.id, {
                    focusDevolucion: true,
                    montoPendiente: getPendienteSaldo(selectedRendicion),
                    rendicionId: selectedRendicion?.id,
                  })
                }
              >
                <Text style={styles.primaryBtnText}>{estadoUi.actionLabel}</Text>
              </Pressable>
            ) : estadoUi.action === "rendir" ? (
              <Pressable style={styles.primaryBtn} onPress={() => onIrRendicion?.(selected?.id)}>
                <Text style={styles.primaryBtnText}>{estadoUi.actionLabel}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.secondaryBtn} onPress={() => setTab("historial")}>
                <Text style={styles.secondaryBtnText}>{estadoUi.actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {!selected ? (
          <StatusMessage tone="info" text="No hay viajes para mostrar." style={styles.messageTight} />
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
              {renderCategoriaRow("Combustible", selected.copec)}
              <View style={styles.detailTotal}>
                <Text style={styles.detailTotalText}>Total asignado viaje</Text>
                <Text style={styles.detailTotalValue}>
                  $ {Number(selected.montoViaticoTotal || 0).toLocaleString("es-CL")}
                </Text>
              </View>
              <View style={styles.detailActions}>
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => onDownloadPlantilla(selected.id, token)}
                >
                  <Text style={styles.secondaryBtnText}>Descargar plantilla</Text>
                </Pressable>
              </View>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  Regla: puedes enviar con diferencia. Si rindes mas, queda reembolso; si rindes menos, queda
                  saldo por devolver.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {rechazoMensaje ? (
        <View style={styles.rejectBox}>
          <Text style={styles.rejectTitle}>Motivo de rechazo</Text>
          <Text style={styles.rejectText}>{rechazoMensaje}</Text>
        </View>
      ) : null}

      {selectedRendicion ? (
        <View style={getSaldoBoxStyle(selectedRendicion)}>
          <Text style={styles.rejectTitle}>Estado de saldo</Text>
          <Text style={styles.rejectText}>
            {getSaldoMessage(selectedRendicion)}
          </Text>
          {getPendienteSaldo(selectedRendicion) > 0 ? (
            <Text style={styles.pendingSaldoHint}>
              Este saldo queda visible para secretaria y contadora en su panel de saldos pendientes.
            </Text>
          ) : null}
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

function isHistorico(estadoRaw) {
  const estado = normalizeText(estadoRaw);
  return estado.includes("aprob") || estado.includes("transfer") || estado.includes("completa");
}

function getISOWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

function getWeekKey(date) {
  const info = getISOWeekInfo(date);
  return `${info.year}-W${String(info.week).padStart(2, "0")}`;
}

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { monday, friday };
}

function buildWeekOptions(list) {
  const map = new Map();
  list.forEach((v) => {
    const start = parseDateInput(v.fechaInicio);
    if (!start) return;
    const key = getWeekKey(start);
    if (map.has(key)) return;
    const range = getWeekRange(start);
    const info = getISOWeekInfo(start);
    const label = `Semana ${String(info.week).padStart(2, "0")} - ${info.year} (${formatRango(range.monday, range.friday)})`;
    map.set(key, { value: key, label });
  });
  return Array.from(map.values()).sort((a, b) => (a.value > b.value ? 1 : -1));
}

function filterViajes(list, filters, tab) {
  const destino = normalizeText(filters.destino);
  const estado = normalizeText(filters.estado).replace(/\s+/g, "");
  const semana = filters.semana;
  return list.filter((v) => {
    const estadoBase = v.estadoVista ?? v.estado;
    if (tab === "activas" && isHistorico(estadoBase)) return false;
    if (tab === "historial" && !isHistorico(estadoBase)) return false;

    const target = normalizeText(v.municipio || v.comuna || "");
    if (destino && !target.includes(destino)) return false;

    if (estado && estado !== "todos") {
      const estadoViaje = normalizeText(estadoBase).replace(/\s+/g, "");
      if (!estadoViaje.includes(estado)) return false;
    }

    if (semana) {
      const start = parseDateInput(v.fechaInicio);
      if (!start) return false;
      const key = getWeekKey(start);
      if (key !== semana) return false;
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
  return Number(viaje.movAsignado || 0) + Number(viaje.transferUber || 0) + Number(viaje.colectivoTaxi || 0);
}

function getSaldoMessage(rendicion) {
  const tipo = String(getField(rendicion, "tipoResultado", "TipoResultado") || "");
  const estadoSaldo = String(getField(rendicion, "saldoEstado", "SaldoEstado") || "");
  const pendiente = getPendienteSaldo(rendicion);
  const monto = `$ ${pendiente.toLocaleString("es-CL")}`;
  const saldoCerradoEn = getField(rendicion, "saldoCerradoEn", "SaldoCerradoEn");
  const fechaCierre = saldoCerradoEn ? ` (${formatDate(saldoCerradoEn)})` : "";

  if (tipo === "Reembolso") {
    if (pendiente > 0) return `Reembolso pendiente a tu favor: ${monto}.`;
    return `Reembolso pagado por la empresa${fechaCierre}.`;
  }

  if (tipo === "Devolucion") {
    if (pendiente > 0) return `Saldo pendiente por devolver a la empresa: ${monto}.`;
    return `Devolucion completada${fechaCierre}.`;
  }

  if (estadoSaldo === "SinSaldo") return "Rendicion cuadrada. No hay saldo pendiente.";
  return `Estado de saldo: ${estadoSaldo || "Pendiente"}${pendiente > 0 ? ` (${monto})` : ""}.`;
}

function getSaldoBoxStyle(rendicion) {
  const tipo = String(getField(rendicion, "tipoResultado", "TipoResultado") || "");
  const pendiente = getPendienteSaldo(rendicion);
  if (tipo === "Reembolso" && pendiente > 0) return [styles.rejectBox, styles.saldoFavorBox];
  if (tipo === "Reembolso" && pendiente <= 0) return [styles.rejectBox, styles.saldoCerradoBox];
  if (tipo === "Devolucion" && pendiente > 0) return [styles.rejectBox, styles.saldoDeudaBox];
  if (tipo === "Devolucion" && pendiente <= 0) return [styles.rejectBox, styles.saldoCerradoBox];
  return styles.rejectBox;
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getField(obj, ...keys) {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

function getViajeIdFromRendicion(r) {
  return Number(getField(r, "asignacionViajeId", "AsignacionViajeId") || r?.viaje?.id || 0);
}

function getDiferenciaRendicion(r) {
  const explicit = Number(getField(r, "diferencia", "Diferencia") || 0);
  if (explicit) return explicit;
  const totalRendido = Number(getField(r, "totalRendido", "TotalRendido") || 0);
  const totalAsignado = Number(getField(r, "totalAsignado", "TotalAsignado") || 0);
  return totalRendido - totalAsignado;
}

function getPendienteSaldo(r) {
  const pendienteRaw = Number(getField(r, "saldoPendiente", "SaldoPendiente") || 0);
  if (pendienteRaw > 0) return pendienteRaw;

  // Fallback: si el backend no expone saldoPendiente, inferimos por diferencia.
  const estadoSaldo = normalizeText(getField(r, "saldoEstado", "SaldoEstado"));
  if (estadoSaldo && estadoSaldo !== "pendiente") return 0;

  const tipo = normalizeText(getField(r, "tipoResultado", "TipoResultado"));
  const diferencia = getDiferenciaRendicion(r);
  if (tipo === "reembolso" && diferencia > 0) return diferencia;
  if (tipo === "devolucion" && diferencia < 0) return Math.abs(diferencia);
  return 0;
}

function isSaldoRendicionValidaCapacitador(r) {
  const estado = normalizeText(getField(r, "estado", "Estado"));
  if (!estado) return false;
  if (estado.includes("rechaz")) return false;
  return (
    estado.includes("aprob") ||
    estado.includes("transfer") ||
    estado.includes("completa") ||
    estado.includes("cerrad")
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
  } catch (_e) {
    // ignore for now
  }
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
  return `${fmt(start)} - ${fmt(end)}`;
}

const styles = StyleSheet.create({
  panelSub: { color: COLORS.muted, fontWeight: "700", marginBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tabs: { flexDirection: "row", gap: 8 },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  tabBtnActive: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  tabText: { fontWeight: "900", color: COLORS.muted },
  tabTextActive: { color: COLORS.blue2 },
  filterTopRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  filterTitle: { color: COLORS.text, fontWeight: "900" },
  clearFilterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
  },
  clearFilterBtnText: { fontWeight: "900", color: COLORS.blue2, fontSize: 12 },
  filterBar: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, alignItems: "flex-end" },
  filterItem: { minWidth: 180, flex: 1 },
  filterSearch: { minWidth: 220 },
  filterLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "800", marginBottom: 6 },
  filterSelectWrap: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  filterPicker: { height: 40, color: COLORS.text },
  filterChipsRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#E8F0FF",
  },
  filterChipText: { fontWeight: "800", color: COLORS.blue2, fontSize: 12 },
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
  cardList: { marginTop: 12, gap: 10 },
  card: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#fff",
  },
  cardActive: { borderColor: "#BFD4FF", backgroundColor: "#F5F9FF" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 18 },
  cardSub: { marginTop: 6, color: COLORS.muted, fontWeight: "700", fontSize: 13 },
  cardFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardAmount: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  linkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  linkBtnText: { color: COLORS.blue2, fontWeight: "900" },
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
  badgeInfo: { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" },
  badgeOk: { backgroundColor: "#E7F8ED", borderWidth: 1, borderColor: "#BFE8CB" },
  badgeDanger: { backgroundColor: "#FFEFEF", borderWidth: 1, borderColor: "#F3B6B6" },
  badgeText: { fontSize: 11, fontWeight: "900", color: COLORS.text },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  nextActionBox: {
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    backgroundColor: "#F5F9FF",
    padding: 10,
  },
  nextActionTitle: { fontWeight: "900", color: COLORS.text, marginBottom: 4 },
  nextActionHint: { fontWeight: "700", color: COLORS.muted, fontSize: 12 },
  nextActionRow: { marginTop: 8, alignItems: "flex-start" },
  detailCard: {
    flex: 1,
    minWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  detailTitle: { fontWeight: "900", color: COLORS.blue2, marginBottom: 8, fontSize: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  detailLabel: { fontWeight: "700", color: COLORS.text, flex: 1, fontSize: 15 },
  detailValue: { fontWeight: "900", color: COLORS.text, marginRight: 8, fontSize: 16 },
  detailTotal: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF3FF",
    padding: 10,
    borderRadius: 10,
  },
  detailTotalText: { fontWeight: "900", color: COLORS.text, fontSize: 14 },
  detailTotalValue: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
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
  pendingSaldoRow: {
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#EEF3FF",
    borderRadius: 10,
  },
  pendingSaldoText: { fontWeight: "800", color: COLORS.text },
  pendingSaldoHint: { marginTop: 2, color: COLORS.blue2, fontWeight: "800", fontSize: 12 },
  pendingActionRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pendingActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.orange,
    borderWidth: 1,
    borderColor: "#D56E00",
  },
  pendingActionBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  saldoFavorBox: { backgroundColor: "#FFF4E5", borderColor: "#FFD39A" },
  saldoDeudaBox: { backgroundColor: "#FFEFEF", borderColor: "#F3B6B6" },
  saldoCerradoBox: { backgroundColor: "#E7F8ED", borderColor: "#BFE8CB" },
  messageTight: { marginBottom: 8 },
});

