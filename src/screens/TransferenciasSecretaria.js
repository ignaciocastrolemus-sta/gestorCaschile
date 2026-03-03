import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE } from "../config/api";
import { COLORS } from "../constants/colors";
import { Input } from "../components/UI";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";

// Secretaria: transferencias (resumen por capacitador)
export default function TransferenciasSecretaria({ token }) {
  const [transferRendiciones, setTransferRendiciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [actionMsg, setActionMsg] = useState("");
  const [actionKind, setActionKind] = useState("info");
  const [transferEstado, setTransferEstado] = useState("Aprobada");
  const [transferPeriodoId, setTransferPeriodoId] = useState("");
  const [draftEstado, setDraftEstado] = useState("Aprobada");
  const [draftPeriodoId, setDraftPeriodoId] = useState("");
  const [draftSearch, setDraftSearch] = useState("");

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

  // Filtro local para busqueda rapida por texto en capacitador.
  const filteredTransferItems = useMemo(() => {
    const q = (draftSearch || "").trim().toLowerCase();
    if (!q) return transferItems;
    return transferItems.filter((t) => String(t.capacitador).toLowerCase().includes(q));
  }, [transferItems, draftSearch]);

  const kpis = useMemo(() => {
    const totalAsignado = filteredTransferItems.reduce((acc, it) => acc + Number(it.totalAsignado || 0), 0);
    const totalRendido = filteredTransferItems.reduce((acc, it) => acc + Number(it.totalRendido || 0), 0);
    const cantidadRendiciones = filteredTransferItems.reduce((acc, it) => acc + Number(it.cantidad || 0), 0);
    return {
      totalAsignado,
      totalRendido,
      cantidadRendiciones,
      capacitadores: filteredTransferItems.length,
    };
  }, [filteredTransferItems]);

  const loadPeriodos = useCallback(async () => {
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
  }, [token]);

  const loadTransfer = useCallback(
    async (estado, periodoId) => {
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
        setActionMsg("");
        setActionKind("info");
      } catch (e) {
        setActionMsg(e?.message || "No se pudo cargar transferencias.");
        setActionKind("error");
      }
    },
    [token]
  );

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
      setActionKind("error");
    }
  };

  // Exporta una planilla ordenada para Excel sin depender del backend.
  const downloadTransferExcel = () => {
    if (typeof window === "undefined") {
      setActionMsg("La exportacion Excel solo esta disponible en web.");
      return;
    }

    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const fecha = new Date().toLocaleString("es-CL");
    const periodoNombre =
      transferPeriodoId === ""
        ? "Periodo activo"
        : periodos.find((p) => String(p.id ?? p.Id) === String(transferPeriodoId))?.nombre ||
          periodos.find((p) => String(p.id ?? p.Id) === String(transferPeriodoId))?.Nombre ||
          transferPeriodoId;

    const rowsHtml = transferItems
      .map(
        (t) => `
          <tr>
            <td>${esc(t.capacitador)}</td>
            <td style="text-align:right">${Number(t.totalAsignado).toLocaleString("es-CL")}</td>
            <td style="text-align:right">${Number(t.totalRendido).toLocaleString("es-CL")}</td>
            <td style="text-align:center">${esc(t.cantidad)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
            .meta { margin: 2px 0; color: #333; }
            table { border-collapse: collapse; margin-top: 12px; width: 100%; }
            th, td { border: 1px solid #cfd7e6; padding: 8px; font-size: 12px; }
            th { background: #eef3ff; color: #163F8A; text-align: left; }
          </style>
        </head>
        <body>
          <div class="title">Transferencias por capacitador</div>
          <div class="meta"><b>Fecha:</b> ${esc(fecha)}</div>
          <div class="meta"><b>Estado:</b> ${esc(transferEstado)}</div>
          <div class="meta"><b>Periodo:</b> ${esc(periodoNombre)}</div>
          <table>
            <thead>
              <tr>
                <th>Capacitador</th>
                <th>Total asignado</th>
                <th>Total rendido</th>
                <th>Cantidad rendiciones</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="4">Sin datos para exportar</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transferencias_solicitudes.xls";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const onGenerarTransferencias = async () => {
    try {
      setActionMsg("");
      setActionKind("info");
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
      setActionKind("success");
      loadTransfer(transferEstado, transferPeriodoId);
    } catch (e) {
      setActionMsg(e?.message || "No se pudo generar transferencias.");
      setActionKind("error");
    }
  };

  const onApplyFilters = () => {
    setTransferEstado(draftEstado);
    setTransferPeriodoId(draftPeriodoId);
    loadTransfer(draftEstado, draftPeriodoId);
  };

  const onClearFilters = () => {
    setDraftEstado("Aprobada");
    setDraftPeriodoId("");
    setDraftSearch("");
    setTransferEstado("Aprobada");
    setTransferPeriodoId("");
    loadTransfer("Aprobada", "");
  };

  const onGenerateWithConfirm = () => {
    const msg = "Se generaran las transferencias para el filtro actual. ¿Deseas continuar?";
    const proceed =
      typeof window !== "undefined" && typeof window.confirm === "function" ? window.confirm(msg) : false;
    if (!proceed) return;
    onGenerarTransferencias();
  };

  useEffect(() => {
    loadPeriodos();
    loadTransfer(transferEstado, transferPeriodoId);
  }, [loadPeriodos, loadTransfer, transferEstado, transferPeriodoId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Transferencias"
        subtitle="Resumen por capacitador para generar transferencias."
        secondaryLabel="Actualizar"
        onSecondaryPress={() => loadTransfer(transferEstado, transferPeriodoId)}
      />

      <StatusMessage
        tone={actionKind === "error" ? "error" : actionKind === "success" ? "info" : "warning"}
        text={actionMsg}
      />

      <KpiRow
        items={[
          {
            key: "asignado",
            label: "Total asignado",
            value: `$ ${kpis.totalAsignado.toLocaleString("es-CL")}`,
          },
          {
            key: "rendido",
            label: "Total rendido",
            value: `$ ${kpis.totalRendido.toLocaleString("es-CL")}`,
          },
          { key: "rendiciones", label: "Rendiciones", value: kpis.cantidadRendiciones },
          { key: "capacitadores", label: "Capacitadores", value: kpis.capacitadores },
        ]}
      />

      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Filtros rapidos</Text>
        <Text style={styles.transferSub}>Define estado, periodo y busqueda por capacitador.</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Estado</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={draftEstado}
                onValueChange={(v) => setDraftEstado(v)}
                style={styles.transferPicker}
              >
                <Picker.Item label="Aprobada" value="Aprobada" />
                <Picker.Item label="Pendiente" value="Pendiente" />
                <Picker.Item label="Rechazada" value="Rechazada" />
              </Picker>
            </View>
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Periodo</Text>
            <View style={styles.transferSelectWrap}>
              <Picker
                selectedValue={draftPeriodoId}
                onValueChange={(v) => setDraftPeriodoId(v)}
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
          <View style={styles.filterCol}>
            <Text style={styles.transferFilterLabel}>Capacitador</Text>
            <Input
              value={draftSearch}
              onChangeText={setDraftSearch}
              placeholder="Buscar por nombre o correo"
            />
          </View>
        </View>
        <View style={styles.filterActions}>
          <Pressable style={styles.transferBtn} onPress={onApplyFilters}>
            <Text style={styles.transferBtnText}>Aplicar</Text>
          </Pressable>
          <Pressable style={styles.transferBtnSecondary} onPress={onClearFilters}>
            <Text style={styles.transferBtnTextSecondary}>Limpiar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Transferencias (vista previa)</Text>
        <Text style={styles.transferSub}>Resultado del filtro aplicado.</Text>

        {filteredTransferItems.length === 0 ? (
          <Text style={styles.emptyText}>No hay rendiciones para transferir.</Text>
        ) : (
          <View style={styles.transferTable}>
            <View style={styles.transferHeaderRow}>
              <Text style={[styles.transferHeader, styles.colTransferCap]}>Capacitador</Text>
              <Text style={[styles.transferHeader, styles.colTransferAsig]}>Asignado</Text>
              <Text style={[styles.transferHeader, styles.colTransferRend]}>Rendido</Text>
              <Text style={[styles.transferHeader, styles.colTransferCant]}>Cant.</Text>
            </View>
            {filteredTransferItems.map((t, idx) => (
              <View key={`${t.capacitador}-${idx}`} style={styles.transferRow}>
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
            style={styles.transferBtnSecondary}
            onPress={() => downloadTransferFile("transferencias_solicitudes.csv", "csv")}
          >
            <Text style={styles.transferBtnTextSecondary}>Descargar CSV</Text>
          </Pressable>
          <Pressable style={styles.transferBtnSecondary} onPress={downloadTransferExcel}>
            <Text style={styles.transferBtnTextSecondary}>Descargar Excel</Text>
          </Pressable>
          <Pressable style={styles.transferBtnPrimary} onPress={onGenerateWithConfirm}>
            <Text style={styles.transferBtnText}>Generar transferencias</Text>
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
  filterRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  filterCol: { minWidth: 220, flexGrow: 1 },
  filterActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  transferFilterLabel: { fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  transferSelectWrap: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    justifyContent: "center",
    maxWidth: 320,
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
  transferBtnPrimary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    borderWidth: 1,
    borderColor: "#D98A1A",
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
  emptyText: { color: COLORS.muted, fontWeight: "700" },
});
