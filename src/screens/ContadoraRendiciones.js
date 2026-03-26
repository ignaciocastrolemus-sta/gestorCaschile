import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Modal, useWindowDimensions } from "react-native";
import { useCallback } from "react";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";
import { isSaldoRendicionValida, normalizeText, resolveSaldoEstado, resolveTipoResultado } from "../utils/saldoUtils";
import { groupRendicionesByCapacitador } from "../utils/rendicionGrouping";
import { formatFechaCorta, formatRango, resolveMonthKey, resolveMonthLabel } from "../utils/reportDateUtils";
import { quickFilterBtn, quickFilterText } from "../utils/quickFilterStyles";
import {
  descargarAdjuntoRendicion,
  obtenerHistorialContadora,
  justificarPendienteRendicion,
  levantarJustificacionRendicion,
  obtenerNotificacionesSaldo,
  obtenerRendicionesContadora,
  obtenerRendicionesContadoraPaginadas,
  obtenerRendicionesJustificadas,
  obtenerSaldoMovimientos,
  obtenerSaldos,
  obtenerSaldosPaginados,
  registrarSaldoSecretaria,
  resolverRendicionContadora,
  revertirSaldoRendicion,
} from "../api/rendiciones";
import { exportReportExcel, exportReportPdf } from "../utils/reportExport";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { getHiddenNotificationIds, getVisibleNotifications, hideNotifications } from "../utils/notificationUtils";

