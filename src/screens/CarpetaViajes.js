import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, Pressable, Alert, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import dash from "../styles/dashboardStyles";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import { isSaldoRendicionValida, normalizeText, resolveSaldoEstado, resolveTipoResultado } from "../utils/saldoUtils";
import { groupRendicionesByCapacitador } from "../utils/rendicionGrouping";
import { obtenerSaldoMovimientos } from "../api/rendiciones";
import { exportReportExcel, exportReportPdf } from "../utils/reportExport";

// Secretaria: rendiciones recibidas y envio a contadora.
export default function CarpetaViajes({ token, viewMode = "all" }) {
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
      const res = await fetch(`${API_BASE}/Rendiciones/secretaria/paged?page=${page}&pageSize=${itemsPageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const fallback = await fetch(`${API_BASE}/Rendiciones/secretaria`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!fallback.ok) {
          const txt = await fallback.text();
          throw new Error(txt || "Error al cargar rendiciones");
        }
        const data = await fallback.json();
        setItems(Array.isArray(data) ? data : []);
        setItemsTotal(Array.isArray(data) ? data.length : 0);
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
  }, [token, itemsPage, itemsPageSize]);

  const loadSaldos = useCallback(async (page = saldosPage) => {
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
  }, [token, saldosPage, saldosPageSize]);

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
    load();
    loadSaldos();
    loadJustificadas();
  }, [load, loadSaldos, loadJustificadas]);

  const onActualizar = useCallback(() => {
    load(1);
    loadSaldos(1);
    loadJustificadas();
  }, [load, loadSaldos, loadJustificadas]);

  const onEnviarContadora = async (id) => {
    try {
      setInfo("");
      const res = await fetch(`${API_BASE}/Rendiciones/${id}/enviar-contadora`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo enviar");
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
      setInfo("Rendicion enviada a contadora.");
      load(itemsPage);
      loadSaldos(saldosPage);
      loadJustificadas();
    } catch (e) {
      setInfo(e?.message || "No se pudo enviar.");
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
      setInfo("Rendicion marcada como pendiente justificada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setInfo(e?.message || "No se pudo justificar.");
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
      setInfo("Justificacion levantada.");
      load(itemsPage);
      loadJustificadas();
    } catch (e) {
      setInfo(e?.message || "No se pudo levantar justificacion.");
    }
  };

  const onRegistrarSaldo = async (r) => {
    const rawMonto =
      typeof window !== "undefined" ? window.prompt("Monto a registrar", String(r.saldoPendiente || "")) : "";
    const monto = Number(String(rawMonto || "").replace(/[^\d.,-]/g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    const observacion =
      typeof window !== "undefined" ? window.prompt("Observacion (opcional)", "Registro de saldo") || "" : "";
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
      setInfo("Saldo registrado correctamente.");
      loadSaldos(saldosPage);
    } catch (e) {
      setInfo(e?.message || "No se pudo registrar saldo.");
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

      {viewMode !== "saldos" ? (
      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Pendientes de revision</Text>
        {!!error && <Text style={{ color: "#6B7280", fontWeight: "700" }}>{error}</Text>}
        {!!info && <Text style={{ color: "#6B7280", fontWeight: "700" }}>{info}</Text>}

        {pendientesAgrupados.length === 0 ? (
          <Text style={{ color: "#6B7280", fontWeight: "700", marginTop: 8 }}>
            No hay rendiciones pendientes.
          </Text>
        ) : (
          <>
            {pendientesAgrupados.slice(0, visibleGroups).map((grupo) => (
              <View
                key={grupo.key}
                style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 10 }}
              >
                <Pressable
                  style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  onPress={() => setExpandedCaps((prev) => ({ ...prev, [grupo.key]: !prev[grupo.key] }))}
                >
                  <View>
                    <Text style={dash.docTitle}>{grupo.capacitador}</Text>
                    <Text style={dash.docSub}>
                      Rendiciones: {grupo.count} | Asignado: $ {grupo.totalAsignado.toLocaleString("es-CL")} |
                      Rendido: $ {grupo.totalRendido.toLocaleString("es-CL")}
                    </Text>
                  </View>
                  <Text style={{ color: "#1D4ED8", fontWeight: "900" }}>
                    {expandedCaps[grupo.key] ? "Ocultar" : "Ver"}
                  </Text>
                </Pressable>
                {expandedCaps[grupo.key]
                  ? grupo.rows.map((item) => (
                      <ViajeRowCard
                        key={item.id}
                        data={item}
                        onEnviar={() => onEnviarContadora(item.id)}
                        onJustificar={() => onJustificar(item.id)}
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
                  >
                    <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>Levantar justificacion</Text>
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
                    const saldoPendiente = Number(r.saldoPendiente || 0);
                    const canRegistrar = saldoEstado === "Pendiente" && saldoPendiente > 0;
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
                              <Pressable style={[dash.docBtn, { backgroundColor: "#1D4ED8" }]} onPress={() => onRegistrarSaldo(r)}>
                                <Text style={dash.docBtnText}>
                                  {resolveTipoResultado(r) === "Reembolso" ? "Registrar pago" : "Registrar devolucion"}
                                </Text>
                              </Pressable>
                            ) : (
                              <View style={[dash.docBtn, { backgroundColor: "#E5E7EB" }]}>
                                <Text style={[dash.docBtnText, { color: "#4B5563" }]}>Saldo cerrado</Text>
                              </View>
                            )}
                            <Pressable
                              style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]}
                              onPress={() => onToggleMovimientos(r.id)}
                            >
                              <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>
                                {movOpenById[r.id] ? "Ocultar movimientos" : "Ver movimientos"}
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
            <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>Descargar Excel</Text>
          </Pressable>
          <Pressable
            style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]}
            onPress={() => onExportHistorial("pdf")}
          >
            <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>Descargar PDF</Text>
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
                            style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]}
                            onPress={() => onToggleMovimientos(r.id)}
                          >
                            <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>
                              {movOpenById[r.id] ? "Ocultar movimientos" : "Ver movimientos"}
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

function ViajeRowCard({ data, onEnviar, onJustificar }) {
  const onDownload = () => {
    Alert.alert("Adjuntos", "Los adjuntos se validan en backend. Descarga sera agregada luego.");
  };
  const detalles = Array.isArray(data.detalles) ? data.detalles : [];
  const totalAdjuntos = detalles.reduce((acc, d) => acc + (d.adjuntos?.length || 0), 0);
  const diferencia = Number(data.diferencia ?? Number(data.totalRendido || 0) - Number(data.totalAsignado || 0));
  const tipoResultado =
    data.tipoResultado || (diferencia > 0 ? "Reembolso" : diferencia < 0 ? "Devolucion" : "Cuadrada");
  const guidance = resolveGuidance(data);
  return (
    <View style={dash.docRow}>
      <View style={{ flex: 1 }}>
        <Text style={[dash.docTitle, { fontSize: 17 }]}>Rendicion #{data.id}</Text>
        <View style={guidance.badgeStyle}>
          <Text style={guidance.badgeTextStyle}>{guidance.badgeLabel}</Text>
        </View>
        <Text style={[dash.docSub, { fontSize: 13 }]}>
          Capacitador: {data.viaje?.capacitador || "-"} - {data.viaje?.regionNombre || "-"} -{" "}
          {data.viaje?.municipio || "-"}
        </Text>
        <Text style={[dash.docSub, { fontSize: 13 }]}>
          Fechas: {formatRango(data.viaje?.fechaInicio, data.viaje?.fechaTermino)}
        </Text>
        <Text style={[dash.docSub, { fontSize: 14, fontWeight: "800", color: "#111827" }]}>
          Asignado: $ {Number(data.totalAsignado || 0).toLocaleString("es-CL")} - Rendido: ${" "}
          {Number(data.totalRendido || 0).toLocaleString("es-CL")}
        </Text>
        <Text style={[dash.docSub, { fontSize: 14, fontWeight: "800", color: "#111827" }]}>
          Diferencia: $ {diferencia.toLocaleString("es-CL")} - Resultado: {tipoResultado}
        </Text>
        <Text style={dash.docSub}>Adjuntos: {totalAdjuntos}</Text>
        <Text style={[dash.docSub, { color: "#1D4ED8", fontWeight: "800" }]}>{guidance.prompt}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Pressable style={[dash.docBtn, { backgroundColor: "#1D4ED8" }]} onPress={onEnviar}>
          <Text style={dash.docBtnText}>Enviar a contadora</Text>
        </Pressable>
        <Pressable style={dash.docBtn} onPress={onDownload}>
          <Text style={dash.docBtnText}>Ver adjuntos</Text>
        </Pressable>
        <Pressable style={[dash.docBtn, { backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" }]} onPress={onJustificar}>
          <Text style={[dash.docBtnText, { color: "#1D4ED8" }]}>Justificar</Text>
        </Pressable>
      </View>
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

function formatFechaCorta(value) {
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

function resolveMonthKey(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function resolveMonthLabel(key) {
  if (!key || !key.includes("-")) return "Sin mes";
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}



