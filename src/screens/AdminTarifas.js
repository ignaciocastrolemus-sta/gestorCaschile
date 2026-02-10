import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Picker } from "@react-native-picker/picker";
export default function AdminTarifas({ token }) {
  const [items, setItems] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    regionId: "",
    municipio: "",
    periodo: "",
    desayuno: "0",
    almuerzo: "0",
    once: "0",
    cena: "0",
    viatico: "0",
    activo: true,
  });

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/TarifaMunicipio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar tarifas.");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [resReg, resCom] = await Promise.all([
          fetch(`${API_BASE}/Regiones`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/Comunas`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!resReg.ok || !resCom.ok) return;
        const regData = await resReg.json();
        const comData = await resCom.json();
        if (!alive) return;
        setRegiones(Array.isArray(regData) ? regData : []);
        setComunas(Array.isArray(comData) ? comData : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const regionItems = useMemo(
    () =>
      regiones.map((r) => ({
        id: r.id ?? r.Id,
        nombre: r.nombre ?? r.Nombre,
      })),
    [regiones]
  );

  const comunasItems = useMemo(() => {
    const selectedRegionId = Number(form.regionId);
    const base = comunas
      .map((c) => ({
        id: c.id ?? c.Id,
        nombre: c.nombre ?? c.Nombre,
        regionId: c.regionId ?? c.RegionId,
      }))
      .filter((c) => c.id && c.nombre);
    if (!selectedRegionId) return base;
    return base.filter((c) => Number(c.regionId) === selectedRegionId);
  }, [comunas, form.regionId]);

  const regionNameById = useMemo(() => {
    const map = new Map();
    regionItems.forEach((r) => {
      if (r.id) map.set(Number(r.id), r.nombre);
    });
    return map;
  }, [regionItems]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setEditing(null);
    setForm({
      regionId: "",
      municipio: "",
      periodo: "",
      desayuno: "0",
      almuerzo: "0",
      once: "0",
      cena: "0",
      viatico: "0",
      activo: true,
    });
  };

  const onSave = async () => {
    if (!form.regionId || !form.municipio.trim() || !form.periodo) {
      setError("Region, Municipio y Periodo son obligatorios.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const payload = {
        regionId: Number(form.regionId),
        municipio: form.municipio.trim(),
        periodo: Number(form.periodo),
        desayuno: Number(form.desayuno || 0),
        almuerzo: Number(form.almuerzo || 0),
        once: Number(form.once || 0),
        cena: Number(form.cena || 0),
        viatico: Number(form.viatico || 0),
        activo: form.activo,
      };
      const url = editing
        ? `${API_BASE}/TarifaMunicipio/${editing.id}`
        : `${API_BASE}/TarifaMunicipio`;
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
      Alert.alert("Tarifas", editing ? "Tarifa actualizada." : "Tarifa creada.");
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (t) => {
    setEditing(t);
    setForm({
      regionId: String(t.regionId ?? t.RegionId ?? ""),
      municipio: t.municipio ?? t.Municipio ?? "",
      periodo: String(t.periodo ?? t.Periodo ?? ""),
      desayuno: String(t.desayuno ?? t.Desayuno ?? 0),
      almuerzo: String(t.almuerzo ?? t.Almuerzo ?? 0),
      once: String(t.once ?? t.Once ?? 0),
      cena: String(t.cena ?? t.Cena ?? 0),
      viatico: String(t.viatico ?? t.Viatico ?? 0),
      activo: !!t.activo,
    });
  };

  const onDelete = (t) => {
    const msg = `Â¿Eliminar tarifa de ${t.municipio || t.Municipio}?`;
    const proceed = typeof window !== "undefined" && window.confirm ? window.confirm(msg) : undefined;
    if (proceed === false) return;
    if (proceed === undefined) {
      Alert.alert("Eliminar tarifa", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => doDelete(t.id) },
      ]);
      return;
    }
    doDelete(t.id);
  };

  const doDelete = async (id) => {
    try {
      setError("");
      setLoading(true);
      const res = await fetch(`${API_BASE}/TarifaMunicipio/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      load();
      Alert.alert("Tarifas", "Tarifa eliminada.");
    } catch (e) {
      setError(e?.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Tarifas por municipio</Text>
      <Text style={dash.h2}>Mantenedor de montos por region/municipio/periodo.</Text>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? "Editar tarifa" : "Nueva tarifa"}</Text>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={dash.label}>Region</Text>
            <View style={styles.selectWrap}>
              <Picker
                selectedValue={form.regionId || ""}
                onValueChange={(v) => {
                  setField("regionId", v);
                  if (!editing) setField("municipio", "");
                }}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona region" value="" />
                {regionItems.map((r) => (
                  <Picker.Item key={String(r.id)} label={r.nombre} value={String(r.id)} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Periodo</Text>
            <TextInput
              value={form.periodo}
              onChangeText={(v) => setField("periodo", v.replace(/[^\d]/g, ""))}
              placeholder="2026"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
        </View>

        <Text style={dash.label}>Municipio</Text>
        <View style={styles.selectWrap}>
          <Picker
            selectedValue={form.municipio}
            onValueChange={(v) => setField("municipio", v)}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona municipio" value="" />
            {comunasItems.map((c) => (
              <Picker.Item key={String(c.id)} label={c.nombre} value={c.nombre} />
            ))}
          </Picker>
        </View>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={dash.label}>Desayuno</Text>
            <TextInput
              value={form.desayuno}
              onChangeText={(v) => setField("desayuno", v.replace(/[^\d]/g, ""))}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Almuerzo</Text>
            <TextInput
              value={form.almuerzo}
              onChangeText={(v) => setField("almuerzo", v.replace(/[^\d]/g, ""))}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Once</Text>
            <TextInput
              value={form.once}
              onChangeText={(v) => setField("once", v.replace(/[^\d]/g, ""))}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={dash.label}>Cena</Text>
            <TextInput
              value={form.cena}
              onChangeText={(v) => setField("cena", v.replace(/[^\d]/g, ""))}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              style={dash.input}
            />
          </View>
          <View style={styles.col}>
            <Text style={dash.label}>Viatico</Text>
            <TextInput
              value={form.viatico}
              onChangeText={(v) => setField("viatico", v.replace(/[^\d]/g, ""))}
              placeholder="0"
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
          <Text style={styles.empty}>No hay tarifas.</Text>
        ) : (
          items.map((t) => (
            <View key={t.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{t.municipio || t.Municipio}</Text>
                <Text style={styles.listSub}>Id: {t.id}</Text>
                <Text style={styles.listSub}>
                  Region: {regionNameById.get(Number(t.regionId ?? t.RegionId)) || (t.regionId ?? t.RegionId)}
                </Text>
                <Text style={styles.listSub}>Periodo: {t.periodo ?? t.Periodo}</Text>
                <Text style={styles.listSub}>
                  Des: {t.desayuno ?? t.Desayuno} / Alm: {t.almuerzo ?? t.Almuerzo} / Once:{" "}
                  {t.once ?? t.Once} / Cena: {t.cena ?? t.Cena} / Viatico: {t.viatico ?? t.Viatico}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.smallBtn} onPress={() => onEdit(t)}>
                  <Text style={styles.smallBtnText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.smallBtnDanger} onPress={() => onDelete(t)}>
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
  grid: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1, minWidth: 140 },
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





