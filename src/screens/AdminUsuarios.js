import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Picker } from "@react-native-picker/picker";

// Admin Usuarios: crear/editar/desactivar usuarios y asignar rol

export default function AdminUsuarios({ token, title }) {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    cuentaBancaria: "",
    activo: true,
    rolId: "",
  });

  const roleItems = useMemo(() => roles.map((r) => ({ label: r.nombre, value: r.id })), [roles]);

  const load = async () => {
    try {
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${API_BASE}/Usuarios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Roles`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resUsers.ok) throw new Error(await resUsers.text());
      if (!resRoles.ok) throw new Error(await resRoles.text());
      const usersData = await resUsers.json();
      const rolesData = await resRoles.json();
      setUsuarios(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar usuarios.");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setEditing(null);
    setForm({
      nombre: "",
      email: "",
      password: "",
      cuentaBancaria: "",
      activo: true,
      rolId: roles[0]?.id ?? "",
    });
  };

  const onSave = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!editing && !form.password.trim()) {
      setError("Password es obligatorio para crear.");
      return;
    }
    if (!form.rolId) {
      setError("Rol es obligatorio.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        cuentaBancaria: form.cuentaBancaria,
        activo: form.activo,
        rolId: Number(form.rolId),
      };
      const url = editing
        ? `${API_BASE}/Usuarios/${editing.id}`
        : `${API_BASE}/Usuarios`;
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

  const onEdit = (u) => {
    setEditing(u);
    setForm({
      nombre: u.nombre || "",
      email: u.email || "",
      password: "",
      cuentaBancaria: u.cuentaBancaria || "",
      activo: Boolean(u.activo),
      rolId: u.rolId,
    });
  };

  const onDisable = async (u) => {
    Alert.alert("Desactivar usuario", `Â¿Desactivar ${u.email}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/Usuarios/${u.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await res.text());
            load();
          } catch (e) {
            setError(e?.message || "No se pudo desactivar.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>{title || "Usuarios"}</Text>
      <Text style={dash.h2}>Crea, edita o desactiva usuarios. Asigna roles.</Text>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? "Editar usuario" : "Nuevo usuario"}</Text>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={dash.label}>Nombre</Text>
            <TextInput
              value={form.nombre}
              onChangeText={(v) => setField("nombre", v)}
              placeholder="Nombre completo"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => setField("email", v)}
              placeholder="correo@empresa.cl"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              style={dash.input}
            />
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={dash.label}>Password</Text>
            <TextInput
              value={form.password}
              onChangeText={(v) => setField("password", v)}
              placeholder={editing ? "Dejar vacio para no cambiar" : "Nueva contrasena"}
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Cuenta bancaria</Text>
            <TextInput
              value={form.cuentaBancaria}
              onChangeText={(v) => setField("cuentaBancaria", v)}
              placeholder="111-222-333"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={dash.label}>Rol</Text>
            <View style={styles.selectWrap}>
              <Picker
                selectedValue={form.rolId || roleItems[0]?.value}
                onValueChange={(v) => setField("rolId", v)}
                style={styles.picker}
              >
                {roleItems.map((it) => (
                  <Picker.Item key={String(it.value)} label={it.label} value={it.value} />
                ))}
              </Picker>
            </View>
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
            <Text style={styles.primaryText}>
              {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
            </Text>
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
        {usuarios.length === 0 ? (
          <Text style={styles.empty}>No hay usuarios.</Text>
        ) : (
          usuarios.map((u) => (
            <View key={u.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{u.nombre}</Text>
                <Text style={styles.rowSub}>{u.email}</Text>
                <Text style={styles.rowSub}>Rol: {u.rolNombre}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowState}>{u.activo ? "Activo" : "Inactivo"}</Text>
                <View style={styles.actions}>
                  <Pressable style={styles.smallBtn} onPress={() => onEdit(u)}>
                    <Text style={styles.smallBtnText}>Editar</Text>
                  </Pressable>
                  <Pressable style={styles.smallBtnDanger} onPress={() => onDisable(u)}>
                    <Text style={styles.smallBtnText}>Desactivar</Text>
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
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  col: { flex: 1, minWidth: 220 },
  selectWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  picker: { height: 44, color: COLORS.text },
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
  btnRow: { flexDirection: "row", gap: 10, marginTop: 6 },
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  rowTitle: { fontWeight: "800", color: COLORS.text },
  rowSub: { marginTop: 2, color: COLORS.muted, fontWeight: "700" },
  rowRight: { alignItems: "flex-end", gap: 8 },
  rowState: { fontWeight: "900", color: COLORS.text },
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



