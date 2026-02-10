import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

// Capacitador: formulario de rendiciÃ³n con adjuntos y montos
const CATEGORIAS = [
  { key: "transporte", label: "Transporte / Uber / Taxi" },
  { key: "peajes", label: "Peajes" },
  { key: "reembolsos", label: "Reembolsos / Descuentos" },
  { key: "varios", label: "Varios" },
  { key: "copec", label: "Copec" },
];

export default function CapacitadorRendicion({ token, selectedViajeId }) {
  const [viajes, setViajes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [montos, setMontos] = useState({});
  const [archivos, setArchivos] = useState({});
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const fileInputs = useRef({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Viajes/mios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Error al cargar viajes");
        }
        const data = await res.json();
        if (!alive) return;
        const lista = Array.isArray(data) ? data : [];
        setViajes(lista);
        if (lista.length > 0) setSelectedId(lista[0].id);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Error al cargar viajes");
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (selectedViajeId) {
      setSelectedId(selectedViajeId);
    }
  }, [selectedViajeId]);

  const viaje = useMemo(
    () => viajes.find((v) => v.id === selectedId) || null,
    [viajes, selectedId]
  );

  const asignacionesPorDia = useMemo(() => {
    if (!viaje) return [];
    return [
      { key: "desayuno", label: "Desayuno", monto: Number(viaje.desayuno || 0) },
      { key: "almuerzo", label: "Almuerzo", monto: Number(viaje.almuerzo || 0) },
      { key: "once", label: "Once", monto: Number(viaje.once || 0) },
      { key: "cena", label: "Cena", monto: Number(viaje.cena || 0) },
      { key: "viatico", label: "Viatico", monto: Number(viaje.viatico || 0) },
    ];
  }, [viaje]);

  const asignadoPorCategoria = useMemo(() => {
    if (!viaje) return {};
    return {
      transporte: Number(viaje.movAsignado || 0) + Number(viaje.transferUber || 0) + Number(viaje.colectivoTaxi || 0),
      peajes: Number(viaje.peajes || 0),
      reembolsos: Number(viaje.reembolsos || 0),
      varios: Number(viaje.varios || 0),
      copec: Number(viaje.copec || 0),
    };
  }, [viaje]);

  const subtotalDia = useMemo(
    () => asignacionesPorDia.reduce((acc, it) => acc + it.monto, 0),
    [asignacionesPorDia]
  );

  const totalViaje = useMemo(() => {
    if (!viaje) return 0;
    const total = Number(viaje.montoViaticoTotal || 0);
    if (total > 0) return total;
    const dias = Number(viaje.totalDias || 0);
    return subtotalDia * (dias || 0);
  }, [viaje, subtotalDia]);

  const totalAsignado = useMemo(
    () => Object.values(asignadoPorCategoria).reduce((acc, v) => acc + v, 0),
    [asignadoPorCategoria]
  );

  const totalRendido = useMemo(
    () => Object.values(montos).reduce((acc, v) => acc + Number(v || 0), 0),
    [montos]
  );

  const handleFiles = (categoria, fileList) => {
    const list = Array.from(fileList || []);
    setArchivos((prev) => ({ ...prev, [categoria]: list }));
  };

  const openFilePicker = (categoria) => {
    const input = fileInputs.current[categoria];
    if (input && input.click) input.click();
  };

  const validateBeforeSend = () => {
    if (!viaje) return "Debes seleccionar un viaje.";
    if (totalRendido !== totalAsignado) {
      return "El total rendido debe ser igual al total asignado.";
    }
    for (const cat of CATEGORIAS) {
      const monto = Number(montos[cat.key] || 0);
      if (monto > 0) {
        const files = archivos[cat.key] || [];
        if (files.length === 0) return `Faltan adjuntos para ${cat.label}.`;
      }
    }
    return "";
  };

  const enviarRendicion = async () => {
    setMensaje("");
    const err = validateBeforeSend();
    if (err) {
      setMensaje(err);
      return;
    }

    const detalles = CATEGORIAS.map((c) => ({
      categoria: c.key,
      montoRendido: Number(montos[c.key] || 0),
      observacion: "",
    }));

    const formData = new FormData();
    formData.append("viajeId", String(viaje.id));
    formData.append("detalles", JSON.stringify(detalles));

    CATEGORIAS.forEach((c) => {
      const files = archivos[c.key] || [];
      files.forEach((file) => {
        formData.append(`files.${c.key}`, file);
      });
    });

    try {
      const res = await fetch(`${API_BASE}/Rendiciones`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al enviar rendicion");
      }
      setMensaje("Rendicion enviada correctamente.");
    } catch (e) {
      setMensaje(e?.message || "Error al enviar rendicion.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Ingresar rendicion de gasto</Text>
      <Text style={dash.h2}>Formulario de rendicion de gastos</Text>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Selecciona un viaje</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.selector}>
          {viajes.map((v) => (
            <Pressable
              key={v.id}
              style={[styles.selectorItem, v.id === selectedId && styles.selectorItemActive]}
              onPress={() => setSelectedId(v.id)}
            >
              <Text style={styles.selectorTitle}>{v.municipio || v.comuna}</Text>
              <Text style={styles.selectorSub}>
                {v.regionNombre || ""} - {formatRango(v.fechaInicio, v.fechaTermino)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Asignaciones por dia</Text>
        <Text style={styles.panelSub}>
          Adjunta documentos o imagenes que validen tus gastos. Debes rendir los montos asignados.
        </Text>

        <View style={styles.cardRow}>
          {asignacionesPorDia.map((item) => (
            <View key={item.key} style={styles.miniCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardAmount}>$ {item.monto.toLocaleString("es-CL")}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalText}>Subtotal: </Text>
          <View style={styles.subtotalBadge}>
            <Text style={styles.subtotalValue}>$ {subtotalDia.toLocaleString("es-CL")}</Text>
          </View>
        </View>

        <View style={styles.totalViajeRow}>
          <Text style={styles.totalViajeText}>Total viaje: </Text>
          <View style={styles.totalViajeBadge}>
            <Text style={styles.totalViajeValue}>$ {totalViaje.toLocaleString("es-CL")}</Text>
          </View>
        </View>
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Gastos ingresados (rendicion de viaje)</Text>
        <Text style={styles.panelSub}>
          Adjunta documentos por cada categoria para validar tus gastos.
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>Categoria</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Adjuntar documento</Text>
          <Text style={[styles.th, { flex: 1 }]}>Monto asignado</Text>
          <Text style={[styles.th, { flex: 1 }]}>Monto rendido</Text>
        </View>

        {CATEGORIAS.map((row) => (
          <View key={row.key} style={styles.tableRow}>
            <Text style={[styles.td, styles.cell, { flex: 2 }]}>{row.label}</Text>
            <View style={[styles.td, styles.cell, styles.attachCell, { flex: 1.2 }]}>
              <Pressable style={styles.tableBtn} onPress={() => openFilePicker(row.key)}>
                <Text style={styles.tableBtnText}>Adjuntar</Text>
              </Pressable>
              {Platform.OS === "web" && (
                <input
                  ref={(el) => (fileInputs.current[row.key] = el)}
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(row.key, e.target.files)}
                />
              )}
              <Text style={styles.filesHint}>
                {archivos[row.key]?.length ? `${archivos[row.key].length} archivo(s)` : "Sin archivos"}
              </Text>
            </View>
            <Text style={[styles.td, styles.cell, styles.amountText, { flex: 1 }]}>
              $ {Number(asignadoPorCategoria[row.key] || 0).toLocaleString("es-CL")}
            </Text>
            <View style={[styles.td, styles.cell, { flex: 1 }]}>
              <TextInput
                placeholder="0"
                placeholderTextColor={COLORS.muted}
                value={montos[row.key] || ""}
                onChangeText={(value) =>
                  setMontos((prev) => ({ ...prev, [row.key]: value.replace(/[^\d]/g, "") }))
                }
                style={styles.montoInput}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Asig. Norma CAS</Text>
          <Text style={styles.totalValue}>$ {totalAsignado.toLocaleString("es-CL")}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total rendido</Text>
          <Text style={styles.totalValue}>$ {totalRendido.toLocaleString("es-CL")}</Text>
        </View>
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>
          Los montos rendidos deben coincidir con los valores asignados. No puedes enviar la rendicion
          hasta que el total coincida.
        </Text>
        <Pressable style={styles.sendBtn} onPress={enviarRendicion}>
          <Text style={styles.sendBtnText}>Enviar rendicion</Text>
        </Pressable>
      </View>

      {!!mensaje && <Text style={styles.messageText}>{mensaje}</Text>}
    </ScrollView>
  );
}

function formatRango(inicio, termino) {
  if (!inicio || !termino) return "";
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = (d) => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  return `${fmt(start)} - ${fmt(end)}`;
}

const styles = StyleSheet.create({
  panelSub: { color: COLORS.muted, fontWeight: "700", marginBottom: 12 },
  selector: { gap: 8 },
  selectorItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  selectorItemActive: { borderColor: "#BFD4FF", backgroundColor: "#E8F0FF" },
  selectorTitle: { fontWeight: "900", color: COLORS.text },
  selectorSub: { marginTop: 2, fontWeight: "700", color: COLORS.muted },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  miniCard: {
    width: 220,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontWeight: "900", color: COLORS.blue2 },
  cardAmount: { fontWeight: "900", color: COLORS.text },
  subtotalRow: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 },
  subtotalText: { fontWeight: "900", color: COLORS.muted },
  subtotalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  subtotalValue: { fontWeight: "900", color: COLORS.text },
  totalViajeRow: { marginTop: 6, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 },
  totalViajeText: { fontWeight: "900", color: COLORS.muted },
  totalViajeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E7F8ED",
    borderWidth: 1,
    borderColor: "#BFE8CB",
  },
  totalViajeValue: { fontWeight: "900", color: COLORS.text },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  th: { fontSize: 12, fontWeight: "900", color: COLORS.muted },
  td: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  cell: { paddingRight: 16, paddingLeft: 8 },
  attachCell: { alignItems: "flex-start" },
  amountText: { textAlign: "center" },
  tableBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0D2F6B",
    minWidth: 84,
  },
  tableBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  filesHint: { marginTop: 6, fontSize: 11, color: COLORS.muted, fontWeight: "700" },
  montoInput: {
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: COLORS.text,
    textAlign: "center",
  },
  totalRow: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  totalLabel: { fontWeight: "900", color: COLORS.muted },
  totalValue: { fontWeight: "900", color: COLORS.text },
  alertBox: {
    marginBottom: 14,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#BFD4FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  alertText: { flex: 1, fontWeight: "700", color: COLORS.text },
  sendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.blue2,
    borderWidth: 1,
    borderColor: "#0D2F6B",
  },
  sendBtnText: { fontWeight: "900", color: "#fff" },
  errorText: { color: COLORS.muted, fontWeight: "700" },
  messageText: { color: COLORS.muted, fontWeight: "800", marginBottom: 12 },
});


