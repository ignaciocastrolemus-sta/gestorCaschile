import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { normalizeText } from "../utils/textUtils";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";

// Capacitador: formulario de rendicion con adjuntos y montos
const CATEGORIAS = [
  { key: "bus", label: "Bus Interurbano" },
  { key: "colectivo", label: "Colectivo / Taxi" },
  { key: "transfer", label: "Transfer Aeropuerto" },
  { key: "uber", label: "Uber / Didi / Cabify" },
  { key: "estacionamiento", label: "Estacionamiento / Parquímetro" },
  { key: "peajes", label: "Peajes / TAG" },
  { key: "combustible", label: "Combustible" },
  { key: "varios", label: "Gastos Varios" },
];

export default function CapacitadorRendicion({ token, selectedViajeId, selectedContext }) {
  const [viajes, setViajes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [montos, setMontos] = useState({});
  const [archivos, setArchivos] = useState({});
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filters, setFilters] = useState({ semana: "", estado: "Todos", destino: "" });
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [rendiciones, setRendiciones] = useState([]);
  const scrollRef = useRef(null);
  const gastosPanelYRef = useRef(0);

  const fileInputs = useRef({});

  const fetchViajes = React.useCallback(async () => {
    // Carga viajes asignados al capacitador.
    const res = await fetch(`${API_BASE}/Viajes/mios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Error al cargar viajes");
    }
    const rawData = await res.json();
    const arrayData = Array.isArray(rawData) ? rawData : (rawData?.data || []);

    // LA ADUANA: Convertimos los nombres de C# (PascalCase) a los de JS (camelCase)
    return arrayData.map((v) => ({
      ...v, // Mantiene los datos originales por si acaso
      id: v.id || v.IdAsignacionViaje || v.idAsignacionViaje,
      estado: v.estado || v.Estado || "Pendiente",
      municipio: v.municipio || v.comuna || v.CodigoOt || "Viaje sin destino",
      fechaInicio: v.fechaInicio || v.FechaInicio,
      fechaTermino: v.fechaTermino || v.FechaTermino,
      
      // Normalizamos las columnas rendibles
      montoBus: Number(v.montoBus ?? v.MontoBus ?? 0),
      montoColectivo: Number(v.montoColectivo ?? v.MontoColectivo ?? 0),
      montoTransfer: Number(v.montoTransfer ?? v.MontoTransfer ?? 0),
      montoUber: Number(v.montoUber ?? v.MontoUber ?? 0),
      montoEstacionamiento: Number(v.montoEstacionamiento ?? v.MontoEstacionamiento ?? 0),
      montoPeajes: Number(v.montoPeajes ?? v.MontoPeajes ?? 0),
      montoCombustible: Number(v.montoCombustible ?? v.MontoCombustible ?? 0),
      montoVarios: Number(v.montoVarios ?? v.MontoVarios ?? 0),

      // Normalizamos las comidas
      montoDesayuno: Number(v.montoDesayuno ?? v.MontoDesayuno ?? 0),
      montoAlmuerzo: Number(v.montoAlmuerzo ?? v.MontoAlmuerzo ?? 0),
      montoOnce: Number(v.montoOnce ?? v.MontoOnce ?? 0),
      montoCena: Number(v.montoCena ?? v.MontoCena ?? 0),
      montoViatico: Number(v.montoViatico ?? v.MontoViatico ?? 0),
    }));
  }, [token]);

  const fetchRendiciones = React.useCallback(async () => {
    // Carga rendiciones del capacitador (para saber si un viaje ya fue enviado/aprobado/rechazado).
    const res = await fetch(`${API_BASE}/Rendiciones/mias`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Error al cargar rendiciones");
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, [token]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const lista = await fetchViajes();
        if (!alive) return;
        setViajes(lista);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Error al cargar viajes");
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchViajes]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchRendiciones();
        if (!alive) return;
        setRendiciones(data);
      } catch (_err) {
        if (!alive) return;
        setRendiciones([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchRendiciones]);

  useEffect(() => {
    if (selectedViajeId) {
      setSelectedId(selectedViajeId);
    }
  }, [selectedViajeId]);

  useEffect(() => {
    if (!selectedContext?.focusDevolucion) return;
    setTimeout(() => {
      scrollRef.current?.scrollTo?.({ y: gastosPanelYRef.current || 0, animated: true });
    }, 120);
  }, [selectedContext, selectedId]);

  const rendicionEstadoByViajeId = useMemo(() => {
    const map = new Map();
    (rendiciones || []).forEach((r) => {
      const id = r?.asignacionViajeId ?? r?.viaje?.id ?? r?.viajeId;
      if (!id) return;
      map.set(Number(id), r?.estado || "");
    });
    return map;
  }, [rendiciones]);

  const estadoVistaViaje = React.useCallback(
    (v) => {
      // Estado "real" para el capacitador: si ya existe rendicion, manda el estado de rendicion.
      const rid = rendicionEstadoByViajeId.get(Number(v?.id));
      return rid || v?.estado || "Pendiente";
    },
    [rendicionEstadoByViajeId]
  );

  const esAccionableParaRendir = React.useCallback((estadoRaw) => {
    // En esta pantalla solo se muestran viajes pendientes o rechazados (lo demas va a Carpeta).
    const estado = String(estadoRaw || "").toLowerCase();
    if (!estado) return true;
    if (estado.includes("justific")) return false;
    if (estado.includes("rechaz")) return true;
    if (estado.includes("pend")) return true;
    if (estado.includes("asignado")) return true;
    if (estado.includes("transferido")) return true;
    return false;
  }, []);

  const forcedViajeId = useMemo(() => {
    if (!selectedContext?.focusDevolucion) return 0;
    return Number(selectedViajeId || 0);
  }, [selectedContext, selectedViajeId]);

  const viajesAccionables = useMemo(() => {
    return (viajes || []).filter((v) => esAccionableParaRendir(estadoVistaViaje(v)) || Number(v.id) === forcedViajeId);
  }, [esAccionableParaRendir, estadoVistaViaje, viajes, forcedViajeId]);

  const weekOptions = useMemo(() => buildWeekOptions(viajesAccionables), [viajesAccionables]);
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

  useEffect(() => {
    setMostrarTodos(false);
  }, [filters]);

  const viaje = useMemo(
    () => viajesAccionables.find((v) => v.id === selectedId) || null,
    [viajesAccionables, selectedId]
  );

  const viajesFiltrados = useMemo(() => {
    const q = normalizeText(filters.destino);
    const estado = normalizeText(filters.estado).replace(/\s+/g, "");
    const semana = filters.semana;
    return viajesAccionables.filter((v) => {
      if (estado && estado !== "todos") {
        const estadoViaje = normalizeText(estadoVistaViaje(v) || "Pendiente").replace(/\s+/g, "");
        if (!estadoViaje.includes(estado)) return false;
      }

      if (semana) {
        const start = parseDateInput(v.fechaInicio);
        if (!start || getWeekKey(start) !== semana) return false;
      }

      const destino = normalizeText(v.municipio || v.comuna || "");
      const region = normalizeText(v.regionNombre || v.region || "");
      if (!q) return true;
      return destino.includes(q) || region.includes(q);
    });
  }, [estadoVistaViaje, filters, viajesAccionables]);

  const viajesVisibles = useMemo(() => {
    if (mostrarTodos) return viajesFiltrados;
    return viajesFiltrados.slice(0, 6);
  }, [viajesFiltrados, mostrarTodos]);

  const viajesJustificados = useMemo(() => {
    return (viajes || []).filter((v) => normalizeText(estadoVistaViaje(v)).includes("justific"));
  }, [estadoVistaViaje, viajes]);

  useEffect(() => {
    if (viajesFiltrados.length === 0) {
      setSelectedId(null);
      return;
    }
    const existe = viajesFiltrados.some((v) => v.id === selectedId);
    if (!existe) setSelectedId(viajesFiltrados[0].id);
  }, [viajesFiltrados, selectedId]);

  const asignacionesPorDia = useMemo(() => {
    if (!viaje) return [];
    return [
      { key: "desayuno", label: "Desayuno", monto: Number(viaje.montoDesayuno || viaje.MontoDesayuno || 0) },
      { key: "almuerzo", label: "Almuerzo", monto: Number(viaje.montoAlmuerzo || viaje.MontoAlmuerzo || 0) },
      { key: "once", label: "Once", monto: Number(viaje.montoOnce || viaje.MontoOnce || 0) },
      { key: "cena", label: "Cena", monto: Number(viaje.montoCena || viaje.MontoCena || 0) },
      { key: "viatico", label: "Viático", monto: Number(viaje.montoViatico || viaje.MontoViatico || 0) },
    ];
  }, [viaje]);

  const asignadoPorCategoria = useMemo(() => {
    if (!viaje) return {};
    return {
      bus: Number(viaje.montoBus || viaje.MontoBus || 0),
      colectivo: Number(viaje.montoColectivo || viaje.MontoColectivo || 0),
      transfer: Number(viaje.montoTransfer || viaje.MontoTransfer || 0),
      uber: Number(viaje.montoUber || viaje.MontoUber || 0),
      estacionamiento: Number(viaje.montoEstacionamiento || viaje.MontoEstacionamiento || 0),
      peajes: Number(viaje.montoPeajes || viaje.MontoPeajes || 0),
      combustible: Number(viaje.montoCombustible || viaje.MontoCombustible || 0),
      varios: Number(viaje.montoVarios || viaje.MontoVarios || 0),
    };
  }, [viaje]);

  const subtotalDia = useMemo(
    () => asignacionesPorDia.reduce((acc, it) => acc + it.monto, 0),
    [asignacionesPorDia]
  );

  const totalViaje = useMemo(() => {
    if (!viaje) return 0;
    const total = Number(viaje.montoViaticoTotal || 0);
    if (total > 0) return total;
    const dias = Number(viaje.totalDias || 0);
    return subtotalDia * (dias || 0);
  }, [viaje, subtotalDia]);

  const totalAsignado = useMemo(
    () => Object.values(asignadoPorCategoria).reduce((acc, v) => acc + v, 0),
    [asignadoPorCategoria]
  );

  const totalRendido = useMemo(
    () => Object.values(montos).reduce((acc, v) => acc + Number(v || 0), 0),
    [montos]
  );
  const diferencia = useMemo(() => totalRendido - totalAsignado, [totalRendido, totalAsignado]);
  const tipoResultado = useMemo(() => {
    if (diferencia > 0) return "Reembolso";
    if (diferencia < 0) return "Devolucion";
    return "Cuadrada";
  }, [diferencia]);

  // KPI para resumen rapido de la carga de rendicion.
  const kpiItems = useMemo(
    () => [
      { key: "asignados", label: "Viajes asignados", value: viajes.length },
      { key: "accionables", label: "Pendientes/Rechazadas", value: viajesAccionables.length },
      { key: "filtrados", label: "Filtrados", value: viajesFiltrados.length },
      { key: "asignado", label: "Total asignado", value: `$ ${totalAsignado.toLocaleString("es-CL")}` },
      { key: "rendido", label: "Total rendido", value: `$ ${totalRendido.toLocaleString("es-CL")}` },
    ],
    [viajes.length, viajesAccionables.length, viajesFiltrados.length, totalAsignado, totalRendido]
  );

  const mergeFiles = (current, incoming) => {
    const next = [...(current || [])];
    (incoming || []).forEach((file) => {
      const exists = next.some(
        (f) =>
          f?.name === file?.name &&
          Number(f?.size || 0) === Number(file?.size || 0) &&
          Number(f?.lastModified || 0) === Number(file?.lastModified || 0)
      );
      if (!exists) next.push(file);
    });
    return next;
  };

  const handleFiles = (categoria, fileList) => {
    const list = Array.from(fileList || []);
    setArchivos((prev) => ({ ...prev, [categoria]: mergeFiles(prev[categoria], list) }));
  };

  const openFilePicker = (categoria) => {
    const input = fileInputs.current[categoria];
    if (input && input.click) input.click();
  };

  const clearFiles = (categoria) => {
    setArchivos((prev) => ({ ...prev, [categoria]: [] }));
    const input = fileInputs.current[categoria];
    if (input) input.value = "";
  };

  const validateBeforeSend = () => {
    if (!viaje) return "Debes seleccionar un viaje.";
    for (const cat of CATEGORIAS) {
      const monto = Number(montos[cat.key] || 0);
      if (monto > 0) {
        const files = archivos[cat.key] || [];
        if (files.length === 0) return `Faltan adjuntos para ${cat.label}.`;
      }
    }
    return "";
  };

  const enviarRendicion = async () => {
    setMensaje("");
    const err = validateBeforeSend();
    if (err) {
      setMensaje(err);
      return;
    }

    const detalles = CATEGORIAS.map((c) => ({
      categoria: c.key,
      montoRendido: Number(montos[c.key] || 0),
      observacion: "",
    }));

    const formData = new FormData();
    formData.append("viajeId", String(viaje.id));
    formData.append("detalles", JSON.stringify(detalles));

    CATEGORIAS.forEach((c) => {
      const files = archivos[c.key] || [];
      files.forEach((file) => {
        formData.append(`files.${c.key}`, file);
      });
    });

    try {
      const res = await fetch(`${API_BASE}/Rendiciones`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al enviar rendicion");
      }
      setMensaje("Rendicion enviada correctamente.");
      // Refrescamos para ocultar este viaje (pasa a revision/aprobada) y limpiar el formulario.
      setMontos({});
      setArchivos({});
      try {
        const [listaViajes, listaRendiciones] = await Promise.all([fetchViajes(), fetchRendiciones()]);
        setViajes(listaViajes);
        setRendiciones(listaRendiciones);
      } catch (_err) {
        // Si falla el refresh, mantenemos el mensaje de exito.
      }
    } catch (e) {
      setMensaje(e?.message || "Error al enviar rendicion.");
    }
  };

  const limpiarFiltros = () => setFilters({ semana: "", estado: "Todos", destino: "" });

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader title="Ingresar rendicion de gasto" subtitle="Formulario de rendicion de gastos." />
      <KpiRow items={kpiItems} />

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Selecciona un viaje</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.panelHint}>
          Solo se muestran viajes pendientes o rechazados. Los enviados/aprobados aparecen en "Carpeta de
          viajes".
        </Text>
        {viajesJustificados.length > 0 ? (
          <Text style={styles.panelHint}>
            Tienes {viajesJustificados.length} viaje(s) en estado pendiente justificada (ej. licencia medica). Se
            muestran en Carpeta de viajes, no en esta pantalla de envio.
          </Text>
        ) : null}

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
                <Picker.Item label="Rechazada" value="Rechazada" />
                <Picker.Item label="Aprobada" value="Aprobada" />
                <Picker.Item label="Transferida" value="Transferida" />
              </Picker>
            </View>
          </View>

          <View style={[styles.filterItem, styles.filterSearch]}>
            <Text style={styles.filterLabel}>Destino</Text>
            <TextInput
              value={filters.destino}
              onChangeText={(value) => setFilters((prev) => ({ ...prev, destino: value }))}
              placeholder="Buscar por destino o region"
              placeholderTextColor={COLORS.muted}
              style={styles.searchInput}
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
        <View style={styles.selector}>
          {viajesVisibles.map((v) => {
            // Normalizamos el ID y las fechas para que no falle sin importar cómo vengan del backend
            const viajeId = v.id || v.idAsignacionViaje || v.IdAsignacionViaje;
            const fInicio = v.fechaInicio || v.FechaInicio;
            const fTermino = v.fechaTermino || v.FechaTermino;
            
            // Usamos un nombre de fallback si no tienes municipio o comuna en la BD
            const tituloViaje = v.municipio || v.comuna || v.CodigoOt || `Viaje #${viajeId}`;

            return (
              <Pressable
                key={viajeId}
                style={[styles.selectorItem, viajeId === selectedId && styles.selectorItemActive]}
                onPress={() => setSelectedId(viajeId)}
              >
                <Text style={styles.selectorTitle}>{tituloViaje}</Text>
                <Text style={styles.selectorSub}>
                  {formatRango(fInicio, fTermino)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {viajesFiltrados.length > 6 && (
          <View style={styles.showMoreRow}>
            <Pressable style={styles.showMoreBtn} onPress={() => setMostrarTodos((v) => !v)}>
              <Text style={styles.showMoreText}>
                {mostrarTodos ? "Mostrar menos" : `Mostrar ${viajesFiltrados.length - 6} mas`}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {selectedContext?.focusDevolucion ? (
        <View style={styles.devolucionBox}>
          <Text style={styles.devolucionTitle}>Saldo en contra detectado</Text>
          <Text style={styles.devolucionText}>
            Debes rendir devolucion por $ {Number(selectedContext?.montoPendiente || 0).toLocaleString("es-CL")}
            {selectedContext?.rendicionId ? ` (rendicion #${selectedContext.rendicionId}).` : "."}
          </Text>
          <Text style={styles.devolucionText}>
            Completa montos y adjunta comprobantes para regularizar el saldo.
          </Text>
        </View>
      ) : null}

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Asignaciones por dia</Text>
        <Text style={styles.panelSub}>
          Adjunta documentos o imagenes que validen tus gastos. Debes rendir los montos asignados.
        </Text>

        <View style={styles.cardRow}>
          {asignacionesPorDia.map((item) => (
            <View key={item.key} style={styles.miniCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardAmount}>$ {item.monto.toLocaleString("es-CL")}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalText}>Subtotal: </Text>
          <View style={styles.subtotalBadge}>
            <Text style={styles.subtotalValue}>$ {subtotalDia.toLocaleString("es-CL")}</Text>
          </View>
        </View>

        <View style={styles.totalViajeRow}>
          <Text style={styles.totalViajeText}>Total viaje: </Text>
          <View style={styles.totalViajeBadge}>
            <Text style={styles.totalViajeValue}>$ {totalViaje.toLocaleString("es-CL")}</Text>
          </View>
        </View>
      </View>

      <View
        style={dash.panel}
        onLayout={(e) => {
          gastosPanelYRef.current = e?.nativeEvent?.layout?.y || 0;
        }}
      >
        <Text style={dash.panelTitle}>Gastos ingresados (rendicion de viaje)</Text>
        <Text style={styles.panelSub}>Adjunta documentos por cada categoria para validar tus gastos.</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>Categoria</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Adjuntar documento</Text>
          <Text style={[styles.th, { flex: 1 }]}>Monto asignado</Text>
          <Text style={[styles.th, { flex: 1 }]}>Monto rendido</Text>
        </View>

        {CATEGORIAS.map((row) => (
          <View key={row.key} style={styles.tableRow}>
            <Text style={[styles.td, styles.cell, { flex: 2 }]}>{row.label}</Text>
            <View style={[styles.td, styles.cell, styles.attachCell, { flex: 1.2 }]}>
              <View style={styles.attachActions}>
                <Pressable style={styles.tableBtn} onPress={() => openFilePicker(row.key)}>
                  <Text style={styles.tableBtnText}>Adjuntar</Text>
                </Pressable>
                <Pressable style={styles.clearAttachBtn} onPress={() => clearFiles(row.key)}>
                  <Text style={styles.clearAttachBtnText}>Limpiar</Text>
                </Pressable>
              </View>
              {Platform.OS === "web" && (
                <input
                  ref={(el) => (fileInputs.current[row.key] = el)}
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(row.key, e.target.files)}
                />
              )}
              <Text style={styles.filesHint}>
                {archivos[row.key]?.length ? `${archivos[row.key].length} archivo(s)` : "Sin archivos"}
              </Text>
              {archivos[row.key]?.length > 0 && (
                <Text style={styles.filesHintSub}>Puedes adjuntar mas de un comprobante por categoria.</Text>
              )}
            </View>
            <Text style={[styles.td, styles.cell, styles.amountText, { flex: 1 }]}>
              $ {Number(asignadoPorCategoria[row.key] || 0).toLocaleString("es-CL")}
            </Text>
            <View style={[styles.td, styles.cell, { flex: 1 }]}>
              <TextInput
                placeholder="0"
                placeholderTextColor={COLORS.muted}
                value={montos[row.key] || ""}
                onChangeText={(value) =>
                  setMontos((prev) => ({ ...prev, [row.key]: value.replace(/[^\d]/g, "") }))
                }
                style={styles.montoInput}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Asig. Norma CAS</Text>
          <Text style={styles.totalValue}>$ {totalAsignado.toLocaleString("es-CL")}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total rendido</Text>
          <Text style={styles.totalValue}>$ {totalRendido.toLocaleString("es-CL")}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Diferencia</Text>
          <Text style={styles.totalValue}>$ {diferencia.toLocaleString("es-CL")}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Resultado</Text>
          <Text style={styles.totalValue}>{tipoResultado}</Text>
        </View>
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>
          Puedes enviar con diferencia. Si rindes mas, queda reembolso; si rindes menos, queda saldo por
          devolver.
        </Text>
        <Pressable style={styles.sendBtn} onPress={enviarRendicion}>
          <Text style={styles.sendBtnText}>Enviar rendicion</Text>
        </Pressable>
      </View>

      {!!mensaje && <Text style={styles.messageText}>{mensaje}</Text>}
    </ScrollView>
  );
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

const styles = StyleSheet.create({
  panelSub: { color: COLORS.muted, fontWeight: "700", marginBottom: 12 },
  panelHint: { color: COLORS.muted, fontWeight: "700", marginBottom: 10, fontSize: 12 },
  filterTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  filterTitle: { color: COLORS.text, fontWeight: "900" },
  clearFilterBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  clearFilterBtnText: { fontWeight: "900", color: COLORS.blue2, fontSize: 12 },
  filterBar: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10, alignItems: "flex-end" },
  filterItem: { minWidth: 180, flex: 1 },
  filterSearch: { minWidth: 240 },
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
  filterChipsRow: { marginBottom: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#E8F0FF",
  },
  filterChipText: { fontWeight: "800", color: COLORS.blue2, fontSize: 12 },
  selector: { gap: 8 },
  selectorItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  selectorItemActive: { borderColor: "#BFD4FF", backgroundColor: "#E8F0FF" },
  selectorTitle: { fontWeight: "900", color: COLORS.text },
  selectorSub: { marginTop: 2, fontWeight: "700", color: COLORS.muted },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  showMoreRow: { marginTop: 8, alignItems: "center" },
  showMoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
  },
  showMoreText: { fontWeight: "900", color: COLORS.blue2 },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  miniCard: {
    width: 220,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontWeight: "900", color: COLORS.blue2 },
  cardAmount: { fontWeight: "900", color: COLORS.text },
  subtotalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  subtotalText: { fontWeight: "900", color: COLORS.muted },
  subtotalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  subtotalValue: { fontWeight: "900", color: COLORS.text },
  totalViajeRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  totalViajeText: { fontWeight: "900", color: COLORS.muted },
  totalViajeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E7F8ED",
    borderWidth: 1,
    borderColor: "#BFE8CB",
  },
  totalViajeValue: { fontWeight: "900", color: COLORS.text },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  th: { fontSize: 12, fontWeight: "900", color: COLORS.muted },
  td: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  cell: { paddingRight: 16, paddingLeft: 8 },
  attachCell: { alignItems: "flex-start" },
  attachActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  amountText: { textAlign: "center" },
  tableBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0D2F6B",
    minWidth: 84,
  },
  tableBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  clearAttachBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
    minWidth: 70,
    alignItems: "center",
  },
  clearAttachBtnText: { fontWeight: "900", fontSize: 12, color: COLORS.blue2 },
  filesHint: { marginTop: 6, fontSize: 11, color: COLORS.muted, fontWeight: "700" },
  filesHintSub: { marginTop: 2, fontSize: 11, color: COLORS.muted, fontWeight: "700" },
  montoInput: {
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: COLORS.text,
    textAlign: "center",
  },
  totalRow: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  totalLabel: { fontWeight: "900", color: COLORS.muted },
  totalValue: { fontWeight: "900", color: COLORS.text },
  devolucionBox: {
    marginBottom: 14,
    backgroundColor: "#FFEFEF",
    borderWidth: 1,
    borderColor: "#F3B6B6",
    borderRadius: 12,
    padding: 12,
  },
  devolucionTitle: { fontWeight: "900", color: COLORS.text, marginBottom: 4 },
  devolucionText: { fontWeight: "700", color: COLORS.text, fontSize: 12 },
  alertBox: {
    marginBottom: 14,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#BFD4FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  alertText: { flex: 1, fontWeight: "700", color: COLORS.text },
  sendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.blue2,
    borderWidth: 1,
    borderColor: "#0D2F6B",
  },
  sendBtnText: { fontWeight: "900", color: "#fff" },
  errorText: { color: COLORS.muted, fontWeight: "700" },
  messageText: { color: COLORS.muted, fontWeight: "800", marginBottom: 12 },
});
