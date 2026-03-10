import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, Alert, TextInput, useWindowDimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import dash from "../styles/dashboardStyles";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";
import { isSaldoRendicionValida, normalizeText, resolveSaldoEstado, resolveTipoResultado } from "../utils/saldoUtils";
import { groupRendicionesByCapacitador } from "../utils/rendicionGrouping";
import { formatFechaCorta, formatRango, resolveMonthKey, resolveMonthLabel } from "../utils/reportDateUtils";
import { quickFilterBtn, quickFilterText } from "../utils/quickFilterStyles";
import {
  descargarAdjuntoRendicion,
  enviarRendicionAContadora,
  justificarPendienteRendicion,
  levantarJustificacionRendicion,
  obtenerAdjuntosRendicion,
  obtenerNotificacionesSaldo,
  obtenerRendicionesJustificadas,
  obtenerRendicionesSecretaria,
  obtenerRendicionesSecretariaPaginadas,
  obtenerSaldoMovimientos,
  obtenerSaldos,
  obtenerSaldosPaginados,
  registrarSaldoSecretaria,
} from "../api/rendiciones";
import { exportReportExcel, exportReportPdf } from "../utils/reportExport";
import useDebouncedValue from "../hooks/useDebouncedValue";

function MaterialCommunityIcons({ name, size = 12, color = "#1D4ED8" }) {
  const glyphByName = {
    send: "✈",
    paperclip: "📎",
    "file-document-edit-outline": "📝",
    "account-outline": "👤",
    "map-marker-outline": "📍",
    "calendar-range": "📅",
  };
  return <Text style={{ fontSize: size, color }}>{glyphByName[name] || "•"}</Text>;
}

