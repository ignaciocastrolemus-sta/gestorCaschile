import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, Pressable, StyleSheet, Alert, Modal, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../constants/colors";
import { Card } from "../components/UI";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";
import { exportReportPdf } from "../utils/reportExport";

const API_URL = `${API_BASE}/Rendiciones/encuadre`;
const STORAGE_KEY = "encuadre_rendiciones_filters_v1";

const fmtDate = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const [yyyy, mm, dd] = raw.split("-");
  if (!yyyy || !mm || !dd) return raw;
  return `${dd}/${mm}/${yyyy}`;
};

const fmtMoney = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString("es-CL");
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const MONTH_LABELS = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

const getPeriodoLabel = (value) => {
  if (!value) return "Sin fecha";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return d.toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
};

const getEstadoVisual = (diferencia) => {
  const diff = Number(diferencia || 0);
  if (diff === 0) return { key: "cuadra", label: "Cuadra", color: "#146C43", bg: "#EAF8EF" };
  if (diff > 0) return { key: "faltante", label: "Faltante", color: "#B54708", bg: "#FFF3E8" };
  return { key: "exceso", label: "Exceso", color: "#B42318", bg: "#FEECEC" };
};

const getReembolsoPara = (itemOrDiff) => {
  if (itemOrDiff && typeof itemOrDiff === "object") {
    const fromApi = itemOrDiff.reembolsoPara;
    if (typeof fromApi === "string" && fromApi.trim()) return fromApi;
  }
  const diff = Number(
    itemOrDiff && typeof itemOrDiff === "object" ? itemOrDiff.diferencia : itemOrDiff || 0
  );
  if (diff > 0) return "Capacitador";
  if (diff < 0) return "Empresa";
  return "Sin saldo";
};

const getCombustible = (item) =>
  Number(item?.viaje?.copec ?? item?.viaje?.combustible ?? item?.copec ?? item?.combustible ?? 0);

// Escapa celdas para CSV compatible con Excel.
const csvCell = (value) => {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
};