// Contadora: lista de rendiciones y resolucion (aprobar/rechazar)
export default function ContadoraRendiciones({ token, viewMode = "all" }) {
  const { width } = useWindowDimensions();
  const compactUi = width < 1200;
  const isMobile = width < 780;
  const [items, setItems] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [historialRevisado, setHistorialRevisado] = useState([]);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsPageSize] = useState(20);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [saldosPage, setSaldosPage] = useState(1);
  const [saldosPageSize] = useState(20);
  const [error, setError] = useState("");
  const [msgById, setMsgById] = useState({});
  const [actionMsg, setActionMsg] = useState("");
  const [saldoFiltros, setSaldoFiltros] = useState({ tipo: "Todos", q: "" });
  const saldoBusquedaDebounced = useDebouncedValue(saldoFiltros.q, 250);
  const [movimientosById, setMovimientosById] = useState({});
  const [movLoadingById, setMovLoadingById] = useState({});
  const [movErrorById, setMovErrorById] = useState({});
  const [movOpenById, setMovOpenById] = useState({});
  const [historyAdjuntosOpenById, setHistoryAdjuntosOpenById] = useState({});
  const [reviewAdjuntosOpenById, setReviewAdjuntosOpenById] = useState({});
  const [revirtiendoByMovId, setRevirtiendoByMovId] = useState({});
  const [justificadas, setJustificadas] = useState([]);
  const [saldoOpenByCap, setSaldoOpenByCap] = useState({});
  const [historyOpenByCap, setHistoryOpenByCap] = useState({});
  const [reviewOpenByCap, setReviewOpenByCap] = useState({});
  const [expandedCaps, setExpandedCaps] = useState({});
  const [visibleGroups, setVisibleGroups] = useState(6);
  const [historialMes, setHistorialMes] = useState("todos");
  const [resolviendoById, setResolviendoById] = useState({});
  const [justificandoById, setJustificandoById] = useState({});
  const [levantandoById, setLevantandoById] = useState({});
  const [registrandoSaldoById, setRegistrandoSaldoById] = useState({});
  const [pendientesQuery, setPendientesQuery] = useState("");
  const [historialQuery, setHistorialQuery] = useState("");
  const [historialRevisadoQuery, setHistorialRevisadoQuery] = useState("");
  const [historialRevisadoEstado, setHistorialRevisadoEstado] = useState("Todos");
  const [confirmacionResolucion, setConfirmacionResolucion] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [hiddenNotiIds, setHiddenNotiIds] = useState(() => getHiddenNotificationIds("contadora"));
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const visibleNotificaciones = useMemo(
    () => getVisibleNotifications(notificaciones, hiddenNotiIds),
    [notificaciones, hiddenNotiIds]
  );

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
      try {
        const data = await obtenerRendicionesContadoraPaginadas(token, page, itemsPageSize);
        setItems(Array.isArray(data?.items) ? data.items : []);
        setItemsTotal(Number(data?.total || 0));
        setItemsPage(Number(data?.page || page));
        setError("");
      } catch {
        const raw = await obtenerRendicionesContadora(token);
        setItems(Array.isArray(raw) ? raw : []);
        setItemsTotal(Array.isArray(raw) ? raw.length : 0);
        setItemsPage(1);
        setError("");
      }
    } catch (e) {
      setError(e?.message || "Error al cargar rendiciones");
    }
  }, [token, itemsPageSize]);

  const loadSaldos = useCallback(async (page = 1) => {
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
  }, [token, saldosPageSize]);

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

  const loadHistorialRevisado = useCallback(async () => {
    try {
      const data = await obtenerHistorialContadora(token);
      setHistorialRevisado(Array.isArray(data) ? data : []);
    } catch {
      setHistorialRevisado([]);
    }
  }, [token]);

  useEffect(() => {
    load(1);
    loadSaldos(1);
    loadJustificadas();
    loadNotificaciones();
    loadHistorialRevisado();
  }, [load, loadSaldos, loadJustificadas, loadNotificaciones, loadHistorialRevisado]);

  const onActualizar = useCallback(() => {
    load(1);
    loadSaldos(1);
    loadJustificadas();
    loadNotificaciones();
    loadHistorialRevisado();
  }, [load, loadSaldos, loadJustificadas, loadNotificaciones, loadHistorialRevisado]);

  const onDownload = async (adjuntoId, filename) => {
    try {
      const blob = await descargarAdjuntoRendicion(token, adjuntoId);
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

  const onResolver = useCallback(async (id, aprobar) => {
    if (resolviendoById[id]) return;
    try {
      setConfirmacionResolucion(null);
      setResolviendoById((prev) => ({ ...prev, [id]: true }));
      setActionMsg("");
      const mensaje = (msgById[id] || "").trim();
      await resolverRendicionContadora(token, id, { aprobar, mensaje });
      setItems((prev) => prev.filter((r) => r.id !== id));
      setActionMsg(aprobar ? "Rendicion aprobada." : "Rendicion rechazada.");
      if (aprobar) loadSaldos(saldosPage);
      loadJustificadas();
      loadHistorialRevisado();
    } catch (e) {
      setActionMsg(e?.message || "Error al resolver rendicion.");
    } finally {
      setResolviendoById((prev) => ({ ...prev, [id]: false }));
    }
  }, [token, saldosPage, loadJustificadas, loadSaldos, loadHistorialRevisado, resolviendoById, msgById]);

  const onJustificar = async (id) => {
    if (justificandoById[id]) return;
    const motivo = typeof window !== "undefined" ? (window.prompt("Motivo (ej: Licencia medica)", "Licencia medica") || "").trim() : "";
    if (!motivo) return;
    const fechaRaw = typeof window !== "undefined" ? window.prompt("Fecha hasta (YYYY-MM-DD, opcional)", "") || "" : "";
    const observacion = typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "") || "" : "";
    try {
      setJustificandoById((prev) => ({ ...prev, [id]: true }));
      const payload = {
        motivo,
        observacion,
        fechaHasta: fechaRaw ? `${fechaRaw}T00:00:00` : null,
      };
      await justificarPendienteRendicion(token, id, payload);
      setActionMsg("Rendicion marcada como pendiente justificada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setActionMsg(e?.message || "No se pudo justificar.");
    } finally {
      setJustificandoById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const onLevantarJustificacion = async (id) => {
    if (levantandoById[id]) return;
    try {
      setLevantandoById((prev) => ({ ...prev, [id]: true }));
      await levantarJustificacionRendicion(token, id);
      setActionMsg("Justificacion levantada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setActionMsg(e?.message || "No se pudo levantar justificacion.");
    } finally {
      setLevantandoById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const onRegistrarSaldo = async (r) => {
    if (registrandoSaldoById[r.id]) return;
    const rawMonto =
      typeof window !== "undefined" ? window.prompt("Monto a registrar", String(r.saldoPendiente || "")) : "";
    const monto = Number(String(rawMonto || "").replace(/[^\d.,-]/g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    const observacion =
      typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "Pago/registro de saldo") || "" : "";

    try {
      setRegistrandoSaldoById((prev) => ({ ...prev, [r.id]: true }));
      await registrarSaldoSecretaria(token, r.id, { monto, observacion });
      setActionMsg("Saldo registrado correctamente.");
      loadSaldos(saldosPage);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo registrar saldo.");
    } finally {
      setRegistrandoSaldoById((prev) => ({ ...prev, [r.id]: false }));
    }
  };

  const loadMovimientos = async (rendicionId) => {
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

  const onSolicitarResolucion = (rendicion, aprobar) => {
    if (!rendicion?.id || resolviendoById[rendicion.id]) return;
    setConfirmacionResolucion({ rendicion, aprobar });
  };

  const onToggleMovimientos = async (rendicionId) => {
    const isOpen = !!movOpenById[rendicionId];
    if (isOpen) {
      setMovOpenById((prev) => ({ ...prev, [rendicionId]: false }));
      return;
    }
    setMovOpenById((prev) => ({ ...prev, [rendicionId]: true }));
    await loadMovimientos(rendicionId);
  };

  const onRevertirMovimiento = async (rendicionId, movimiento) => {
    if (!movimiento?.id || revirtiendoByMovId[movimiento.id]) return;
    const motivo = typeof window !== "undefined" ? window.prompt("Motivo de reversa (obligatorio)", "") || "" : "";
    if (!motivo.trim()) return;
    try {
      setRevirtiendoByMovId((prev) => ({ ...prev, [movimiento.id]: true }));
      await revertirSaldoRendicion(token, rendicionId, { movimientoId: movimiento.id, motivo });
      setActionMsg("Movimiento revertido correctamente.");
      await loadSaldos(saldosPage);
      await loadMovimientos(rendicionId);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo revertir.");
    } finally {
      setRevirtiendoByMovId((prev) => ({ ...prev, [movimiento.id]: false }));
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

  const historialQueryDebounced = useDebouncedValue(historialQuery, 250);
  const historialRevisadoQueryDebounced = useDebouncedValue(historialRevisadoQuery, 250);

  const saldosCerradosBusqueda = useMemo(() => {
    const q = normalizeText(historialQueryDebounced);
    if (!q) return saldosCerradosFiltrados;
    return saldosCerradosFiltrados.filter((r) => {
      const searchable = normalizeText(
        `${r?.id || ""} ${r?.viaje?.capacitador || ""} ${r?.viaje?.municipio || ""} ${r?.viaje?.regionNombre || ""}`
      );
      return searchable.includes(q);
    });
  }, [saldosCerradosFiltrados, historialQueryDebounced]);

  const historialPorCapacitador = useMemo(() => {
    const map = new Map();
    saldosCerradosBusqueda.forEach((r) => {
      const cap = r?.viaje?.capacitador || "Sin nombre";
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(r);
    });
    return Array.from(map.entries()).map(([capacitador, rows]) => ({ capacitador, rows }));
  }, [saldosCerradosBusqueda]);

  const historialRevisadoFiltrado = useMemo(() => {
    const q = normalizeText(historialRevisadoQueryDebounced);
    return (historialRevisado || []).filter((r) => {
      if (historialRevisadoEstado !== "Todos" && String(r?.estado || "") !== historialRevisadoEstado) {
        return false;
      }
      if (!q) return true;
      const searchable = normalizeText(
        `${r?.id || ""} ${r?.estado || ""} ${r?.viaje?.capacitador || ""} ${r?.viaje?.municipio || ""} ${r?.viaje?.regionNombre || ""}`
      );
      return searchable.includes(q);
    });
  }, [historialRevisado, historialRevisadoEstado, historialRevisadoQueryDebounced]);

  const historialRevisadoPorCapacitador = useMemo(() => {
    const map = new Map();
    historialRevisadoFiltrado.forEach((r) => {
      const cap = r?.viaje?.capacitador || "Sin nombre";
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(r);
    });
    return Array.from(map.entries()).map(([capacitador, rows]) => ({ capacitador, rows }));
  }, [historialRevisadoFiltrado]);

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

  const exportSummaryRevisado = useMemo(() => {
    const total = historialRevisadoFiltrado.length;
    const aprobadas = historialRevisadoFiltrado.filter((r) => String(r?.estado || "") === "Aprobada").length;
    const rechazadas = historialRevisadoFiltrado.filter((r) => String(r?.estado || "") === "Rechazada").length;
    return { total, aprobadas, rechazadas };
  }, [historialRevisadoFiltrado]);

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
        subtitle: "Contadora - Rendiciones",
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
          ? exportReportExcel({ fileName: "historial_saldos_contadora.xls", ...config })
          : exportReportPdf({ fileName: "historial_saldos_contadora.pdf", ...config });
      if (!ok) setActionMsg("La exportacion solo esta habilitada en web.");
    },
    [saldosCerradosFiltrados, historialMes, exportSummary]
  );

  const onExportHistorialRevisado = useCallback(
    (type) => {
      const rows = historialRevisadoFiltrado.map((r) => {
        const totalAdjuntos = (r.detalles || []).reduce(
          (acc, detalle) => acc + ((detalle.adjuntos || []).length || 0),
          0
        );
        return [
          { value: formatFechaCorta(r?.fechaEnvio) },
          { value: r.id },
          { value: r?.estado || "-" },
          { value: r?.viaje?.capacitador || "-" },
          { value: r?.viaje?.municipio || "-" },
          { value: r?.viaje?.regionNombre || "-" },
          { value: `$ ${Number(r?.totalRendido || 0).toLocaleString("es-CL")}`, align: "right" },
          { value: totalAdjuntos },
        ];
      });
      const config = {
        title: "Historial de rendiciones revisadas",
        subtitle: "Contadora - Rendiciones",
        meta: [
          { label: "Fecha de generacion", value: new Date().toLocaleString("es-CL") },
          { label: "Estado", value: historialRevisadoEstado },
        ],
        summary: [
          { label: "Registros", value: exportSummaryRevisado.total },
          { label: "Aprobadas", value: exportSummaryRevisado.aprobadas },
          { label: "Rechazadas", value: exportSummaryRevisado.rechazadas },
        ],
        headers: ["Fecha", "Rendicion", "Estado", "Capacitador", "Destino", "Region", "Total rendido", "Adjuntos"],
        rows,
      };
      const ok =
        type === "excel"
          ? exportReportExcel({ fileName: "historial_rendiciones_revisadas_contadora.xls", ...config })
          : exportReportPdf({ fileName: "historial_rendiciones_revisadas_contadora.pdf", ...config });
      if (!ok) setActionMsg("La exportacion solo esta habilitada en web.");
    },
    [historialRevisadoFiltrado, historialRevisadoEstado, exportSummaryRevisado]
  );

  const pendientesQueryDebounced = useDebouncedValue(pendientesQuery, 250);

  const pendientesFiltrados = useMemo(() => {
    const q = normalizeText(pendientesQueryDebounced);
    if (!q) return items;
    return (items || []).filter((r) => {
      const searchable = normalizeText(
        `${r?.id || ""} ${r?.viaje?.capacitador || ""} ${r?.viaje?.municipio || ""} ${r?.viaje?.regionNombre || ""}`
      );
      return searchable.includes(q);
    });
  }, [items, pendientesQueryDebounced]);

  const pendientesAgrupados = useMemo(
    () => groupRendicionesByCapacitador(pendientesFiltrados),
    [pendientesFiltrados]
  );

  const confirmacionResumen = useMemo(() => {
    if (!confirmacionResolucion?.rendicion) return null;
    const rendicion = confirmacionResolucion.rendicion;
    const totalAdjuntos = (rendicion.detalles || []).reduce(
      (acc, detalle) => acc + ((detalle.adjuntos || []).length || 0),
      0
    );
    return {
      totalAdjuntos,
      totalRendido: Number(rendicion.totalRendido || 0),
      accionLabel: confirmacionResolucion.aprobar ? "aprobar" : "rechazar",
      accionBoton: confirmacionResolucion.aprobar ? "Si, aprobar rendicion" : "Si, rechazar rendicion",
      subtitulo: confirmacionResolucion.aprobar
        ? "Al aprobar, se registrara la resolucion financiera de esta rendicion."
        : "Al rechazar, la rendicion volvera al capacitador para correccion.",
    };
  }, [confirmacionResolucion]);

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
    setReviewOpenByCap((prev) => {
      const next = {};
      historialRevisadoPorCapacitador.forEach((g, idx) => {
        next[g.capacitador] = prev[g.capacitador] ?? idx === 0;
      });
      return next;
    });
  }, [historialRevisadoPorCapacitador]);

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

      <StatusMessage tone="error" text={error} />
      <StatusMessage tone="info" text={actionMsg} />

      <View style={styles.card}>
        <View style={styles.actionsRow}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <Pressable style={styles.historyBtn} onPress={() => setShowNotificaciones((v) => !v)}>
            <Text style={styles.historyBtnText}>{showNotificaciones ? "Ocultar" : "Mostrar"}</Text>
          </Pressable>
          <Pressable
            style={styles.historyBtn}
            onPress={() => setHiddenNotiIds(hideNotifications("contadora", visibleNotificaciones))}
          >
            <Text style={styles.historyBtnText}>Marcar todo leido</Text>
          </Pressable>
        </View>
        {!showNotificaciones ? (
          <Text style={styles.detailHint}>Panel contraido.</Text>
        ) : visibleNotificaciones.length === 0 ? (
          <Text style={styles.detailHint}>Sin notificaciones.</Text>
        ) : (
          visibleNotificaciones.map((n) => (
            <View key={`noti-${n.id}`} style={styles.movementsWrap}>
              <Text style={styles.line}>{n.titulo || "Notificacion"}</Text>
              <Text style={styles.detailHint}>
                {formatFechaCorta(n.fechaRegistro)}
                {n.rendicionId ? ` | Rendicion #${n.rendicionId}` : ""}
                {typeof n.monto === "number" ? ` | $ ${Number(n.monto || 0).toLocaleString("es-CL")}` : ""}
              </Text>
              {!!n.mensaje ? <Text style={styles.detailHint}>{n.mensaje}</Text> : null}
            </View>
          ))
        )}
      </View>

      {viewMode !== "rendiciones" ? (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reembolsos y devoluciones pendientes</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pendientes</Text>
            <Text style={styles.summaryValue}>{resumenSaldosPendientes.count}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>A favor</Text>
            <Text style={styles.summaryValue}>$ {resumenSaldosPendientes.montoFavor.toLocaleString("es-CL")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>En contra</Text>
            <Text style={styles.summaryValue}>$ {resumenSaldosPendientes.montoContra.toLocaleString("es-CL")}</Text>
          </View>
        </View>
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
                    const saldoEstadoRaw = normalizeText(r?.saldoEstado || "");
                    const saldoPendiente = Number(r.saldoPendiente || 0);
                    const canRegistrar = saldoEstado === "Pendiente" && saldoPendiente > 0;
                    const devolucionReportada =
                      saldoEstadoRaw === "devolucionreportadacapacitador" && resolveTipoResultado(r) === "Devolucion";
                    return (
                      <View key={`saldo-${r.id}`} style={styles.saldoItemCard}>
                        <View style={styles.saldoItemHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.line}>Rendicion #{r.id} - {r.viaje?.municipio || "-"}</Text>
                            <View style={styles.saldoMetaRow}>
                              <Text
                                style={[
                                  styles.saldoMetaBadge,
                                  resolveTipoResultado(r) === "Reembolso" ? styles.saldoMetaFavor : styles.saldoMetaContra,
                                ]}
                              >
                                {resolveTipoResultado(r)}
                              </Text>
                              <Text
                                style={[
                                  styles.saldoMetaBadge,
                                  saldoEstado === "Pendiente" ? styles.saldoMetaPendiente : styles.saldoMetaCerrado,
                                ]}
                              >
                                {saldoEstado}
                              </Text>
                              <Text style={styles.saldoMonto}>Pendiente: $ {saldoPendiente.toLocaleString("es-CL")}</Text>
                            </View>
                          </View>
                          <View style={styles.saldoActionCol}>
                            {canRegistrar ? (
                              <Pressable
                                style={[styles.approveBtn, styles.saldoActionBtn, registrandoSaldoById[r.id] && { opacity: 0.7 }]}
                                onPress={() => onRegistrarSaldo(r)}
                                disabled={!!registrandoSaldoById[r.id]}
                              >
                                <Text style={styles.approveText}>
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
                              <View style={styles.saldoClosedBtn}>
                                <Text style={styles.saldoClosedText}>Saldo cerrado</Text>
                              </View>
                            )}
                            <Pressable
                              style={[styles.historyBtn, styles.saldoActionBtn, movLoadingById[r.id] && { opacity: 0.7 }]}
                              onPress={() => onToggleMovimientos(r.id)}
                              disabled={!!movLoadingById[r.id]}
                            >
                              <Text style={styles.historyBtnText}>
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
                          <View style={styles.movementsWrap}>
                            {movLoadingById[r.id] ? <Text style={styles.detailHint}>Cargando historial...</Text> : null}
                            {movErrorById[r.id] ? <Text style={styles.detailHint}>{movErrorById[r.id]}</Text> : null}
                            {!movLoadingById[r.id] && !movErrorById[r.id] && !(movimientosById[r.id] || []).length ? (
                              <Text style={styles.detailHint}>Sin movimientos registrados.</Text>
                            ) : null}
                            {(movimientosById[r.id] || []).map((m, idx) => (
                              <View key={`mov-${r.id}-${m.id}`} style={styles.movRow}>
                                <Text style={[styles.detailHint, { flex: 1 }]}>
                                  {formatFechaCorta(m.fechaRegistro)} | {m.tipoOperacion} | $ {Number(m.monto || 0).toLocaleString("es-CL")} |{" "}
                                  {Number(m.saldoAnterior || 0).toLocaleString("es-CL")} {"->"}{" "}
                                  {Number(m.saldoPosterior || 0).toLocaleString("es-CL")}
                                </Text>
                                {idx === 0 && !normalizeText(m.tipoOperacion).includes("reversa") ? (
                                  <Pressable
                                    style={[styles.historyBtn, revirtiendoByMovId[m.id] && { opacity: 0.7 }]}
                                    onPress={() => onRevertirMovimiento(r.id, m)}
                                    disabled={!!revirtiendoByMovId[m.id]}
                                  >
                                    <Text style={styles.historyBtnText}>
                                      {revirtiendoByMovId[m.id] ? "Revirtiendo..." : "Revertir"}
                                    </Text>
                                  </Pressable>
                                ) : null}
                              </View>
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
                  <Pressable
                    style={[styles.historyBtn, levantandoById[r.id] && { opacity: 0.7 }]}
                    onPress={() => onLevantarJustificacion(r.id)}
                    disabled={!!levantandoById[r.id]}
                  >
                    <Text style={styles.historyBtnText}>{levantandoById[r.id] ? "Levantando..." : "Levantar justificacion"}</Text>
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
        <View style={[styles.actionsRow, { marginTop: 8, marginBottom: 8, flexWrap: "wrap" }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthChipRow}>
            {historialMesOptions.map((opt) => {
              const active = historialMes === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.monthChip, active && styles.monthChipActive]}
                  onPress={() => setHistorialMes(opt.value)}
                >
                  <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.historyBtn} onPress={() => onExportHistorial("excel")}>
            <Text style={styles.historyBtnText}>{compactUi ? "Excel" : "Descargar Excel"}</Text>
          </Pressable>
          <Pressable style={styles.historyBtn} onPress={() => onExportHistorial("pdf")}>
            <Text style={styles.historyBtnText}>{compactUi ? "PDF" : "Descargar PDF"}</Text>
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <Text style={styles.searchLabel}>Buscar historial cerrado</Text>
          <TextInput
            value={historialQuery}
            onChangeText={setHistorialQuery}
            placeholder="Buscar por rendicion, capacitador o destino"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
        </View>
        {saldosCerradosBusqueda.length === 0 ? (
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
                    const totalAdjuntos = (r.detalles || []).reduce(
                      (acc, detalle) => acc + ((detalle.adjuntos || []).length || 0),
                      0
                    );
                    return (
                      <View key={`cerrado-${grupo.capacitador}-${r.id}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.grayBorder, paddingTop: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.line}>Rendicion #{r.id} - {r?.viaje?.municipio || "-"}</Text>
                            <Text style={styles.detailHint}>
                              {tipo} cerrado | Monto: $ {monto.toLocaleString("es-CL")} | Fecha: {fecha}
                            </Text>
                            <Text style={styles.detailHint}>Adjuntos disponibles: {totalAdjuntos}</Text>
                          </View>
                          <View style={styles.historyActionStack}>
                            <Pressable
                              style={[styles.historyBtn, totalAdjuntos === 0 && styles.historyBtnDisabled]}
                              onPress={() =>
                                totalAdjuntos > 0
                                  ? setHistoryAdjuntosOpenById((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                                  : null
                              }
                              disabled={totalAdjuntos === 0}
                            >
                              <Text style={[styles.historyBtnText, totalAdjuntos === 0 && styles.historyBtnTextDisabled]}>
                                {historyAdjuntosOpenById[r.id] ? "Ocultar adjuntos" : "Ver adjuntos"}
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[styles.historyBtn, movLoadingById[r.id] && { opacity: 0.7 }]}
                              onPress={() => onToggleMovimientos(r.id)}
                              disabled={!!movLoadingById[r.id]}
                            >
                              <Text style={styles.historyBtnText}>
                                {movLoadingById[r.id]
                                  ? "Cargando..."
                                  : movOpenById[r.id]
                                    ? compactUi ? "Ocultar" : "Ocultar movimientos"
                                    : compactUi ? "Movimientos" : "Ver movimientos"}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                        {historyAdjuntosOpenById[r.id] ? (
                          <View style={styles.historyAdjuntosWrap}>
                            {totalAdjuntos === 0 ? (
                              <Text style={styles.detailHint}>Sin adjuntos para esta rendicion.</Text>
                            ) : (
                              (r.detalles || []).map((detalle) => (
                                <View key={`hist-det-${r.id}-${detalle.id}`} style={styles.historyAdjuntosBlock}>
                                  <Text style={styles.historyAdjuntosTitle}>{mapCategoriaLabel(detalle.categoria)}</Text>
                                  {(detalle.adjuntos || []).length ? (
                                    <View style={styles.historyAdjuntosList}>
                                      {(detalle.adjuntos || []).map((adjunto) => (
                                        <Pressable
                                          key={adjunto.id}
                                          style={styles.downloadBtn}
                                          onPress={() => onDownload(adjunto.id, adjunto.nombreArchivo || "adjunto")}
                                        >
                                          <Text style={styles.downloadText}>
                                            Descargar {adjunto.nombreArchivo || "adjunto"}
                                          </Text>
                                        </Pressable>
                                      ))}
                                    </View>
                                  ) : (
                                    <Text style={styles.detailHint}>Sin adjuntos en esta categoria.</Text>
                                  )}
                                </View>
                              ))
                            )}
                          </View>
                        ) : null}
                        {movOpenById[r.id] ? (
                          <View style={styles.movementsWrap}>
                            {movLoadingById[r.id] ? <Text style={styles.detailHint}>Cargando historial...</Text> : null}
                            {movErrorById[r.id] ? <Text style={styles.detailHint}>{movErrorById[r.id]}</Text> : null}
                            {!movLoadingById[r.id] && !movErrorById[r.id] && !(movimientosById[r.id] || []).length ? (
                              <Text style={styles.detailHint}>Sin movimientos registrados.</Text>
                            ) : null}
                            {(movimientosById[r.id] || []).map((m, idx) => (
                              <View key={`mov-h-${r.id}-${m.id}`} style={styles.movRow}>
                                <Text style={[styles.detailHint, { flex: 1 }]}>
                                  {formatFechaCorta(m.fechaRegistro)} | {m.tipoOperacion} | $ {Number(m.monto || 0).toLocaleString("es-CL")} |{" "}
                                  {Number(m.saldoAnterior || 0).toLocaleString("es-CL")} {"->"}{" "}
                                  {Number(m.saldoPosterior || 0).toLocaleString("es-CL")}
                                </Text>
                                {idx === 0 && !normalizeText(m.tipoOperacion).includes("reversa") ? (
                                  <Pressable
                                    style={[styles.historyBtn, revirtiendoByMovId[m.id] && { opacity: 0.7 }]}
                                    onPress={() => onRevertirMovimiento(r.id, m)}
                                    disabled={!!revirtiendoByMovId[m.id]}
                                  >
                                    <Text style={styles.historyBtnText}>
                                      {revirtiendoByMovId[m.id] ? "Revirtiendo..." : "Revertir"}
                                    </Text>
                                  </Pressable>
                                ) : null}
                              </View>
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
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historial de rendiciones revisadas</Text>
        <View style={[styles.actionsRow, { marginTop: 8, marginBottom: 8, flexWrap: "wrap" }]}>
          <Pressable style={styles.historyBtn} onPress={() => onExportHistorialRevisado("excel")}>
            <Text style={styles.historyBtnText}>{compactUi ? "Excel" : "Descargar Excel"}</Text>
          </Pressable>
          <Pressable style={styles.historyBtn} onPress={() => onExportHistorialRevisado("pdf")}>
            <Text style={styles.historyBtnText}>{compactUi ? "PDF" : "Descargar PDF"}</Text>
          </Pressable>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Registros</Text>
            <Text style={styles.summaryValue}>{historialRevisadoFiltrado.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Aprobadas</Text>
            <Text style={styles.summaryValue}>
              {historialRevisadoFiltrado.filter((r) => String(r?.estado || "") === "Aprobada").length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Rechazadas</Text>
            <Text style={styles.summaryValue}>
              {historialRevisadoFiltrado.filter((r) => String(r?.estado || "") === "Rechazada").length}
            </Text>
          </View>
        </View>
        <View style={styles.saldoFilterRow}>
          {["Todos", "Aprobada", "Rechazada"].map((estado) => {
            const active = historialRevisadoEstado === estado;
            return (
              <Pressable key={estado} style={quickFilterBtn(active)} onPress={() => setHistorialRevisadoEstado(estado)}>
                <Text style={quickFilterText(active)}>{estado}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.searchWrap}>
          <Text style={styles.searchLabel}>Buscar rendiciones revisadas</Text>
          <TextInput
            value={historialRevisadoQuery}
            onChangeText={setHistorialRevisadoQuery}
            placeholder="Buscar por rendicion, capacitador o destino"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
        </View>
        {historialRevisadoFiltrado.length === 0 ? (
          <Text style={styles.detailHint}>No hay rendiciones revisadas para este filtro.</Text>
        ) : (
          historialRevisadoPorCapacitador.map((grupo) => (
            <View key={`review-cap-${grupo.capacitador}`} style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.grayBorder, paddingTop: 10 }}>
              <Pressable
                style={styles.groupHeader}
                onPress={() => setReviewOpenByCap((prev) => ({ ...prev, [grupo.capacitador]: !prev[grupo.capacitador] }))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{grupo.capacitador}</Text>
                  <Text style={styles.detailHint}>Rendiciones revisadas: {grupo.rows.length}</Text>
                </View>
                <Text style={styles.groupToggle}>{reviewOpenByCap[grupo.capacitador] ? "Ocultar" : "Ver"}</Text>
              </Pressable>

              {reviewOpenByCap[grupo.capacitador]
                ? grupo.rows.map((r) => {
                    const totalAdjuntos = (r.detalles || []).reduce(
                      (acc, detalle) => acc + ((detalle.adjuntos || []).length || 0),
                      0
                    );
                    return (
                      <View key={`review-${grupo.capacitador}-${r.id}`} style={styles.reviewItemCard}>
                        <View style={styles.reviewItemHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.line}>Rendicion #{r.id} - {r?.viaje?.municipio || "-"}</Text>
                            <Text style={styles.detailHint}>
                              {r?.estado || "-"} | Fecha: {formatFechaCorta(r?.fechaEnvio)} | Total rendido: $ {Number(r?.totalRendido || 0).toLocaleString("es-CL")}
                            </Text>
                            <Text style={styles.detailHint}>Adjuntos disponibles: {totalAdjuntos}</Text>
                          </View>
                          <Pressable
                            style={[styles.historyBtn, totalAdjuntos === 0 && styles.historyBtnDisabled]}
                            onPress={() =>
                              totalAdjuntos > 0
                                ? setReviewAdjuntosOpenById((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                                : null
                            }
                            disabled={totalAdjuntos === 0}
                          >
                            <Text style={[styles.historyBtnText, totalAdjuntos === 0 && styles.historyBtnTextDisabled]}>
                              {reviewAdjuntosOpenById[r.id] ? "Ocultar adjuntos" : "Ver adjuntos"}
                            </Text>
                          </Pressable>
                        </View>
                        {reviewAdjuntosOpenById[r.id] ? (
                          <View style={styles.historyAdjuntosWrap}>
                            {(r.detalles || []).map((detalle) => (
                              <View key={`review-det-${r.id}-${detalle.id}`} style={styles.historyAdjuntosBlock}>
                                <Text style={styles.historyAdjuntosTitle}>{mapCategoriaLabel(detalle.categoria)}</Text>
                                {(detalle.adjuntos || []).length ? (
                                  <View style={styles.historyAdjuntosList}>
                                    {(detalle.adjuntos || []).map((adjunto) => (
                                      <Pressable
                                        key={adjunto.id}
                                        style={styles.downloadBtn}
                                        onPress={() => onDownload(adjunto.id, adjunto.nombreArchivo || "adjunto")}
                                      >
                                        <Text style={styles.downloadText}>
                                          Descargar {adjunto.nombreArchivo || "adjunto"}
                                        </Text>
                                      </Pressable>
                                    ))}
                                  </View>
                                ) : (
                                  <Text style={styles.detailHint}>Sin adjuntos en esta categoria.</Text>
                                )}
                              </View>
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
        <View style={styles.searchWrap}>
          <Text style={styles.searchLabel}>Buscar rendicion o capacitador</Text>
          <TextInput
            value={pendientesQuery}
            onChangeText={setPendientesQuery}
            placeholder="Buscar por rendicion, capacitador o destino"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
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
                        <View style={[styles.cardHeader, isMobile && styles.cardHeaderMobile]}>
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
                          <Text style={[styles.detailHeader, styles.colCategoria]}>{compactUi ? "Cat." : "Categoria"}</Text>
                          <Text style={[styles.detailHeader, styles.colAsignado]}>{compactUi ? "Asig." : "Asignado"}</Text>
                          <Text style={[styles.detailHeader, styles.colRendido]}>{compactUi ? "Rend." : "Rendido"}</Text>
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
                          <Pressable
                            style={[styles.approveBtn, styles.actionMainBtn, resolviendoById[r.id] && { opacity: 0.7 }]}
                            onPress={() => onSolicitarResolucion(r, true)}
                            disabled={!!resolviendoById[r.id]}
                          >
                            <Text style={styles.approveText}>{resolviendoById[r.id] ? "Procesando..." : "Aprobar"}</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.secondaryBtn, styles.actionMainBtn, justificandoById[r.id] && { opacity: 0.7 }]}
                            onPress={() => onJustificar(r.id)}
                            disabled={!!justificandoById[r.id] || !!resolviendoById[r.id]}
                          >
                            <Text style={styles.secondaryBtnText}>
                              {justificandoById[r.id] ? "Justificando..." : "Justificar"}
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[styles.rejectBtn, styles.actionMainBtn, resolviendoById[r.id] && { opacity: 0.7 }]}
                            onPress={() => onSolicitarResolucion(r, false)}
                            disabled={!!resolviendoById[r.id]}
                          >
                            <Text style={styles.rejectText}>{resolviendoById[r.id] ? "Procesando..." : "Rechazar"}</Text>
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

      <Modal
        transparent
        visible={!!confirmacionResolucion}
        animationType="fade"
        onRequestClose={() => setConfirmacionResolucion(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>
                {confirmacionResolucion?.aprobar ? "Confirmar aprobacion" : "Confirmar rechazo"}
              </Text>
              <Pressable onPress={() => setConfirmacionResolucion(null)} style={styles.confirmCloseBtn}>
                <Text style={styles.confirmCloseText}>X</Text>
              </Pressable>
            </View>

            <Text style={styles.confirmLead}>
              ¿Descargaste la documentacion y estas segura de {confirmacionResumen?.accionLabel} esta rendicion?
            </Text>
            <Text style={styles.confirmSublead}>{confirmacionResumen?.subtitulo}</Text>

            <View style={styles.confirmSummaryBox}>
              <View style={styles.confirmSummaryItem}>
                <Text style={styles.confirmSummaryLabel}>Total rendido</Text>
                <Text style={styles.confirmSummaryValue}>
                  $ {Number(confirmacionResumen?.totalRendido || 0).toLocaleString("es-CL")}
                </Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmSummaryItem}>
                <Text style={styles.confirmSummaryLabel}>Adjuntos cargados</Text>
                <Text style={styles.confirmSummaryValue}>{confirmacionResumen?.totalAdjuntos || 0}</Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <Pressable style={styles.confirmSecondaryBtn} onPress={() => setConfirmacionResolucion(null)}>
                <Text style={styles.confirmSecondaryText}>Volver a revisar</Text>
              </Pressable>
              <Pressable
                style={[
                  confirmacionResolucion?.aprobar ? styles.confirmApproveBtn : styles.confirmRejectBtn,
                  resolviendoById[confirmacionResolucion?.rendicion?.id] && { opacity: 0.7 },
                ]}
                onPress={() =>
                  confirmacionResolucion?.rendicion?.id
                    ? onResolver(confirmacionResolucion.rendicion.id, confirmacionResolucion.aprobar)
                    : null
                }
                disabled={!!resolviendoById[confirmacionResolucion?.rendicion?.id]}
              >
                <Text style={styles.confirmPrimaryText}>
                  {resolviendoById[confirmacionResolucion?.rendicion?.id]
                    ? "Procesando..."
                    : confirmacionResumen?.accionBoton}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function mapCategoriaLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "copec") return "Combustible";
  return value || "Categoria";
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
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardHeaderMobile: { alignItems: "flex-start" },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
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
  sectionTitle: { marginTop: 12, marginBottom: 2, fontWeight: "900", color: COLORS.blue2, fontSize: 15 },
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
  detailHint: { color: COLORS.muted, fontWeight: "700", lineHeight: 18 },
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
  saldoItemCard: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 10,
  },
  saldoItemHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  saldoMetaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  saldoMetaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.text,
  },
  saldoMetaFavor: { backgroundColor: "#FFF4E5", borderColor: "#FFD39A" },
  saldoMetaContra: { backgroundColor: "#FFEFEF", borderColor: "#F3B6B6" },
  saldoMetaPendiente: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  saldoMetaCerrado: { backgroundColor: "#EAF7EF", borderColor: "#BFE7CC" },
  saldoMonto: { color: COLORS.text, fontWeight: "900", fontSize: 12 },
  saldoActionCol: { gap: 8 },
  saldoActionBtn: { minWidth: 150 },
  saldoClosedBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  saldoClosedText: { color: "#4B5563", fontWeight: "900", fontSize: 12 },
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
  movRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  historyBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  historyBtnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  historyBtnDisabled: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  historyBtnTextDisabled: { color: "#9CA3AF" },
  historyActionStack: { gap: 8, alignItems: "flex-end" },
  historyAdjuntosWrap: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 10,
  },
  historyAdjuntosBlock: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  historyAdjuntosTitle: { color: COLORS.text, fontWeight: "900", fontSize: 14, marginBottom: 6 },
  historyAdjuntosList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reviewItemCard: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 10,
  },
  reviewItemHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  searchWrap: { marginBottom: 14 },
  searchLabel: { marginBottom: 6, color: COLORS.text, fontWeight: "900", fontSize: 14 },
  input: {
    marginTop: 6,
    minHeight: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  monthChipRow: { gap: 8, paddingRight: 4 },
  monthChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#fff",
  },
  monthChipActive: {
    backgroundColor: "#E8F0FF",
    borderColor: "#BFD4FF",
  },
  monthChipText: { color: COLORS.muted, fontWeight: "800", fontSize: 12 },
  monthChipTextActive: { color: COLORS.blue2 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  actionMainBtn: { flex: 1, minWidth: 140 },
  approveBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1F7A36",
    borderWidth: 1,
    borderColor: "#17642C",
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryBtnText: { color: COLORS.blue2, fontWeight: "900" },
  rejectBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: "#B42318",
    borderWidth: 1,
    borderColor: "#8F1C13",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: { color: "#fff", fontWeight: "900" },
  emptyText: { color: COLORS.muted, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    backgroundColor: "#F8FAFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  summaryLabel: { color: COLORS.muted, fontWeight: "800", fontSize: 12, marginBottom: 3 },
  summaryValue: { color: COLORS.text, fontWeight: "900", fontSize: 16 },
  pageRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageText: { color: COLORS.muted, fontWeight: "800", minWidth: 130, textAlign: "center" },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(11,29,63,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 760,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    overflow: "hidden",
  },
  confirmHeader: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confirmTitle: { color: COLORS.blue2, fontWeight: "900", fontSize: 20 },
  confirmCloseBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  confirmCloseText: { color: COLORS.muted, fontWeight: "900", fontSize: 22 },
  confirmLead: {
    paddingHorizontal: 24,
    paddingTop: 24,
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 27,
  },
  confirmSublead: {
    paddingHorizontal: 24,
    paddingTop: 10,
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  confirmSummaryBox: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 16,
    backgroundColor: "#F8FAFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  confirmSummaryItem: { flex: 1 },
  confirmSummaryLabel: { color: COLORS.muted, fontWeight: "800", fontSize: 13, marginBottom: 6 },
  confirmSummaryValue: { color: COLORS.text, fontWeight: "900", fontSize: 22 },
  confirmDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#D9E5FF",
  },
  confirmActions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  confirmSecondaryBtn: {
    minWidth: 220,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmSecondaryText: { color: COLORS.muted, fontWeight: "900", fontSize: 16 },
  confirmApproveBtn: {
    minWidth: 220,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmRejectBtn: {
    minWidth: 220,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#B42318",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmPrimaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});




