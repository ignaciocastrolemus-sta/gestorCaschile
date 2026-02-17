import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Card, Col, Input, Row, SectionTitle, Select } from "../components/UI";
import {
  listarAsignacionesSemanales,
  crearAsignacionSemanal,
  actualizarAsignacionSemanal,
  eliminarAsignacionSemanal,
} from "../api/asignacionesSemanales";
const formatDate = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const [yyyy, mm, dd] = raw.split("-");
  if (!yyyy || !mm || !dd) return raw;
  return `${dd}/${mm}/${yyyy}`;
};

const formatPeriodoLabel = (p) => {
  const nombre = p?.nombre ?? p?.Nombre ?? "Periodo";
  const inicio = formatDate(p?.fechaInicio ?? p?.FechaInicio);
  const termino = formatDate(p?.fechaTermino ?? p?.FechaTermino);
  if (inicio && termino) return `${nombre} (${inicio} - ${termino})`;
  return nombre;
};

export default function AsignacionSemanal({ token }) {
  const [items, setItems] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [capacitadores, setCapacitadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [form, setForm] = useState({
    periodoId: "",
    capacitadorId: "",
    clienteId: "",
    regionId: "",
    observacion: "",
    estado: "Pendiente",
  });
  const [filters, setFilters] = useState({
    periodoId: "",
    capacitadorId: "",
    estado: "",
  });

  const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const toDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const loadCatalogos = useCallback(async () => {
    try {
      const [p, c, cl, r] = await Promise.all([
        fetch(`${API_BASE}/Periodos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Capacitadores`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Clientes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Regiones`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (p.ok) setPeriodos(await p.json());
      if (c.ok) setCapacitadores(await c.json());
      if (cl.ok) setClientes(await cl.json());
      if (r.ok) setRegiones(await r.json());
    } catch {
      // ignore
    }
  }, [token]);

  const load = useCallback(async () => {
    try {
      const data = await listarAsignacionesSemanales(token);
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar asignaciones.");
    }
  }, [token]);

  useEffect(() => {
    load();
    loadCatalogos();
  }, [load, loadCatalogos]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const setFilter = (k, v) => setFilters((prev) => ({ ...prev, [k]: v }));
  const clearFilters = () => {
    setFilters({ periodoId: "", capacitadorId: "", estado: "" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      periodoId: "",
      capacitadorId: "",
      clienteId: "",
      regionId: "",
      observacion: "",
      estado: "Pendiente",
    });
  };

  const onSave = async () => {
    if (!form.periodoId || !form.capacitadorId || !form.clienteId || !form.regionId) {
      setError("Periodo, capacitador, cliente y region son obligatorios.");
      return;
    }
    const periodoActivo = periodosActivosItems.some((p) => String(p.value) === String(form.periodoId));
    if (!periodoActivo) {
      setError("El periodo seleccionado no esta activo.");
      return;
    }
    const dup = items.find((it) => {
      const itId = it.id ?? it.Id;
      if (editing && String(itId) === String(editing.id)) return false;
      const samePeriodo = String(it.periodoId ?? it.PeriodoId) === String(form.periodoId);
      const sameCap = String(it.capacitadorId ?? it.CapacitadorId) === String(form.capacitadorId);
      const sameCliente = String(it.clienteId ?? it.ClienteId) === String(form.clienteId);
      return samePeriodo && sameCap && sameCliente;
    });
    if (dup) {
      setError("Ya existe una asignacion con el mismo periodo, capacitador y cliente.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        periodoId: Number(form.periodoId),
        capacitadorId: Number(form.capacitadorId),
        clienteId: Number(form.clienteId),
        regionId: Number(form.regionId),
        observacion: form.observacion,
        estado: form.estado,
      };
      if (editing) {
        await actualizarAsignacionSemanal(token, editing.id, payload);
        Alert.alert("Asignacion", "Asignacion semanal actualizada.");
      } else {
        await crearAsignacionSemanal(token, payload);
        Alert.alert("Asignacion", "Asignacion semanal creada.");
      }
      resetForm();
      load();
    } catch (e) {
      setError(e?.message || "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (it) => {
    setEditing(it);
    setForm({
      periodoId: String(it.periodoId ?? it.PeriodoId ?? ""),
      capacitadorId: String(it.capacitadorId ?? it.CapacitadorId ?? ""),
      clienteId: String(it.clienteId ?? it.ClienteId ?? ""),
      regionId: String(it.regionId ?? it.RegionId ?? ""),
      observacion: it.observacion ?? it.Observacion ?? "",
      estado: it.estado ?? it.Estado ?? "Pendiente",
    });
  };

  const onDelete = (it) => {
    const id = it?.id ?? it?.Id;
    if (!id) {
      setError("No se pudo eliminar: falta el Id.");
      return;
    }

    const msg = "¿Eliminar asignacion semanal?";
    const proceed =
      typeof window !== "undefined" && typeof window.confirm === "function" ? window.confirm(msg) : undefined;

    if (proceed === false) return;
    if (proceed === undefined) {
      Alert.alert("Eliminar", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => doDelete(id),
        },
      ]);
      return;
    }

    doDelete(id);
  };

  const doDelete = async (id) => {
    try {
      setLoading(true);
      await eliminarAsignacionSemanal(token, id);
      load();
      Alert.alert("Asignacion", "Asignacion semanal eliminada.");
    } catch (e) {
      setError(e?.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  const periodosItems = useMemo(
    () =>
      (Array.isArray(periodos) ? periodos : [])
        .filter((p) => {
          const d = toDate(p.fechaInicio ?? p.FechaInicio);
          if (!d) return false;
          return d.getFullYear() === Number(selectedYear) && d.getMonth() === selectedMonth;
        })
        .map((p) => ({
          label: formatPeriodoLabel(p),
          value: String(p.id ?? p.Id),
          activo: (p.activo ?? p.Activo) === true,
        })),
    [periodos, selectedMonth, selectedYear]
  );

  // Para crear nuevas asignaciones solo se muestran semanas activas.
  const periodosActivosItems = useMemo(() => periodosItems.filter((p) => p.activo), [periodosItems]);

  const yearItems = useMemo(() => {
    const years = new Set();
    (Array.isArray(periodos) ? periodos : []).forEach((p) => {
      const d = toDate(p.fechaInicio ?? p.FechaInicio);
      if (d) years.add(d.getFullYear());
    });
    if (years.size === 0) years.add(selectedYear);
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((y) => ({ label: String(y), value: String(y) }));
  }, [periodos, selectedYear]);

  const capacitadoresItems = useMemo(
    () =>
      (Array.isArray(capacitadores) ? capacitadores : [])
        .filter((c) => (c.activo ?? c.Activo) !== false)
        .map((c) => ({
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

  const regionesItems = useMemo(
    () =>
      (Array.isArray(regiones) ? regiones : []).map((r) => ({
        label: r.nombre ?? r.Nombre,
        value: String(r.id ?? r.Id),
      })),
    [regiones]
  );

  const getLabel = (items, value) => items.find((i) => String(i.value) === String(value))?.label || value;

  // Diccionario global para renderizar semana en el listado sin depender del filtro mensual.
  const periodosLabelById = useMemo(() => {
    const map = {};
    (Array.isArray(periodos) ? periodos : []).forEach((p) => {
      const id = String(p.id ?? p.Id ?? "");
      if (!id) return;
      map[id] = formatPeriodoLabel(p);
    });
    return map;
  }, [periodos]);

  useEffect(() => {
    if (form.periodoId && !periodosItems.some((p) => String(p.value) === String(form.periodoId))) {
      setForm((prev) => ({ ...prev, periodoId: "" }));
    }
    if (filters.periodoId && !periodosItems.some((p) => String(p.value) === String(filters.periodoId))) {
      setFilters((prev) => ({ ...prev, periodoId: "" }));
    }
  }, [periodosItems, form.periodoId, filters.periodoId]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const periodoOk =
        !filters.periodoId || String(it.periodoId ?? it.PeriodoId) === String(filters.periodoId);
      const capOk =
        !filters.capacitadorId ||
        String(it.capacitadorId ?? it.CapacitadorId) === String(filters.capacitadorId);
      const estadoVal = (it.estado ?? it.Estado ?? "").toString();
      const estadoOk = !filters.estado || estadoVal === filters.estado;
      return periodoOk && capOk && estadoOk;
    });
  }, [items, filters]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <SectionTitle title="Asignacion semanal" subtitle="Crea asignaciones por semana." />

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.formTitle}>Seleccion de mes y año</Text>
        <View style={styles.formDivider} />
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
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
              items={yearItems}
            />
          </View>
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.formTitle}>Nueva asignacion semanal</Text>
        <View style={styles.formDivider} />
        <Row gap={16}>
          <Col>
            <Text style={styles.formLabel}>📅 Semana (Periodo)</Text>
            <Select
              value={form.periodoId}
              onValueChange={(v) => setField("periodoId", v)}
              items={[{ label: "Selecciona", value: "" }, ...periodosActivosItems]}
            />
          </Col>
          <Col>
            <Text style={styles.formLabel}>👤 Capacitador</Text>
            <Select
              value={form.capacitadorId}
              onValueChange={(v) => setField("capacitadorId", v)}
              items={[{ label: "Selecciona", value: "" }, ...capacitadoresItems]}
            />
          </Col>
        </Row>

        <Row gap={16} style={{ marginTop: 12 }}>
          <Col>
            <Text style={styles.formLabel}>🏛️ Cliente</Text>
            <Select
              value={form.clienteId}
              onValueChange={(v) => setField("clienteId", v)}
              items={[{ label: "Selecciona", value: "" }, ...clientesItems]}
            />
          </Col>
          <Col>
            <Text style={styles.formLabel}>🗺️ Region</Text>
            <Select
              value={form.regionId}
              onValueChange={(v) => setField("regionId", v)}
              items={[{ label: "Selecciona", value: "" }, ...regionesItems]}
            />
          </Col>
        </Row>

        <Row gap={16} style={{ marginTop: 12 }}>
          <Col>
            <Text style={styles.formLabel}>📌 Estado</Text>
            <Select
              value={form.estado}
              onValueChange={(v) => setField("estado", v)}
              items={[
                { label: "Pendiente", value: "Pendiente" },
                { label: "Asignada", value: "Asignada" },
                { label: "Completada", value: "Completada" },
              ]}
            />
          </Col>
          <Col>
            <Text style={styles.formLabel}>📝 Observacion</Text>
            <Input
              value={form.observacion}
              onChangeText={(v) => setField("observacion", v)}
              placeholder="Opcional"
            />
          </Col>
        </Row>

        <View style={styles.formActions}>
          <Pressable style={[dash.saveBtn, styles.formPrimaryBtn]} onPress={onSave}>
            <Text style={dash.saveText}>{loading ? "Guardando..." : "Guardar"}</Text>
          </Pressable>
          <Pressable
            style={styles.formClearBtn}
            onPress={() => {
              resetForm();
              setError("");
            }}
          >
            <Text style={styles.formClearBtnText}>Limpiar formulario</Text>
          </Pressable>
        </View>
        {!!error && <Text style={{ marginTop: 8, color: COLORS.muted, fontWeight: "700" }}>{error}</Text>}
      </Card>

      <Card style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtros rapidos</Text>
        <View style={styles.filterDivider} />
        <Row gap={12} style={styles.filterRow}>
          <Col>
            <Text style={styles.filterLabel}>📅 Semana</Text>
            <Select
              value={filters.periodoId}
              onValueChange={(v) => setFilter("periodoId", v)}
              items={[{ label: "Todos", value: "" }, ...periodosItems]}
            />
          </Col>
          <Col>
            <Text style={styles.filterLabel}>👤 Capacitador</Text>
            <Select
              value={filters.capacitadorId}
              onValueChange={(v) => setFilter("capacitadorId", v)}
              items={[{ label: "Todos", value: "" }, ...capacitadoresItems]}
            />
          </Col>
          <Col>
            <Text style={styles.filterLabel}>📍 Estado</Text>
            <Select
              value={filters.estado}
              onValueChange={(v) => setFilter("estado", v)}
              items={[
                { label: "Todos", value: "" },
                { label: "Pendiente", value: "Pendiente" },
                { label: "Asignada", value: "Asignada" },
                { label: "Completada", value: "Completada" },
              ]}
            />
          </Col>
        </Row>
        <View style={styles.filterActions}>
          <Pressable style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Limpiar filtros</Text>
          </Pressable>
        </View>
      </Card>

      <SectionTitle title="Listado" />
      {filteredItems.length === 0 ? (
        <Text style={{ color: COLORS.muted, fontWeight: "700" }}>No hay asignaciones.</Text>
      ) : (
        filteredItems.map((it) => (
          <View key={it.id} style={styles.listRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>Id: {it.id}</Text>
              <Text style={styles.listSub}>
                Semana:{" "}
                {periodosLabelById[String(it.periodoId ?? it.PeriodoId)] ||
                  String(it.periodoId ?? it.PeriodoId)}
              </Text>
              <Text style={styles.listSub}>
                Capacitador: {getLabel(capacitadoresItems, it.capacitadorId ?? it.CapacitadorId)}
              </Text>
              <Text style={styles.listSub}>
                Cliente: {getLabel(clientesItems, it.clienteId ?? it.ClienteId)}
              </Text>
              <Text style={styles.listSub}>
                Region: {getLabel(regionesItems, it.regionId ?? it.RegionId)}
              </Text>
              <Text style={styles.listSub}>Estado: {it.estado ?? it.Estado}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.smallBtn} onPress={() => onEdit(it)}>
                <Text style={styles.smallBtnText}>Editar</Text>
              </Pressable>
              <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(it)}>
                <Text style={styles.smallBtnText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  formDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  formActions: { marginTop: 6, gap: 8 },
  formPrimaryBtn: { marginTop: 0 },
  formClearBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  formClearBtnText: { fontWeight: "800", color: COLORS.blue2 },
  formLabel: { marginBottom: 6, color: COLORS.text, fontWeight: "700" },
  filterCard: { marginBottom: 16 },
  filterTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  filterDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  filterRow: { alignItems: "flex-start" },
  filterActions: { marginTop: 10, alignItems: "flex-start" },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  clearBtnText: { fontWeight: "800", color: COLORS.blue2 },
  filterLabel: { marginBottom: 6, color: COLORS.text, fontWeight: "700" },
  monthRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  monthChip: {
    paddingVertical: 6,
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
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  listTitle: { fontWeight: "900", color: COLORS.text },
  listSub: { marginTop: 2, color: COLORS.muted, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E8F0FF",
    borderWidth: 1,
    borderColor: "#BFD4FF",
  },
  smallBtnDanger: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#FFEFEF",
    borderWidth: 1,
    borderColor: "#F3B6B6",
  },
  smallBtnText: { fontWeight: "900", color: COLORS.text, fontSize: 12 },
});