// Secretaria: rendiciones recibidas y envio a contadora.
export default function CarpetaViajes({ token, viewMode = "all" }) {
  const { width } = useWindowDimensions();
  const compactUi = width < 1200;
  const [items, setItems] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsPageSize] = useState(20);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [saldosPage, setSaldosPage] = useState(1);
  const [saldosPageSize] = useState(20);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [saldoFiltros, setSaldoFiltros] = useState({ tipo: "Todos", q: "" });
  const saldoBusquedaDebounced = useDebouncedValue(saldoFiltros.q, 250);
  const [movimientosById, setMovimientosById] = useState({});
  const [movLoadingById, setMovLoadingById] = useState({});
  const [movErrorById, setMovErrorById] = useState({});
  const [movOpenById, setMovOpenById] = useState({});
  const [justificadas, setJustificadas] = useState([]);
  const [saldoOpenByCap, setSaldoOpenByCap] = useState({});
  const [historyOpenByCap, setHistoryOpenByCap] = useState({});
  const [expandedCaps, setExpandedCaps] = useState({});
  const [visibleGroups, setVisibleGroups] = useState(6);
  const [historialMes, setHistorialMes] = useState("todos");
  const [pendientesFiltros, setPendientesFiltros] = useState({ estado: "Todos", q: "" });
  const pendientesBusquedaDebounced = useDebouncedValue(pendientesFiltros.q, 220);
  const [sendingContadoraById, setSendingContadoraById] = useState({});
  const [justifyingById, setJustifyingById] = useState({});
  const [liftingById, setLiftingById] = useState({});
  const [registrandoSaldoById, setRegistrandoSaldoById] = useState({});
  const [notificaciones, setNotificaciones] = useState([]);
  const [showNotificaciones, setShowNotificaciones] = useState(false);

  const totalAsignado = items.reduce((acc, it) => acc + Number(it.totalAsignado || 0), 0);
  const totalRendido = items.reduce((acc, it) => acc + Number(it.totalRendido || 0), 0);
  const totalDiferencia = items.reduce(
    (acc, it) => acc + Number(it.diferencia ?? Number(it.totalRendido || 0) - Number(it.totalAsignado || 0)),
    0
  );
  const totalAdjuntos = items.reduce(
    (acc, it) =>
      acc + (Array.isArray(it.detalles) ? it.detalles.reduce((a, d) => a + (d.adjuntos?.length || 0), 0) : 0),
    0
  );

  const load = useCallback(async (page = itemsPage) => {
    try {
      try {
        const data = await obtenerRendicionesSecretariaPaginadas(token, page, itemsPageSize);
        setItems(Array.isArray(data?.items) ? data.items : []);
        setItemsTotal(Number(data?.total || 0));
        setItemsPage(Number(data?.page || page));
        setError("");
      } catch {
        const data = await obtenerRendicionesSecretaria(token);
        setItems(Array.isArray(data) ? data : []);
        setItemsTotal(Array.isArray(data) ? data.length : 0);
        setItemsPage(1);
        setError("");
      }
    } catch (e) {
      setError(e?.message || "Error al cargar rendiciones");
    }
  }, [token, itemsPage, itemsPageSize]);

  const loadSaldos = useCallback(async (page = saldosPage) => {
    try {
      try {
        const data = await obtenerSaldosPaginados(token, page, saldosPageSize, true);
        setSaldos(Array.isArray(data?.items) ? data.items : []);
        setSaldosPage(Number(data?.page || page));
      } catch {
        const raw = await obtenerSaldos(token);
        setSaldos(Array.isArray(raw) ? raw : []);
        setSaldosPage(1);
      }
    } catch {
      setSaldos([]);
    }
  }, [token, saldosPage, saldosPageSize]);

  const loadJustificadas = useCallback(async () => {
    try {
      const data = await obtenerRendicionesJustificadas(token);
      setJustificadas(Array.isArray(data) ? data : []);
    } catch {
      setJustificadas([]);
    }
  }, [token]);

  const loadNotificaciones = useCallback(async () => {
    try {
      const data = await obtenerNotificacionesSaldo(token, 10);
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch {
      setNotificaciones([]);
    }
  }, [token]);

  useEffect(() => {
    load();
    loadSaldos();
    loadJustificadas();
    loadNotificaciones();
  }, [load, loadSaldos, loadJustificadas, loadNotificaciones]);

  const onActualizar = useCallback(() => {
    load(1);
    loadSaldos(1);
    loadJustificadas();
    loadNotificaciones();
  }, [load, loadSaldos, loadJustificadas, loadNotificaciones]);

  const onEnviarContadora = async (id) => {
    if (sendingContadoraById[id]) return;
    try {
      setSendingContadoraById((prev) => ({ ...prev, [id]: true }));
      setError("");
      setInfo("");
      await enviarRendicionAContadora(token, id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      setInfo("Rendicion enviada a contadora.");
      load(itemsPage);
      loadSaldos(saldosPage);
      loadJustificadas();
    } catch (e) {
      setError(e?.message || "No se pudo enviar.");
    } finally {
      setSendingContadoraById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const onJustificar = async (id) => {
    if (justifyingById[id]) return;
    const motivo = typeof window !== "undefined" ? (window.prompt("Motivo (ej: Licencia medica)", "Licencia medica") || "").trim() : "";
    if (!motivo) return;
    const fechaRaw = typeof window !== "undefined" ? window.prompt("Fecha hasta (YYYY-MM-DD, opcional)", "") || "" : "";
    const observacion = typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "") || "" : "";
    try {
      setJustifyingById((prev) => ({ ...prev, [id]: true }));
      setError("");
      setInfo("");
      const payload = {
        motivo,
        observacion,
        fechaHasta: fechaRaw ? `${fechaRaw}T00:00:00` : null,
      };
      await justificarPendienteRendicion(token, id, payload);
      setInfo("Rendicion marcada como pendiente justificada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setError(e?.message || "No se pudo justificar.");
    } finally {
      setJustifyingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const onLevantarJustificacion = async (id) => {
    if (liftingById[id]) return;
    try {
      setLiftingById((prev) => ({ ...prev, [id]: true }));
      setError("");
      setInfo("");
      await levantarJustificacionRendicion(token, id);
      setInfo("Justificacion levantada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setError(e?.message || "No se pudo levantar justificacion.");
    } finally {
      setLiftingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const onRegistrarSaldo = async (r) => {
    if (registrandoSaldoById[r.id]) return;
    const rawMonto =
      typeof window !== "undefined" ? window.prompt("Monto a registrar", String(r.saldoPendiente || "")) : "";
    const monto = Number(String(rawMonto || "").replace(/[^\d.,-]/g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    const observacion =
      typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "Registro de saldo") || "" : "";
    try {
      setRegistrandoSaldoById((prev) => ({ ...prev, [r.id]: true }));
      setError("");
      setInfo("");
      await registrarSaldoSecretaria(token, r.id, { monto, observacion });
      setInfo("Saldo registrado correctamente.");
      loadSaldos(saldosPage);
    } catch (e) {
      setError(e?.message || "No se pudo registrar saldo.");
    } finally {
      setRegistrandoSaldoById((prev) => ({ ...prev, [r.id]: false }));
    }
  };

  const onToggleMovimientos = async (rendicionId) => {
    const isOpen = !!movOpenById[rendicionId];
    if (isOpen) {
      setMovOpenById((prev) => ({ ...prev, [rendicionId]: false }));
      return;
    }
    setMovOpenById((prev) => ({ ...prev, [rendicionId]: true }));
    try {
      setMovLoadingById((prev) => ({ ...prev, [rendicionId]: true }));
      setMovErrorById((prev) => ({ ...prev, [rendicionId]: "" }));
      const list = await obtenerSaldoMovimientos(token, rendicionId);
      setMovimientosById((prev) => ({ ...prev, [rendicionId]: Array.isArray(list) ? list : [] }));
    } catch (e) {
      setMovErrorById((prev) => ({ ...prev, [rendicionId]: e?.message || "No se pudo cargar historial." }));
    } finally {
      setMovLoadingById((prev) => ({ ...prev, [rendicionId]: false }));
    }
  };

  const itemsTotalPages = Math.max(1, Math.ceil(itemsTotal / itemsPageSize));

  const saldosFiltrados = useMemo(() => {
    const q = normalizeText(saldoBusquedaDebounced);
    return (saldos || []).filter((r) => {
      if (!isSaldoRendicionValida(r)) return false;
      const tipo = resolveTipoResultado(r);
      const estado = resolveSaldoEstado(r);
      const searchable = normalizeText(
        `${r?.id || ""} ${r?.viaje?.capacitador || ""} ${r?.viaje?.municipio || ""} ${r?.viaje?.regionNombre || ""}`
      );
      if (saldoFiltros.tipo !== "Todos" && tipo !== saldoFiltros.tipo) return false;
      if (estado !== "Pendiente") return false;
      if (q && !searchable.includes(q)) return false;
      return true;
    });
  }, [saldos, saldoFiltros.tipo, saldoBusquedaDebounced]);

  const saldosPorCapacitador = useMemo(() => {
    const map = new Map();
    saldosFiltrados.forEach((r) => {
      const cap = r?.viaje?.capacitador || "Sin nombre";
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(r);
    });
    return Array.from(map.entries()).map(([capacitador, rows]) => ({ capacitador, rows }));
  }, [saldosFiltrados]);

  const resumenSaldosPendientes = useMemo(() => {
    const count = saldosFiltrados.length;
    const monto = saldosFiltrados.reduce((acc, r) => acc + Number(r?.saldoPendiente || 0), 0);
    const montoFavor = saldosFiltrados
      .filter((r) => resolveTipoResultado(r) === "Reembolso")
      .reduce((acc, r) => acc + Number(r?.saldoPendiente || 0), 0);
    const montoContra = saldosFiltrados
      .filter((r) => resolveTipoResultado(r) === "Devolucion")
      .reduce((acc, r) => acc + Number(r?.saldoPendiente || 0), 0);
    return { count, monto, montoFavor, montoContra };
  }, [saldosFiltrados]);

  const saldosCerrados = useMemo(() => {
    return (saldos || [])
      .filter((r) => isSaldoRendicionValida(r) && resolveSaldoEstado(r) === "Cerrado")
      .sort((a, b) => {
        const fa = new Date(a?.saldoCerradoEn || a?.fechaEnvio || 0).getTime();
        const fb = new Date(b?.saldoCerradoEn || b?.fechaEnvio || 0).getTime();
        return fb - fa;
      });
  }, [saldos]);

  const historialMesOptions = useMemo(() => {
    const unique = new Map();
    saldosCerrados.forEach((r) => {
      const key = resolveMonthKey(r?.saldoCerradoEn || r?.fechaEnvio);
      if (!key) return;
      unique.set(key, resolveMonthLabel(key));
    });
    return [{ value: "todos", label: "Todos los meses" }].concat(
      Array.from(unique.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([value, label]) => ({ value, label }))
    );
  }, [saldosCerrados]);

  const saldosCerradosFiltrados = useMemo(() => {
    if (historialMes === "todos") return saldosCerrados;
    return saldosCerrados.filter((r) => resolveMonthKey(r?.saldoCerradoEn || r?.fechaEnvio) === historialMes);
  }, [saldosCerrados, historialMes]);

  const historialPorCapacitador = useMemo(() => {
    const map = new Map();
    saldosCerradosFiltrados.forEach((r) => {
      const cap = r?.viaje?.capacitador || "Sin nombre";
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(r);
    });
    return Array.from(map.entries()).map(([capacitador, rows]) => ({ capacitador, rows }));
  }, [saldosCerradosFiltrados]);

  const exportSummary = useMemo(() => {
    const total = saldosCerradosFiltrados.length;
    const favor = saldosCerradosFiltrados
      .filter((r) => resolveTipoResultado(r) === "Reembolso")
      .reduce((acc, r) => acc + resolveMontoSaldo(r), 0);
    const contra = saldosCerradosFiltrados
      .filter((r) => resolveTipoResultado(r) === "Devolucion")
      .reduce((acc, r) => acc + resolveMontoSaldo(r), 0);
    return { total, favor, contra };
  }, [saldosCerradosFiltrados]);

  const onExportHistorial = useCallback(
    (type) => {
      const rows = saldosCerradosFiltrados.map((r) => {
        const tipo = resolveTipoResultado(r);
        return [
          { value: formatFechaCorta(r?.saldoCerradoEn || r?.fechaEnvio) },
          { value: r.id },
          { value: r?.viaje?.capacitador || "-" },
          { value: r?.viaje?.municipio || "-" },
          { value: r?.viaje?.regionNombre || "-" },
          { value: tipo },
          { value: `$ ${resolveMontoSaldo(r).toLocaleString("es-CL")}`, align: "right" },
          { value: resolveSaldoEstado(r) },
        ];
      });
      const mesLabel = historialMes === "todos" ? "Todos los meses" : resolveMonthLabel(historialMes);
      const config = {
        title: "Historial de saldos cerrados",
        subtitle: "Secretaria - Rendiciones",
        meta: [
          { label: "Fecha de generacion", value: new Date().toLocaleString("es-CL") },
          { label: "Mes", value: mesLabel },
        ],
        summary: [
          { label: "Registros", value: exportSummary.total },
          { label: "A favor", value: `$ ${exportSummary.favor.toLocaleString("es-CL")}` },
          { label: "En contra", value: `$ ${exportSummary.contra.toLocaleString("es-CL")}` },
        ],
        headers: ["Fecha cierre", "Rendicion", "Capacitador", "Destino", "Region", "Tipo", "Monto", "Estado"],
        rows,
      };
      const ok =
        type === "excel"
          ? exportReportExcel({ fileName: "historial_saldos_secretaria.xls", ...config })
          : exportReportPdf({ fileName: "historial_saldos_secretaria.pdf", ...config });
      if (!ok) Alert.alert("Exportar", "La exportacion solo esta habilitada en web.");
    },
    [saldosCerradosFiltrados, historialMes, exportSummary]
  );

  const itemsFiltrados = useMemo(() => {
    const q = normalizeText(pendientesBusquedaDebounced);
    return (items || []).filter((it) => {
      const estado = String(it?.estado || "").toLowerCase();
      if (pendientesFiltros.estado === "Secretaria" && !estado.includes("secretaria")) return false;
      if (pendientesFiltros.estado === "Justificada" && !estado.includes("justific")) return false;
      const searchable = normalizeText(
        `${it?.id || ""} ${it?.viaje?.capacitador || ""} ${it?.viaje?.municipio || ""} ${it?.viaje?.regionNombre || ""}`
      );
      if (q && !searchable.includes(q)) return false;
      return true;
    });
  }, [items, pendientesFiltros.estado, pendientesBusquedaDebounced]);

  const pendientesAgrupados = useMemo(() => groupRendicionesByCapacitador(itemsFiltrados), [itemsFiltrados]);

  useEffect(() => {
    setVisibleGroups(6);
    setExpandedCaps((prev) => {
      const next = {};
      pendientesAgrupados.forEach((g, idx) => {
        next[g.key] = prev[g.key] ?? idx === 0;
      });
      return next;
    });
  }, [pendientesAgrupados]);

  useEffect(() => {
    setHistoryOpenByCap((prev) => {
      const next = {};
      historialPorCapacitador.forEach((g, idx) => {
        next[g.capacitador] = prev[g.capacitador] ?? idx === 0;
      });
      return next;
    });
  }, [historialPorCapacitador]);

  useEffect(() => {
    setSaldoOpenByCap((prev) => {
      const next = {};
      saldosPorCapacitador.forEach((g) => {
        const tienePendientes = g.rows.some((r) => resolveSaldoEstado(r) === "Pendiente");
        next[g.capacitador] = prev[g.capacitador] ?? tienePendientes;
      });
      return next;
    });
  }, [saldosPorCapacitador]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title={viewMode === "saldos" ? "Saldos" : "Carpeta de viajes"}
        subtitle={
          viewMode === "saldos"
            ? "Control de reembolsos y devoluciones."
            : "Documentos enviados por capacitador."
        }
        secondaryLabel="Actualizar"
        onSecondaryPress={onActualizar}
      />

      <KpiRow
        items={[
          { key: "pendientes", label: "Pendientes", value: items.length },
          { key: "asignado", label: "Total asignado", value: `$ ${totalAsignado.toLocaleString("es-CL")}` },
          { key: "rendido", label: "Total rendido", value: `$ ${totalRendido.toLocaleString("es-CL")}` },
          { key: "diferencia", label: "Diferencia", value: `$ ${totalDiferencia.toLocaleString("es-CL")}` },
          { key: "adjuntos", label: "Adjuntos", value: totalAdjuntos },
        ]}
      />

      <View style={dash.panel}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={dash.panelTitle}>Notificaciones</Text>
          <Pressable style={dash.docBtn} onPress={() => setShowNotificaciones((v) => !v)}>
            <Text style={dash.docBtnText}>{showNotificaciones ? "Ocultar" : "Mostrar"}</Text>
          </Pressable>
        </View>
        {!showNotificaciones ? (
          <Text style={dash.docSub}>Panel contraido.</Text>
        ) : notificaciones.length === 0 ? (
          <Text style={dash.docSub}>Sin notificaciones.</Text>
        ) : (
          notificaciones.map((n) => (
            <View key={String(n.id)} style={{ borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8, marginTop: 8 }}>
              <Text style={dash.docTitle}>{n.titulo || "Notificacion"}</Text>
              <Text style={dash.docSub}>
                {formatFechaCorta(n.fechaRegistro)}
                {n.rendicionId ? ` | Rendicion #${n.rendicionId}` : ""}
                {typeof n.monto === "number" ? ` | $ ${Number(n.monto || 0).toLocaleString("es-CL")}` : ""}
              </Text>
              {!!n.mensaje ? <Text style={dash.docSub}>{n.mensaje}</Text> : null}
            </View>
          ))
        )}
      </View>

      {viewMode !== "saldos" ? (
      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Pendientes de revision</Text>
        <StatusMessage tone="error" text={error} />
        <StatusMessage tone="info" text={info} />
        <View style={pendingUiStyles.filtersWrap}>
          <TextInput
            value={pendientesFiltros.q}
            onChangeText={(value) => setPendientesFiltros((prev) => ({ ...prev, q: value }))}
            placeholder="Buscar por capacitador, destino o id..."
            style={pendingUiStyles.searchInput}
          />
          <View style={pendingUiStyles.chipsRow}>
            <Pressable
              style={quickFilterBtn(pendientesFiltros.estado === "Todos")}
              onPress={() => setPendientesFiltros((prev) => ({ ...prev, estado: "Todos" }))}
            >
              <Text style={quickFilterText(pendientesFiltros.estado === "Todos")}>Todos</Text>
            </Pressable>
            <Pressable
              style={quickFilterBtn(pendientesFiltros.estado === "Secretaria")}
              onPress={() => setPendientesFiltros((prev) => ({ ...prev, estado: "Secretaria" }))}
            >
              <Text style={quickFilterText(pendientesFiltros.estado === "Secretaria")}>Pendiente secretaria</Text>
            </Pressable>
            <Pressable
              style={quickFilterBtn(pendientesFiltros.estado === "Justificada")}
              onPress={() => setPendientesFiltros((prev) => ({ ...prev, estado: "Justificada" }))}
            >
              <Text style={quickFilterText(pendientesFiltros.estado === "Justificada")}>Justificada</Text>
            </Pressable>
          </View>
        </View>

        {pendientesAgrupados.length === 0 ? (
          <Text style={{ color: "#6B7280", fontWeight: "700", marginTop: 8 }}>
            No hay rendiciones para el filtro seleccionado.
          </Text>
        ) : (
          <>
            {pendientesAgrupados.slice(0, visibleGroups).map((grupo) => (
              <View
                key={grupo.key}
                style={pendingUiStyles.groupCard}
              >
                <Pressable
                  style={pendingUiStyles.groupHeader}
                  onPress={() => setExpandedCaps((prev) => ({ ...prev, [grupo.key]: !prev[grupo.key] }))}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={pendingUiStyles.groupIconWrap}>
                      <MaterialCommunityIcons name="account-group-outline" size={15} color="#1D4ED8" />
                    </View>
                    <View>
                    <Text style={dash.docTitle}>{grupo.capacitador}</Text>
                    <Text style={dash.docSub}>
                      Rendiciones: {grupo.count} | Asignado: $ {grupo.totalAsignado.toLocaleString("es-CL")} |
                      Rendido: $ {grupo.totalRendido.toLocaleString("es-CL")}
                    </Text>
                    </View>
                  </View>
                  <Text style={{ color: "#1D4ED8", fontWeight: "900", fontSize: 12 }}>
                    {expandedCaps[grupo.key] ? "Ocultar" : "Ver"}
                  </Text>
                </Pressable>
                {expandedCaps[grupo.key]
                  ? grupo.rows.map((item) => (
                      <ViajeRowCard
                        key={item.id}
                        data={item}
                        token={token}
                        onEnviar={() => onEnviarContadora(item.id)}
                        onJustificar={() => onJustificar(item.id)}
                        sending={!!sendingContadoraById[item.id]}
                        justifying={!!justifyingById[item.id]}
                      />
                    ))
                  : null}
              </View>
            ))}
            {pendientesAgrupados.length > visibleGroups ? (
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Pressable style={quickFilterBtn(false)} onPress={() => setVisibleGroups((prev) => prev + 6)}>
                  <Text style={quickFilterText(false)}>Mostrar más capacitadores</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
        {itemsTotal > 0 ? (
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              style={quickFilterBtn(itemsPage <= 1)}
              onPress={() => itemsPage > 1 && load(itemsPage - 1)}
            >
              <Text style={quickFilterText(false)}>Anterior</Text>
            </Pressable>
            <Text style={{ color: "#6B7280", fontWeight: "800" }}>
              Pagina {itemsPage} de {itemsTotalPages}
            </Text>
            <Pressable
              style={quickFilterBtn(itemsPage >= itemsTotalPages)}
              onPress={() => itemsPage < itemsTotalPages && load(itemsPage + 1)}
            >
              <Text style={quickFilterText(false)}>Siguiente</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      ) : null}

      {viewMode !== "saldos" ? (
        <View style={dash.panel}>
          <Text style={dash.panelTitle}>Pendientes justificadas</Text>
          {justificadas.length === 0 ? (
            <Text style={{ color: "#6B7280", fontWeight: "700", marginTop: 8 }}>No hay rendiciones justificadas.</Text>
          ) : (
            justificadas.map((r) => (
              <View key={`just-sec-${r.id}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 10 }}>
                <Text style={dash.docTitle}>
                  Rendicion #{r.id} - {r?.viaje?.capacitador || "-"} - {r?.viaje?.municipio || "-"}
                </Text>
                <Text style={dash.docSub}>
                  Motivo: {r?.motivoPendiente || "-"} | Hasta: {r?.pendienteHasta ? formatFechaCorta(r.pendienteHasta) : "Sin fecha"}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <Pressable
                    style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]}
                    onPress={() => onLevantarJustificacion(r.id)}
                    disabled={!!liftingById[r.id]}
                  >
                    <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>
                      {liftingById[r.id] ? "Levantando..." : "Levantar justificacion"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {viewMode !== "rendiciones" ? (
      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Reembolsos y devoluciones pendientes</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
          <View style={summaryCardStyle}>
            <Text style={summaryLabelStyle}>Pendientes</Text>
            <Text style={summaryValueStyle}>{resumenSaldosPendientes.count}</Text>
          </View>
          <View style={summaryCardStyle}>
            <Text style={summaryLabelStyle}>A favor</Text>
            <Text style={summaryValueStyle}>$ {resumenSaldosPendientes.montoFavor.toLocaleString("es-CL")}</Text>
          </View>
          <View style={summaryCardStyle}>
            <Text style={summaryLabelStyle}>En contra</Text>
            <Text style={summaryValueStyle}>$ {resumenSaldosPendientes.montoContra.toLocaleString("es-CL")}</Text>
          </View>
        </View>
        <Text style={dash.docSub}>
          Pendientes: {resumenSaldosPendientes.count} | Monto pendiente: ${" "}
          {resumenSaldosPendientes.monto.toLocaleString("es-CL")}
        </Text>
        <Text style={dash.docSub}>
          Monto a favor: $ {resumenSaldosPendientes.montoFavor.toLocaleString("es-CL")} | Monto en contra: ${" "}
          {resumenSaldosPendientes.montoContra.toLocaleString("es-CL")}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <Pressable
            style={quickFilterBtn(saldoFiltros.tipo === "Todos")}
            onPress={() => setSaldoFiltros((prev) => ({ ...prev, tipo: "Todos" }))}
          >
            <Text style={quickFilterText(saldoFiltros.tipo === "Todos")}>Todos</Text>
          </Pressable>
          <Pressable
            style={quickFilterBtn(saldoFiltros.tipo === "Reembolso")}
            onPress={() => setSaldoFiltros((prev) => ({ ...prev, tipo: "Reembolso" }))}
          >
            <Text style={quickFilterText(saldoFiltros.tipo === "Reembolso")}>A favor</Text>
          </Pressable>
          <Pressable
            style={quickFilterBtn(saldoFiltros.tipo === "Devolucion")}
            onPress={() => setSaldoFiltros((prev) => ({ ...prev, tipo: "Devolucion" }))}
          >
            <Text style={quickFilterText(saldoFiltros.tipo === "Devolucion")}>En contra</Text>
          </Pressable>
        </View>
        <TextInput
          value={saldoFiltros.q}
          onChangeText={(value) => setSaldoFiltros((prev) => ({ ...prev, q: value }))}
          placeholder="Buscar por rendicion, capacitador o destino"
          style={{
            height: 40,
            borderWidth: 1,
            borderColor: "#D9E5FF",
            borderRadius: 10,
            paddingHorizontal: 10,
            marginBottom: 8,
            backgroundColor: "#fff",
            color: "#111827",
          }}
        />
        {saldosPorCapacitador.length === 0 ? (
          <Text style={{ color: "#6B7280", fontWeight: "700", marginTop: 8 }}>No hay saldos pendientes.</Text>
        ) : (
          saldosPorCapacitador.map((grupo) => (
            <View key={`saldo-cap-${grupo.capacitador}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 10 }}>
              <Pressable
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                onPress={() => setSaldoOpenByCap((prev) => ({ ...prev, [grupo.capacitador]: !prev[grupo.capacitador] }))}
              >
                <Text style={dash.docTitle}>{grupo.capacitador}</Text>
                <Text style={dash.docSub}>Pendientes: {grupo.rows.length} | {saldoOpenByCap[grupo.capacitador] ? "Ocultar" : "Ver"}</Text>
              </Pressable>
              {saldoOpenByCap[grupo.capacitador]
                  ? grupo.rows.map((r) => {
                    const saldoEstado = resolveSaldoEstado(r);
                    const saldoEstadoRaw = normalizeText(r?.saldoEstado || "");
                    const saldoPendiente = Number(r.saldoPendiente || 0);
                    const canRegistrar = saldoEstado === "Pendiente" && saldoPendiente > 0;
                    const devolucionReportada =
                      saldoEstadoRaw === "devolucionreportadacapacitador" && resolveTipoResultado(r) === "Devolucion";
                    return (
                      <View key={`saldo-${r.id}`} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={dash.docTitle}>Rendicion #{r.id} - {r.viaje?.municipio || "-"}</Text>
                            <Text style={dash.docSub}>
                              Tipo: {resolveTipoResultado(r)} | Estado: {saldoEstado} | Pendiente: $ {saldoPendiente.toLocaleString("es-CL")}
                            </Text>
                          </View>
                          <View style={{ gap: 8 }}>
                            {canRegistrar ? (
                              <Pressable
                                style={[dash.docBtn, { backgroundColor: "#1D4ED8", opacity: registrandoSaldoById[r.id] ? 0.7 : 1 }]}
                                onPress={() => onRegistrarSaldo(r)}
                                disabled={!!registrandoSaldoById[r.id]}
                              >
                                <Text style={dash.docBtnText}>
                                  {registrandoSaldoById[r.id]
                                    ? "Registrando..."
                                    : resolveTipoResultado(r) === "Reembolso"
                                      ? "Registrar pago"
                                      : devolucionReportada
                                        ? "Confirmar devolucion"
                                        : "Registrar devolucion"}
                                </Text>
                              </Pressable>
                            ) : (
                              <View style={[dash.docBtn, { backgroundColor: "#E5E7EB" }]}>
                                <Text style={[dash.docBtnText, { color: "#4B5563" }]}>Saldo cerrado</Text>
                              </View>
                            )}
                            <Pressable
                              style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }, movLoadingById[r.id] && { opacity: 0.7 }]}
                              onPress={() => onToggleMovimientos(r.id)}
                              disabled={!!movLoadingById[r.id]}
                            >
                              <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>
                                {movLoadingById[r.id]
                                  ? "Cargando..."
                                  : movOpenById[r.id]
                                    ? compactUi ? "Ocultar" : "Ocultar movimientos"
                                    : compactUi ? "Movimientos" : "Ver movimientos"}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                        {movOpenById[r.id] ? (
                          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8 }}>
                            {movLoadingById[r.id] ? <Text style={dash.docSub}>Cargando historial...</Text> : null}
                            {movErrorById[r.id] ? <Text style={dash.docSub}>{movErrorById[r.id]}</Text> : null}
                            {!movLoadingById[r.id] && !movErrorById[r.id] && !(movimientosById[r.id] || []).length ? (
                              <Text style={dash.docSub}>Sin movimientos registrados.</Text>
                            ) : null}
                            {(movimientosById[r.id] || []).map((m) => (
                              <Text key={`mov-${r.id}-${m.id}`} style={dash.docSub}>
                                {formatFechaCorta(m.fechaRegistro)} | {m.tipoOperacion} | $ {Number(m.monto || 0).toLocaleString("es-CL")} |{" "}
                                {Number(m.saldoAnterior || 0).toLocaleString("es-CL")} {"->"}{" "}
                                {Number(m.saldoPosterior || 0).toLocaleString("es-CL")}
                              </Text>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    );
                  })
                : null}
            </View>
          ))
        )}
      </View>
      ) : null}

      {viewMode !== "rendiciones" ? (
      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Historial reciente de saldos cerrados</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
          <View
            style={{
              minWidth: 240,
              borderWidth: 1,
              borderColor: "#D9E5FF",
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <Picker selectedValue={historialMes} onValueChange={setHistorialMes} style={{ height: 38 }}>
              {historialMesOptions.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          <Pressable
            style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]}
            onPress={() => onExportHistorial("excel")}
          >
            <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>{compactUi ? "Excel" : "Descargar Excel"}</Text>
          </Pressable>
          <Pressable
            style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]}
            onPress={() => onExportHistorial("pdf")}
          >
            <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>{compactUi ? "PDF" : "Descargar PDF"}</Text>
          </Pressable>
        </View>
        {saldosCerradosFiltrados.length === 0 ? (
          <Text style={{ color: "#6B7280", fontWeight: "700", marginTop: 8 }}>Aun no hay cierres registrados.</Text>
        ) : (
          historialPorCapacitador.map((grupo) => (
            <View key={`hist-cap-${grupo.capacitador}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 10 }}>
              <Pressable
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                onPress={() =>
                  setHistoryOpenByCap((prev) => ({ ...prev, [grupo.capacitador]: !prev[grupo.capacitador] }))
                }
              >
                <Text style={dash.docTitle}>{grupo.capacitador}</Text>
                <Text style={dash.docSub}>{historyOpenByCap[grupo.capacitador] ? "Ocultar" : "Ver"}</Text>
              </Pressable>

              {historyOpenByCap[grupo.capacitador]
                ? grupo.rows.map((r) => {
                    const tipo = resolveTipoResultado(r);
                    const fecha = formatFechaCorta(r?.saldoCerradoEn || r?.fechaEnvio);
                    const monto = resolveMontoSaldo(r);
                    return (
                      <View key={`cerrado-${grupo.capacitador}-${r.id}`} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={dash.docTitle}>Rendicion #{r.id} - {r?.viaje?.municipio || "-"}</Text>
                            <Text style={dash.docSub}>
                              {tipo} cerrado | Monto: $ {monto.toLocaleString("es-CL")} | Fecha: {fecha}
                            </Text>
                          </View>
                          <Pressable
                            style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }, movLoadingById[r.id] && { opacity: 0.7 }]}
                            onPress={() => onToggleMovimientos(r.id)}
                            disabled={!!movLoadingById[r.id]}
                          >
                            <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>
                              {movLoadingById[r.id]
                                ? "Cargando..."
                                : movOpenById[r.id]
                                  ? compactUi ? "Ocultar" : "Ocultar movimientos"
                                  : compactUi ? "Movimientos" : "Ver movimientos"}
                            </Text>
                          </Pressable>
                        </View>
                        {movOpenById[r.id] ? (
                          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8 }}>
                            {movLoadingById[r.id] ? <Text style={dash.docSub}>Cargando historial...</Text> : null}
                            {movErrorById[r.id] ? <Text style={dash.docSub}>{movErrorById[r.id]}</Text> : null}
                            {!movLoadingById[r.id] && !movErrorById[r.id] && !(movimientosById[r.id] || []).length ? (
                              <Text style={dash.docSub}>Sin movimientos registrados.</Text>
                            ) : null}
                            {(movimientosById[r.id] || []).map((m) => (
                              <Text key={`mov-h-${r.id}-${m.id}`} style={dash.docSub}>
                                {formatFechaCorta(m.fechaRegistro)} | {m.tipoOperacion} | $ {Number(m.monto || 0).toLocaleString("es-CL")} |{" "}
                                {Number(m.saldoAnterior || 0).toLocaleString("es-CL")} {"->"}{" "}
                                {Number(m.saldoPosterior || 0).toLocaleString("es-CL")}
                              </Text>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    );
                  })
                : null}
            </View>
          ))
        )}
      </View>
      ) : null}
    </ScrollView>
  );
}

function ViajeRowCard({ data, token, onEnviar, onJustificar, sending = false, justifying = false }) {
  const { width } = useWindowDimensions();
  const compact = width < 1180;
  const [adjuntosOpen, setAdjuntosOpen] = useState(false);
  const [adjuntosLoading, setAdjuntosLoading] = useState(false);
  const [adjuntosError, setAdjuntosError] = useState("");
  const [adjuntos, setAdjuntos] = useState([]);

  const onToggleAdjuntos = async () => {
    const nextOpen = !adjuntosOpen;
    setAdjuntosOpen(nextOpen);
    if (!nextOpen || adjuntos.length > 0) return;

    try {
      setAdjuntosLoading(true);
      setAdjuntosError("");
      const rows = await obtenerAdjuntosRendicion(token, data.id);
      setAdjuntos(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setAdjuntosError(e?.message || "No se pudieron cargar adjuntos.");
    } finally {
      setAdjuntosLoading(false);
    }
  };

  const onDownloadAdjunto = async (adjuntoId, fileName) => {
    try {
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("La descarga de adjuntos esta disponible en web.");
      }
      const blob = await descargarAdjuntoRendicion(token, adjuntoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "adjunto";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      Alert.alert("Adjuntos", e?.message || "No se pudo descargar.");
    }
  };
  const detalles = Array.isArray(data.detalles) ? data.detalles : [];
  const totalAdjuntos = detalles.reduce((acc, d) => acc + (d.adjuntos?.length || 0), 0);
  const diferencia = Number(data.diferencia ?? Number(data.totalRendido || 0) - Number(data.totalAsignado || 0));
  const tipoResultado =
    data.tipoResultado || (diferencia > 0 ? "Reembolso" : diferencia < 0 ? "Devolucion" : "Cuadrada");
  const guidance = resolveGuidance(data);
  return (
    <View style={[dash.docRow, rowCardStyles.container, compact ? rowCardStyles.containerCompact : null]}>
      <View style={{ flex: 1 }}>
        <Text style={[dash.docTitle, { fontSize: 17 }]}>Rendicion #{data.id}</Text>
        <View style={guidance.badgeStyle}>
          <Text style={guidance.badgeTextStyle}>{guidance.badgeLabel}</Text>
        </View>

        <View style={rowCardStyles.metaGrid}>
          <InfoPill icon="account-outline" tag="CAP" value={data.viaje?.capacitador || "-"} />
          <InfoPill icon="map-marker-outline" tag="DES" value={`${data.viaje?.regionNombre || "-"} - ${data.viaje?.municipio || "-"}`} />
          <InfoPill icon="calendar-range" tag="FEC" value={formatRango(data.viaje?.fechaInicio, data.viaje?.fechaTermino) || "-"} />
        </View>

        <Text style={[dash.docSub, { fontSize: 14, fontWeight: "800", color: "#111827" }]}>
          Asignado: $ {Number(data.totalAsignado || 0).toLocaleString("es-CL")} - Rendido: ${" "}
          {Number(data.totalRendido || 0).toLocaleString("es-CL")}
        </Text>
        <Text style={[dash.docSub, { fontSize: 14, fontWeight: "800", color: "#111827" }]}>
          Diferencia: $ {diferencia.toLocaleString("es-CL")} - Resultado: {tipoResultado}
        </Text>
        <Text style={dash.docSub}>Adjuntos: {adjuntos.length || totalAdjuntos}</Text>
        {adjuntosOpen ? (
          <View style={rowCardStyles.adjuntosBox}>
            {adjuntosLoading ? <Text style={dash.docSub}>Cargando adjuntos...</Text> : null}
            {adjuntosError ? <Text style={[dash.docSub, { color: "#B91C1C" }]}>{adjuntosError}</Text> : null}
            {!adjuntosLoading && !adjuntosError && adjuntos.length === 0 ? (
              <Text style={dash.docSub}>No hay adjuntos disponibles.</Text>
            ) : null}
            {adjuntos.map((a) => (
              <View key={`adj-${data.id}-${a.id}`} style={rowCardStyles.adjuntoRow}>
                <Text numberOfLines={1} style={rowCardStyles.adjuntoName}>
                  {a.nombreArchivo || "adjunto"}
                </Text>
                <Pressable style={rowCardStyles.adjuntoBtn} onPress={() => onDownloadAdjunto(a.id, a.nombreArchivo)}>
                  <Text style={rowCardStyles.adjuntoBtnText}>Descargar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={[dash.docSub, { color: "#1D4ED8", fontWeight: "800" }]}>{guidance.prompt}</Text>
      </View>
      <View style={[rowCardStyles.actionsCol, compact ? rowCardStyles.actionsColCompact : null]}>
        <Pressable
          style={[dash.docBtn, rowCardStyles.actionBtn, { backgroundColor: "#1D4ED8", opacity: sending ? 0.7 : 1 }]}
          onPress={onEnviar}
          disabled={sending}
        >
          <Text style={dash.docBtnText}>
            <MaterialCommunityIcons name="send" size={12} color="#fff" />
            {sending ? " Enviando..." : " Enviar a contadora"}
          </Text>
        </Pressable>
        <Pressable
          style={[dash.docBtn, rowCardStyles.actionBtn, adjuntosLoading && { opacity: 0.7 }]}
          onPress={onToggleAdjuntos}
          disabled={adjuntosLoading}
        >
          <Text style={dash.docBtnText}>
            <MaterialCommunityIcons name="paperclip" size={12} color="#fff" />
            {adjuntosLoading ? " Cargando adjuntos..." : adjuntosOpen ? " Ocultar adjuntos" : " Ver adjuntos"}
          </Text>
        </Pressable>
        <Pressable
          style={[
            dash.docBtn,
            rowCardStyles.actionBtn,
            { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF", opacity: justifying ? 0.7 : 1 },
          ]}
          onPress={onJustificar}
          disabled={justifying}
        >
          <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={12} color="#1D4ED8" />
            {justifying ? " Justificando..." : " Justificar"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoPill({ icon, tag, value }) {
  return (
    <View style={rowCardStyles.pill}>
      <View style={rowCardStyles.pillIconWrap}>
        <MaterialCommunityIcons name={icon} size={13} color="#1D4ED8" />
      </View>
      <View style={rowCardStyles.pillTag}>
        <Text style={rowCardStyles.pillTagText}>{tag}</Text>
      </View>
      <Text numberOfLines={1} style={rowCardStyles.pillValue}>
        {value}
      </Text>
    </View>
  );
}

function resolveGuidance(item) {
  const estado = String(item?.estado || "").toLowerCase();
  if (estado.includes("justific")) {
    return {
      badgeLabel: "Pendiente justificada",
      prompt: "Que hacer ahora: esperar fecha de termino de justificacion o levantarla.",
      badgeStyle: {
        alignSelf: "flex-start",
        marginTop: 4,
        marginBottom: 2,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#D9E5FF",
        backgroundColor: "#EEF3FF",
      },
      badgeTextStyle: { color: "#1D4ED8", fontWeight: "900", fontSize: 11 },
    };
  }

  if (estado.includes("secretaria")) {
    return {
      badgeLabel: "Pendiente secretaria",
      prompt: "Que hacer ahora: validar adjuntos y enviar a contadora.",
      badgeStyle: {
        alignSelf: "flex-start",
        marginTop: 4,
        marginBottom: 2,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#FFD39A",
        backgroundColor: "#FFF4E5",
      },
      badgeTextStyle: { color: "#8A4B00", fontWeight: "900", fontSize: 11 },
    };
  }

  return {
    badgeLabel: item?.estado || "Pendiente",
    prompt: "Que hacer ahora: revisar y definir accion principal.",
    badgeStyle: {
      alignSelf: "flex-start",
      marginTop: 4,
      marginBottom: 2,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      backgroundColor: "#F3F4F6",
    },
    badgeTextStyle: { color: "#374151", fontWeight: "900", fontSize: 11 },
  };
}

function resolveMontoSaldo(item) {
  const dif = Number(item?.diferencia ?? Number(item?.totalRendido || 0) - Number(item?.totalAsignado || 0));
  const pendiente = Number(item?.saldoPendiente || 0);
  if (pendiente > 0) return pendiente;
  return Math.abs(dif);
}

const summaryCardStyle = {
  flex: 1,
  minWidth: 150,
  borderWidth: 1,
  borderColor: "#D9E5FF",
  borderRadius: 10,
  backgroundColor: "#F8FAFF",
  paddingVertical: 8,
  paddingHorizontal: 10,
};

const summaryLabelStyle = {
  color: "#6B7280",
  fontWeight: "800",
  fontSize: 12,
  marginBottom: 3,
};

const summaryValueStyle = {
  color: "#111827",
  fontWeight: "900",
  fontSize: 16,
};

const rowCardStyles = {
  container: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  containerCompact: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  metaGrid: {
    marginTop: 8,
    marginBottom: 6,
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
  },
  pillIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  pillTag: {
    minWidth: 30,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#E8F0FF",
    borderWidth: 1,
    borderColor: "#BFD4FF",
  },
  pillTagText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "900",
    color: "#1D4ED8",
  },
  pillValue: {
    flex: 1,
    color: "#374151",
    fontWeight: "700",
    fontSize: 12,
  },
  actionsCol: {
    gap: 8,
    minWidth: 170,
  },
  actionsColCompact: {
    width: "100%",
    minWidth: 0,
  },
  actionBtn: {
    minHeight: 38,
  },
  adjuntosBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    backgroundColor: "#F8FAFF",
    padding: 8,
    gap: 6,
  },
  adjuntoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  adjuntoName: {
    flex: 1,
    color: "#374151",
    fontWeight: "700",
    fontSize: 12,
  },
  adjuntoBtn: {
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#EEF3FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  adjuntoBtnText: {
    color: "#1D4ED8",
    fontWeight: "900",
    fontSize: 11,
  },
};

const pendingUiStyles = {
  filtersWrap: {
    marginTop: 10,
    marginBottom: 6,
    gap: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  groupCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FBFCFF",
    padding: 10,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  groupIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
};



