import React, { useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

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

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, [token]);

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
    if (!form.nombre.trim()) return setError("Nombre es obligatorio.");
    if (!form.fechaInicio || !form.fechaTermino) return setError("Fechas obligatorias.");
    if (!form.diasLimiteRendicion) return setError("Dias limite obligatorios.");

    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        fechaInicio: form.fechaInicio,
        fechaTermino: form.fechaTermino,
        diasLimiteRendicion: Number(form.diasLimiteRendicion),
        activo: form.activo,
      };
      const url = editing
        ? `${API_BASE}/Periodos/${editing.id}`
        : `${API_BASE}/Periodos`;
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
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const onActivateCurrentWeek = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/Periodos/activar-semana-actual`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(e?.message || "No se pudo activar la semana actual.");
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
      diasLimiteRendicion: String(p.diasLimiteRendicion ?? 3),
      activo: !!p.activo,
    });
  };

  const onDelete = (p) => {
    const msg = `¿Eliminar ${p.nombre}?`;
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
      if (!res.ok) throw new Error(await res.text());
      load();
    } catch (e) {
      setError(e?.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Periodos</Text>
      <Text style={dash.h2}>Mantenedor de periodos semanales.</Text>

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
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave}>
            <Text style={styles.primaryText}>{loading ? "Guardando..." : "Guardar"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onActivateCurrentWeek}>
            <Text style={styles.secondaryText}>Activar semana actual</Text>
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
        <Text style={dash.panelTitle}>Listado</Text>
        {items.length === 0 ? (
          <Text style={styles.empty}>No hay periodos.</Text>
        ) : (
          items.map((p) => (
            <View key={p.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{p.nombre}</Text>
                <Text style={styles.listSub}>Inicio: {String(p.fechaInicio).slice(0, 10)}</Text>
                <Text style={styles.listSub}>Termino: {String(p.fechaTermino).slice(0, 10)}</Text>
                <Text style={styles.listSub}>Dias limite: {p.diasLimiteRendicion}</Text>
              </View>
              <View style={styles.listRight}>
                <Text style={styles.badge}>{p.activo ? "Activo" : "Inactivo"}</Text>
                <View style={styles.actions}>
                  <Pressable style={styles.smallBtn} onPress={() => onEdit(p)}>
                    <Text style={styles.smallBtnText}>Editar</Text>
                  </Pressable>
                  <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(p)}>
                    <Text style={styles.smallBtnText}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
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
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  listTitle: { fontWeight: "800", color: COLORS.text },
  listSub: { marginTop: 2, color: COLORS.muted, fontWeight: "700" },
  listRight: { alignItems: "flex-end", gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    fontWeight: "900",
    color: COLORS.text,
  },
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



