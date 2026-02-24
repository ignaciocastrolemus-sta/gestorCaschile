import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/httpClient";

// Admin Periodos: CRUD de periodos semanales
export default function AdminPeriodos({ token }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    fechaInicio: "",
    fechaTermino: "",
    diasLimiteRendicion: "3",
    activo: true,
  });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const toDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const filteredItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter((p) => {
      const d = toDate(p.fechaInicio ?? p.FechaInicio);
      if (!d) return false;
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [items, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    const total = filteredItems.length;
    const activas = filteredItems.filter((p) => Boolean(p.activo ?? p.Activo)).length;
    const inactivas = total - activas;
    return { total, activas, inactivas };
  }, [filteredItems]);
  const globalSummary = useMemo(() => {
    const total = items.length;
    const activas = items.filter((p) => Boolean(p.activo ?? p.Activo)).length;
    const inactivas = total - activas;
    const anios = new Set(
      items.map((p) => String(p.fechaInicio || "").slice(0, 4)).filter((v) => v && v !== "0001")
    ).size;
    return { total, activas, inactivas, anios };
  }, [items]);

  const load = useCallback(async () => {
    try {
      const data = await apiGet("/Periodos", { token });
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar periodos.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setEditing(null);
    setForm({
      nombre: "",
      fechaInicio: "",
      fechaTermino: "",
      diasLimiteRendicion: "3",
      activo: true,
    });
  };

  const onSave = async () => {
    if (loading) return;
    if (!form.nombre.trim()) return setError("Nombre es obligatorio.");
    if (!form.fechaInicio || !form.fechaTermino) return setError("Fechas obligatorias.");
    if (!form.diasLimiteRendicion) return setError("Dias limite obligatorios.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(form.fechaTermino)) {
      return setError("Formato de fecha invalido. Usa YYYY-MM-DD.");
    }
    const fi = new Date(`${form.fechaInicio}T00:00:00`);
    const ft = new Date(`${form.fechaTermino}T00:00:00`);
    if (Number.isNaN(fi.getTime()) || Number.isNaN(ft.getTime())) return setError("Fechas invalidas.");
    if (fi > ft) return setError("Fecha inicio no puede ser mayor que fecha termino.");
    if (Number(form.diasLimiteRendicion) <= 0) return setError("Dias limite debe ser mayor a 0.");

    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        fechaInicio: form.fechaInicio,
        fechaTermino: form.fechaTermino,
        diasLimiteRendicion: Number(form.diasLimiteRendicion),
        activo: form.activo,
      };
      if (editing) {
        await apiPut(`/Periodos/${editing.id}`, payload, { token });
      } else {
        await apiPost("/Periodos", payload, { token });
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const onActivateCurrentWeek = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await apiPost("/Periodos/activar-semana-actual", {}, { token });
      await load();
    } catch (e) {
      setError(e?.message || "No se pudo activar la semana actual.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (p) => {
    if (loading) return;
    setEditing(p);
    setForm({
      nombre: p.nombre || "",
      fechaInicio: (p.fechaInicio || "").slice(0, 10),
      fechaTermino: (p.fechaTermino || "").slice(0, 10),
      diasLimiteRendicion: String(p.diasLimiteRendicion ?? 3),
      activo: !!p.activo,
    });
  };

  const onDelete = (p) => {
    if (loading) return;
    const msg = `Â¿Eliminar ${p.nombre}?`;
    const proceed = typeof window !== "undefined" && window.confirm ? window.confirm(msg) : undefined;
    if (proceed === false) return;
    if (proceed === undefined) {
      Alert.alert("Eliminar periodo", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => doDelete(p.id) },
      ]);
      return;
    }
    doDelete(p.id);
  };

  const doDelete = async (id) => {
    if (loading) return;
    try {
      setLoading(true);
      await apiDelete(`/Periodos/${id}`, { token });
      await load();
    } catch (e) {
      setError(e?.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Periodos"
        subtitle="Mantenedor de periodos semanales."
        secondaryLabel="Actualizar"
        onSecondaryPress={load}
        primaryLabel="Limpiar formulario"
        onPrimaryPress={resetForm}
      />
      <KpiRow
        items={[
          { key: "total", label: "Total semanas", value: globalSummary.total },
          { key: "activas", label: "Semanas activas", value: globalSummary.activas, valueColor: "#0D8A42" },
          {
            key: "inactivas",
            label: "Semanas inactivas",
            value: globalSummary.inactivas,
            valueColor: "#C2410C",
          },
          { key: "anios", label: "AÃ±os cargados", value: globalSummary.anios },
        ]}
      />

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? "Editar periodo" : "Nuevo periodo"}</Text>

        <Text style={dash.label}>Nombre</Text>
        <TextInput
          value={form.nombre}
          onChangeText={(v) => setField("nombre", v)}
          placeholder="Semana 05 - 2026"
          placeholderTextColor={COLORS.muted}
          style={dash.input}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={dash.label}>Fecha inicio (lunes)</Text>
            <TextInput
              value={form.fechaInicio}
              onChangeText={(v) => setField("fechaInicio", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Fecha termino (viernes)</Text>
            <TextInput
              value={form.fechaTermino}
              onChangeText={(v) => setField("fechaTermino", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={dash.label}>Dias limite rendicion</Text>
            <TextInput
              value={form.diasLimiteRendicion}
              onChangeText={(v) => setField("diasLimiteRendicion", v.replace(/[^\d]/g, ""))}
              placeholder="3"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Activo</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, form.activo && styles.toggleBtnActive]}
                onPress={() => setField("activo", true)}
              >
                <Text style={[styles.toggleText, form.activo && styles.toggleTextActive]}>Si</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, !form.activo && styles.toggleBtnActive]}
                onPress={() => setField("activo", false)}
              >
                <Text style={[styles.toggleText, !form.activo && styles.toggleTextActive]}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? "Guardando..." : "Guardar"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onActivateCurrentWeek} disabled={loading}>
            <Text style={styles.secondaryText}>Activar semana actual</Text>
          </Pressable>
          {editing && (
            <Pressable style={styles.secondaryBtn} onPress={resetForm} disabled={loading}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          )}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Periodos por mes</Text>
        <View style={styles.monthWrap}>
          <Text style={styles.monthTitle}>Mes</Text>
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
            <View style={styles.yearControl}>
              <Pressable style={styles.yearBtn} onPress={() => setSelectedYear((y) => y - 1)}>
                <Text style={styles.yearBtnText}>-</Text>
              </Pressable>
              <Text style={styles.yearValue}>{selectedYear}</Text>
              <Pressable style={styles.yearBtn} onPress={() => setSelectedYear((y) => y + 1)}>
                <Text style={styles.yearBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Semanas</Text>
              <Text style={styles.summaryValue}>{summary.total}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Activas</Text>
              <Text style={styles.summaryValue}>{summary.activas}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Inactivas</Text>
              <Text style={styles.summaryValue}>{summary.inactivas}</Text>
            </View>
          </View>
        </View>

        {filteredItems.length === 0 ? (
          <Text style={styles.empty}>No hay semanas para este mes.</Text>
        ) : (
          <View style={styles.cardsGrid}>
            {filteredItems.map((p) => {
              const fi = String(p.fechaInicio).slice(0, 10);
              const ft = String(p.fechaTermino).slice(0, 10);
              return (
                <View key={p.id} style={styles.weekCard}>
                  <View style={styles.weekHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekTitle}>{p.nombre}</Text>
                      <Text style={styles.weekSub}>
                        {fi} - {ft}
                      </Text>
                    </View>
                    <View
                      style={[styles.statusBadge, p.activo ? styles.statusActive : styles.statusInactive]}
                    >
                      <Text style={styles.statusText}>{p.activo ? "Activa" : "Inactiva"}</Text>
                    </View>
                  </View>
                  <Text style={styles.weekMeta}>Dias limite: {p.diasLimiteRendicion}</Text>
                  <View style={styles.actions}>
                    <Pressable style={styles.smallBtn} onPress={() => onEdit(p)} disabled={loading}>
                      <Text style={styles.smallBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(p)} disabled={loading}>
                      <Text style={styles.smallBtnText}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1 },
  toggleRow: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  toggleBtnActive: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  toggleText: { fontWeight: "900", color: COLORS.text },
  toggleTextActive: { color: COLORS.blue2 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  secondaryText: { color: COLORS.blue2, fontWeight: "900" },
  error: { marginTop: 8, color: COLORS.muted, fontWeight: "800" },
  empty: { color: COLORS.muted, fontWeight: "800" },
  monthWrap: { marginBottom: 12 },
  monthTitle: { fontWeight: "900", color: COLORS.text, marginBottom: 8 },
  monthRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  monthChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  monthChipActive: { backgroundColor: COLORS.blue2, borderColor: COLORS.blue2 },
  monthText: { fontWeight: "900", color: COLORS.text },
  monthTextActive: { color: "#fff" },
  yearControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  yearBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  yearBtnText: { fontWeight: "900", color: COLORS.blue2 },
  yearValue: { fontWeight: "900", color: COLORS.text },
  summaryRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 12,
    padding: 10,
  },
  summaryLabel: { fontWeight: "800", color: COLORS.muted, fontSize: 12 },
  summaryValue: { fontWeight: "900", color: COLORS.text, fontSize: 18, marginTop: 4 },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  weekCard: {
    width: 320,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
  },
  weekHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  weekTitle: { fontWeight: "900", color: COLORS.text },
  weekSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
  weekMeta: { marginTop: 8, color: COLORS.muted, fontWeight: "800" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusActive: { backgroundColor: "#E7F8ED", borderColor: "#BFE8CB" },
  statusInactive: { backgroundColor: "#FFEFEF", borderColor: "#F3B6B6" },
  statusText: { fontWeight: "900", color: COLORS.text },
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


