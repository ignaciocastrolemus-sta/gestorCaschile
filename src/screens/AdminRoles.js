import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/httpClient";

// Admin Roles: crear/editar/eliminar roles

export default function AdminRoles({ token, title }) {
  const [roles, setRoles] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [usersByRole, setUsersByRole] = useState({});
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const protectedRoles = new Set(["administrador", "secretaria", "contadora", "usuario terreno"]);

  const load = useCallback(async () => {
    try {
      const [data, users] = await Promise.all([apiGet("/Roles", { token }), apiGet("/Usuarios", { token })]);
      setRoles(Array.isArray(data) ? data : []);
      if (Array.isArray(users)) {
        const counts = {};
        const groupedUsers = {};
        users.forEach((u) => {
          const rid = u?.rolId ?? u?.RolId;
          if (!rid) return;
          counts[rid] = (counts[rid] || 0) + 1;
          if (!groupedUsers[rid]) groupedUsers[rid] = [];
          const nombre = u?.nombre ?? u?.Nombre ?? "";
          const email = u?.email ?? u?.Email ?? "";
          groupedUsers[rid].push(nombre || email || "Usuario");
        });
        setUserCounts(counts);
        setUsersByRole(groupedUsers);
      } else {
        setUserCounts({});
        setUsersByRole({});
      }
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar roles.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (loading) return;
    if (!nombre.trim()) {
      setError("Nombre es obligatorio.");
      return;
    }
    try {
      setLoading(true);
      const payload = { nombre: nombre.trim() };
      if (editing) {
        await apiPut(`/Roles/${editing.id}`, payload, { token });
      } else {
        await apiPost("/Roles", payload, { token });
      }
      setNombre("");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const roleName = (rol) => rol?.nombre || rol?.Nombre || "";
  const isProtected = (rol) => protectedRoles.has(roleName(rol).toLowerCase());

  const onEdit = (rol) => {
    if (loading) return;
    if (isProtected(rol)) {
      Alert.alert("Rol protegido", "Este rol es parte del sistema y no se puede editar.");
      return;
    }
    setEditing(rol);
    setNombre(roleName(rol));
  };

  const onDelete = async (rol) => {
    if (loading) return;
    if (isProtected(rol)) {
      Alert.alert("Rol protegido", "Este rol es parte del sistema y no se puede eliminar.");
      return;
    }
    const nombreRol = roleName(rol) || "este rol";
    const confirmMsg = `¿Eliminar ${nombreRol}?`;
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
    if (loading) return;
    try {
      setLoading(true);
      await apiDelete(`/Roles/${rol.id}`, { token });
      await load();
    } catch (e) {
      setError(e?.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  const totalRoles = roles.length;
  const totalProtegidos = roles.filter((r) => isProtected(r)).length;
  const totalEditables = totalRoles - totalProtegidos;
  const totalUsuariosConRol = Object.values(userCounts).reduce((acc, n) => acc + Number(n || 0), 0);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title={title || "Roles"}
        subtitle="Crea, edita o elimina roles del sistema."
        secondaryLabel="Actualizar"
        onSecondaryPress={load}
      />
      <KpiRow
        items={[
          { key: "total", label: "Total roles", value: totalRoles },
          { key: "protegidos", label: "Protegidos", value: totalProtegidos, valueColor: "#C2410C" },
          { key: "editables", label: "Editables", value: totalEditables, valueColor: "#0D8A42" },
          { key: "usuarios", label: "Usuarios con rol", value: totalUsuariosConRol },
        ]}
      />

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
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave} disabled={loading}>
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
              disabled={loading}
            >
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={dash.panel}>
        <View style={styles.listHeader}>
          <Text style={dash.panelTitle}>Listado</Text>
          <Text style={styles.listHint}>Roles activos y protegidos del sistema</Text>
        </View>
        {roles.length === 0 ? (
          <Text style={styles.empty}>No hay roles.</Text>
        ) : (
          <View style={styles.grid}>
            {roles.map((rol) => {
              const nombre = roleName(rol) || "(sin nombre)";
              const protegido = isProtected(rol);
              const usuarios = userCounts[rol.id] || 0;
              const miembros = usersByRole[rol.id] || [];
              const isExpanded = expandedRoleId === rol.id;
              return (
                <View key={rol.id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>{nombre}</Text>
                    <View style={styles.metaRow}>
                      <View style={[styles.badge, protegido && styles.badgeProtected]}>
                        <Text style={styles.badgeText}>{protegido ? "Protegido" : "Editable"}</Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Usuarios: {usuarios}</Text>
                      </View>
                    </View>
                    {miembros.length > 0 ? (
                      <Pressable
                        style={styles.membersToggle}
                        onPress={() => setExpandedRoleId((prev) => (prev === rol.id ? null : rol.id))}
                      >
                        <Text style={styles.membersToggleText}>
                          {isExpanded ? "Ocultar integrantes" : `Ver integrantes (${miembros.length})`}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.membersText}>Integrantes: sin usuarios asignados</Text>
                    )}
                    {isExpanded && miembros.length > 0 && (
                      <View style={styles.membersList}>
                        {miembros.map((m, idx) => (
                          <Text key={`${rol.id}-${idx}`} style={styles.memberItem}>
                            • {m}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.smallBtn, protegido && styles.smallBtnDisabled]}
                      onPress={() => onEdit(rol)}
                      disabled={loading}
                    >
                      <Text style={styles.smallBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(rol)} disabled={loading}>
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
  listHeader: { marginBottom: 6 },
  listHint: { color: COLORS.muted, fontWeight: "700", marginTop: 4 },
  grid: { gap: 10 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  cardLeft: { flex: 1, paddingRight: 10 },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 15 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  badgeProtected: {
    backgroundColor: "#FFF6E5",
    borderColor: "#F2D4A7",
  },
  badgeText: { fontWeight: "800", color: COLORS.text, fontSize: 12 },
  membersText: {
    marginTop: 8,
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  membersToggle: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
  },
  membersToggleText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  membersList: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#FAFBFF",
    gap: 4,
  },
  memberItem: { color: COLORS.text, fontWeight: "700", fontSize: 12 },
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
