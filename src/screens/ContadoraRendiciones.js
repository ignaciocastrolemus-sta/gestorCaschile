import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useCallback } from "react";
import { API_BASE } from "../config/api";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import { isSaldoRendicionValida, normalizeText, resolveSaldoEstado, resolveTipoResultado } from "../utils/saldoUtils";
import { groupRendicionesByCapacitador } from "../utils/rendicionGrouping";
import { obtenerSaldoMovimientos } from "../api/rendiciones";

// Contadora: lista de rendiciones y resolucion (aprobar/rechazar)
export default function ContadoraRendiciones({ token, viewMode = "all" }) {
  const [items, setItems] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsPageSize] = useState(20);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [saldosPage, setSaldosPage] = useState(1);
  const [saldosPageSize] = useState(20);
  const [error, setError] = useState("");
  const [msgById, setMsgById] = useState({});
  const [actionMsg, setActionMsg] = useState("");
  const [saldoFiltros, setSaldoFiltros] = useState({ tipo: "Todos", q: "" });
  const [movimientosById, setMovimientosById] = useState({});
  const [movLoadingById, setMovLoadingById] = useState({});
  const [movErrorById, setMovErrorById] = useState({});
  const [movOpenById, setMovOpenById] = useState({});
  const [justificadas, setJustificadas] = useState([]);
  const [saldoOpenByCap, setSaldoOpenByCap] = useState({});
  const [historyOpenByCap, setHistoryOpenByCap] = useState({});
  const [expandedCaps, setExpandedCaps] = useState({});
  const [visibleGroups, setVisibleGroups] = useState(6);

  // Resumen rapido para priorizar revision.
  const kpis = useMemo(() => {
    const totalAsignado = items.reduce((acc, r) => acc + Number(r.totalAsignado || 0), 0);
    const totalRendido = items.reduce((acc, r) => acc + Number(r.totalRendido || 0), 0);
    const totalDiferencia = items.reduce(
      (acc, r) => acc + Number(r.diferencia ?? Number(r.totalRendido || 0) - Number(r.totalAsignado || 0)),
      0
    );
    const conAdjuntos = items.reduce((acc, r) => {
      const tieneAdjuntos = (r.detalles || []).some((d) => (d.adjuntos || []).length > 0);
      return acc + (tieneAdjuntos ? 1 : 0);
    }, 0);
    const reembolsos = items.filter((r) => resolveTipoResultado(r) === "Reembolso").length;
    const devoluciones = items.filter((r) => resolveTipoResultado(r) === "Devolucion").length;
    return {
      pendientes: items.length,
      totalAsignado,
      totalRendido,
      totalDiferencia,
      conAdjuntos,
      reembolsos,
      devoluciones,
    };
  }, [items]);

  const load = useCallback(async (page = 1) => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/contadora/paged?page=${page}&pageSize=${itemsPageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const fallback = await fetch(`${API_BASE}/Rendiciones/contadora`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!fallback.ok) {
          const txt = await fallback.text();
          throw new Error(txt || "Error al cargar rendiciones");
        }
        const raw = await fallback.json();
        setItems(Array.isArray(raw) ? raw : []);
        setItemsTotal(Array.isArray(raw) ? raw.length : 0);
        setItemsPage(1);
        setError("");
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
      setItemsTotal(Number(data?.total || 0));
      setItemsPage(Number(data?.page || page));
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar rendiciones");
    }
  }, [token, itemsPageSize]);

  const loadSaldos = useCallback(async (page = 1) => {
    try {
      const res = await fetch(
        `${API_BASE}/Rendiciones/saldos/paged?page=${page}&pageSize=${saldosPageSize}&incluirCerrados=true`,
        {
        headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const fallback = await fetch(`${API_BASE}/Rendiciones/saldos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!fallback.ok) return;
        const raw = await fallback.json();
        setSaldos(Array.isArray(raw) ? raw : []);
        setSaldosPage(1);
        return;
      }
      const data = await res.json();
      setSaldos(Array.isArray(data?.items) ? data.items : []);
      setSaldosPage(Number(data?.page || page));
    } catch {
      setSaldos([]);
    }
  }, [token, saldosPageSize]);

  const loadJustificadas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/justificadas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setJustificadas([]);
        return;
      }
      const data = await res.json();
      setJustificadas(Array.isArray(data) ? data : []);
    } catch {
      setJustificadas([]);
    }
  }, [token]);

  useEffect(() => {
    load(1);
    loadSaldos(1);
    loadJustificadas();
  }, [load, loadSaldos, loadJustificadas]);

  const onActualizar = useCallback(() => {
    load(1);
    loadSaldos(1);
    loadJustificadas();
  }, [load, loadSaldos, loadJustificadas]);

  const onDownload = async (adjuntoId, filename) => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/adjuntos/${adjuntoId}`, {
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
      a.download = filename || "adjunto";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo descargar.");
    }
  };

  const onResolver = async (id, aprobar) => {
    try {
      setActionMsg("");
      const mensaje = (msgById[id] || "").trim();
      const res = await fetch(`${API_BASE}/Rendiciones/${id}/resolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aprobar, mensaje }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al resolver rendicion");
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
      setActionMsg(aprobar ? "Rendicion aprobada." : "Rendicion rechazada.");
      if (aprobar) loadSaldos(saldosPage);
      loadJustificadas();
    } catch (e) {
      setActionMsg(e?.message || "Error al resolver rendicion.");
    }
  };

  const onJustificar = async (id) => {
    const motivo = typeof window !== "undefined" ? (window.prompt("Motivo (ej: Licencia medica)", "Licencia medica") || "").trim() : "";
    if (!motivo) return;
    const fechaRaw = typeof window !== "undefined" ? window.prompt("Fecha hasta (YYYY-MM-DD, opcional)", "") || "" : "";
    const observacion = typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "") || "" : "";
    try {
      const payload = {
        motivo,
        observacion,
        fechaHasta: fechaRaw ? `${fechaRaw}T00:00:00` : null,
      };
      const res = await fetch(`${API_BASE}/Rendiciones/${id}/justificar-pendiente`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo justificar.");
      }
      setActionMsg("Rendicion marcada como pendiente justificada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setActionMsg(e?.message || "No se pudo justificar.");
    }
  };

  const onLevantarJustificacion = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/${id}/levantar-justificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo levantar justificacion.");
      }
      setActionMsg("Justificacion levantada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setActionMsg(e?.message || "No se pudo levantar justificacion.");
    }
  };

  const onRegistrarSaldo = async (r) => {
    const rawMonto =
      typeof window !== "undefined" ? window.prompt("Monto a registrar", String(r.saldoPendiente || "")) : "";
    const monto = Number(String(rawMonto || "").replace(/[^\d.,-]/g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    const observacion =
      typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "Pago/registro de saldo") || "" : "";

    try {
      const res = await fetch(`${API_BASE}/Rendiciones/${r.id}/registrar-saldo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monto, observacion }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo registrar saldo.");
      }
      setActionMsg("Saldo registrado correctamente.");
      loadSaldos(saldosPage);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo registrar saldo.");
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
    const q = normalizeText(saldoFiltros.q);
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
  }, [saldos, saldoFiltros]);

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

  // Bitacora visible para control operativo: ultimos saldos cerrados.
  const saldosCerradosRecientes = useMemo(() => {
    return (saldos || [])
      .filter((r) => isSaldoRendicionValida(r) && resolveSaldoEstado(r) === "Cerrado")
      .sort((a, b) => {
        const fa = new Date(a?.saldoCerradoEn || a?.fechaEnvio || 0).getTime();
        const fb = new Date(b?.saldoCerradoEn || b?.fechaEnvio || 0).getTime();
        return fb - fa;
      })
      .slice(0, 8);
  }, [saldos]);

  const historialPorCapacitador = useMemo(() => {
    const map = new Map();
    saldosCerradosRecientes.forEach((r) => {
      const cap = r?.viaje?.capacitador || "Sin nombre";
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(r);
    });
    return Array.from(map.entries()).map(([capacitador, rows]) => ({ capacitador, rows }));
  }, [saldosCerradosRecientes]);

  const pendientesAgrupados = useMemo(() => groupRendicionesByCapacitador(items), [items]);

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
        title={viewMode === "saldos" ? "Saldos" : "Revision de rendiciones"}
        subtitle={
          viewMode === "saldos"
            ? "Control de reembolsos y devoluciones."
            : "Valida documentos y montos enviados por el capacitador."
        }
        secondaryLabel="Actualizar"
        onSecondaryPress={onActualizar}
      />

      <KpiRow
        items={[
          { key: "pendientes", label: "Pendientes", value: kpis.pendientes },
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
          {
            key: "diferencia",
            label: "Diferencia",
            value: `$ ${kpis.totalDiferencia.toLocaleString("es-CL")}`,
          },
          { key: "reembolsos", label: "Reembolsos", value: kpis.reembolsos },
          { key: "devoluciones", label: "Devoluciones", value: kpis.devoluciones },
          { key: "adjuntos", label: "Con adjuntos", value: kpis.conAdjuntos },
        ]}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!!actionMsg && <Text style={styles.infoText}>{actionMsg}</Text>}

      {viewMode !== "rendiciones" ? (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reembolsos y devoluciones pendientes</Text>
        <Text style={styles.detailHint}>
          Pendientes: {resumenSaldosPendientes.count} | Monto pendiente: ${" "}
          {resumenSaldosPendientes.monto.toLocaleString("es-CL")}
        </Text>
        <Text style={styles.detailHint}>
          Monto a favor: $ {resumenSaldosPendientes.montoFavor.toLocaleString("es-CL")} | Monto en contra: ${" "}
          {resumenSaldosPendientes.montoContra.toLocaleString("es-CL")}
        </Text>
        <View style={styles.saldoFilterRow}>
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
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        {saldosPorCapacitador.length === 0 ? (
          <Text style={styles.detailHint}>No hay saldos pendientes.</Text>
        ) : (
          saldosPorCapacitador.map((grupo) => (
            <View key={`saldo-cap-${grupo.capacitador}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.grayBorder, paddingTop: 10 }}>
              <Pressable
                style={styles.groupHeader}
                onPress={() => setSaldoOpenByCap((prev) => ({ ...prev, [grupo.capacitador]: !prev[grupo.capacitador] }))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{grupo.capacitador}</Text>
                  <Text style={styles.detailHint}>Pendientes: {grupo.rows.length}</Text>
                </View>
                <Text style={styles.groupToggle}>
                  {saldoOpenByCap[grupo.capacitador] ? "Ocultar" : "Ver"}
                </Text>
              </Pressable>
              {saldoOpenByCap[grupo.capacitador]
                ? grupo.rows.map((r) => {
                    const saldoEstado = resolveSaldoEstado(r);
                    const saldoPendiente = Number(r.saldoPendiente || 0);
                    const canRegistrar = saldoEstado === "Pendiente" && saldoPendiente > 0;
                    return (
                      <View key={`saldo-${r.id}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.grayBorder, paddingTop: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.line}>Rendicion #{r.id} - {r.viaje?.municipio || "-"}</Text>
                            <Text style={styles.detailHint}>
                              Tipo: {resolveTipoResultado(r)} | Estado: {saldoEstado} | Pendiente: $ {saldoPendiente.toLocaleString("es-CL")}
                            </Text>
                          </View>
                          <View style={{ gap: 8 }}>
                            {canRegistrar ? (
                              <Pressable style={styles.approveBtn} onPress={() => onRegistrarSaldo(r)}>
                                <Text style={styles.approveText}>
                                  {resolveTipoResultado(r) === "Reembolso" ? "Registrar pago" : "Registrar devolucion"}
                                </Text>
                              </Pressable>
                            ) : (
                              <View style={[styles.historyBtn, { backgroundColor: "#E5E7EB", borderColor: COLORS.grayBorder }]}>
                                <Text style={[styles.historyBtnText, { color: "#4B5563" }]}>Saldo cerrado</Text>
                              </View>
                            )}
                            <Pressable style={styles.historyBtn} onPress={() => onToggleMovimientos(r.id)}>
                              <Text style={styles.historyBtnText}>{movOpenById[r.id] ? "Ocultar movimientos" : "Ver movimientos"}</Text>
                            </Pressable>
                          </View>
                        </View>
                        {movOpenById[r.id] ? (
                          <View style={styles.movementsWrap}>
                            {movLoadingById[r.id] ? <Text style={styles.detailHint}>Cargando historial...</Text> : null}
                            {movErrorById[r.id] ? <Text style={styles.detailHint}>{movErrorById[r.id]}</Text> : null}
                            {!movLoadingById[r.id] && !movErrorById[r.id] && !(movimientosById[r.id] || []).length ? (
                              <Text style={styles.detailHint}>Sin movimientos registrados.</Text>
                            ) : null}
                            {(movimientosById[r.id] || []).map((m) => (
                              <Text key={`mov-${r.id}-${m.id}`} style={styles.detailHint}>
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

      {viewMode !== "saldos" ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pendientes justificadas</Text>
          {justificadas.length === 0 ? (
            <Text style={styles.detailHint}>No hay rendiciones justificadas.</Text>
          ) : (
            justificadas.map((r) => (
              <View key={`just-${r.id}`} style={styles.groupItem}>
                <Text style={styles.line}>
                  Rendicion #{r.id} - {r?.viaje?.capacitador || "-"} - {r?.viaje?.municipio || "-"}
                </Text>
                <Text style={styles.detailHint}>
                  Motivo: {r?.motivoPendiente || "-"} | Hasta: {r?.pendienteHasta ? formatFechaCorta(r.pendienteHasta) : "Sin fecha"}
                </Text>
                <View style={styles.actionsRow}>
                  <Pressable style={styles.historyBtn} onPress={() => onLevantarJustificacion(r.id)}>
                    <Text style={styles.historyBtnText}>Levantar justificacion</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {viewMode !== "rendiciones" ? (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historial reciente de saldos cerrados</Text>
        {saldosCerradosRecientes.length === 0 ? (
          <Text style={styles.detailHint}>Aun no hay cierres registrados.</Text>
        ) : (
          historialPorCapacitador.map((grupo) => (
            <View key={`hist-cap-${grupo.capacitador}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.grayBorder, paddingTop: 10 }}>
              <Pressable
                style={styles.groupHeader}
                onPress={() =>
                  setHistoryOpenByCap((prev) => ({ ...prev, [grupo.capacitador]: !prev[grupo.capacitador] }))
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{grupo.capacitador}</Text>
                  <Text style={styles.detailHint}>Rendiciones cerradas: {grupo.rows.length}</Text>
                </View>
                <Text style={styles.groupToggle}>{historyOpenByCap[grupo.capacitador] ? "Ocultar" : "Ver"}</Text>
              </Pressable>

              {historyOpenByCap[grupo.capacitador]
                ? grupo.rows.map((r) => {
                    const tipo = resolveTipoResultado(r);
                    const fecha = formatFechaCorta(r?.saldoCerradoEn || r?.fechaEnvio);
                    const monto = resolveMontoSaldo(r);
                    return (
                      <View key={`cerrado-${grupo.capacitador}-${r.id}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.grayBorder, paddingTop: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.line}>Rendicion #{r.id} - {r?.viaje?.municipio || "-"}</Text>
                            <Text style={styles.detailHint}>
                              {tipo} cerrado | Monto: $ {monto.toLocaleString("es-CL")} | Fecha: {fecha}
                            </Text>
                          </View>
                          <Pressable style={styles.historyBtn} onPress={() => onToggleMovimientos(r.id)}>
                            <Text style={styles.historyBtnText}>
                              {movOpenById[r.id] ? "Ocultar movimientos" : "Ver movimientos"}
                            </Text>
                          </Pressable>
                        </View>
                        {movOpenById[r.id] ? (
                          <View style={styles.movementsWrap}>
                            {movLoadingById[r.id] ? <Text style={styles.detailHint}>Cargando historial...</Text> : null}
                            {movErrorById[r.id] ? <Text style={styles.detailHint}>{movErrorById[r.id]}</Text> : null}
                            {!movLoadingById[r.id] && !movErrorById[r.id] && !(movimientosById[r.id] || []).length ? (
                              <Text style={styles.detailHint}>Sin movimientos registrados.</Text>
                            ) : null}
                            {(movimientosById[r.id] || []).map((m) => (
                              <Text key={`mov-h-${r.id}-${m.id}`} style={styles.detailHint}>
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

      {viewMode !== "saldos" ? (pendientesAgrupados.length === 0 ? (
        <Text style={styles.emptyText}>No hay rendiciones pendientes.</Text>
      ) : (
        <>
          {pendientesAgrupados.slice(0, visibleGroups).map((grupo) => (
            <View key={grupo.key} style={styles.card}>
              <Pressable
                style={styles.groupHeader}
                onPress={() => setExpandedCaps((prev) => ({ ...prev, [grupo.key]: !prev[grupo.key] }))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{grupo.capacitador}</Text>
                  <Text style={styles.detailHint}>
                    Rendiciones: {grupo.count} | Asignado: $ {grupo.totalAsignado.toLocaleString("es-CL")} | Rendido: $
                    {" "}{grupo.totalRendido.toLocaleString("es-CL")}
                  </Text>
                </View>
                <Text style={styles.groupToggle}>{expandedCaps[grupo.key] ? "Ocultar" : "Ver"}</Text>
              </Pressable>

              {expandedCaps[grupo.key]
                ? grupo.rows.map((r) => {
                    const diferencia = Number(r.diferencia ?? Number(r.totalRendido || 0) - Number(r.totalAsignado || 0));
                    const tipoResultado = resolveTipoResultado(r);
                    const guidance = resolveContadoraGuidance(r, tipoResultado);
                    return (
                      <View key={r.id} style={styles.groupItem}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>Rendicion #{r.id}</Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{r.estado}</Text>
                          </View>
                        </View>

                        <Text style={styles.line}>
                          <Text style={styles.label}>Capacitador: </Text>
                          {r.viaje?.capacitador || "Sin nombre"}
                        </Text>
                        <Text style={styles.line}>
                          <Text style={styles.label}>Destino: </Text>
                          {r.viaje?.municipio || "-"} ({r.viaje?.regionNombre || "-"})
                        </Text>
                        <Text style={styles.line}>
                          <Text style={styles.label}>Fechas: </Text>
                          {formatRango(r.viaje?.fechaInicio, r.viaje?.fechaTermino)}
                        </Text>

                        <View style={styles.totalsRow}>
                          <Text style={styles.totalBox}>Asignado: $ {Number(r.totalAsignado || 0).toLocaleString("es-CL")}</Text>
                          <Text style={styles.totalBox}>Rendido: $ {Number(r.totalRendido || 0).toLocaleString("es-CL")}</Text>
                        </View>
                        <View style={styles.totalsRow}>
                          <Text style={styles.totalBox}>Diferencia: $ {diferencia.toLocaleString("es-CL")}</Text>
                          <Text style={styles.totalBox}>Resultado: {tipoResultado}</Text>
                        </View>
                        <View style={styles.financeRow}>
                          <Text
                            style={[
                              styles.financeBadge,
                              tipoResultado === "Reembolso"
                                ? styles.financeFavor
                                : tipoResultado === "Devolucion"
                                  ? styles.financeContra
                                  : styles.financeCuadra,
                            ]}
                          >
                            {tipoResultado === "Reembolso"
                              ? "A favor del capacitador"
                              : tipoResultado === "Devolucion"
                                ? "En contra del capacitador"
                              : "Rendicion cuadrada"}
                          </Text>
                        </View>
                        <View style={styles.nextActionBox}>
                          <Text style={styles.nextActionTitle}>{guidance.badge}</Text>
                          <Text style={styles.nextActionHint}>{guidance.prompt}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Detalles</Text>
                        <View style={styles.detailHeaderRow}>
                          <Text style={[styles.detailHeader, styles.colCategoria]}>Categoria</Text>
                          <Text style={[styles.detailHeader, styles.colAsignado]}>Asignado</Text>
                          <Text style={[styles.detailHeader, styles.colRendido]}>Rendido</Text>
                          <Text style={[styles.detailHeader, styles.colAdjuntos]}>Adjuntos</Text>
                        </View>
                        {r.detalles?.map((d) => (
                          <View key={d.id} style={styles.detailRow}>
                            <Text style={[styles.detailLabel, styles.colCategoria]}>{mapCategoriaLabel(d.categoria)}</Text>
                            <Text style={[styles.detailValue, styles.colAsignado]}>
                              $ {Number(d.montoAsignado || 0).toLocaleString("es-CL")}
                            </Text>
                            <Text style={[styles.detailValue, styles.colRendido]}>
                              $ {Number(d.montoRendido || 0).toLocaleString("es-CL")}
                            </Text>
                            <View style={[styles.colAdjuntos, styles.adjuntosWrap]}>
                              {d.adjuntos?.length ? (
                                d.adjuntos.map((a) => (
                                  <Pressable
                                    key={a.id}
                                    style={styles.downloadBtn}
                                    onPress={() => onDownload(a.id, a.nombreArchivo || "adjunto")}
                                  >
                                    <Text style={styles.downloadText}>Descargar</Text>
                                  </Pressable>
                                ))
                              ) : (
                                <Text style={styles.detailHint}>0</Text>
                              )}
                            </View>
                          </View>
                        ))}

                        <Text style={styles.sectionTitle}>Mensaje (si rechazas)</Text>
                        <TextInput
                          value={msgById[r.id] || ""}
                          onChangeText={(value) => setMsgById((prev) => ({ ...prev, [r.id]: value }))}
                          placeholder="Motivo del rechazo"
                          placeholderTextColor={COLORS.muted}
                          style={styles.input}
                        />

                        <View style={styles.actionsRow}>
                          <Pressable style={styles.approveBtn} onPress={() => onResolver(r.id, true)}>
                            <Text style={styles.approveText}>Aprobar</Text>
                          </Pressable>
                          <Pressable style={styles.historyBtn} onPress={() => onJustificar(r.id)}>
                            <Text style={styles.historyBtnText}>Justificar</Text>
                          </Pressable>
                          <Pressable style={styles.rejectBtn} onPress={() => onResolver(r.id, false)}>
                            <Text style={styles.rejectText}>Rechazar</Text>
                          </Pressable>
                        </View>
                        <Text style={styles.ruleHint}>
                          Aprobar registra el saldo financiero (a favor/en contra). Rechazar devuelve la rendicion para correccion.
                        </Text>
                      </View>
                    );
                  })
                : null}
            </View>
          ))}
          {pendientesAgrupados.length > visibleGroups ? (
            <View style={{ marginBottom: 12, alignItems: "center" }}>
              <Pressable style={quickFilterBtn(false)} onPress={() => setVisibleGroups((prev) => prev + 6)}>
                <Text style={quickFilterText(false)}>Mostrar mas capacitadores</Text>
              </Pressable>
            </View>
          ) : null}
          {itemsTotal > 0 ? (
            <View style={styles.pageRow}>
              <Pressable style={quickFilterBtn(itemsPage <= 1)} onPress={() => itemsPage > 1 && load(itemsPage - 1)}>
                <Text style={quickFilterText(false)}>Anterior</Text>
              </Pressable>
              <Text style={styles.pageText}>
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
        </>
      )) : null}
    </ScrollView>
  );
}

function mapCategoriaLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "copec") return "Combustible";
  return value || "Categoria";
}

function quickFilterBtn(active) {
  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: active ? "#BFD4FF" : "#D9E5FF",
    backgroundColor: active ? "#E8F0FF" : "#fff",
  };
}

function quickFilterText(active) {
  return { fontWeight: "900", color: active ? "#1D4ED8" : "#374151", fontSize: 12 };
}

function formatRango(inicio, termino) {
  if (!inicio || !termino) return "";

  const formatearSeguro = (fechaStr) => {
    if (!fechaStr) return "";
    // Cortamos la hora si viene (ej: "2026-03-05T00:00:00" -> "2026-03-05")
    const soloFecha = String(fechaStr).split("T")[0]; 
    const partes = soloFecha.split("-");
    
    // Si logramos separar el Año, Mes y Día, lo armamos a mano (evita el bug de zona horaria)
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    
    // Fallback por si acaso
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return "-";
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return `${formatearSeguro(inicio)} - ${formatearSeguro(termino)}`;
}

function formatFechaCorta(value) {
  if (!value) return "-";
  
  const soloFecha = String(value).split("T")[0];
  const partes = soloFecha.split("-");
  
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function resolveMontoSaldo(item) {
  const dif = Number(item?.diferencia ?? Number(item?.totalRendido || 0) - Number(item?.totalAsignado || 0));
  const pendiente = Number(item?.saldoPendiente || 0);
  if (pendiente > 0) return pendiente;
  return Math.abs(dif);
}

function resolveContadoraGuidance(r, tipoResultado) {
  const estado = String(r?.estado || "").toLowerCase();
  if (estado.includes("justific")) {
    return {
      badge: "Pendiente justificada",
      prompt: "Que hacer ahora: mantener en espera o levantar justificacion.",
    };
  }
  if (tipoResultado === "Reembolso") {
    return {
      badge: "A favor del capacitador",
      prompt: "Que hacer ahora: aprobar para registrar saldo de reembolso.",
    };
  }
  if (tipoResultado === "Devolucion") {
    return {
      badge: "En contra del capacitador",
      prompt: "Que hacer ahora: aprobar para registrar saldo de devolucion.",
    };
  }
  return {
    badge: "Rendicion cuadrada",
    prompt: "Que hacer ahora: aprobar para cerrar sin saldo pendiente.",
  };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    marginBottom: 10,
  },
  groupToggle: { color: COLORS.blue2, fontWeight: "900" },
  groupItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 17 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#EEF3FF" },
  badgeText: { fontWeight: "800", color: COLORS.text, fontSize: 12 },
  line: { marginTop: 4, color: COLORS.text, fontWeight: "700", fontSize: 14 },
  label: { color: COLORS.muted, fontWeight: "800" },
  totalsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  totalBox: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    padding: 12,
    fontWeight: "900",
    color: COLORS.text,
    fontSize: 16,
  },
  sectionTitle: { marginTop: 12, fontWeight: "900", color: COLORS.blue2 },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  detailHeader: { fontWeight: "900", color: COLORS.muted, fontSize: 14 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  detailLabel: { fontWeight: "800", color: COLORS.text, fontSize: 15 },
  detailValue: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  detailHint: { color: COLORS.muted, fontWeight: "700" },
  saldoFilterRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8, flexWrap: "wrap" },
  financeRow: { marginTop: 8 },
  nextActionBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    backgroundColor: "#F5F9FF",
    padding: 10,
  },
  nextActionTitle: { color: COLORS.text, fontWeight: "900" },
  nextActionHint: { marginTop: 2, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  financeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    fontWeight: "900",
    fontSize: 12,
    color: COLORS.text,
  },
  financeFavor: { backgroundColor: "#FFF4E5", borderColor: "#FFD39A" },
  financeContra: { backgroundColor: "#FFEFEF", borderColor: "#F3B6B6" },
  financeCuadra: { backgroundColor: "#E7F8ED", borderColor: "#BFE8CB" },
  ruleHint: { marginTop: 8, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  saldoRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 10,
  },
  movementsWrap: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 8,
    width: "100%",
  },
  historyBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  historyBtnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  colCategoria: { flex: 2.3, textAlign: "left", paddingRight: 12 },
  colAsignado: { flex: 1.2, textAlign: "right" },
  colRendido: { flex: 1.2, textAlign: "right", paddingRight: 12 },
  colAdjuntos: { flex: 1.6, textAlign: "left", paddingLeft: 12 },
  adjuntosWrap: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  downloadBtn: {
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  downloadText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  input: {
    marginTop: 6,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  approveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: { color: "#fff", fontWeight: "900" },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#C62828",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: { color: "#fff", fontWeight: "900" },
  errorText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
  infoText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontWeight: "700" },
  pageRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageText: { color: COLORS.muted, fontWeight: "800" },
});

