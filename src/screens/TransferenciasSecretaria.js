import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE } from "../config/api";
import { COLORS } from "../constants/colors";
import dash from "../styles/dashboardStyles";

// Secretaria: transferencias (resumen por capacitador)
export default function TransferenciasSecretaria({ token }) {
  const [transferRendiciones, setTransferRendiciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [actionMsg, setActionMsg] = useState("");
  const [transferEstado, setTransferEstado] = useState("Aprobada");
  const [transferPeriodoId, setTransferPeriodoId] = useState("");

  const transferItems = useMemo(
    () =>
      transferRendiciones.map((r) => ({
        capacitador: r.capacitador ?? r.Capacitador ?? "Sin nombre",
        totalAsignado: Number(r.totalAsignado ?? r.TotalAsignado ?? 0),
        totalRendido: Number(r.totalRendido ?? r.TotalRendido ?? 0),
        cantidad: Number(r.cantidadRendiciones ?? r.CantidadRendiciones ?? 0),
      })),
    [transferRendiciones]
  );

  const loadPeriodos = async () => {
    try {
      const res = await fetch(`${API_BASE}/Periodos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPeriodos(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  const loadTransfer = async (estado, periodoId) => {
    try {
      const params = new URLSearchParams();
      if (estado) params.set("estado", estado);
      if (periodoId) params.set("periodoId", periodoId);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_BASE}/Transferencias/solicitudes${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al cargar transferencias");
      }
      const data = await res.json();
      setTransferRendiciones(Array.isArray(data) ? data : []);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo cargar transferencias.");
    }
  };

  const downloadTransferFile = async (filename, type) => {
    try {
      const params = new URLSearchParams();
      if (transferEstado) params.set("estado", transferEstado);
      if (transferPeriodoId) params.set("periodoId", transferPeriodoId);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_BASE}/Transferencias/solicitudes/${type}${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo descargar.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo descargar.");
    }
  };

  const onGenerarTransferencias = async () => {
    try {
      setActionMsg("");
      const params = new URLSearchParams();
      if (transferEstado) params.set("estado", transferEstado);
      if (transferPeriodoId) params.set("periodoId", transferPeriodoId);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_BASE}/Transferencias/solicitudes/generar${q}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo generar transferencias.");
      }
      const data = await res.json();
      setActionMsg(`Transferencias generadas: ${data?.created ?? 0}`);
      loadTransfer(transferEstado, transferPeriodoId);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo generar transferencias.");
    }
  };

  useEffect(() => {
    loadPeriodos();
  }, [token]);

  useEffect(() => {
    loadTransfer(transferEstado, transferPeriodoId);
  }, [token, transferEstado, transferPeriodoId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Transferencias</Text>
      <Text style={dash.h2}>Resumen por capacitador para generar transferencias.</Text>

      {!!actionMsg && <Text style={styles.infoText}>{actionMsg}</Text>}

      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Transferencias (vista previa)</Text>
        <Text style={styles.transferSub}>Filtra por estado y periodo.</Text>

        <View style={styles.transferFilterRow}>
          <Text style={styles.transferFilterLabel}>Estado</Text>
          <View style={styles.transferSelectWrap}>
            <Picker
              selectedValue={transferEstado}
              onValueChange={(v) => setTransferEstado(v)}
              style={styles.transferPicker}
            >
              <Picker.Item label="Aprobada" value="Aprobada" />
              <Picker.Item label="Pendiente" value="Pendiente" />
              <Picker.Item label="Rechazada" value="Rechazada" />
            </Picker>
          </View>
        </View>
        <View style={styles.transferFilterRow}>
          <Text style={styles.transferFilterLabel}>Periodo</Text>
          <View style={styles.transferSelectWrap}>
            <Picker
              selectedValue={transferPeriodoId}
              onValueChange={(v) => setTransferPeriodoId(v)}
              style={styles.transferPicker}
            >
              <Picker.Item label="Periodo activo" value="" />
              {periodos.map((p) => (
                <Picker.Item
                  key={String(p.id ?? p.Id)}
                  label={p.nombre ?? p.Nombre}
                  value={String(p.id ?? p.Id)}
                />
              ))}
            </Picker>
          </View>
        </View>

        {transferItems.length === 0 ? (
          <Text style={styles.emptyText}>No hay rendiciones para transferir.</Text>
        ) : (
          <View style={styles.transferTable}>
            <View style={styles.transferHeaderRow}>
              <Text style={[styles.transferHeader, styles.colTransferCap]}>Capacitador</Text>
              <Text style={[styles.transferHeader, styles.colTransferAsig]}>Asignado</Text>
              <Text style={[styles.transferHeader, styles.colTransferRend]}>Rendido</Text>
              <Text style={[styles.transferHeader, styles.colTransferCant]}>Cant.</Text>
            </View>
            {transferItems.map((t) => (
              <View key={t.capacitador} style={styles.transferRow}>
                <Text style={[styles.transferCell, styles.colTransferCap]}>{t.capacitador}</Text>
                <Text style={[styles.transferCell, styles.colTransferAsig]}>
                  $ {Number(t.totalAsignado).toLocaleString("es-CL")}
                </Text>
                <Text style={[styles.transferCell, styles.colTransferRend]}>
                  $ {Number(t.totalRendido).toLocaleString("es-CL")}
                </Text>
                <Text style={[styles.transferCell, styles.colTransferCant]}>{t.cantidad}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.transferActions}>
          <Pressable
            style={styles.transferBtn}
            onPress={() => downloadTransferFile("transferencias_solicitudes.csv", "csv")}
          >
            <Text style={styles.transferBtnText}>Descargar CSV</Text>
          </Pressable>
          <Pressable
            style={styles.transferBtnSecondary}
            onPress={() => downloadTransferFile("transferencias_solicitudes.xlsx", "excel")}
          >
            <Text style={styles.transferBtnTextSecondary}>Descargar Excel</Text>
          </Pressable>
          <Pressable style={styles.transferBtnSecondary} onPress={onGenerarTransferencias}>
            <Text style={styles.transferBtnTextSecondary}>Generar transferencias</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  transferCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  transferTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  transferSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
  transferFilterRow: { marginTop: 10 },
  transferFilterLabel: { fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  transferSelectWrap: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    justifyContent: "center",
    maxWidth: 240,
  },
  transferPicker: { height: 40, color: COLORS.text },
  transferTable: { marginTop: 10 },
  transferHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  transferHeader: { fontWeight: "900", color: COLORS.muted, fontSize: 12 },
  transferRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  transferCell: { fontWeight: "800", color: COLORS.text },
  colTransferCap: { width: 320, textAlign: "left" },
  colTransferAsig: { width: 140, textAlign: "right" },
  colTransferRend: { width: 140, textAlign: "right" },
  colTransferCant: { width: 80, textAlign: "center" },
  transferActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  transferBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  transferBtnText: { color: "#fff", fontWeight: "900" },
  transferBtnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  transferBtnTextSecondary: { color: COLORS.blue2, fontWeight: "900" },
  infoText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontWeight: "700" },
});
