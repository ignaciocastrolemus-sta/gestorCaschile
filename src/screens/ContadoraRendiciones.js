import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { API_BASE } from "../config/api";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

// Contadora: lista de rendiciones y resolucion (aprobar/rechazar)
export default function ContadoraRendiciones({ token }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [msgById, setMsgById] = useState({});
  const [actionMsg, setActionMsg] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/contadora`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al cargar rendiciones");
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar rendiciones");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const onDownload = async (adjuntoId, filename) => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/adjuntos/${adjuntoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo descargar");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "adjunto";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo descargar.");
    }
  };

  const onResolver = async (id, aprobar) => {
    try {
      setActionMsg("");
      const mensaje = (msgById[id] || "").trim();
      const res = await fetch(`${API_BASE}/Rendiciones/${id}/resolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aprobar, mensaje }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al resolver rendicion");
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
      setActionMsg(aprobar ? "Rendicion aprobada." : "Rendicion rechazada.");
    } catch (e) {
      setActionMsg(e?.message || "Error al resolver rendicion.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Revision de rendiciones</Text>
      <Text style={dash.h2}>Valida documentos y montos enviados por el capacitador.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!!actionMsg && <Text style={styles.infoText}>{actionMsg}</Text>}

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No hay rendiciones pendientes.</Text>
      ) : (
        items.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Rendicion #{r.id}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{r.estado}</Text>
              </View>
            </View>

            <Text style={styles.line}>
              <Text style={styles.label}>Capacitador: </Text>
              {r.viaje?.capacitador || "Sin nombre"}
            </Text>
            <Text style={styles.line}>
              <Text style={styles.label}>Destino: </Text>
              {r.viaje?.municipio || "-"} ({r.viaje?.regionNombre || "-"})
            </Text>
            <Text style={styles.line}>
              <Text style={styles.label}>Fechas: </Text>
              {formatRango(r.viaje?.fechaInicio, r.viaje?.fechaTermino)}
            </Text>

            <View style={styles.totalsRow}>
              <Text style={styles.totalBox}>
                Asignado: $ {Number(r.totalAsignado || 0).toLocaleString("es-CL")}
              </Text>
              <Text style={styles.totalBox}>
                Rendido: $ {Number(r.totalRendido || 0).toLocaleString("es-CL")}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Detalles</Text>
            <View style={styles.detailHeaderRow}>
              <Text style={[styles.detailHeader, styles.colCategoria]}>Categoria</Text>
              <Text style={[styles.detailHeader, styles.colAsignado]}>Asignado</Text>
              <Text style={[styles.detailHeader, styles.colRendido]}>Rendido</Text>
              <Text style={[styles.detailHeader, styles.colAdjuntos]}>Adjuntos</Text>
            </View>
            {r.detalles?.map((d) => (
              <View key={d.id} style={styles.detailRow}>
                <Text style={[styles.detailLabel, styles.colCategoria]}>{d.categoria}</Text>
                <Text style={[styles.detailValue, styles.colAsignado]}>
                  $ {Number(d.montoAsignado || 0).toLocaleString("es-CL")}
                </Text>
                <Text style={[styles.detailValue, styles.colRendido]}>
                  $ {Number(d.montoRendido || 0).toLocaleString("es-CL")}
                </Text>
                <View style={[styles.colAdjuntos, styles.adjuntosWrap]}>
                  {d.adjuntos?.length ? (
                    d.adjuntos.map((a) => (
                      <Pressable
                        key={a.id}
                        style={styles.downloadBtn}
                        onPress={() => onDownload(a.id, a.nombreArchivo || "adjunto")}
                      >
                        <Text style={styles.downloadText}>Descargar</Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.detailHint}>0</Text>
                  )}
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Mensaje (si rechazas)</Text>
            <TextInput
              value={msgById[r.id] || ""}
              onChangeText={(value) => setMsgById((prev) => ({ ...prev, [r.id]: value }))}
              placeholder="Motivo del rechazo"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <View style={styles.actionsRow}>
              <Pressable style={styles.approveBtn} onPress={() => onResolver(r.id, true)}>
                <Text style={styles.approveText}>Aprobar</Text>
              </Pressable>
              <Pressable style={styles.rejectBtn} onPress={() => onResolver(r.id, false)}>
                <Text style={styles.rejectText}>Rechazar</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function formatRango(inicio, termino) {
  if (!inicio || !termino) return "";
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = (d) =>
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear();
  return `${fmt(start)} - ${fmt(end)}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "900", color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#EEF3FF" },
  badgeText: { fontWeight: "800", color: COLORS.text, fontSize: 12 },
  line: { marginTop: 4, color: COLORS.text, fontWeight: "700" },
  label: { color: COLORS.muted, fontWeight: "800" },
  totalsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  totalBox: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 10,
    padding: 10,
    fontWeight: "900",
    color: COLORS.text,
  },
  sectionTitle: { marginTop: 12, fontWeight: "900", color: COLORS.blue2 },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  detailHeader: { fontWeight: "900", color: COLORS.muted, fontSize: 12 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  detailLabel: { fontWeight: "700", color: COLORS.text },
  detailValue: { fontWeight: "900", color: COLORS.text },
  detailHint: { color: COLORS.muted, fontWeight: "700" },
  colCategoria: { width: 320, textAlign: "left" },
  colAsignado: { width: 140, textAlign: "right" },
  colRendido: { width: 150, textAlign: "right", paddingRight: 24 },
  colAdjuntos: { width: 170, textAlign: "left", paddingLeft: 12 },
  adjuntosWrap: { alignItems: "flex-start" },
  downloadBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.blue2,
    marginBottom: 6,
  },
  downloadText: { color: "#fff", fontWeight: "900", fontSize: 11 },
  input: {
    marginTop: 6,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  approveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: { color: "#fff", fontWeight: "900" },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#C62828",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: { color: "#fff", fontWeight: "900" },
  errorText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
  infoText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontWeight: "700" },
});
