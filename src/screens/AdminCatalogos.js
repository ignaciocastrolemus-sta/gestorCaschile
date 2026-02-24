import React, { use, useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
function useCatalogo({ token, path, incluirInactivos = false }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const query = incluirInactivos ? "?incluirInactivos=true" : "";
      const res = await fetch(`${API_BASE}/${path}${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar.");
    }
  }, [path, token, incluirInactivos]);

  useEffect(() => {
    load();
  }, [load]);

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
      setError("");
    } catch (e) {
      setError(e?.message || "No se pudo crear.");
      throw e;
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
      setError("");
    } catch (e) {
      setError(e?.message || "No se pudo actualizar.");
      throw e;
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
      setError("");
    } catch (e) {
      // Tipico: restriccion FK (el registro esta siendo usado).
      setError(e?.message || "No se pudo eliminar.");
      throw e;
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
  const [rut, setRut] = useState("");
  const [extra, setExtra] = useState("");
  const [showInactivos, setShowInactivos] = useState(false);

  const isClientes = activeTab === "clientes";
  const isComunas = activeTab === "comunas";
  const isRegiones = activeTab === "regiones";

  const { items, error, setError, loading, create, update, remove } = useCatalogo({
    token,
    path: isClientes ? "Clientes" : isComunas ? "Comunas" : "Regiones",
    incluirInactivos: showInactivos,
  });

  const isActivo = (row) => {
    // Compat: si backend aun no tiene Activo, consideramos activo por defecto.
    const raw = row?.activo ?? row?.Activo;
    return raw === undefined ? true : Boolean(raw);
  };

  const itemsVisibles = useMemo(() => {
    if (showInactivos) return items;
    return (items || []).filter((row) => isActivo(row));
  }, [items, showInactivos]);
  const totalRegistros = (items || []).length;
  const totalActivos = useMemo(
    () => (items || []).filter((row) => isActivo(row)).length,
    [items],
  );
  const totalInactivos = Math.max(0, totalRegistros - totalActivos);

  const resetForm = () => {
    setEditing(null);
    setNombre("");
    setRut("");
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
      const payloadBase = isRegiones
        ? { nombre: nombre.trim(), romano: extra.trim() }
        : isComunas
          ? { nombre: nombre.trim(), regionId: Number(extra) }
          : { nombre: nombre.trim(), rutCliente: rut.trim(),comunaId: Number(extra) };

      // Soft delete: Activo (si el backend lo soporta). Si no existe en backend, se ignora.
      const payload = { ...payloadBase, activo: editing ? isActivo(editing) : true };

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
    setRut(row?.rutCliente || row?.RutCliente || "");
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
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => remove(row.id).catch(() => {}),
        },
      ]);
      return;
    }
    remove(row.id).catch(() => {});
  };

  const onToggleActivo = async (row) => {
    // Desactivar/Activar sin borrar (para no romper historiales).
    try {
      const nextActivo = !isActivo(row);
      const nombreRow = row?.nombre || row?.Nombre || "";
      const payload = isRegiones
        ? { nombre: nombreRow, romano: row?.romano || row?.Romano || "", activo: nextActivo }
        : isComunas
          ? {
              nombre: nombreRow,
              regionId: Number(row?.regionId ?? row?.RegionId ?? 0),
              activo: nextActivo,
            }
          : {
              nombre: nombreRow,
              comunaId: Number(row?.comunaId ?? row?.ComunaId ?? 0),
              activo: nextActivo,
            };

      await update(row.id, payload);
    } catch {
      // El mensaje se muestra en `error` (lo setea el hook).
    }
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

        {isClientes && (
          <>
            <Text style={dash.label}>RUT</Text>
            <TextInput
              value={rut}
              onChangeText={setRut}
              placeholder="Ej: 12.345.678-K"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
              autoCapitalize="characters" // Para que la 'K' salga siempre en mayúscula
            />
          </>
        )}

        <Text style={dash.label}>{isRegiones ? "Romano" : isComunas ? "RegionId" : "ComunaId"}</Text>
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
        <View style={styles.listHeaderRow}>
          <Text style={dash.panelTitle}>Listado</Text>
          <Pressable
            style={[styles.chipBtn, showInactivos && styles.chipBtnActive]}
            onPress={() => setShowInactivos((v) => !v)}
          >
            <Text style={[styles.chipText, showInactivos && styles.chipTextActive]}>
              {showInactivos
                ? `Mostrando todos · Activos (${totalActivos}) · Inactivos (${totalInactivos})`
                : `Solo activos (${totalActivos}) · Inactivos (${totalInactivos})`}
            </Text>
          </Pressable>
        </View>
        {itemsVisibles.length === 0 ? (
          <Text style={styles.empty}>No hay registros.</Text>
        ) : (
          itemsVisibles.map((row) => (
            <View key={row.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{row.nombre || row.Nombre}</Text>
                {/* Id visible para facilitar pruebas y relaciones (RegionId/ComunaId). */}
                <Text style={styles.listSub}>Id: {row.id}</Text>
                {isRegiones && <Text style={styles.listSub}>Romano: {row.romano || row.Romano}</Text>}
                {isComunas && <Text style={styles.listSub}>RegionId: {row.regionId || row.RegionId}</Text>}
                {isClientes && <Text style={styles.listSub}>ComunaId: {row.comunaId || row.ComunaId}</Text>}
                <Text style={styles.listSub}>Activo: {isActivo(row) ? "Si" : "No"}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.smallBtn} onPress={() => onEdit(row)}>
                  <Text style={styles.smallBtnText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.smallBtn} onPress={() => onToggleActivo(row)}>
                  <Text style={styles.smallBtnText}>{isActivo(row) ? "Desactivar" : "Activar"}</Text>
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
  listHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
  },
  chipBtnActive: { backgroundColor: COLORS.blue2, borderColor: COLORS.blue2 },
  chipText: { fontWeight: "900", color: COLORS.blue2, fontSize: 12 },
  chipTextActive: { color: "#fff" },
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
