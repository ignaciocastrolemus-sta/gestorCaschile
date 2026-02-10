import React, { useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

// Admin Roles: crear/editar/eliminar roles

export default function AdminRoles({ token, title }) {
  const [roles, setRoles] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const protectedRoles = new Set([
    "administrador",
    "secretaria",
    "contadora",
    "usuario terreno",
  ]);

  const load = async () => {
    try {
      const [resRoles, resUsers] = await Promise.all([
        fetch(`${API_BASE}/Roles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/Usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!resRoles.ok) throw new Error(await resRoles.text());
      if (!resUsers.ok) throw new Error(await resUsers.text());
      const data = await resRoles.json();
      const users = await resUsers.json();
      setRoles(Array.isArray(data) ? data : []);
      if (Array.isArray(users)) {
        const counts = {};
        users.forEach((u) => {
          const rid = u?.rolId ?? u?.RolId;
          if (!rid) return;
          counts[rid] = (counts[rid] || 0) + 1;
        });
        setUserCounts(counts);
      } else {
        setUserCounts({});
      }
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar roles.");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const onSave = async () => {
    if (!nombre.trim()) {
      setError("Nombre es obligatorio.");
      return;
    }
    try {
      setLoading(true);
      const payload = { nombre: nombre.trim() };
      const url = editing ? `${API_BASE}/Roles/${editing.id}` : `${API_BASE}/Roles`;
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
      setNombre("");
      setEditing(null);
      load();
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const roleName = (rol) => rol?.nombre || rol?.Nombre || "";
  const isProtected = (rol) => protectedRoles.has(roleName(rol).toLowerCase());

  const onEdit = (rol) => {
    if (isProtected(rol)) {
      Alert.alert(
        "Rol protegido",
        "Este rol es parte del sistema y no se puede editar."
      );
      return;
    }
    setEditing(rol);
    setNombre(roleName(rol));
  };

  const onDelete = async (rol) => {
    if (isProtected(rol)) {
      Alert.alert(
        "Rol protegido",
        "Este rol es parte del sistema y no se puede eliminar."
      );
      return;
    }
    const nombreRol = roleName(rol) || "este rol";
    const confirmMsg = `Â¿Eliminar ${nombreRol}?`;
    const proceed =
      typeof window !== "undefined" && typeof window.confirm === "function"
        ? window.confirm(confirmMsg)
        : undefined;

    if (proceed === false) return;
    if (proceed === undefined) {
      Alert.alert("Eliminar rol", confirmMsg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => doDelete(rol),
        },
      ]);
      return;
    }
    doDelete(rol);
  };

  const doDelete = async (rol) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/Roles/${rol.id}`, {
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
      <Text style={dash.h1}>{title || "Roles"}</Text>
      <Text style={dash.h2}>Crea, edita o elimina roles del sistema.</Text>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? "Editar rol" : "Nuevo rol"}</Text>
        <Text style={dash.label}>Nombre</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Administrador"
          placeholderTextColor={COLORS.muted}
          style={dash.input}
        />
        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave}>
            <Text style={styles.primaryText}>
              {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear rol"}
            </Text>
          </Pressable>
          {editing && (
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                setEditing(null);
                setNombre("");
              }}
            >
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Listado</Text>
        {roles.length === 0 ? (
          <Text style={styles.empty}>No hay roles.</Text>
        ) : (
          roles.map((rol) => (
            <View key={rol.id} style={styles.row}>
              <Text style={styles.rowTitle}>
                {roleName(rol) || "(sin nombre)"}
                {isProtected(rol) ? " (Protegido)" : ""}
              </Text>
              <Text style={styles.rowSub}>
                Usuarios: {userCounts[rol.id] || 0}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.smallBtn, isProtected(rol) && styles.smallBtnDisabled]}
                  onPress={() => onEdit(rol)}
                >
                  <Text style={styles.smallBtnText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(rol)}>
                  <Text style={styles.smallBtnText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  rowTitle: { fontWeight: "800", color: COLORS.text },
  rowSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
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
  smallBtnDisabled: {
    opacity: 0.6,
  },
  smallBtnText: { fontWeight: "900", color: COLORS.text, fontSize: 12 },
});



