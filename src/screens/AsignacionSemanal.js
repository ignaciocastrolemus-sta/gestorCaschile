import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert, Modal, Platform } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function AsignacionSemanal({ token }) {
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Estado para crear una nueva semana y manejar errores del calendario
  const [fechaInicio, setFechaInicio] = useState("");
  const [errorFecha, setErrorFecha] = useState("");

  // Filtros de tiempo
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Estado para el Modal de "Ver Viajes"
  const [modalVisible, setModalVisible] = useState(false);
  const [viajesSemana, setViajesSemana] = useState([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);

  const loadSemanas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/AsignacionSemanals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar las semanas operativas.");
      const data = await res.json();
      setSemanas(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSemanas();
  }, [loadSemanas]);

  // Filtramos la grilla según el Mes y Año seleccionados
  const semanasFiltradas = useMemo(() => {
    return semanas.filter((s) => {
      const rawDate = String(s.fechaInicio ?? s.FechaInicio ?? "");
      if (rawDate.length < 10) return false;
      
      const anio = parseInt(rawDate.substring(0, 4), 10);
      const mes = parseInt(rawDate.substring(5, 7), 10) - 1; // 0-indexado
      
      return anio === selectedYear && mes === selectedMonth;
    });
  }, [semanas, selectedYear, selectedMonth]);

  // Función validadora del calendario
  const handleFechaChange = (textoFecha) => {
    setFechaInicio(textoFecha);
    setErrorFecha(""); // Limpiamos errores previos

    if (!textoFecha || textoFecha.length < 10) return;

    // Forzamos la zona horaria agregando T00:00:00
    const fechaSeleccionada = new Date(textoFecha + "T00:00:00");
    
    // getDay() devuelve 1 para el Lunes
    if (fechaSeleccionada.getDay() !== 1) {
      setErrorFecha("Día inválido. Debes seleccionar obligatoriamente un día Lunes.");
      setFechaInicio(""); 
    }
  };

  const onCrearSemana = async () => {
    if (!fechaInicio || fechaInicio.length !== 10) {
      return setError("Debes ingresar una fecha válida (YYYY-MM-DD).");
    }

    try {
      setLoading(true);
      setError("");
      
      const payload = { fechaInicio: fechaInicio };
      
      const res = await fetch(`${API_BASE}/AsignacionSemanals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.mensaje || "Error al crear la semana.");
      }
      
      setFechaInicio("");
      Alert.alert("Éxito", "Semana operativa creada y abierta exitosamente.");
      loadSemanas();
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  };

  const onAlternarEstado = async (idSemana) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/AsignacionSemanals/${idSemana}/alternar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.mensaje || "Error al cambiar el estado de la semana.");
      }
      
      loadSemanas();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerViajes = async (semana) => {
    setSemanaSeleccionada(semana);
    setModalVisible(true);
    setViajesSemana([]); 
    
    try {
      // Data simulada temporalmente para el diseño
      setViajesSemana([
        { id: 1, empleado: "Juan Pérez", cliente: "Municipalidad de Santiago", estado: "Asignada" },
        { id: 2, empleado: "María López", cliente: "Empresa XYZ", estado: "Pendiente" }
      ]);
      
    } catch (e) {
      Alert.alert("Error", "No se pudieron cargar los viajes de esta semana.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Gestor de Semanas Operativas"
        subtitle="Habilita las semanas para que la secretaria pueda asignar viajes a terreno."
        secondaryLabel="Actualizar"
        onSecondaryPress={loadSemanas}
      />

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Apertura de Nueva Semana</Text>
        <Text style={{ color: COLORS.muted, marginBottom: 12, fontSize: 13 }}>
          Ingresa un día Lunes. El sistema calculará automáticamente hasta el Viernes. 
          Recuerda que solo puede haber una semana abierta a la vez.
        </Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={dash.label}>Fecha Lunes de inicio</Text>
            
            {/* Si estamos en Web, usamos el input nativo HTML que SÍ abre el calendario */}
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => handleFechaChange(e.target.value)}
                style={{
                  height: 46,
                  width: "100%",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: errorFecha ? "#C2410C" : COLORS.grayBorder,
                  paddingHorizontal: 12,
                  backgroundColor: "#fff",
                  fontSize: 14,
                  color: COLORS.text,
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
            ) : (
              /* Si estamos en Celular, usamos el TextInput normal */
              <TextInput
                value={fechaInicio}
                onChangeText={handleFechaChange}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.muted}
                style={[dash.input, errorFecha ? { borderColor: COLORS.error, borderWidth: 1 } : {}]}
              />
            )}

            {!!errorFecha && (
              <Text style={{ color: "#C2410C", fontSize: 12, marginTop: 4, fontWeight: "700" }}>
                {errorFecha}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onCrearSemana}>
            <Text style={styles.primaryText}>{loading ? "Procesando..." : "Crear y Abrir Semana"}</Text>
          </Pressable>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Historial de Semanas</Text>
        
        <View style={styles.monthWrap}>
          <View style={styles.monthRow}>
            {MONTHS.map((m, idx) => (
              <Pressable
                key={m}
                style={[styles.monthChip, selectedMonth === idx && styles.monthChipActive]}
                onPress={() => setSelectedMonth(idx)}
              >
                <Text style={[styles.monthText, selectedMonth === idx && styles.monthTextActive]}>{m}</Text>
              </Pressable>
            ))}
            <View style={styles.yearControl}>
              <Pressable style={styles.yearBtn} onPress={() => setSelectedYear((y) => y - 1)}>
                <Text style={styles.yearBtnText}>-</Text>
              </Pressable>
              <Text style={styles.yearValue}>{selectedYear}</Text>
              <Pressable style={styles.yearBtn} onPress={() => setSelectedYear((y) => y + 1)}>
                <Text style={styles.yearBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {semanasFiltradas.length === 0 ? (
          <Text style={styles.empty}>No hay semanas registradas en este mes.</Text>
        ) : (
          <View style={styles.cardsGrid}>
            {semanasFiltradas.map((s) => {
              const isOpen = s.esAbierta ?? s.EsAbierta;
              const id = s.idSemana ?? s.IdSemana;
              const fi = String(s.fechaInicio ?? s.FechaInicio).slice(0, 10);
              const ft = String(s.fechaTermino ?? s.FechaTermino).slice(0, 10);
              
              return (
                <View key={id} style={[styles.weekCard, isOpen && styles.weekCardActive]}>
                  <View style={styles.weekHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekTitle}>{s.nombre ?? s.Nombre}</Text>
                      <Text style={styles.weekSub}>{fi} al {ft}</Text>
                    </View>
                    <View style={[styles.statusBadge, isOpen ? styles.statusActive : styles.statusInactive]}>
                      <Text style={styles.statusText}>{isOpen ? "ABIERTA" : "CERRADA"}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.actions}>
                    <Pressable 
                      style={isOpen ? styles.smallBtnDanger : styles.smallBtnSuccess} 
                      onPress={() => onAlternarEstado(id)}
                    >
                      <Text style={styles.smallBtnText}>
                        {isOpen ? "Cerrar Semana" : "Reabrir Semana"}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.smallBtnNeutral} onPress={() => onVerViajes(s)}>
                      <Text style={styles.smallBtnTextNeutral}>Ver Viajes</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Viajes: {semanaSeleccionada?.nombre ?? semanaSeleccionada?.Nombre}
            </Text>
            
            <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
              {viajesSemana.length === 0 ? (
                <Text style={styles.empty}>No hay viajes registrados en esta semana.</Text>
              ) : (
                viajesSemana.map((viaje, index) => (
                  <View key={index} style={styles.viajeRow}>
                    <Text style={{ fontWeight: "700", color: COLORS.text }}>{viaje.empleado}</Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12 }}>{viaje.cliente}</Text>
                    <Text style={{ color: COLORS.blue2, fontSize: 12, fontWeight: "800" }}>{viaje.estado}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable style={[styles.secondaryBtn, { marginTop: 20, alignSelf: "flex-end" }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.secondaryText}>Cerrar Visor</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginTop: 4 },
  col: { flex: 1 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
    justifyContent: "center"
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
    justifyContent: "center"
  },
  secondaryText: { color: COLORS.blue2, fontWeight: "900" },
  error: { marginTop: 8, color: COLORS.muted, fontWeight: "800" },
  empty: { color: COLORS.muted, fontWeight: "800", marginTop: 10 },
  monthWrap: { marginBottom: 16 },
  monthRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  monthChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  monthChipActive: { backgroundColor: COLORS.blue2, borderColor: COLORS.blue2 },
  monthText: { fontWeight: "900", color: COLORS.text },
  monthTextActive: { color: "#fff" },
  yearControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    backgroundColor: "#fff",
  },
  yearBtn: { width: 28, height: 28, borderRadius: 999, backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF", alignItems: "center", justifyContent: "center" },
  yearBtnText: { fontWeight: "900", color: COLORS.blue2 },
  yearValue: { fontWeight: "900", color: COLORS.text },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  weekCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 14,
  },
  weekCardActive: { borderColor: "#BFE8CB", backgroundColor: "#FAFFFC" },
  weekHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  weekTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  weekSub: { marginTop: 4, color: COLORS.muted, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  statusActive: { backgroundColor: "#E7F8ED", borderColor: "#BFE8CB" },
  statusInactive: { backgroundColor: "#FFEFEF", borderColor: "#F3B6B6" },
  statusText: { fontWeight: "900", color: COLORS.text, fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  smallBtnDanger: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#FFEFEF", borderWidth: 1, borderColor: "#F3B6B6" },
  smallBtnSuccess: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#E7F8ED", borderWidth: 1, borderColor: "#BFE8CB" },
  smallBtnNeutral: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#D9E5FF" },
  smallBtnText: { fontWeight: "900", color: COLORS.text, fontSize: 12 },
  smallBtnTextNeutral: { fontWeight: "900", color: COLORS.blue2, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.grayBorder, paddingBottom: 10 },
  viajeRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }
});