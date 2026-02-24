import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";

// Vista exclusiva para gestionar los Periodos Anuales (Tarifas Macro)
export default function AdminPeriodos({ token }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Formulario alineado con PeriodoCreateUpdateDto (sin limite de rendicion)
  const [form, setForm] = useState({
    nombre: "",
    fechaInicio: "",
    fechaTermino: "",
    activo: true,
  });

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const toDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Filtramos los periodos solo por el año seleccionado
  const filteredItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter((p) => {
      // Tomamos la fecha (ej: "2026-01-01T00:00:00") y cortamos los primeros 4 caracteres
      const rawDate = String(p.fechaInicio ?? p.FechaInicio ?? "");
      if (rawDate.length < 4 || rawDate.startsWith("0001")) return false; // Ignoramos fechas nulas de .NET
      
      const anioPeriodo = parseInt(rawDate.substring(0, 4), 10);
      return anioPeriodo === selectedYear;
    });
  }, [items, selectedYear]);

  // Resumen global para los KPIs
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
      const res = await fetch(`${API_BASE}/Periodos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
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
      activo: true,
    });
  };

  const onSave = async () => {
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.fechaInicio || !form.fechaTermino) return setError("Las fechas son obligatorias.");

    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        fechaInicio: form.fechaInicio,
        fechaTermino: form.fechaTermino, // Hace match con [JsonPropertyName("fechaTermino")] del backend
        activo: form.activo,
      };
      
      const url = editing ? `${API_BASE}/Periodos/${editing.id}` : `${API_BASE}/Periodos`;
      const method = editing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error(await res.text());
      resetForm();
      load();
    } catch (e) {
      setError(e?.message || "Error al guardar el periodo.");
    } finally {
      setLoading(false);
    }
  };

  const onActivateCurrentPeriod = async () => {
    try {
      setLoading(true);
      setError("");
      // Este endpoint apaga todos y enciende el que coincide con la fecha de hoy
      const res = await fetch(`${API_BASE}/Periodos/activar-semana-actual`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
      Alert.alert("Éxito", "El periodo actual ha sido activado en base a la fecha de hoy.");
    } catch (e) {
      setError(e?.message || "No se pudo activar el periodo actual.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (p) => {
    setEditing(p);
    setForm({
      nombre: p.nombre || "",
      fechaInicio: (p.fechaInicio || "").slice(0, 10),
      fechaTermino: (p.fechaTermino || "").slice(0, 10),
      activo: !!p.activo,
    });
  };

  const onDelete = (p) => {
    const msg = `¿Eliminar el periodo ${p.nombre}? Si tiene tarifas asociadas, el sistema bloqueará la acción.`;
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
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/Periodos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.mensaje || "Error al eliminar");
      }
      load();
    } catch (e) {
      setError(e?.message || "No se pudo eliminar el periodo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Periodos (Tarifas)"
        subtitle="Mantenedor de periodos anuales y macro."
        secondaryLabel="Actualizar"
        onSecondaryPress={load}
        primaryLabel="Limpiar formulario"
        onPrimaryPress={resetForm}
      />
      
      <KpiRow
        items={[
          { key: "total", label: "Total Periodos", value: globalSummary.total },
          { key: "activas", label: "Activos", value: globalSummary.activas, valueColor: "#0D8A42" },
          { key: "inactivas", label: "Inactivos", value: globalSummary.inactivas, valueColor: "#C2410C" },
          { key: "anios", label: "Años en sistema", value: globalSummary.anios },
        ]}
      />

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? "Editar Periodo" : "Nuevo Periodo"}</Text>

        <Text style={dash.label}>Nombre del Periodo</Text>
        <TextInput
          value={form.nombre}
          onChangeText={(v) => setField("nombre", v)}
          placeholder="Ej: Año 2026 o Temporada Verano"
          placeholderTextColor={COLORS.muted}
          style={dash.input}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={dash.label}>Fecha de inicio</Text>
            <TextInput
              value={form.fechaInicio}
              onChangeText={(v) => setField("fechaInicio", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Fecha de término</Text>
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
            <Text style={dash.label}>Estado del Periodo</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, form.activo && styles.toggleBtnActive]}
                onPress={() => setField("activo", true)}
              >
                <Text style={[styles.toggleText, form.activo && styles.toggleTextActive]}>Activo</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, !form.activo && styles.toggleBtnActive]}
                onPress={() => setField("activo", false)}
              >
                <Text style={[styles.toggleText, !form.activo && styles.toggleTextActive]}>Inactivo</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave}>
            <Text style={styles.primaryText}>{loading ? "Guardando..." : "Guardar Periodo"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onActivateCurrentPeriod}>
            <Text style={styles.secondaryText}>Activar Periodo Actual</Text>
          </Pressable>
          {editing && (
            <Pressable style={styles.secondaryBtn} onPress={resetForm}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          )}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={dash.panel}>
        <View style={styles.headerRow}>
            <Text style={dash.panelTitle}>Listado de Periodos</Text>
            
            {/* Solo dejamos el control de Año */}
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

        {filteredItems.length === 0 ? (
          <Text style={styles.empty}>No se encontraron periodos configurados para el año {selectedYear}.</Text>
        ) : (
          <View style={styles.cardsGrid}>
            {filteredItems.map((p) => {
              const fi = String(p.fechaInicio).slice(0, 10);
              const ft = String(p.fechaTermino).slice(0, 10);
              return (
                <View key={p.id} style={styles.periodCard}>
                  <View style={styles.periodHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.periodTitle}>{p.nombre}</Text>
                      <Text style={styles.periodSub}>
                        {fi} al {ft}
                      </Text>
                    </View>
                    <View
                      style={[styles.statusBadge, p.activo ? styles.statusActive : styles.statusInactive]}
                    >
                      <Text style={styles.statusText}>{p.activo ? "Activo" : "Inactivo"}</Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable style={styles.smallBtn} onPress={() => onEdit(p)}>
                      <Text style={styles.smallBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(p)}>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
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
    justifyContent: "center"
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    justifyContent: "center"
  },
  secondaryText: { color: COLORS.blue2, fontWeight: "900" },
  error: { marginTop: 8, color: COLORS.muted, fontWeight: "800" },
  empty: { color: COLORS.muted, fontWeight: "800", marginTop: 10 },
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
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  periodCard: {
    width: 320,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
  },
  periodHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  periodTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  periodSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusActive: { backgroundColor: "#E7F8ED", borderColor: "#BFE8CB" },
  statusInactive: { backgroundColor: "#FFEFEF", borderColor: "#F3B6B6" },
  statusText: { fontWeight: "900", color: COLORS.text, fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
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