export default function EncuadreRendiciones({ token }) {
  const today = new Date();
  const defaultMes = String(today.getMonth() + 1).padStart(2, "0");
  const defaultAnio = String(today.getFullYear());
  const persisted = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 14;
  const [filtro, setFiltro] = useState({
    mes: persisted?.filtro?.mes || defaultMes,
    anio: persisted?.filtro?.anio || defaultAnio,
    capacitador: persisted?.filtro?.capacitador || "todos",
    estado: persisted?.filtro?.estado || "todos",
  });
  const [draftFiltro, setDraftFiltro] = useState({
    mes: persisted?.draftFiltro?.mes || defaultMes,
    anio: persisted?.draftFiltro?.anio || defaultAnio,
    capacitador: persisted?.draftFiltro?.capacitador || "todos",
    estado: persisted?.draftFiltro?.estado || "todos",
  });
  const [search, setSearch] = useState(persisted?.search || "");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState("detalle");

  // Mantiene la consulta base al backend y deja los filtros rÃ¡pidos en frontend.
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!token) return;
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el encuadre.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (k, v) => setDraftFiltro((prev) => ({ ...prev, [k]: v }));

  // Opciones dinamicas para filtros.
  const opciones = useMemo(() => {
    const meses = new Set();
    const anios = new Set();
    const capacitadores = new Set();
    const estados = new Set();

    items.forEach((it) => {
      const d = new Date(it?.viaje?.fechaInicio);
      if (!Number.isNaN(d.getTime())) {
        meses.add(String(d.getMonth() + 1).padStart(2, "0"));
        anios.add(String(d.getFullYear()));
      }
      capacitadores.add(it?.viaje?.capacitador || "-");
      estados.add(it?.estado || "-");
    });

    return {
      meses: ["todos", ...Array.from(meses).sort((a, b) => Number(a) - Number(b))],
      anios: ["todos", ...Array.from(anios).sort((a, b) => Number(b) - Number(a))],
      capacitadores: ["todos", ...Array.from(capacitadores).sort((a, b) => a.localeCompare(b, "es"))],
      estados: ["todos", ...Array.from(estados).sort((a, b) => a.localeCompare(b, "es"))],
    };
  }, [items]);

  useEffect(() => {
    if (!opciones.meses.includes(draftFiltro.mes) || !opciones.meses.includes(filtro.mes)) {
      setDraftFiltro((prev) => ({ ...prev, mes: "todos" }));
      setFiltro((prev) => ({ ...prev, mes: "todos" }));
    }
    if (!opciones.anios.includes(draftFiltro.anio) || !opciones.anios.includes(filtro.anio)) {
      setDraftFiltro((prev) => ({ ...prev, anio: "todos" }));
      setFiltro((prev) => ({ ...prev, anio: "todos" }));
    }
  }, [opciones.meses, opciones.anios, draftFiltro.mes, draftFiltro.anio, filtro.mes, filtro.anio]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filtro, draftFiltro, search }));
    } catch {
      // ignore storage errors
    }
  }, [filtro, draftFiltro, search]);

  // Filtrado visual para mantener experiencia rapida.
  const itemsFiltrados = useMemo(() => {
    return items.filter((it) => {
      const d = new Date(it?.viaje?.fechaInicio);
      const mes = !Number.isNaN(d.getTime()) ? String(d.getMonth() + 1).padStart(2, "0") : "sin";
      const anio = !Number.isNaN(d.getTime()) ? String(d.getFullYear()) : "sin";
      const capacitador = it?.viaje?.capacitador || "-";
      const estado = it?.estado || "-";
      const q = normalize(search);

      const okMes = filtro.mes === "todos" || filtro.mes === mes;
      const okAnio = filtro.anio === "todos" || filtro.anio === anio;
      const okCapacitador =
        filtro.capacitador === "todos" || normalize(filtro.capacitador) === normalize(capacitador);
      const okEstado = filtro.estado === "todos" || normalize(filtro.estado) === normalize(estado);
      const searchable = normalize(
        [
          it?.id,
          it?.viaje?.capacitador,
          it?.viaje?.correoCapacitador,
          it?.viaje?.municipio,
          it?.viaje?.regionNombre,
          it?.estado,
        ]
          .filter(Boolean)
          .join(" ")
      );
      const okBusqueda = !q || searchable.includes(q);
      return okMes && okAnio && okCapacitador && okEstado && okBusqueda;
    });
  }, [items, filtro, search]);

  const totalPages = Math.max(1, Math.ceil(itemsFiltrados.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const itemsPaginados = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return itemsFiltrados.slice(start, start + PAGE_SIZE);
  }, [itemsFiltrados, pageSafe, PAGE_SIZE]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const totales = useMemo(() => {
    return itemsFiltrados.reduce(
      (acc, it) => {
        acc.asignado += Number(it.totalAsignado || 0);
        acc.rendido += Number(it.totalRendido || 0);
        acc.diff += Number(it.diferencia || 0);
        if (Number(it.diferencia || 0) === 0) acc.cuadradas += 1;
        return acc;
      },
      { asignado: 0, rendido: 0, diff: 0, cuadradas: 0 }
    );
  }, [itemsFiltrados]);

  const porcentajeCuadrado = itemsFiltrados.length
    ? Math.round((totales.cuadradas / itemsFiltrados.length) * 100)
    : 0;

  const aplicarFiltros = () => {
    setFiltro({ ...draftFiltro });
    setPage(1);
  };

  const limpiarFiltros = () => {
    const base = { mes: defaultMes, anio: defaultAnio, capacitador: "todos", estado: "todos" };
    setDraftFiltro(base);
    setFiltro(base);
    setSearch("");
    setPage(1);
  };

  const descargarCsv = (soloItem) => {
    const sep = ";";
    const rows = (soloItem ? [soloItem] : itemsFiltrados).map((it) => {
      const estadoVisual = getEstadoVisual(it?.diferencia);
      const reembolsoPara = getReembolsoPara(it);
      const combustible = getCombustible(it);
      return [
        it.id,
        it?.viaje?.capacitador || "",
        it?.viaje?.municipio || "",
        it?.viaje?.regionNombre || "",
        getPeriodoLabel(it?.viaje?.fechaInicio),
        it?.estado || "",
        estadoVisual.label,
        reembolsoPara,
        combustible,
        Number(it?.totalAsignado || 0),
        Number(it?.totalRendido || 0),
        Number(it?.diferencia || 0),
      ]
        .map(csvCell)
        .join(sep);
    });

    const encabezado = [
      [csvCell("Fecha de generacion"), csvCell(new Date().toLocaleString("es-CL"))].join(sep),
      [csvCell("Filtro mes"), csvCell(filtro.mes === "todos" ? "Todos" : MONTH_LABELS[filtro.mes] || filtro.mes)].join(sep),
      [csvCell("Filtro año"), csvCell(filtro.anio === "todos" ? "Todos" : filtro.anio)].join(sep),
      [csvCell("Filtro capacitador"), csvCell(filtro.capacitador)].join(sep),
      [csvCell("Filtro estado"), csvCell(filtro.estado)].join(sep),
      [csvCell("Filtro busqueda"), csvCell(search || "Sin filtro")].join(sep),
      "",
      [
        "Id",
        "Capacitador",
        "Destino",
        "Region",
        "Periodo",
        "Estado",
        "Resultado",
        "Reembolso para",
        "Combustible",
        "Total Asignado",
        "Total Rendido",
        "Diferencia",
      ]
        .map(csvCell)
        .join(sep),
    ].join("\r\n");

    // BOM UTF-8 para que Excel lea acentos correctamente.
    const csv = `\uFEFF${encabezado}\r\n${rows.join("\r\n")}\r\n`;

    if (typeof window === "undefined") {
      Alert.alert("Exportar", "La exportacion CSV solo esta habilitada en web.");
      return;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = soloItem ? `encuadre_${soloItem.id}.csv` : "encuadre_rendiciones.csv";
    a.href = url;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exporta una planilla ordenada para Excel desde el encuadre.
  const descargarExcel = (soloItem) => {
    if (typeof window === "undefined") {
      Alert.alert("Exportar", "La exportacion Excel solo esta habilitada en web.");
      return;
    }

    const data = soloItem ? [soloItem] : itemsFiltrados;
    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const rowsHtml = data
      .map((it) => {
        const estadoVisual = getEstadoVisual(it?.diferencia);
        const reembolsoPara = getReembolsoPara(it);
        const combustible = getCombustible(it);
        return `
          <tr>
            <td>${esc(it.id)}</td>
            <td>${esc(it?.viaje?.capacitador || "-")}</td>
            <td>${esc(it?.viaje?.municipio || "-")}</td>
            <td>${esc(it?.viaje?.regionNombre || "-")}</td>
            <td>${esc(getPeriodoLabel(it?.viaje?.fechaInicio))}</td>
            <td>${esc(it?.estado || "-")}</td>
            <td>${esc(estadoVisual.label)}</td>
            <td>${esc(reembolsoPara)}</td>
            <td style="text-align:right">${Number(combustible || 0).toLocaleString("es-CL")}</td>
            <td style="text-align:right">${Number(it?.totalAsignado || 0).toLocaleString("es-CL")}</td>
            <td style="text-align:right">${Number(it?.totalRendido || 0).toLocaleString("es-CL")}</td>
            <td style="text-align:right">${Number(it?.diferencia || 0).toLocaleString("es-CL")}</td>
          </tr>
        `;
      })
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
          <div class="title">Encuadre de rendiciones</div>
          <div class="meta"><b>Fecha:</b> ${esc(new Date().toLocaleString("es-CL"))}</div>
          <div class="meta"><b>Filtro mes:</b> ${esc(filtro.mes === "todos" ? "Todos" : MONTH_LABELS[filtro.mes] || filtro.mes)}</div>
          <div class="meta"><b>Filtro año:</b> ${esc(filtro.anio === "todos" ? "Todos" : filtro.anio)}</div>
          <div class="meta"><b>Filtro capacitador:</b> ${esc(filtro.capacitador)}</div>
          <div class="meta"><b>Filtro estado:</b> ${esc(filtro.estado)}</div>
          <div class="meta"><b>Filtro busqueda:</b> ${esc(search || "Sin filtro")}</div>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Capacitador</th>
                <th>Destino</th>
                <th>Region</th>
                <th>Periodo</th>
                <th>Estado</th>
                <th>Resultado</th>
                <th>Reembolso para</th>
                <th>Combustible</th>
                <th>Total Asignado</th>
                <th>Total Rendido</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="12">Sin datos para exportar</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = soloItem ? `encuadre_${soloItem.id}.xls` : "encuadre_rendiciones.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const descargarPdf = (soloItem) => {
    const data = soloItem ? [soloItem] : itemsFiltrados;
    const ok = exportReportPdf({
      fileName: soloItem ? `encuadre_${soloItem.id}.pdf` : "encuadre_rendiciones.pdf",
      title: "Encuadre de rendiciones",
      subtitle: "Resumen para revision de jefatura",
      meta: [
        { label: "Fecha", value: new Date().toLocaleString("es-CL") },
        { label: "Filtro mes", value: filtro.mes === "todos" ? "Todos" : MONTH_LABELS[filtro.mes] || filtro.mes },
        { label: "Filtro año", value: filtro.anio === "todos" ? "Todos" : filtro.anio },
        { label: "Filtro capacitador", value: filtro.capacitador },
        { label: "Filtro estado", value: filtro.estado },
        { label: "Filtro busqueda", value: search || "Sin filtro" },
      ],
      headers: [
        "Id",
        "Capacitador",
        "Destino",
        "Region",
        "Periodo",
        "Estado",
        "Resultado",
        "Reembolso para",
        "Combustible",
        "Total Asignado",
        "Total Rendido",
        "Diferencia",
      ],
      rows: data.map((it) => [
        { value: it.id },
        { value: it?.viaje?.capacitador || "-" },
        { value: it?.viaje?.municipio || "-" },
        { value: it?.viaje?.regionNombre || "-" },
        { value: getPeriodoLabel(it?.viaje?.fechaInicio) },
        { value: it?.estado || "-" },
        { value: getEstadoVisual(it?.diferencia).label },
        { value: getReembolsoPara(it) },
        { value: `$ ${fmtMoney(getCombustible(it))}`, align: "right" },
        { value: `$ ${fmtMoney(it?.totalAsignado || 0)}`, align: "right" },
        { value: `$ ${fmtMoney(it?.totalRendido || 0)}`, align: "right" },
        { value: `$ ${fmtMoney(it?.diferencia || 0)}`, align: "right" },
      ]),
    });
    if (!ok) Alert.alert("Exportar", "La exportacion PDF solo esta habilitada en web.");
  };

  // Abre modal de detalle/rendicion para el registro seleccionado.
  const openItemModal = (item, mode) => {
    setSelectedItem(item);
    setModalMode(mode);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setModalMode("detalle");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Encuadre de rendiciones"
        subtitle="Control rapido de asignado vs rendido para jefatura."
        secondaryLabel="Actualizar"
        onSecondaryPress={load}
        primaryLabel="Limpiar filtros"
        onPrimaryPress={limpiarFiltros}
      />
      <KpiRow
        items={[
          { key: "asignado", label: "Total asignado", value: `$ ${fmtMoney(totales.asignado)}` },
          { key: "rendido", label: "Total rendido", value: `$ ${fmtMoney(totales.rendido)}` },
          {
            key: "diferencia",
            label: "Diferencia",
            value: `$ ${fmtMoney(totales.diff)}`,
            valueColor: Number(totales.diff) === 0 ? "#146C43" : "#B54708",
          },
          { key: "cuadrado", label: "% cuadrado", value: `${porcentajeCuadrado}%` },
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.filterTitle}>Filtros rapidos</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por capacitador, correo, destino o ID..."
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
        <View style={styles.filterRow}>
          <View style={styles.chipBox}>
            <Text style={styles.chipLabel}>Mes</Text>
            <View style={styles.selectWrap}>
              <Picker
                selectedValue={draftFiltro.mes}
                onValueChange={(v) => onChange("mes", v)}
                style={styles.picker}
              >
                {opciones.meses.map((m) => (
                  <Picker.Item key={m} label={m === "todos" ? "Todos" : MONTH_LABELS[m] || `Mes ${m}`} value={m} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.chipBox}>
            <Text style={styles.chipLabel}>Año</Text>
            <View style={styles.selectWrap}>
              <Picker
                selectedValue={draftFiltro.anio}
                onValueChange={(v) => onChange("anio", v)}
                style={styles.picker}
              >
                {opciones.anios.map((a) => (
                  <Picker.Item key={a} label={a === "todos" ? "Todos" : a} value={a} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.chipBox}>
            <Text style={styles.chipLabel}>Capacitador</Text>
            <View style={styles.selectWrap}>
              <Picker
                selectedValue={draftFiltro.capacitador}
                onValueChange={(v) => onChange("capacitador", v)}
                style={styles.picker}
              >
                {opciones.capacitadores.map((p) => (
                  <Picker.Item key={p} label={p === "todos" ? "Todos" : p} value={p} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.chipBox}>
            <Text style={styles.chipLabel}>Estado</Text>
            <View style={styles.selectWrap}>
              <Picker
                selectedValue={draftFiltro.estado}
                onValueChange={(v) => onChange("estado", v)}
                style={styles.picker}
              >
                {opciones.estados.map((p) => (
                  <Picker.Item key={p} label={p === "todos" ? "Todos" : p} value={p} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryBtn} onPress={aplicarFiltros}>
            <Text style={styles.primaryText}>{loading ? "Cargando..." : "Aplicar"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={limpiarFiltros}>
            <Text style={styles.secondaryText}>Limpiar</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => descargarCsv()}>
            <Text style={styles.secondaryText}>Exportar CSV</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => descargarPdf()}>
            <Text style={styles.secondaryText}>Exportar PDF</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => descargarExcel()}>
            <Text style={styles.secondaryText}>Exportar Excel</Text>
          </Pressable>
        </View>
      </Card>

      {itemsFiltrados.length === 0 ? (
        <StatusMessage tone="info" text="No hay rendiciones." style={{ marginBottom: 0 }} />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={styles.tableMinWidth}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2.1 }]}>Rendicion</Text>
                <Text style={[styles.th, { flex: 1.1 }]}>Reembolso para</Text>
                <Text style={[styles.th, { flex: 1 }]}>Combustible</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Asignado</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Rendido</Text>
                <Text style={[styles.th, { flex: 1.1 }]}>Diferencia</Text>
                <Text style={[styles.th, { flex: 1.1 }]}>Estado</Text>
                <Text style={[styles.th, { flex: 1.6, textAlign: "left" }]}>Acciones</Text>
              </View>

              {itemsPaginados.map((it) => {
                const estadoVisual = getEstadoVisual(it?.diferencia);
                return (
                  <View
                    key={it.id}
                    style={[
                      styles.tableRow,
                      estadoVisual.key === "cuadra" ? styles.rowOk : null,
                      estadoVisual.key === "faltante" ? styles.rowWarn : null,
                      estadoVisual.key === "exceso" ? styles.rowDanger : null,
                    ]}
                  >
                    <View style={{ flex: 2.1 }}>
                      <Text style={styles.rowTitle}>
                        #{it.id} - {it?.viaje?.municipio || "-"}
                      </Text>
                      <Text style={styles.rowSub}>
                        {it?.viaje?.capacitador || "-"} | {fmtDate(it?.viaje?.fechaInicio)} -{" "}
                        {fmtDate(it?.viaje?.fechaTermino)}
                      </Text>
                    </View>

                    <Text style={[styles.td, { flex: 1.1 }]}>{getReembolsoPara(it)}</Text>
                    <Text style={[styles.td, { flex: 1 }]}>$ {fmtMoney(getCombustible(it))}</Text>
                    <Text style={[styles.td, { flex: 1.2 }]}>$ {fmtMoney(it.totalAsignado)}</Text>
                    <Text style={[styles.td, { flex: 1.2 }]}>$ {fmtMoney(it.totalRendido)}</Text>
                    <Text style={[styles.td, { flex: 1.1 }]}>$ {fmtMoney(it.diferencia)}</Text>

                    <View style={{ flex: 1.1 }}>
                      <View style={[styles.statusPill, { backgroundColor: estadoVisual.bg }]}>
                        <Text style={[styles.statusText, { color: estadoVisual.color }]}>
                          {estadoVisual.label}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.rowActions, { flex: 1.6 }]}>
                      <Pressable style={styles.actionBtn} onPress={() => openItemModal(it, "detalle")}>
                        <Text style={styles.actionText}>Ver detalle</Text>
                      </Pressable>
                      <Pressable style={styles.actionBtn} onPress={() => openItemModal(it, "rendicion")}>
                        <Text style={styles.actionText}>Ver rendicion</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.pageRow}>
            <Text style={styles.pageText}>
              Mostrando {itemsPaginados.length} de {itemsFiltrados.length} rendiciones
            </Text>
            <View style={styles.pageActions}>
              <Pressable
                style={[styles.pageBtn, pageSafe <= 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
              >
                <Text style={styles.pageBtnText}>Anterior</Text>
              </Pressable>
              <Text style={styles.pageIndicator}>
                Pagina {pageSafe} de {totalPages}
              </Text>
              <Pressable
                style={[styles.pageBtn, pageSafe >= totalPages && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
              >
                <Text style={styles.pageBtnText}>Siguiente</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      )}

      <StatusMessage tone="error" text={error} style={{ marginTop: 10, marginBottom: 0 }} />

      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={closeItemModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === "detalle" ? "Detalle de encuadre" : "Rendicion del viaje"}
              </Text>
              <Pressable style={styles.modalCloseBtn} onPress={closeItemModal}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </Pressable>
            </View>

            {selectedItem ? (
              <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
                <Text style={styles.modalLine}>Rendicion #{selectedItem.id}</Text>
                <Text style={styles.modalLine}>Capacitador: {selectedItem?.viaje?.capacitador || "-"}</Text>
                <Text style={styles.modalLine}>
                  Destino: {selectedItem?.viaje?.municipio || "-"} ({selectedItem?.viaje?.regionNombre || "-"}
                  )
                </Text>
                <Text style={styles.modalLine}>
                  Fechas: {fmtDate(selectedItem?.viaje?.fechaInicio)} -{" "}
                  {fmtDate(selectedItem?.viaje?.fechaTermino)}
                </Text>
                <Text style={styles.modalLine}>Estado: {selectedItem?.estado || "-"}</Text>

                <View style={styles.modalTotals}>
                  <Text style={styles.modalTotalText}>
                    Asignado: $ {fmtMoney(selectedItem?.totalAsignado || 0)}
                  </Text>
                  <Text style={styles.modalTotalText}>
                    Rendido: $ {fmtMoney(selectedItem?.totalRendido || 0)}
                  </Text>
                  <Text style={styles.modalTotalText}>
                    Diferencia: $ {fmtMoney(selectedItem?.diferencia || 0)}
                  </Text>
                </View>

                {modalMode === "rendicion" ? (
                  <>
                    <Text style={styles.modalBlockTitle}>Categorias rendidas</Text>
                    {Array.isArray(selectedItem?.detalles) && selectedItem.detalles.length > 0 ? (
                      selectedItem.detalles.map((d) => (
                        <View key={d.id ?? `${d.categoria}-${d.montoRendido}`} style={styles.modalDetailRow}>
                          <Text style={styles.modalDetailLabel}>
                            {String(d.categoria || "").toLowerCase() === "copec"
                              ? "Combustible"
                              : d.categoria || "Categoria"}
                          </Text>
                          <Text style={styles.modalDetailValue}>
                            Asig: $ {fmtMoney(d?.montoAsignado || 0)} | Rend: ${" "}
                            {fmtMoney(d?.montoRendido || 0)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.modalHint}>No hay detalle de categorias en este registro.</Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.modalBlockTitle}>Resumen</Text>
                    <Text style={styles.modalHint}>
                      Este panel muestra montos y diferencia para validar si la rendicion cuadra.
                    </Text>
                  </>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterTitle: {
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  chipBox: {
    flex: 1,
    minWidth: 200,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 6,
  },
  selectWrap: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: {
    height: 42,
    color: COLORS.text,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  primaryBtn: {
    height: 40,
    minWidth: 120,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    height: 40,
    minWidth: 110,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: COLORS.blue2, fontWeight: "900" },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F8FAFF",
  },
  tableMinWidth: { minWidth: 1300 },
  th: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.muted,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    gap: 10,
  },
  rowOk: { backgroundColor: "#FAFFFC" },
  rowWarn: { backgroundColor: "#FFFDF8" },
  rowDanger: { backgroundColor: "#FFF9F9" },
  rowTitle: {
    fontWeight: "900",
    color: COLORS.text,
  },
  rowSub: {
    marginTop: 2,
    fontWeight: "700",
    color: COLORS.muted,
    fontSize: 12,
  },
  td: {
    fontWeight: "800",
    color: COLORS.text,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontWeight: "900",
    fontSize: 12,
  },
  rowActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#F3F8FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionText: {
    color: COLORS.blue2,
    fontWeight: "900",
    fontSize: 11,
  },
  pageRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pageText: { color: COLORS.muted, fontWeight: "700" },
  pageActions: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  pageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#EEF3FF",
  },
  pageBtnDisabled: { opacity: 0.45 },
  pageBtnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  pageIndicator: { color: COLORS.text, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 780,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  modalCloseBtn: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F8FAFF",
  },
  modalCloseText: {
    color: COLORS.text,
    fontWeight: "800",
  },
  modalLine: {
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalTotals: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    backgroundColor: "#FAFBFF",
  },
  modalTotalText: {
    color: COLORS.text,
    fontWeight: "800",
    marginBottom: 2,
  },
  modalBlockTitle: {
    marginTop: 8,
    marginBottom: 6,
    color: COLORS.blue2,
    fontWeight: "900",
  },
  modalHint: {
    color: COLORS.muted,
    fontWeight: "700",
  },
  modalDetailRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  modalDetailLabel: {
    color: COLORS.text,
    fontWeight: "800",
  },
  modalDetailValue: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 2,
  },
});

