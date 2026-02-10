import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
function useCatalogo({ token, path }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar.");
    }
  };

  useEffect(() => {
    load();
  }, [token, path]);

  const create = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${path}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${path}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } finally {
      setLoading(false);
    }
  };

  return { items, error, setError, loading, load, create, update, remove };
}

export default function AdminCatalogos({ token }) {
  const [activeTab, setActiveTab] = useState("clientes");
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState("");
  const [extra, setExtra] = useState("");

  const isClientes = activeTab === "clientes";
  const isComunas = activeTab === "comunas";
  const isRegiones = activeTab === "regiones";

  const { items, error, setError, loading, create, update, remove } = useCatalogo({
    token,
    path: isClientes ? "Clientes" : isComunas ? "Comunas" : "Regiones",
  });

  const resetForm = () => {
    setEditing(null);
    setNombre("");
    setExtra("");
  };

  const title = useMemo(() => {
    if (isRegiones) return "Regiones";
    if (isComunas) return "Comunas";
    return "Clientes";
  }, [isRegiones, isComunas]);

  const onSave = async () => {
    if (!nombre.trim()) {
      setError("Nombre es obligatorio.");
      return;
    }
    try {
      const payload = isRegiones
        ? { nombre: nombre.trim(), romano: extra.trim() }
        : isComunas
        ? { nombre: nombre.trim(), regionId: Number(extra) }
        : { nombre: nombre.trim(), comunaId: Number(extra) };

      if (editing) {
        await update(editing.id, payload);
      } else {
        await create(payload);
      }
      resetForm();
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    }
  };

  const onEdit = (row) => {
    setEditing(row);
    setNombre(row?.nombre || row?.Nombre || "");
    if (isRegiones) {
      setExtra(row?.romano || row?.Romano || "");
    } else if (isComunas) {
      setExtra(String(row?.regionId ?? row?.RegionId ?? ""));
    } else {
      setExtra(String(row?.comunaId ?? row?.ComunaId ?? ""));
    }
  };

  const onDelete = (row) => {
    const nombreRow = row?.nombre || row?.Nombre || "este registro";
    const msg = `Eliminar ${nombreRow}?`;
    const proceed = typeof window !== "undefined" && window.confirm ? window.confirm(msg) : undefined;
    if (proceed === false) return;
    if (proceed === undefined) {
      Alert.alert("Eliminar", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => remove(row.id) },
      ]);
      return;
    }
    remove(row.id);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Catalogos</Text>
      <Text style={dash.h2}>Clientes, comunas y regiones.</Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, isClientes && styles.tabActive]}
          onPress={() => {
            setActiveTab("clientes");
            resetForm();
          }}
        >
          <Text style={[styles.tabText, isClientes && styles.tabTextActive]}>Clientes</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, isComunas && styles.tabActive]}
          onPress={() => {
            setActiveTab("comunas");
            resetForm();
          }}
        >
          <Text style={[styles.tabText, isComunas && styles.tabTextActive]}>Comunas</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, isRegiones && styles.tabActive]}
          onPress={() => {
            setActiveTab("regiones");
            resetForm();
          }}
        >
          <Text style={[styles.tabText, isRegiones && styles.tabTextActive]}>Regiones</Text>
        </Pressable>
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? `Editar ${title}` : `Nuevo ${title}`}</Text>
        <Text style={dash.label}>Nombre</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder={`Nombre de ${title.toLowerCase()}`}
          placeholderTextColor={COLORS.muted}
          style={dash.input}
        />

        <Text style={dash.label}>
          {isRegiones ? "Romano" : isComunas ? "RegionId" : "ComunaId"}
        </Text>
        <TextInput
          value={extra}
          onChangeText={setExtra}
          placeholder={isRegiones ? "RM" : isComunas ? "Id de region" : "Id de comuna"}
          placeholderTextColor={COLORS.muted}
          style={dash.input}
        />

        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave}>
            <Text style={styles.primaryText}>{loading ? "Guardando..." : "Guardar"}</Text>
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
          <Text style={styles.empty}>No hay registros.</Text>
        ) : (
          items.map((row) => (
            <View key={row.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{row.nombre || row.Nombre}</Text>
                {isRegiones && <Text style={styles.listSub}>Romano: {row.romano || row.Romano}</Text>}
                {isComunas && <Text style={styles.listSub}>RegionId: {row.regionId || row.RegionId}</Text>}
                {isClientes && <Text style={styles.listSub}>ComunaId: {row.comunaId || row.ComunaId}</Text>}
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.smallBtn} onPress={() => onEdit(row)}>
                  <Text style={styles.smallBtnText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(row)}>
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
  tabs: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  tabActive: { backgroundColor: COLORS.blue2, borderColor: COLORS.blue2 },
  tabText: { fontWeight: "800", color: COLORS.blue2 },
  tabTextActive: { color: "#fff" },
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  listTitle: { fontWeight: "800", color: COLORS.text },
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





