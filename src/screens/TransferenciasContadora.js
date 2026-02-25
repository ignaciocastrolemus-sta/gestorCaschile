import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { COLORS } from "../constants/colors";
import { Input } from "../components/UI";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import { obtenerViajesPorTransferir, transferirFondosViaje } from "../api/viajesGastos"; // Tus nuevas funciones de API

export default function TransferenciasContadora({ token }) {
  const [viajes, setViajes] = useState([]);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionKind, setActionKind] = useState("info");

  // Filtro local para búsqueda rápida
  const filteredViajes = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return viajes;
    return viajes.filter(
      (v) => 
        String(v.nombreCapacitador).toLowerCase().includes(q) || 
        String(v.razonSocialCliente).toLowerCase().includes(q)
    );
  }, [viajes, search]);

  // Cálculos para las tarjetas de arriba
  const kpis = useMemo(() => {
    const totalPresupuesto = filteredViajes.reduce((acc, it) => acc + Number(it.totalPresupuesto || 0), 0);
    return {
      totalPresupuesto,
      cantidadViajes: filteredViajes.length,
    };
  }, [filteredViajes]);

  const loadViajes = useCallback(async () => {
    try {
      const data = await obtenerViajesPorTransferir(token);
      setViajes(Array.isArray(data) ? data : []);
      setActionMsg("");
      console.log("[UI] Viajes pendientes cargados exitosamente:", data.length);
    } catch (e) {
      console.error("[UI] Error atrapado al cargar viajes:", e); // <-- AQUÍ EL AVISO EN CONSOLA
      setActionMsg(e?.message || "No se pudieron cargar los viajes asignados.");
      setActionKind("error");
    }
  }, [token]);

  useEffect(() => {
    loadViajes();
  }, [loadViajes]);

  const onTransferir = (id, capacitador) => {
    const msg = `¿Confirmas que deseas liberar los fondos para el viaje de ${capacitador}?`;
    const proceed = typeof window !== "undefined" && typeof window.confirm === "function" ? window.confirm(msg) : false;
    
    if (!proceed) return;

    transferirFondosViaje(id, token)
      .then((respuesta) => {
        console.log(`[UI] Transferencia exitosa para ID ${id}:`, respuesta); // <-- TRAZABILIDAD
        setActionMsg(`Fondos liberados exitosamente para ${capacitador}.`);
        setActionKind("success");
        loadViajes(); 
      })
      .catch((e) => {
        console.error(`[UI] Error atrapado al transferir viaje ID ${id}:`, e); // <-- AQUÍ EL AVISO EN CONSOLA
        setActionMsg(e?.message || "Error al transferir los fondos.");
        setActionKind("error");
      });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Liberación de Fondos"
        subtitle="Aprueba y transfiere los fondos de los viajes planificados."
        secondaryLabel="Actualizar"
        onSecondaryPress={loadViajes}
      />

      {!!actionMsg && (
        <View style={[styles.feedbackBox, actionKind === "error" ? styles.feedbackError : styles.feedbackSuccess]}>
          <Text style={styles.feedbackText}>{actionMsg}</Text>
        </View>
      )}

      <KpiRow
        items={[
          { key: "viajes", label: "Viajes por Aprobar", value: kpis.cantidadViajes },
          { key: "monto", label: "Monto a Transferir", value: `$ ${kpis.totalPresupuesto.toLocaleString("es-CL")}` },
        ]}
      />

      {/* Buscador Simplificado */}
      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Buscar Viaje</Text>
        <Text style={styles.transferSub}>Filtra por nombre del técnico o destino.</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Ej: Juan Pérez o CAS-Chile"
            />
          </View>
        </View>
      </View>

      {/* Tabla de Resultados */}
      <View style={styles.transferCard}>
        <Text style={styles.transferTitle}>Viajes Asignados (Pendientes)</Text>
        <Text style={styles.transferSub}>Listado de viajes esperando caja.</Text>

        {filteredViajes.length === 0 ? (
          <Text style={styles.emptyText}>No hay viajes pendientes de transferencia en este momento.</Text>
        ) : (
          <View style={styles.transferTable}>
            <View style={styles.transferHeaderRow}>
              <Text style={[styles.transferHeader, styles.colCap]}>Capacitador</Text>
              <Text style={[styles.transferHeader, styles.colDestino]}>Destino</Text>
              <Text style={[styles.transferHeader, styles.colFechas]}>Fechas</Text>
              <Text style={[styles.transferHeader, styles.colMonto]}>Monto</Text>
              <Text style={[styles.transferHeader, styles.colAccion]}>Acción</Text>
            </View>
            {filteredViajes.map((v, idx) => (
              <View key={`${v.idAsignacionViaje}-${idx}`} style={styles.transferRow}>
                <Text style={[styles.transferCell, styles.colCap]}>{v.nombreCapacitador}</Text>
                <Text style={[styles.transferCell, styles.colDestino]}>{v.razonSocialCliente}</Text>
                <Text style={[styles.transferCell, styles.colFechas]}>{v.fechaInicio}</Text>
                <Text style={[styles.transferCell, styles.colMonto, { color: COLORS.orange }]}>
                  $ {Number(v.totalPresupuesto).toLocaleString("es-CL")}
                </Text>
                <View style={styles.colAccion}>
                  <Pressable style={styles.transferBtnPrimary} onPress={() => onTransferir(v.idAsignacionViaje, v.nombreCapacitador)}>
                    <Text style={styles.transferBtnText}>Aprobar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Reutilizamos tus mismos estilos
const styles = StyleSheet.create({
  transferCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 12, padding: 14, marginBottom: 14 },
  transferTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  transferSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
  filterRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  filterCol: { flexGrow: 1 },
  transferTable: { marginTop: 10 },
  transferHeaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.grayBorder },
  transferHeader: { fontWeight: "900", color: COLORS.muted, fontSize: 12 },
  transferRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.grayBorder },
  transferCell: { fontWeight: "800", color: COLORS.text, fontSize: 12 },
  
  // Ajuste de columnas para que quepan bien
  colCap: { width: 160, textAlign: "left" },
  colDestino: { width: 160, textAlign: "left" },
  colFechas: { width: 90, textAlign: "center" },
  colMonto: { width: 90, textAlign: "right", paddingRight: 10 },
  colAccion: { width: 100, alignItems: "center" },
  
  transferBtnPrimary: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.orange, borderWidth: 1, borderColor: "#D98A1A" },
  transferBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  feedbackBox: { marginBottom: 8, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1 },
  feedbackSuccess: { backgroundColor: "#EDF8F2", borderColor: "#9FD7B7" },
  feedbackError: { backgroundColor: "#FFF0F0", borderColor: "#F0B3B3" },
  feedbackText: { color: COLORS.text, fontWeight: "800" },
  emptyText: { color: COLORS.muted, fontWeight: "700", marginTop: 10 },
});